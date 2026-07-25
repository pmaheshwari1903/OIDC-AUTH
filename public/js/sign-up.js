const form = document.querySelector('.sign-up-form');
const statusMessage = document.querySelector('.status-message');
const toggleButtons = document.querySelectorAll('.password-toggle');

const setFieldState = (input, isValid, message) => {
  const fieldGroup = input.closest('.field-group');
  const errorNode = fieldGroup?.querySelector('.field-error');

  input.classList.toggle('is-invalid', !isValid);
  input.classList.toggle('is-valid', isValid);

  if (errorNode) {
    errorNode.textContent = isValid ? '' : message;
  }
};

const validateField = (input) => {
  const name = input.name;
  const value = input.value.trim();

  if (!value) {
    setFieldState(input, false, 'This field is required.');
    return false;
  }

  if (name === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      setFieldState(input, false, 'Enter a valid email address.');
      return false;
    }
  }

  if (name === 'password') {
    const strongPassword = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPassword.test(value)) {
      setFieldState(input, false, 'Use at least 8 characters with a number and a symbol.');
      return false;
    }
  }

  if (name === 'confirmPassword') {
    const password = document.getElementById('password').value;
    if (value !== password) {
      setFieldState(input, false, 'Passwords do not match.');
      return false;
    }
  }

  if (name === 'firstName' || name === 'lastName') {
    if (value.length < 2) {
      setFieldState(input, false, 'Use at least 2 characters.');
      return false;
    }
  }

  setFieldState(input, true, '');
  return true;
};

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const targetInput = document.getElementById(targetId);

    if (!targetInput) return;

    const isPassword = targetInput.type === 'password';
    targetInput.type = isPassword ? 'text' : 'password';
    button.textContent = isPassword ? 'Hide' : 'Show';
    button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
});

if (form) {
  ['input', 'blur'].forEach((eventName) => {
    form.addEventListener(eventName, (event) => {
      const { target } = event;
      if (target.matches('input')) {
        validateField(target);
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const inputs = form.querySelectorAll('input');
    const isValid = Array.from(inputs).every((input) => validateField(input));

    if (!isValid) {
      statusMessage.textContent = 'Please correct the highlighted fields.';
      return;
    }

    try {
      statusMessage.textContent = 'Creating your account...';
      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      statusMessage.textContent = `Account ready for ${firstName}. Redirecting...`;
      setTimeout(() => {
        if (window.location.search) {
          window.location.href = `/authorize${window.location.search}`;
        } else {
          window.location.href = './profile.html';
        }
      }, 700);
      
    } catch (err) {
      statusMessage.textContent = err.message;
    }

    form.querySelectorAll('input').forEach((input) => {
      input.classList.remove('is-valid', 'is-invalid');
    });
  });
}
