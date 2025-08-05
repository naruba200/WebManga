// js/anime-details.js
const API_BASE_URL = 'https://webmangaapi.onrender.com/api/';

// Helper to get auth token
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Refresh token if expired
async function refreshToken() {
    const user = JSON.parse(localStorage.getItem('user'));
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('Refresh attempt - User:', user, 'RefreshToken:', refreshToken);
    if (!user || !refreshToken) {
        console.log('Missing user or refresh token');
        return false;
    }
    try {
        const response = await fetch(`${API_BASE_URL}Auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ReaderID: user.ReaderID, RefreshToken: refreshToken })
        });
        if (!response.ok) {
            console.log('Refresh failed:', response.status, await response.text());
            return false;
        }
        const result = await response.json();
        localStorage.setItem('token', result.Token);
        localStorage.setItem('refreshToken', result.RefreshToken);
        localStorage.setItem('user', JSON.stringify({
            ReaderID: result.User.ReaderID,
            Username: result.User.Username,
            Email: result.User.Email
        }));
        console.log('Token refreshed:', result);
        return true;
    } catch (error) {
        console.error('Refresh error:', error);
        return false;
    }
}

// Get mangaId
const urlParams = new URLSearchParams(window.location.search);
const mangaId = window.mangaId || urlParams.get('mangaId') || 'defaultMangaId';

// Check if user has followed this manga
async function checkFollowStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const followBtn = document.getElementById('follow-btn');
    const icon = followBtn.querySelector('i');

    // Log initial state
    console.log('Checking follow status - User:', user, 'MangaID:', mangaId);

    // Validate user and mangaId
    if (!user || !user.ReaderID || !mangaId) {
        console.error('Missing user or mangaId:', { user, mangaId });
        icon.className = 'fa fa-heart-o';
        followBtn.lastChild.nodeValue = ' Follow';
        followBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = './login.html';
        };
        return;
    }

    try {
        // Use query parameters instead of path parameters
        const url = `${API_BASE_URL}Follow?readerId=${user.ReaderID}&mangaId=${mangaId}`;
        console.log(`Fetching follow status from: ${url}`);
        let response = await fetch(url, {
            headers: getAuthHeader()
        });

        // Log response details
        console.log('Response status:', response.status, 'Response body:', await response.clone().text());

        // Handle token expiration
        if (response.status === 401) {
            console.log('Token expired, attempting refresh');
            const refreshed = await refreshToken();
            if (!refreshed) {
                console.error('Token refresh failed, logging out');
                alert('Session expired. Please log in again.');
                logout();
                return;
            }
            console.log('Retrying with new token');
            response = await fetch(url, {
                headers: getAuthHeader()
            });
        }

        // Handle response
        if (response.status === 200) {
            const followData = await response.json();
            console.log('Follow data:', followData);
            // Since this endpoint returns a single FollowDTO (not a list), check if it exists
            icon.className = 'fa fa-heart';
            followBtn.lastChild.nodeValue = ' Unfollow';
            followBtn.onclick = (e) => {
                e.preventDefault();
                unfollowManga();
            };
        } else if (response.status === 404) {
            console.log('User is not following this manga');
            icon.className = 'fa fa-heart-o';
            followBtn.lastChild.nodeValue = ' Follow';
            followBtn.onclick = (e) => {
                e.preventDefault();
                followManga();
            };
        } else {
            const errorText = await response.text();
            console.error('Unexpected response:', response.status, errorText);
            throw new Error(`Unexpected status: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('Error checking follow status:', error.message);
        alert(`Unable to check follow status: ${error.message}. Please try again later.`);
        // Fallback UI state
        icon.className = 'fa fa-heart-o';
        followBtn.lastChild.nodeValue = ' Follow';
        followBtn.onclick = (e) => {
            e.preventDefault();
            followManga();
        };
    }
}

// Follow manga
async function followManga() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    // Log all relevant session data
    console.log('Follow attempt - User:', user);
    console.log('Token:', token);
    console.log('RefreshToken:', refreshToken);

    // Check user validity
    if (!user || !user.ReaderID) {
        console.log('No valid user found, redirecting to login');
        alert('Please log in to follow this manga');
        window.location.href = './login.html';
        return;
    }

    const followData = { ReaderID: user.ReaderID, MangaID: mangaId };
    console.log('Following manga:', followData);

    try {
        console.log('Sending POST request with headers:', getAuthHeader());
        let response = await fetch(`${API_BASE_URL}Follow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(followData)
        });
        console.log('POST response status:', response.status);
        console.log('POST response body:', await response.clone().text());

        // Handle token expiration
        if (response.status === 401) {
            console.log('Token expired, attempting refresh');
            const refreshed = await refreshToken();
            console.log('Refresh result:', refreshed);
            if (!refreshed) {
                console.log('Refresh failed, redirecting to login');
                alert('Session expired. Please log in again.');
                logout();
                return;
            }
            console.log('Retrying POST with new token');
            response = await fetch(`${API_BASE_URL}Follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(followData)
            });
            console.log('Retry POST response status:', response.status);
            console.log('Retry POST response body:', await response.clone().text());
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to follow manga: ${response.status}`);
        }

        console.log('Follow successful');
        alert('Manga followed successfully');
        const followBtn = document.getElementById('follow-btn');
        const icon = followBtn.querySelector('i');
        icon.className = 'fa fa-heart';
        followBtn.lastChild.nodeValue = ' Unfollow';
        followBtn.onclick = (e) => {
            e.preventDefault();
            unfollowManga();
        };
    } catch (error) {
        console.error('Error following manga:', error.message);
        alert(`Failed to follow manga: ${error.message}. Please try again later.`);
    }
}

// Unfollow manga
async function unfollowManga() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please log in to unfollow this manga');
        window.location.href = './login.html';
        return;
    }

    try {
        console.log(`Unfollowing manga: ReaderID=${user.ReaderID}, MangaID=${mangaId}`);
        let response = await fetch(`${API_BASE_URL}Follow/${user.ReaderID}/${mangaId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (response.status === 401) {
            console.log('Token expired, attempting refresh');
            if (!await refreshToken()) {
                console.log('Refresh failed, redirecting to login');
                logout();
                return;
            }
            response = await fetch(`${API_BASE_URL}Follow/${user.ReaderID}/${mangaId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to unfollow manga');
        }
        alert('Manga unfollowed successfully');
        const followBtn = document.getElementById('follow-btn');
        const icon = followBtn.querySelector('i');
        icon.className = 'fa fa-heart-o';
        followBtn.lastChild.nodeValue = ' Follow';
        followBtn.onclick = (e) => {
            e.preventDefault();
            followManga();
        };
    } catch (error) {
        console.error('Error unfollowing manga:', error);
        alert(error.message || 'Failed to unfollow manga. Please try again later.');
    }
}

// User UI management
function updateUserUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userInfo = document.getElementById('userInfo');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    console.log('User from localStorage:', user);

    if (user && user.username) {
        userInfo.innerHTML = `<i class="fa fa-user"></i> <span>Welcome, ${user.username}</span>`;
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        userInfo.innerHTML = '';
        loginLink.style.display = 'inline';
        logoutLink.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = './login.html';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
    checkFollowStatus();
});