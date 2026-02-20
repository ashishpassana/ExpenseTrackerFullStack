const BASE_URL = "http://localhost:5000/expenses";

// GET all expenses
async function getExpenses() {
  try {
    const res = await fetch(BASE_URL);
    return await res.json();
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
}

// ADD new expense
async function addExpense(expense) {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    });

    return await res.json();
  } catch (err) {
    console.error("Error adding expense:", err);
  }
}

// DELETE expense
async function deleteExpense(id) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    return await res.json();
  } catch (err) {
    console.error("Error deleting expense:", err);
  }
}

// UPDATE expense
async function updateExpense(id, updatedData) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    return await res.json();
  } catch (err) {
    console.error("Error updating expense:", err);
  }
}