// js/profile.js

// Function to fetch and display bookmarked manga
async function loadBookmarks(readerId) {
    try {
        const response = await fetch(`http://mangahomebrew.runasp.net/api/Follow?readerId=${readerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch bookmarks: ${response.status} - ${errorText}`);
        }

        const bookmarks = await response.json();
        displayBookmarks(bookmarks);
    } catch (error) {
        console.error('Error loading bookmarks:', error.message);
        document.getElementById('bookmark-list').innerHTML = '<p>Error loading bookmarks.</p>';
    }
}

// Function to display bookmarks in the UI
function displayBookmarks(bookmarks) {
    const bookmarkList = document.getElementById('bookmark-list');
    if (!bookmarkList) return; // Exit if not on profile page
    bookmarkList.innerHTML = ''; // Clear existing content

    if (bookmarks.length === 0) {
        bookmarkList.innerHTML = '<p>No bookmarked manga yet.</p>';
        return;
    }

    bookmarks.forEach(bookmark => {
        const bookmarkItem = document.createElement('div');
        bookmarkItem.className = 'bookmark-item';
        bookmarkItem.innerHTML = `
            <img src="${bookmark.MangaThumbnail}" alt="${bookmark.MangaTitle}" width="50" height="50">
            <span>${bookmark.MangaTitle}</span>
            <button class="main__button" onclick="unfollowManga(${bookmark.ReaderID}, '${bookmark.MangaID}')">Unfollow</button>
        `;
        bookmarkList.appendChild(bookmarkItem);
    });
}

// Reuse unfollowManga from follow.js (define it here if not imported)
async function unfollowManga(readerId, mangaId) {
    try {
        const response = await fetch(`http://mangahomebrew.runasp.net/api/Follow/${readerId}/${mangaId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to unfollow manga: ${response.status} - ${errorText}`);
        }

        // Reload bookmarks after unfollowing
        loadBookmarks(readerId);
    } catch (error) {
        console.error('Error unfollowing manga:', error.message);
        alert('Failed to unfollow manga. Please try again.');
    }
}

// Event listener for tab switching
document.querySelectorAll('.profile-menu .nav-link').forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();

        // Remove active class from all tabs and panes
        document.querySelectorAll('.profile-menu .nav-link').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        // Add active class to clicked tab and corresponding pane
        this.classList.add('active');
        document.getElementById(this.dataset.tab).classList.add('active');

        // Load bookmarks when the bookmark tab is clicked
        if (this.dataset.tab === 'bookmark') {
            const user = JSON.parse(localStorage.getItem('user')) || { readerID: 1 };
            const readerId = user.readerID;
            loadBookmarks(readerId);
        }
    });
});

// Load profile tab by default on page load
document.addEventListener('DOMContentLoaded', () => {
    const profileTab = document.querySelector('.profile-menu .nav-link[data-tab="profile"]');
    if (profileTab) profileTab.click();
});