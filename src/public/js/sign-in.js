const form = document.querySelector('.sign-in-form');
const passwordInput = document.getElementById('password');
const toggleButton = document.querySelector('.password-toggle');
const statusMessage = document.querySelector('.status-message');

if (toggleButton) {
  toggleButton.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleButton.textContent = isPassword ? 'Hide' : 'Show';
    toggleButton.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      statusMessage.textContent = 'Please enter both your email and password.';
      return;
    }

    statusMessage.textContent = `Welcome back, ${email}. Signing you in...`;
    setTimeout(() => {
      window.location.href = './profile.html';
    }, 700);
  });
}
