const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "expenses.json";

// TEST route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// GET all expenses
app.get("/expenses", (req, res) => {
  const data = fs.readFileSync(FILE, "utf-8");
  res.json(JSON.parse(data || "[]"));
});

// ADD expense
app.post("/expenses", (req, res) => {
  const data = fs.readFileSync(FILE, "utf-8");
  const expenses = data ? JSON.parse(data) : [];

  expenses.push(req.body);
  fs.writeFileSync(FILE, JSON.stringify(expenses, null, 2));

  res.json({ message: "Expense added" });
});

// DELETE expense
app.delete("/expenses/:index", (req, res) => {
  const data = fs.readFileSync(FILE, "utf-8");
  const expenses = JSON.parse(data);

  expenses.splice(req.params.index, 1);
  fs.writeFileSync(FILE, JSON.stringify(expenses, null, 2));

  res.json({ message: "Expense deleted" });
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});

