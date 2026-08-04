const AUTH_URL = "https://expensetrackerfullstack-8fkb.onrender.com/auth";
const BASE_URL = "https://expensetrackerfullstack-8fkb.onrender.com/expenses";

// const AUTH_URL = "http://localhost:5000/auth";
// const BASE_URL = "http://localhost:5000/expenses";  // ----> For testing Locally

function getAuthHeaders(){ //helper function
  const token = localStorage.getItem("token");

  return{
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
    data.message ||
    data.error ||
    "Something went wrong."
  )};

  return data;
}

async function loginUser(userData) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return parseResponse(res);
}

async function registerUser(userData) {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return parseResponse(res);
}

async function getExpenses() {
  const res = await fetch(BASE_URL,{
    headers: getAuthHeaders(),
  });
  return parseResponse(res);
}

async function addExpense(expense) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(expense),
  });

  return parseResponse(res);
}

async function deleteExpense(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseResponse(res);
}

async function updateExpense(id, updatedData) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedData),
  });

  return parseResponse(res);
}
