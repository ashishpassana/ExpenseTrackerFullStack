let editingId = null;
let chart;
let expensesCache = [];

const userName = localStorage.getItem("userName");

document.getElementById("userName").textContent = userName;

document.getElementById("avatar").textContent =
userName.charAt(0).toUpperCase();

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const elements = {
  date: document.getElementById("date"),
  category: document.getElementById("category"),
  amount: document.getElementById("amount"),
  description: document.getElementById("description"),
  addBtn: document.getElementById("addBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  clearFiltersBtn: document.getElementById("clearFiltersBtn"),
  monthFilter: document.getElementById("monthFilter"),
  yearFilter: document.getElementById("yearFilter"),
  categoryFilter: document.getElementById("categoryFilter"),
  searchFilter: document.getElementById("searchFilter"),
  table: document.getElementById("expenseTable"),
  emptyState: document.getElementById("emptyState"),
  totalAmount: document.getElementById("totalAmount"),
  transactionCount: document.getElementById("transactionCount"),
  averageAmount: document.getElementById("averageAmount"),
  topCategory: document.getElementById("topCategory"),
  activeFilterLabel: document.getElementById("activeFilterLabel"),
  statusMessage: document.getElementById("statusMessage"),
};

function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount) || 0);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(message, type = "success") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = [
    "rounded-lg border px-4 py-3 text-sm",
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700",
  ].join(" ");

  window.clearTimeout(setStatus.timeoutId);
  setStatus.timeoutId = window.setTimeout(() => {
    elements.statusMessage.className = "hidden rounded-lg border px-4 py-3 text-sm";
    elements.statusMessage.textContent = "";
  }, 3000);
}

function getFilteredExpenses() {
  const month = elements.monthFilter.value;
  const year = elements.yearFilter.value.trim();
  const category = elements.categoryFilter.value;
  const search = elements.searchFilter.value.trim().toLowerCase();

  return expensesCache.filter((expense) => {
    const [expenseYear, expenseMonth] = String(expense.date).split("-");
    const matchesMonth = !month || expenseMonth === month;
    const matchesYear = !year || expenseYear === year;
    const matchesCategory = !category || expense.category === category;
    const matchesSearch =
      !search || String(expense.description || "").toLowerCase().includes(search);

    return matchesMonth && matchesYear && matchesCategory && matchesSearch;
  });
}

function getCategoryTotals(expenses) {
  return expenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount);
    return totals;
  }, {});
}

function updateSummary(expenses, categoryTotals) {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const average = expenses.length ? (total / expenses.length) : 0;
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  elements.totalAmount.textContent = formatCurrency(total);
  elements.transactionCount.textContent = expenses.length;
  elements.averageAmount.textContent = formatCurrency(average);
  elements.topCategory.textContent = topCategory ? topCategory[0] : "-";
}

function updateFilterLabel(expenses) {
  const labels = [];

  if (elements.monthFilter.value) {
    labels.push(elements.monthFilter.selectedOptions[0].textContent);
  }    // selectedOption[0] convert 7 -- >july

  if (elements.yearFilter.value.trim()) {
    labels.push(elements.yearFilter.value.trim());
  }

  if (elements.categoryFilter.value) {
    labels.push(elements.categoryFilter.value);
  }

  if (elements.searchFilter.value.trim()) {
    labels.push(`"${elements.searchFilter.value.trim()}"`);
  }

  elements.activeFilterLabel.textContent = labels.length
    ? `${expenses.length} result(s) for ${labels.join(", ")}`
    : "Showing all expenses";
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderTable(expenses) {
  elements.table.innerHTML = expenses
    .map((expense) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="p-3">${formatDate(expense.date)}</td>
        <td class="p-3">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">${escapeHtml(expense.category)}</span>
        </td>
        <td class="p-3 text-right font-semibold">${formatCurrency(expense.amount)}</td>
        <td class="p-3">${escapeHtml(expense.description) || "-"}</td>
        <td class="p-3 text-center">
          <button type="button" onclick="editExpense('${expense._id}')" class="rounded-md px-3 py-1 font-semibold text-blue-700 hover:bg-blue-50">Edit</button>
        </td>
        <td class="p-3 text-center">
          <button type="button" onclick="removeExpense('${expense._id}')" class="rounded-md px-3 py-1 font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </td>
      </tr>
    `)
    .join("");

  elements.emptyState.classList.toggle("hidden", expenses.length > 0);
}

function renderDashboard() {
  const filteredExpenses = getFilteredExpenses();
  const categoryTotals = getCategoryTotals(filteredExpenses);

  renderTable(filteredExpenses);
  updateSummary(filteredExpenses, categoryTotals);
  updateFilterLabel(filteredExpenses);
  updateChart(categoryTotals);
}

async function loadData() {
  try {
    expensesCache = await getExpenses();
    renderDashboard();
  } catch (err) {
    setStatus(err.message, "error");
  }
}

async function removeExpense(id) {
  if (!window.confirm("Delete this expense?")) return;

  try {
    await deleteExpense(id);
    setStatus("Expense deleted.");
    await loadData();
  } catch (err) {
    setStatus(err.message, "error");
  }
}

async function editExpense(id) {
  const expense = expensesCache.find((item) => item._id === id);

  if (!expense) return;

  elements.date.value = expense.date.split("T")[0];
  elements.category.value = expense.category;
  elements.amount.value = expense.amount;
  elements.description.value = expense.description;

  editingId = id;
  elements.addBtn.textContent = "Update Expense";
  elements.cancelEditBtn.classList.remove("hidden");
  elements.date.focus();
}

function resetForm() {
  editingId = null;
  elements.addBtn.textContent = "Add Expense";
  elements.cancelEditBtn.classList.add("hidden");
  elements.amount.value = "";
  elements.description.value = "";
}

elements.addBtn.addEventListener("click", async () => {
  const expense = {
    date: elements.date.value,
    category: elements.category.value,
    amount: Number(elements.amount.value),
    description: elements.description.value,
  };

  if (!expense.date || !expense.amount || expense.amount <= 0) {
    setStatus("Please enter a valid date and amount.", "error");
    return;
  }

  try {
    if (editingId) {
      await updateExpense(editingId, expense);
      setStatus("Expense updated.");
    } else {
      await addExpense(expense);
      setStatus("Expense added.");
    }

    resetForm();
    await loadData();
  } catch (err) {
    setStatus(err.message, "error");
  }
});

elements.cancelEditBtn.addEventListener("click", resetForm);

elements.clearFiltersBtn.addEventListener("click", () => {
  elements.monthFilter.value = "";
  elements.yearFilter.value = "";
  elements.categoryFilter.value = "";
  elements.searchFilter.value = "";
  renderDashboard();
});

elements.logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    window.location.href = "login.html";

});

[elements.monthFilter, elements.yearFilter, elements.categoryFilter, elements.searchFilter].forEach((element) => {
  element.addEventListener("input", renderDashboard);
});

function updateChart(categories) {
  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("expenseChart"), {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["No expenses"],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#64748b"],
        borderWidth: 0,
      }],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
        },
      },
      cutout: "62%",
    },
  });
}

elements.date.valueAsDate = new Date();
loadData();
