const elements = {
  highestExpense: document.getElementById("highestExpense"),
  averageMonthly: document.getElementById("averageMonthly"),
  mostCategory: document.getElementById("mostCategory"),
  totalCategories: document.getElementById("totalCategories"),
  monthlyChart: document.getElementById("monthlyChart"),
  categoryChart: document.getElementById("categoryChart"),
};

let monthlyChartInstance = null;
let categoryChartInstance = null;

document.addEventListener("DOMContentLoaded", loadAnalytics);

async function loadAnalytics() {
  try {
    const expenses = await getExpenses();

    updateStats(expenses);
    renderMonthlyChart(expenses);
    renderCategoryChart(expenses);

  } catch (err) {
    alert(err.message);
  }
}

function updateStats(expenses) {

  if (expenses.length === 0) {

    elements.highestExpense.textContent = "₹0";
    elements.averageMonthly.textContent = "₹0";
    elements.mostCategory.textContent = "-";
    elements.totalCategories.textContent = "0";

    return;
  }

  const highestExpense = Math.max(
    ...expenses.map(expense => expense.amount)
  );

  const uniqueCategories = new Set(
    expenses.map(expense => expense.category)
  );

  const categoryTotals = {};

  expenses.forEach(expense => {

    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }

    categoryTotals[expense.category] += expense.amount;

  });

  let mostCategory = "";
  let maxAmount = 0;

  for (const category in categoryTotals) {

    if (categoryTotals[category] > maxAmount) {

      maxAmount = categoryTotals[category];
      mostCategory = category;

    }

  }

  const monthlyTotals = {};

  expenses.forEach(expense => {

    const date = new Date(expense.date);

    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!monthlyTotals[key]) {
      monthlyTotals[key] = 0;
    }

    monthlyTotals[key] += expense.amount;

  });

  const totalSpend = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const averageMonthly =
    totalSpend / Object.keys(monthlyTotals).length;

  elements.highestExpense.textContent =
    `₹${highestExpense.toFixed(2)}`;

  elements.averageMonthly.textContent =
    `₹${averageMonthly.toFixed(2)}`;

  elements.mostCategory.textContent =
    mostCategory;

  elements.totalCategories.textContent =
    uniqueCategories.size;

}

function renderMonthlyChart(expenses) {

  const monthlyData = {};

  expenses.forEach(expense => {

    const date = new Date(expense.date);

    const month = date.toLocaleString("default", {
      month: "short"
    });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    monthlyData[month] += expense.amount;

  });

  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }

  monthlyChartInstance = new Chart(
    elements.monthlyChart,
    {
      type: "line",

      data: {

        labels: Object.keys(monthlyData),

        datasets: [{

          label: "Monthly Spend",

          data: Object.values(monthlyData),

          borderWidth: 3,

          tension: 0.4

        }]

      }

    }
  );

}

function renderCategoryChart(expenses) {

  const categoryData = {};

  expenses.forEach(expense => {

    if (!categoryData[expense.category]) {
      categoryData[expense.category] = 0;
    }

    categoryData[expense.category] += expense.amount;

  });

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  categoryChartInstance = new Chart(
    elements.categoryChart,
    {
      type: "bar",

      data: {

        labels: Object.keys(categoryData),

        datasets: [{

          label: "Amount",

          data: Object.values(categoryData)

        }]

      }

    }
  );

}