const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../data/expenses.json");

const readData = () => {
  const data = fs.readFileSync(FILE, "utf-8");
  return data ? JSON.parse(data) : [];
};

const writeData = (data) => {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
};

exports.getExpenses = (req, res) => {
  res.json(readData());
};

exports.addExpense = (req, res) => {
  const expenses = readData();
  const newExpense = {
    id: Date.now(),
    ...req.body,
  };
  expenses.push(newExpense);
  writeData(expenses);
  res.json(newExpense);
};

exports.deleteExpense = (req, res) => {
  const id = Number(req.params.id);
  const expenses = readData().filter(exp => exp.id !== id);
  writeData(expenses);
  res.json({ message: "Deleted" });
};

exports.updateExpense = (req, res) => {
  const id = Number(req.params.id);
  const expenses = readData();
  const index = expenses.findIndex(exp => exp.id === id);

  if (index === -1) return res.status(404).json({ error: "Not found" });

  expenses[index] = { ...expenses[index], ...req.body };
  writeData(expenses);

  res.json(expenses[index]);
};