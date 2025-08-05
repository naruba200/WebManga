document.addEventListener("DOMContentLoaded", function () {
    async function fetchMangaData() {
        // Check if the required container exists
        const mangaContainer = document.querySelector('.trending__product .row:last-child');
        if (!mangaContainer) {
            console.log('fetchMangaData: No manga container found on this page, skipping execution.');
            return; // Exit if the container doesn't exist
        }

        try {
            const response = await fetch('http://mangahomebrew.runasp.net/api/Manga');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            mangaContainer.innerHTML = ''; // Clear old content

            let htmlContent = ''; // Store HTML to update once
            data.forEach(manga => {
                const thumbnail = manga.thumbnails; // Default image if missing
                const genres = Array.isArray(manga.genres) ? manga.genres.join(', ') : manga.genres || 'Unknown';
                const chapterCount = manga.chapters ? manga.chapters.length : 0;
                const followers = manga.followers ? manga.followers.length : 0;

                htmlContent += `
                    <div class="col-lg-4 col-md-6 col-sm-6">
                        <div class="product__item">
                            <div class="product__item__pic set-bg" style="background-image: url('${thumbnail}');">
                                <div class="ep">${chapterCount} Chapters</div>
                                <div class="comment"><i class="fa fa-comments"></i> 0</div>
                                <div class="view"><i class="fa fa-eye"></i> ${followers}</div>
                            </div>
                            <div class="product__item__text">
                                <ul><li>${genres}</li></ul>
                                <h5><a href="anime-details.html?mangaID=${manga.mangaID}">${manga.title}</a></h5>
                            </div>
                        </div>
                    </div>
                `;
            });

            mangaContainer.innerHTML = htmlContent; // Update content once

        } catch (error) {
            console.error('Error fetching manga data:', error);
        }
    }

    fetchMangaData();
    setInterval(fetchMangaData, 30);
});