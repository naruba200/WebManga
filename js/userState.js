// js/userState.js

// Function to update UI based on login state
function updateUserUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.getElementById('loginLink');

    // Debug: Log the user object to console
    console.log('User from localStorage:', user);

    if (user && user.username) {
        if (userInfo) {
            userInfo.innerHTML = `<i class="fa fa-user"></i> <span>Welcome, ${user.username}</span>`;
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'inline';
        }
        if (loginLink) {
            loginLink.style.display = 'none';
        }
    } else {
        if (userInfo) {
            userInfo.innerHTML = '';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        if (loginLink) {
            loginLink.style.display = 'inline';
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = './login.html';
}

// Run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
});