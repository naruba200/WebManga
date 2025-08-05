// Set your API base URL as needed.
const API_BASE_URL = "http://mangahomebrew.runasp.net/api/";

// Utility function to get authentication headers, if applicable.
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": "Bearer " + token } : {};
}

// ------------------------------
// Anime Details Comment Functions
// ------------------------------
async function loadAnimeComments(mangaID, chapterID = null) {
  try {
    // Build the query string: include mangaID and optionally chapterID.
    let url = `${API_BASE_URL}Comment?mangaID=${mangaID}`;
    if (chapterID) {
      url += `&chapterID=${chapterID}`;
    }
    // Optionally, include a userTimeZoneId parameter if needed.
    const response = await fetch(url, { headers: getAuthHeader() });
    if (!response.ok) {
      throw new Error("Failed to load comments.");
    }
    const comments = await response.json();
    renderComments("comments-container", comments);
  } catch (error) {
    console.error(error);
  }
}

function renderComments(containerId, comments) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (comments.length === 0) {
    container.innerHTML = "<p>No comments yet.</p>";
    return;
  }
  comments.forEach(comment => {
    const commentEl = document.createElement("div");
    commentEl.classList.add("comment-item");
    commentEl.innerHTML = `
      <p>${comment.CommentText}</p>
      <small>By Reader ${comment.ReaderID} on ${new Date(comment.CommentDate).toLocaleString()}</small>
    `;
    container.appendChild(commentEl);
  });
}

async function postAnimeComment(mangaID, chapterID = null) {
  const commentText = document.getElementById("commentText").value.trim();
  if (!commentText) {
    alert("Please enter a comment.");
    return;
  }
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please log in to comment.");
    window.location.href = "./login.html";
    return;
  }
  const commentData = {
    ReaderID: user.ReaderID,
    MangaID: mangaID,
    ChapterID: chapterID,
    CommentText: commentText,
    CommentDate: new Date().toISOString() // stored as UTC
  };

  try {
    const response = await fetch(`${API_BASE_URL}Comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader()
      },
      body: JSON.stringify(commentData)
    });
    if (!response.ok) {
      throw new Error("Failed to post comment.");
    }
    // Reload comments after posting.
    loadAnimeComments(mangaID, chapterID);
    document.getElementById("commentText").value = "";
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// Attach event listener for anime details comment form if it exists.
const commentForm = document.getElementById("commentForm");
if (commentForm) {
  // Replace 'yourMangaID' with dynamic manga ID if available.
  const mangaID = "yourMangaID";
  // Optional: pass a chapterID if this comment is for a specific chapter.
  commentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    postAnimeComment(mangaID);
  });
  // Initial load of comments.
  loadAnimeComments(mangaID);
}

// ------------------------------
// Chapter Comment Functions
// ------------------------------
async function loadChapterComments(mangaID, chapterID) {
  try {
    let url = `${API_BASE_URL}Comment?mangaID=${mangaID}&chapterID=${chapterID}`;
    const response = await fetch(url, { headers: getAuthHeader() });
    if (!response.ok) {
      throw new Error("Failed to load chapter comments.");
    }
    const comments = await response.json();
    renderComments("chapter-comments-container", comments);
  } catch (error) {
    console.error(error);
  }
}

async function postChapterComment(mangaID, chapterID) {
  const commentText = document.getElementById("chapterCommentText").value.trim();
  if (!commentText) {
    alert("Please enter a comment.");
    return;
  }
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please log in to comment.");
    window.location.href = "./login.html";
    return;
  }
  const commentData = {
    ReaderID: user.ReaderID,
    MangaID: mangaID,
    ChapterID: chapterID,
    CommentText: commentText,
    CommentDate: new Date().toISOString()
  };

  try {
    const response = await fetch(`${API_BASE_URL}Comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader()
      },
      body: JSON.stringify(commentData)
    });
    if (!response.ok) {
      throw new Error("Failed to post comment.");
    }
    loadChapterComments(mangaID, chapterID);
    document.getElementById("chapterCommentText").value = "";
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// Attach event listener for chapter comment form if it exists.
const chapterCommentForm = document.getElementById("chapterCommentForm");
if (chapterCommentForm) {
  // Replace with dynamic IDs as necessary.
  const mangaID = "yourMangaID";
  const chapterID = "yourChapterID";
  chapterCommentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    postChapterComment(mangaID, chapterID);
  });
  // Initial load of chapter comments.
  loadChapterComments(mangaID, chapterID);
}
