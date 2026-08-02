const Expense = require("../models/expense");

const cleanExpenseInput = (body) => {
  const amount = Number(body.amount);
  const date = String(body.date || "").trim();
  const category = String(body.category || "").trim();
  const description = String(body.description || "").trim();

  if (!date || Number.isNaN(Date.parse(date))) {
    return { error: "A valid date is required." };
  }

  if (!category) {
    return { error: "Category is required." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Amount must be greater than zero." };
  }

  return {
    value: {
      date,
      category,
      amount: Number(amount.toFixed(2)),
      description,
    },
  };
};


exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user.id,
    }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addExpense = async (req, res) => {
  try {
    const { error, value } = cleanExpenseInput(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    const expense = await Expense.create({
      ...value,   
      user: req.user.id,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    const { error, value } = cleanExpenseInput({
      ...expense.toObject(),
      ...req.body,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      value,
      { new: true,
        runValidators: true }
    );

    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};