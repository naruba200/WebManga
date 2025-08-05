document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const chapterID = urlParams.get('chapterID');

    if (!chapterID) {
        alert("Chapter not found!");
        return;
    }

    try {
        const contentDiv = document.getElementById("chapter-content");
        contentDiv.innerHTML = "<p>Loading...</p>";

        // Fetch chapter details
        const chapterResponse = await fetch(`http://mangahomebrew.runasp.net/api/Chapter/${chapterID}`);
        if (!chapterResponse.ok) throw new Error("Failed to load chapter.");
        const chapter = await chapterResponse.json();

        // Update chapter dropdown text
        const chapterDropdown = document.getElementById("current-chapter");
        chapterDropdown.innerText = `Chapter ${chapter.chapter_no}`;

        if (!chapter.contents || chapter.contents.length === 0) {
            contentDiv.innerHTML = "<p>No images available.</p>";
            return;
        }

        // Sort and display images
        chapter.contents.sort((a, b) => a.image_no - b.image_no);
        contentDiv.innerHTML = "";
        chapter.contents.forEach(content => {
            const imgElement = document.createElement("img");
            imgElement.src = content.image_path;
            imgElement.alt = `Image ${content.image_no}`;
            imgElement.classList.add("chapter-image");
            contentDiv.appendChild(imgElement);
        });

        // Fetch all chapters
        const mangaID = chapter.mangaID;
        if (!mangaID) throw new Error("Manga ID not found in chapter data.");

        const chaptersResponse = await fetch(`http://mangahomebrew.runasp.net/api/Chapter/manga/${mangaID}`);
        if (!chaptersResponse.ok) throw new Error("Failed to fetch chapters.");
        const chapters = await chaptersResponse.json();

        if (!Array.isArray(chapters) || chapters.length === 0) throw new Error("No chapters available.");
        chapters.sort((a, b) => a.chapter_no - b.chapter_no);

        // Setup Navigation Buttons
        const prevButton = document.getElementById("prev-chapter-bottom");
        const nextButton = document.getElementById("next-chapter-bottom");
        const topPrevButton = document.getElementById("top-prev-chapter");
        const topNextButton = document.getElementById("top-next-chapter");
        const bottomNav = document.querySelector(".bottom-navigation-container");

        const currentIndex = chapters.findIndex(ch => ch.chapterID == chapterID);

        function setNavigationButton(button, condition, chapter) {
            if (button) {
                if (condition) {
                    button.style.display = "inline-block";
                    button.onclick = () => {
                        window.location.href = `read-chapter.html?chapterID=${chapter.chapterID}`;
                    };
                } else {
                    button.style.display = "none";
                }
            }
        }

        setNavigationButton(prevButton, currentIndex > 0, chapters[currentIndex - 1]);
        setNavigationButton(nextButton, currentIndex < chapters.length - 1, chapters[currentIndex + 1]);
        setNavigationButton(topPrevButton, currentIndex > 0, chapters[currentIndex - 1]);
        setNavigationButton(topNextButton, currentIndex < chapters.length - 1, chapters[currentIndex + 1]);

        // Populate Chapter List
        const chapterListContainer = document.getElementById("chapter-list");
        chapterListContainer.innerHTML = ""; // Clear existing list

        chapters.forEach((ch) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `<a href="read-chapter.html?chapterID=${ch.chapterID}">Chapter ${ch.chapter_no}</a>`;
            listItem.classList.add("chapter-item");

            if (ch.chapterID == chapterID) {
                listItem.classList.add("active");
            }

            listItem.addEventListener("click", () => {
                window.location.href = `read-chapter.html?chapterID=${ch.chapterID}`;
            });

            chapterListContainer.appendChild(listItem);
        });

        // Toggle Chapter List
        chapterDropdown.addEventListener("click", (event) => {
            event.stopPropagation();
            const chapterList = document.getElementById("chapter-list");
            
            // Ensure the element exists
            if (!chapterList) {
                console.error("Chapter list element not found!");
                return;
            }
        
            // Toggle visibility using class
            if (chapterList.classList.contains("d-none")) {
                chapterList.classList.remove("d-none");
                console.log("Chapter list shown");
            } else {
                chapterList.classList.add("d-none");
                console.log("Chapter list hidden");
            }
        
            // Log the computed style to confirm actual visibility
            const computedStyle = window.getComputedStyle(chapterList);
            console.log("Computed display:", computedStyle.display);
        });
        
        // Close the list when clicking outside
        document.addEventListener("click", (event) => {
            const chapterList = document.getElementById("chapter-list");
            if (!chapterDropdown.contains(event.target) && !chapterList.contains(event.target)) {
                chapterList.classList.add("d-none");
                console.log("Chapter list hidden (outside click)");
            }
        });
    } catch (error) {
        console.error("Error loading content:", error);
        document.getElementById("chapter-content").innerHTML = `<p>Failed to load content: ${error.message}</p>`;
    }
});
