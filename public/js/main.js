document.addEventListener('DOMContentLoaded', function () {
  const usernameElement = document.getElementById('username');
  if (usernameElement) {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if (username) {
      usernameElement.textContent = username;
    }
  }
});
