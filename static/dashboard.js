// ---------------- SUMMARY CARDS ----------------
document.getElementById("totalBudget").innerText =
  userBudget !== null ? "₹ " + userBudget.toLocaleString() : "Not set";

document.getElementById("totalSpent").innerText =
  "₹ " + totalSpent.toLocaleString();

document.getElementById("remaining").innerText =
  remaining !== null ? "₹ " + remaining.toLocaleString() : "N/A";

// ---------------- PROGRESS BAR ----------------
function updateProgressBar() {
  const progressBar = document.getElementById("progressBar");
  if (userBudget !== null && userBudget > 0) {
    const percentage = Math.round((totalSpent / userBudget) * 100);
    progressBar.style.width = `${percentage}%`;
    progressBar.innerText = percentage + "%";

    progressBar.classList.remove("bg-success", "bg-warning", "bg-danger");
    if (percentage < 80) progressBar.classList.add("bg-success");
    else if (percentage < 100) progressBar.classList.add("bg-warning");
    else progressBar.classList.add("bg-danger");
  } else {
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";
  }
}
updateProgressBar();

// ---------------- CATEGORY-WISE CHART ----------------
if (Object.keys(categoryTotals).length > 0) {
  const ctx1 = document.getElementById("categoryChart").getContext("2d");
  new Chart(ctx1, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ["#36a2eb", "#ff6384", "#ffcd56", "#4bc0c0", "#9966ff"],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Category-wise Spending", font: { size: 16 } }
      },
      maintainAspectRatio: false,
    }
  });
}


// ---------------- SAVE BUDGET ----------------
document.getElementById("saveBudgetBtn").addEventListener("click", async function () {
  const newBudgetInput = document.getElementById("newBudget").value;
  const newBudget = parseFloat(newBudgetInput);

  if (!newBudget || newBudget <= 0) {
    alert(" Please enter a valid budget amount");
    return;
  }

  try {
    const res = await fetch("/update-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget: newBudget })
    });

    const data = await res.json();

    if (data.success) {
      alert(" Budget saved successfully!");
      location.reload(); // reload dashboard to reflect changes
    } else {
      alert(" " + (data.message || "Failed to save budget"));
    }
  } catch (err) {
    console.error(err);
    alert(" Error occurred while saving budget");
  }
});