const addBtn = document.getElementById("addBtn");
const expenseTable = document
  .getElementById("expenseTable")
  .getElementsByTagName("tbody")[0];
const totalDisplay = document.getElementById("total");
const monthFilter = document.getElementById("monthFilter");
const yearFilter = document.getElementById("yearFilter");

let expenses = [];
let chart;
let editIndex = null;

window.onload = fetchExpenses;

async function fetchExpenses() {
  const res = await fetch("http://localhost:5000/expenses");
  expenses = await res.json();
  updateTable();
  updateChart();
}

addBtn.addEventListener("click", async () => {
  const expenseData = {
    date: date.value,
    category: category.value,
    amount: parseFloat(amount.value),
    description: description.value
  };

  if (editIndex !== null) {
    await fetch(`http://localhost:5000/expenses/${editIndex}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData)
    });

    editIndex = null;
    addBtn.textContent = "Add Expense";
  }else {
    await fetch("http://localhost:5000/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData)
    });
  }

  fetchExpenses();

  document.getElementById("date").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("description").value = "";
});

async function deleteExpense(index) {
  await fetch(`http://localhost:5000/expenses/${index}`, {
    method: "DELETE",
  });
  fetchExpenses();
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    deleteExpense(index);
  }

  if (e.target.classList.contains("edit-btn")) {
    const index = e.target.dataset.index;
    editExpense(index);
  }
});


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

  <td>
    <button 
      type="button" 
      class="delete-btn" 
      data-index="${index}">
      ❌
    </button>
  </td>

  <td>
    <button 
      type="button" 
      class="edit-btn" 
      data-index="${index}">
      ✏️
    </button>
  </td>
`;
    total += exp.amount;
  });

  totalDisplay.textContent = `Total: ₹${total.toFixed(2)}`;
}

function editExpense(index) {
  const exp = expenses[index];

  date.value = exp.date;
  category.value = exp.category;
  amount.value = exp.amount;
  description.value = exp.description;

  editIndex = index;
  addBtn.textContent = "Update Expense";
}

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

monthFilter.addEventListener("change", () => {
  updateTable();
  updateChart();
});

yearFilter.addEventListener("input", () => {
  updateTable();
  updateChart();
});


