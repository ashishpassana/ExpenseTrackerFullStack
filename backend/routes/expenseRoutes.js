const express = require("express");
const router = express.Router();

const controller = require("../controllers/expenseController");
const protect = require("../middleware/authmiddleware");



router.get("/", protect , controller.getExpenses);
router.post("/", protect , controller.addExpense);
router.delete("/:id", protect , controller.deleteExpense);
router.put("/:id", protect , controller.updateExpense);

module.exports = router;