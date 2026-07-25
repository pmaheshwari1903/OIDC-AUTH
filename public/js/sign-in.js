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
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      statusMessage.textContent = 'Please enter both your email and password.';
      return;
    }

    try {
      statusMessage.textContent = 'Signing you in...';
      
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }
      
      statusMessage.textContent = `Welcome back, ${email}. Redirecting...`;
      
      setTimeout(() => {
        // If there is query string, we are in an Oauth flow from /authorize!
        // Redirect back to /authorize with same query so it generates code
        if (window.location.search) {
          window.location.href = `/authorize${window.location.search}`;
        } else {
          window.location.href = './profile.html';
        }
      }, 700);

    } catch (err) {
      statusMessage.textContent = err.message;
    }
  });
}
