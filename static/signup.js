const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmError = document.getElementById("confirmError");

// Validation functions
function validateName() {
  if (nameInput.value.trim() === "") {
    nameError.innerText = "Full name is required.";
    return false;
  } else {
    nameError.innerText = "";
    return true;
  }
}

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

function validateConfirmPassword() {
  if (confirmInput.value !== passwordInput.value) {
    confirmError.innerText = "Passwords do not match.";
    return false;
  } else {
    confirmError.innerText = "";
    return true;
  }
}

// Event listeners for real-time validation
nameInput.addEventListener("input", validateName);
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", () => {
  validatePassword();
  validateConfirmPassword(); 
});
confirmInput.addEventListener("input", validateConfirmPassword);

// Form submission validation
document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmValid = validateConfirmPassword();

  if (isNameValid && isEmailValid && isPasswordValid && isConfirmValid) {
    this.submit();
  } else {
    alert("Please fix errors before submitting.");
  }
});