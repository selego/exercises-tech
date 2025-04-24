// archi-separate-concern/back/index.js
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const ordersRoutes = require("./controllers/ordersController");

app.use(cors());
app.use(express.json());

app.use("/api/orders", ordersRoutes);

app.listen(port, () =>
  console.log(`API server running at http://localhost:${port}`)
);
