const amount = document.getElementById("amount");
const category = document.getElementById("category");
const description = document.getElementById("description");
const date = document.getElementById("date");
const payment = document.getElementById("payment");
const form = document.getElementById("expenseForm");

// Amount validation
amount.addEventListener("input", () => {
  const err = document.getElementById("amountError");
  err.innerText = amount.value === "" || parseFloat(amount.value) <= 0 ? 
    "Enter a valid positive amount." : "";
});

// Category validation
category.addEventListener("change", () => {
  const err = document.getElementById("categoryError");
  err.innerText = category.value === "" ? "Please select a category." : "";
});

// Description validation
description.addEventListener("input", () => {
  const err = document.getElementById("descriptionError");
  err.innerText = description.value.trim() === "" ? "Description cannot be empty." : "";
});

// Date validation
date.addEventListener("input", () => {
  const err = document.getElementById("dateError");
  err.innerText = date.value === "" ? "Please select a valid date." : "";
});

// Payment mode validation
payment.addEventListener("change", () => {
  const err = document.getElementById("paymentError");
  err.innerText = payment.value === "" ? "Please select payment mode." : "";
});

// -------- Form Submission --------
form.addEventListener("submit", function (e) {
  const hasError =
    amount.value === "" ||
    parseFloat(amount.value) <= 0 ||
    category.value === "" ||
    description.value.trim() === "" ||
    date.value === "" ||
    payment.value === "";

  if (hasError) {
    e.preventDefault();
    alert("Please correct all errors before submitting.");
  }
  
});

// -------------------- Voice to Text Feature --------------------
const voiceBtn = document.getElementById("voiceBtn");
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-IN";

  voiceBtn.addEventListener("click", () => {
    recognition.start();
    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
  });

  recognition.onresult = (event) => {
    description.value = event.results[0][0].transcript;
    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  };

  recognition.onerror = () => {
    alert("Voice input failed. Please try again!");
    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  };
} else {
  voiceBtn.disabled = true;
  voiceBtn.title = "Speech recognition not supported in this browser.";
}
