const logoutButton = document.getElementById('logoutBtn');
const statusMessage = document.getElementById('profileStatus');

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    statusMessage.textContent = 'You have been logged out. Redirecting to sign in...';
    logoutButton.textContent = 'Logging out...';
    logoutButton.disabled = true;

    setTimeout(() => {
      window.location.href = './sign-in.html';
    }, 900);
  });
}
