const addBtn = document.getElementById("addBtn");
const expenseTable = document
  .getElementById("expenseTable")
  .getElementsByTagName("tbody")[0];
const totalDisplay = document.getElementById("total");
const monthFilter = document.getElementById("monthFilter");
const yearFilter = document.getElementById("yearFilter");

let expenses = [];
let chart;

// 🔹 Load expenses from BACKEND
window.onload = fetchExpenses;

async function fetchExpenses() {
  const res = await fetch("http://localhost:5000/expenses");
  expenses = await res.json();
  updateTable();
  updateChart();
}

// 🔹 Add Expense
addBtn.addEventListener("click", async () => {
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value;

  if (!date || !amount) {
    alert("Please fill date and amount");
    return;
  }

  const expense = { date, category, amount, description };

  await fetch("http://localhost:5000/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });

  fetchExpenses();

  document.getElementById("date").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("description").value = "";
});

// 🔹 Delete Expense
async function deleteExpense(index) {
  await fetch(`http://localhost:5000/expenses/${index}`, {
    method: "DELETE",
  });
  fetchExpenses();
}

// 🔹 Update Table with Filters
function updateTable() {
  expenseTable.innerHTML = "";
  let total = 0;

  const month = monthFilter.value;
  const year = yearFilter.value;

  expenses.forEach((exp, index) => {
    const expDate = new Date(exp.date);
    const expMonth = expDate.getMonth() + 1;
    const expYear = expDate.getFullYear();

    if ((month && expMonth != month) || (year && expYear != year)) return;

    const row = expenseTable.insertRow();
    row.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.category}</td>
      <td>₹${exp.amount.toFixed(2)}</td>
      <td>${exp.description}</td>
      <td><button onclick="deleteExpense(${index})">❌</button></td>
    `;
    total += exp.amount;
  });

  totalDisplay.textContent = `Total: ₹${total.toFixed(2)}`;
}

// 🔹 Update Chart
function updateChart() {
  const categories = {};
  const month = monthFilter.value;
  const year = yearFilter.value;

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    const expMonth = expDate.getMonth() + 1;
    const expYear = expDate.getFullYear();

    if ((month && expMonth != month) || (year && expYear != year)) return;

    categories[exp.category] =
      (categories[exp.category] || 0) + exp.amount;
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            "#ff6384",
            "#36a2eb",
            "#ffce56",
            "#4caf50",
            "#d86314",
          ],
        },
      ],
    },
  });
}

// 🔹 Filters
monthFilter.addEventListener("change", () => {
  updateTable();
  updateChart();
});

yearFilter.addEventListener("input", () => {
  updateTable();
  updateChart();
});
