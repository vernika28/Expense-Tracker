const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

// Validation functions
function validateEmail() {
  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!emailInput.value.match(emailPattern)) {
    emailError.innerText = "Please enter a valid email address.";
    return false;
  } else {
    emailError.innerText = "";
    return true;
  }
}

function validatePassword() {
  if (passwordInput.value.length < 6) {
    passwordError.innerText = "Password must be at least 6 characters.";
    return false;
  } else {
    passwordError.innerText = "";
    return true;
  }
}

// Real-time validation
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePassword);

// Form submit validation and redirect
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  if (isEmailValid && isPasswordValid) {
    this.submit();
  } else {
    alert("Please fix errors before submitting.");
  }
});