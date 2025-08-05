// js/follow.js

// Function to check if a manga is followed by the user
async function checkFollowStatus(readerId, mangaId) {
    try {
        const response = await fetch(`http://mangahomebrew.runasp.net/api/Follow?readerId=${readerId}&mangaId=${mangaId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok && response.status !== 404) {
            const errorText = await response.text();
            throw new Error(`Failed to check follow status: ${response.status} - ${errorText}`);
        }

        const follow = await response.json();
        return !!follow; // Returns true if followed, false if not found
    } catch (error) {
        console.error('Error checking follow status:', error.message);
        return false;
    }
}

// Function to follow a manga
async function followManga(readerId, mangaId) {
    try {
        const response = await fetch('http://mangahomebrew.runasp.net/api/Follow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ReaderID: readerId, MangaID: mangaId })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to follow manga: ${response.status} - ${errorText}`);
        }

        updateFollowButton(true);
        alert('Manga followed successfully!');
    } catch (error) {
        console.error('Error following manga:', error.message);
        alert('Failed to follow manga. Please try again.');
    }
}

// Function to unfollow a manga
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

        updateFollowButton(false);
        alert('Manga unfollowed successfully!');
    } catch (error) {
        console.error('Error unfollowing manga:', error.message);
        alert('Failed to unfollow manga. Please try again.');
    }
}

// Function to update the follow button UI
function updateFollowButton(isFollowed) {
    const followBtn = document.getElementById('follow-btn');
    if (followBtn) {
        if (isFollowed) {
            followBtn.innerHTML = '<i class="fa fa-heart"></i> Unfollow';
            followBtn.classList.remove('follow_btn');
            followBtn.classList.add('unfollow_btn');
        } else {
            followBtn.innerHTML = '<i class="fa fa-heart-o"></i> Follow';
            followBtn.classList.remove('unfollow_btn');
            followBtn.classList.add('follow_btn');
        }
    }
}

// Initialize the follow button on page load
document.addEventListener('DOMContentLoaded', async () => {
    const followBtn = document.getElementById('follow-btn');
    if (!followBtn) return; // Exit if not on a page with a follow button

    // Get user and manga details
    const user = JSON.parse(localStorage.getItem('user')) || { readerID: 1 };
    const readerId = user.readerID; // Ensure lowercase readerID
    const mangaId = getMangaIdFromPage();

    if (!mangaId) {
        console.error('Manga ID not found');
        followBtn.style.display = 'none'; // Hide button if mangaId is missing
        return;
    }

    // Check follow status and update button
    const isFollowed = await checkFollowStatus(readerId, mangaId);
    updateFollowButton(isFollowed);

    // Add click event listener to toggle follow/unfollow
    followBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const currentlyFollowed = followBtn.classList.contains('unfollow_btn');
        if (currentlyFollowed) {
            await unfollowManga(readerId, mangaId);
        } else {
            await followManga(readerId, mangaId);
        }
    });
});

// Helper function to get mangaId from the page
function getMangaIdFromPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const mangaId = urlParams.get('mangaId') || 'manga123'; // Fallback to 'manga123'
    console.log('Manga ID from URL:', mangaId); // Debug log
    return mangaId;
}