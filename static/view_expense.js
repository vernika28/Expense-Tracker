const tableBody = document.getElementById("tableBody");
const filterCategory = document.getElementById("filterCategory");
const filterPayment = document.getElementById("filterPayment");
const filterDate = document.getElementById("filterDate");
const searchBox = document.getElementById("searchBox");

// -------------------- Expenses Data from Flask --------------------
const expenses = window.FLASK_EXPENSES || []; 

// -------------------- Render Table --------------------
function loadExpenses(data) {
  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">No expenses found.</td>
      </tr>
    `;
    updateSummary([]);
    return;
  }

  data.forEach(e => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${e.date}</td>
      <td>${e.category}</td>
      <td>${e.description}</td>
      <td>₹ ${e.amount.toFixed(2)}</td>
      <td>${e.payment}</td>
      <td>
        <a href="/edit-expense/${e.id}" class="btn btn-sm btn-warning">
          <i class="fa fa-pencil"></i> Edit
        </a>
        <form method="POST" action="/delete-expense/${e.id}" style="display:inline-block;">
          <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Are you sure you want to delete this expense?');">
            <i class="fa fa-trash"></i>
          </button>
        </form>
      </td>
    `;
    tableBody.appendChild(row);
  });

  updateSummary(data);
}

// -------------------- Update Summary Cards --------------------
function updateSummary(data) {
  const total = data.reduce((sum, e) => sum + e.amount, 0);
  const highest = data.length > 0 ? Math.max(...data.map(e => e.amount)) : 0;
  const transactions = data.length;

  document.getElementById("totalSpent").innerText = `₹ ${total.toFixed(2)}`;
  document.getElementById("highestExpense").innerText = `₹ ${highest.toFixed(2)}`;
  document.getElementById("totalTransactions").innerText = transactions;
}

// -------------------- Apply Filters --------------------
function applyFilters() {
  const cat = filterCategory.value;
  const pay = filterPayment.value;
  const dateVal = filterDate.value;
  const search = searchBox.value.toLowerCase();

  const filtered = expenses.filter(e => {
    return (cat === "" || e.category === cat) &&
           (pay === "" || e.payment === pay) &&
           (dateVal === "" || e.date === dateVal) &&
           (search === "" || e.description.toLowerCase().includes(search));
  });

  loadExpenses(filtered);
}

// -------------------- Event Listeners --------------------
filterCategory.addEventListener("change", applyFilters);
filterPayment.addEventListener("change", applyFilters);
filterDate.addEventListener("input", applyFilters);
searchBox.addEventListener("input", applyFilters);

// -------------------- Initial Load --------------------
loadExpenses(expenses);
