let editingId = null;
let chart;

async function loadData() {

  const expenses = await getExpenses();

  const table = document.getElementById("expenseTable");
  table.innerHTML = "";

  let total = 0;
  const categories = {};

  expenses.forEach(exp => {

    total += exp.amount;

    categories[exp.category] =
      (categories[exp.category] || 0) + exp.amount;

    table.innerHTML += `
<tr class="border-b">
  <td class="p-2">${exp.date}</td>
  <td class="p-2">${exp.category}</td>
  <td class="p-2">₹${exp.amount}</td>
  <td class="p-2">${exp.description}</td>

  <td class="text-center">
    <button onclick="removeExpense(${exp.id})"
      class="text-red-500">✖</button>
  </td>

  <td class="text-center">
    <button onclick="editExpense(${exp.id})"
      class="text-green-500">✏️</button>
  </td>
</tr>
`;
  });

  document.getElementById("totalAmount").textContent = "₹" + total;

  updateChart(categories);
}

async function removeExpense(id) {
  await deleteExpense(id);
  loadData();
}

async function editExpense(id) {

  const expenses = await getExpenses();
  const exp = expenses.find(e => e.id === id);

  if (!exp) return;

  document.getElementById("date").value = exp.date;
  document.getElementById("category").value = exp.category;
  document.getElementById("amount").value = exp.amount;
  document.getElementById("description").value = exp.description;

  editingId = id;

  document.getElementById("addBtn").textContent = "Update Expense";
}

document.getElementById("addBtn").addEventListener("click", async () => {

  const expense = {
    date: document.getElementById("date").value,
    category: document.getElementById("category").value,
    amount: Number(document.getElementById("amount").value),
    description: document.getElementById("description").value
  };

  if (!expense.date || !expense.amount) return;

  if (editingId) {
  await updateExpense(editingId, expense);
  editingId = null;
  document.getElementById("addBtn").textContent = "Add Expense";
} else {
  await addExpense(expense);
}

  document.getElementById("amount").value = "";
  document.getElementById("description").value = "";

  loadData();
});

function updateChart(categories) {

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories)
      }]
    }
  });
}

loadData();