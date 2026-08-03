const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");

connectDB();

const app = express();

app.use(cors({
  origin: "https://expense-tracker-full-stack-zeta.vercel.app",
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Expense Tracker API is running");
});

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});