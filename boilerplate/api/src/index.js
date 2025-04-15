require("dotenv").config();
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const { PORT, ENVIRONMENT, APP_URL } = require("./config");
const app = express();

if (ENVIRONMENT === "development") {
  app.use(morgan("tiny"));
}

// eslint-disable-next-line no-unused-vars
function handleError(err, req, res, next) {
  const output = {
    error: {
      name: err.name,
      message: err.message,
      text: err.toString(),
    },
  };
  const statusCode = err.status || 500;
  res.status(statusCode).json(output);
}

require("./services/mongo");

app.use(cors({ credentials: true, origin: [APP_URL, "your production url because sometimes theres a cors issue"] }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const lastDeployedAt = new Date();
app.get("/", async (req, res) => {
  res.status(200).send({
    name: "api",
    environment: ENVIRONMENT,
    last_deployed_at: lastDeployedAt.toLocaleString(),
  });
});

app.use("/user", require("./controllers/user"));
app.use("/file", require("./controllers/file"));
app.use("/dummy", require("./controllers/dummy_controller"));

app.use(handleError);
require("./services/passport")(app);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
