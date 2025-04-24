const express = require("express");
const router = express.Router();

const dummyOrders = [
  {
    id: "1",
    customerName: "Alice",
    customerEmail: "alice@example.com",
    date: new Date(),
    status: "processing",
    total: 120,
  },
  {
    id: "2",
    customerName: "Bob",
    customerEmail: "bob@example.com",
    date: new Date(),
    status: "completed",
    total: 80,
  },
];

// Get all orders
router.post("/list", async (req, res) => {
  try {
    return res.status(200).send({ ok: true, data: dummyOrders });
  } catch (error) {
    res.status(500).send({ ok: false, message: "Internal error" });
  }
});

// Mark order as shipped
router.post("/mark-shipped", async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = dummyOrders.find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).send({ ok: false, message: "Order not found" });
    }

    if (status) {
      order.status = status;
    }

    return res.status(200).send({ ok: true, data: order });
  } catch (error) {
    res
      .status(500)
      .send({ ok: false, message: "Failed to update order status" });
  }
});

// Send reminder email
router.post("/send-reminder", async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = dummyOrders.find((o) => o.id === orderId);
    if (!order)
      return res.status(404).send({ ok: false, message: "Order not found" });
    return res.status(200).send({
      ok: true,
      data: { message: `Reminder sent for order #${orderId}` },
    });
  } catch (error) {
    res.status(500).send({ ok: false, message: "Failed to send reminder" });
  }
});

module.exports = router;
