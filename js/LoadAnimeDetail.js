document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const mangaID = urlParams.get('mangaID');

    if (!mangaID) {
        alert("Manga not found!");
        return;
    }

    let firstChapterID = null; // Store first chapter

    // Fetch manga details
    fetch(`http://localhost:5000/api/Manga/${mangaID}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch manga details.");
            return response.json();
        })
        .then(manga => {
            document.querySelector('.anime__details__pic').style.backgroundImage = `url(${manga.thumbnails || 'default-thumbnail.jpg'})`;
            document.querySelector('.comment').innerHTML = `<i class="fa fa-comments"></i> ${manga.comments?.length || 0}`;
            document.querySelector('.view').innerHTML = `<i class="fa fa-eye"></i> ${manga.followers?.length || 0}`;

            document.querySelector('.anime__details__title h3').innerText = manga.title;
            document.querySelector('.anime__details__title span').innerText = manga.alternateTitle || "No alternate title";

            const descriptionElement = document.querySelector('.anime__details__text p');
            if (descriptionElement) {
                descriptionElement.innerText = manga.descriptions || "No description available.";
            }

            document.querySelector('.anime__details__widget ul').innerHTML = `
                <li><span>Genre:</span> ${manga.genres || 'Unknown'}</li>
            `;
        })
        .catch(error => {
            console.error('Error fetching manga details:', error);
            alert("Failed to load manga details!");
        });

    // Fetch chapters for the manga
    fetch(`http://localhost:5000/api/Chapter/manga/${mangaID}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch chapters.");
            return response.json();
        })
        .then(chapters => {
            const chapterList = document.getElementById('chapter-list');
            chapterList.innerHTML = ""; // Clear previous content

            if (!chapters.length) {
                chapterList.innerHTML = "<li>No chapters available.</li>";
                return;
            }

            // Sort chapters by chapter number (ascending order)
            chapters.sort((a, b) => a.chapter_no - b.chapter_no);

            // Store the first chapter ID
            firstChapterID = chapters[0].chapterID;

            // Display chapters
            chapters.forEach(chapter => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<a href="read-chapter.html?chapterID=${chapter.chapterID}">Chapter ${chapter.chapter_no}</a>`;
                chapterList.appendChild(listItem);
            });

            // Set "Watch Now" button to open first chapter
            if (firstChapterID) {
                document.querySelector('.watch-btn').setAttribute("href", `read-chapter.html?chapterID=${firstChapterID}`);
            } else {
                document.querySelector('.watch-btn').removeAttribute("href"); // Disable button if no chapters
            }
        })
        .catch(error => {
            console.error('Error fetching chapters:', error);
            document.getElementById('chapter-list').innerHTML = "<li>Failed to load chapters.</li>";
        });
});
