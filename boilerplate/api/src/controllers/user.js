const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const crypto = require("crypto");

const UserObject = require("../models/user");

const config = require("../config");
const { validatePassword, uploadToS3FromBuffer } = require("../utils");
const { BREVO_TEMPLATES } = require("../utils");

const brevo = require("../services/brevo");
const { capture } = require("../services/sentry");

const SERVER_ERROR = "SERVER_ERROR";
const USER_ALREADY_REGISTERED = "USER_ALREADY_REGISTERED";
const PASSWORD_NOT_VALIDATED = "PASSWORD_NOT_VALIDATED";
const EMAIL_OR_PASSWORD_INVALID = "EMAIL_OR_PASSWORD_INVALID";
const PASSWORD_INVALID = "PASSWORD_INVALID";
const EMAIL_AND_PASSWORD_REQUIRED = "EMAIL_AND_PASSWORD_REQUIRED";
const PASSWORD_TOKEN_EXPIRED_OR_INVALID = "PASSWORD_TOKEN_EXPIRED_OR_INVALID";
const PASSWORDS_NOT_MATCH = "PASSWORDS_NOT_MATCH";
const ACOUNT_NOT_ACTIVATED = "ACOUNT_NOT_ACTIVATED";
const USER_NOT_EXISTS = "USER_NOT_EXISTS";

// 1 year
const COOKIE_MAX_AGE = 31557600000;
const JWT_MAX_AGE = "1y";

router.post("/signin", async (req, res) => {
  let { password, email } = req.body;
  email = (email || "").trim().toLowerCase();

  if (!email || !password) return res.status(400).send({ ok: false, code: EMAIL_AND_PASSWORD_REQUIRED });

  try {
    const user = await UserObject.findOne({ email });
    if (!user) return res.status(401).send({ ok: false, code: USER_NOT_EXISTS });

    const match = config.ENVIRONMENT === "development" || (await user.comparePassword(password));
    if (!match) return res.status(401).send({ ok: false, code: EMAIL_OR_PASSWORD_INVALID });

    user.set({ last_login_at: Date.now() });
    await user.save();

    let cookieOptions = { maxAge: COOKIE_MAX_AGE, httpOnly: true };
    if (config.ENVIRONMENT === "development") {
      cookieOptions = { ...cookieOptions, secure: false, domain: "localhost", sameSite: "Lax" };
    } else {
      cookieOptions = { ...cookieOptions, secure: true, origin: "https://api-erasmus.cleverapps.io", sameSite: "none" };
    }

    const token = jwt.sign({ _id: user.id }, config.SECRET, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions);

    return res.status(200).send({ ok: true, token, user });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { password, email, name } = req.body;

    if (password && !validatePassword(password))
      return res.status(400).send({ ok: false, user: null, code: PASSWORD_NOT_VALIDATED });

    const user = await UserObject.create({ name, password, email });
    const token = jwt.sign({ _id: user._id }, config.SECRET, { expiresIn: JWT_MAX_AGE });
    const opts = {
      maxAge: COOKIE_MAX_AGE,
      secure: config.ENVIRONMENT === "development" ? false : true,
      httpOnly: false,
    };
    res.cookie("jwt", token, opts);

    return res.status(200).send({ user, token, ok: true });
  } catch (error) {
    console.log("e", error);
    if (error.code === 11000) return res.status(409).send({ ok: false, code: USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, error });
  }
});

router.get("/signin_token", passport.authenticate(["user", "admin"], { session: false }), async (req, res) => {
  try {
    const { user } = req;
    user.set({ last_login_at: Date.now() });
    await user.save();
    return res.status(200).send({ user, token: req.cookies.jwt, ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/forgot_password", async (req, res) => {
  try {
    const obj = await UserObject.findOne({ email: req.body.email.toLowerCase() });

    if (!obj) return res.status(401).send({ ok: false, code: EMAIL_OR_PASSWORD_INVALID });

    const token = await crypto.randomBytes(20).toString("hex");
    obj.set({ forgot_password_reset_token: token, forgot_password_reset_expires: Date.now() + 7200000 }); //2h
    await obj.save();

    await brevo.sendTemplate(SENDINBLUE_TEMPLATES.FORGOT_PASSWORD, {
      emailTo: [{ email: obj.email }],
      params: { cta: `${config.APP_URL}/auth/reset?token=${token}` },
    });

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/forgot_password_reset", async (req, res) => {
  try {
    const obj = await UserObject.findOne({
      forgot_password_reset_token: req.body.token,
      forgot_password_reset_expires: { $gt: Date.now() },
    });

    if (!obj) return res.status(400).send({ ok: false, code: PASSWORD_TOKEN_EXPIRED_OR_INVALID });

    if (!validatePassword(req.body.password)) return res.status(400).send({ ok: false, code: PASSWORD_NOT_VALIDATED });

    obj.password = req.body.password;
    obj.forgot_password_reset_token = "";
    obj.forgot_password_reset_expires = "";
    await obj.save();
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.post("/reset_password", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const match = await req.user.comparePassword(req.body.password);
    if (!match) {
      return res.status(401).send({ ok: false, code: PASSWORD_INVALID });
    }
    if (req.body.newPassword !== req.body.verifyPassword) {
      return res.status(422).send({ ok: false, code: PASSWORDS_NOT_MATCH });
    }
    if (!validatePassword(req.body.newPassword)) {
      return res.status(400).send({ ok: false, code: PASSWORD_NOT_VALIDATED });
    }
    const obj = await UserObject.findById(req.user._id);

    obj.set({ password: req.body.newPassword });
    await obj.save();
    return res.status(200).send({ ok: true, user: obj });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await UserObject.findOne({ _id: req.params.id });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const data = await UserObject.find({ role: "normal" });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/search", passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    let query = {};

    const searchValue = req.body.search?.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");
    if (req.body.search) {
      query = {
        ...query,
        $or: [{ name: { $regex: searchValue, $options: "i" } }, { email: { $regex: searchValue, $options: "i" } }],
      };
    }

    const no_of_docs_each_page = req.body.per_page || 200;
    const current_page_number = req.body.page - 1 || 0;

    const users = await UserObject.find(query)
      .skip(no_of_docs_each_page * current_page_number)
      .limit(no_of_docs_each_page)
      .sort(sort);

    const total = await UserObject.countDocuments(query);

    return res.status(200).send({ ok: true, data: { users, total } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/", passport.authenticate(["admin"], { session: false }), async (req, res) => {
  try {
    if (!validatePassword(req.body.password))
      return res.status(400).send({ ok: false, user: null, code: PASSWORD_NOT_VALIDATED });

    const user = await UserObject.create(req.body);

    return res.status(200).send({ data: user, ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR });
  }
});

//@check
router.put("/:id", passport.authenticate(["admin", "user"], { session: false }), async (req, res) => {
  try {
    const user = await UserObject.findById(req.params.id);
    const obj = req.body;

    user.set(obj);
    await user.save();

    res.status(200).send({ ok: true, data: user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate(["admin", "user", "applicant"], { session: false }), async (req, res) => {
  try {
    const obj = req.body;
    const data = await UserObject.findByIdAndUpdate(req.user._id, obj, { new: true });
    res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("admin", { session: false }), async (req, res) => {
  try {
    await UserObject.findOneAndRemove({ _id: req.params.id });
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

module.exports = router;
