const mangaContainer = document.getElementById('manga-container');
const paginationContainer = document.getElementById('pagination');
const genreToggle = document.getElementById('genre-toggle');
const genreMenu = document.getElementById('genre-menu');
const genreItemsContainer = document.querySelector('.genre-items-container');
const trendingProduct = document.querySelector('.trending__product');
const itemsPerPage = 10;
let currentPage = 1;
let allManga = [];
let isDropdownOpen = false;

async function fetchMangaData(page = 1) {
    try {
        const response = await fetch(`http://localhost:5000/api/Manga?page=${page}&limit=${itemsPerPage}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        allManga = data.manga || data;
        displayManga(allManga);
        updatePagination(data.total || allManga.length);
    } catch (error) {
        console.error('Error fetching manga:', error);
        mangaContainer.innerHTML = '<p>Error loading manga.</p>';
    }
}

async function fetchAllManga() {
    try {
        const response = await fetch('http://localhost:5000/api/Manga');
        if (!response.ok) throw new Error('Network response was not ok');
        allManga = await response.json();
        filteredManga = allManga;
        populateGenreDropdown();
        displayManga(filteredManga, 1);
        updatePagination(filteredManga.length);
    } catch (error) {
        console.error('Error fetching manga:', error);
    }
}


function updateGenreToggleText(selectedGenres) {
    if (selectedGenres.length === 0) {
        genreToggle.textContent = 'Select Genres';
    } else if (selectedGenres.length <= 2) {
        genreToggle.textContent = selectedGenres.map(capitalizeGenre).join(', ');
    } else {
        const visibleGenres = selectedGenres.slice(0, 2).map(capitalizeGenre).join(', ');
        const remainingCount = selectedGenres.length - 2;
        genreToggle.textContent = `${visibleGenres} +${remainingCount}`;
    }
    updateResetButton(selectedGenres.length > 0);
}

function capitalizeGenre(genre) {
    return genre
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function populateGenreDropdown() {
    const genres = new Set();
    allManga.forEach(manga => {
        if (manga.genres) {
            manga.genres.split(',').forEach(genre => genres.add(genre.trim()));
        }
    });
    const sortedGenres = [...genres].sort((a, b) => a.localeCompare(b));
    console.log('Sorted genres (A-Z):', sortedGenres);

    genreItemsContainer.innerHTML = '';
    sortedGenres.forEach(genre => {
        const genreItem = document.createElement('div');
        genreItem.className = 'genre-item';
        genreItem.innerHTML = `
            <label style="display: flex; align-items: center;">
                <input type="radio" name="genre" value="${genre}" style="margin-right: 5px;">
                ${genre}
            </label>
        `;
        genreItemsContainer.appendChild(genreItem);
    });

    const radioButtons = genreMenu.querySelectorAll('input[type="radio"]');
    const searchInput = document.getElementById('genre-search');
    const resetButton = document.getElementById('reset-genres');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedGenre = Array.from(radioButtons)
                .find(rb => rb.checked)?.value.toLowerCase();
            displayFilteredManga(selectedGenre ? [selectedGenre] : []);
            updateGenreToggleText(selectedGenre ? [selectedGenre] : []);
        });
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const genreItems = genreItemsContainer.querySelectorAll('.genre-item');
        genreItems.forEach(item => {
            const genreText = item.textContent.toLowerCase();
            item.style.display = genreText.includes(searchTerm) ? 'block' : 'none';
        });
    });

    resetButton.addEventListener('click', () => {
        radioButtons.forEach(rb => (rb.checked = false));
        displayFilteredManga([]);
        updateGenreToggleText([]);
    });

    updateResetButton(false);
}

function updateResetButton(hasSelection) {
    const resetButton = document.getElementById('reset-genres');
    resetButton.style.backgroundColor = hasSelection ? '#ff6666' : '#ff9999';
}

function displayManga(mangaList) {
    mangaContainer.innerHTML = '';
    if (mangaList.length === 0) {
        mangaContainer.innerHTML = '<p>No manga found for selected genres.</p>';
        return;
    }
    mangaList.forEach(manga => {
        const thumbnail = manga.thumbnails;
        const title = manga.title || 'Untitled';
        const mangaID = manga.mangaID || 'unknown';
        const genres = manga.genres ? manga.genres.split(',').map(g => g.trim()) : ['Unknown'];
        const genreText = genres.map(genre => capitalizeGenre(genre)).join(', ');
        const chapterCount = Array.isArray(manga.chapters) ? manga.chapters.length : 'N/A';
        const commentCount = manga.comments || 0;
        const viewCount = manga.views || 0;

        const mangaDiv = document.createElement('div');
        mangaDiv.className = 'col-lg-4 col-md-6 col-sm-6';
        mangaDiv.innerHTML = `
            <div class="product__item" data-manga-id="${mangaID}">
                <div class="product__item__pic set-bg" data-setbg="${thumbnail}">
                    <div class="chapter-count">${chapterCount} Chapters</div>
                    <div class="thumbnail-footer">
                        <div class="comment-box">
                            <i class="fa fa-comments"></i> ${commentCount}
                        </div>
                        <div class="view-box">
                            <i class="fa fa-eye"></i> ${viewCount}
                        </div>
                    </div>
                </div>
                <div class="product__item__text">
                    <p class="product__item__genres">${genreText}</p>
                    <h5><a href="#">${title}</a></h5>
                </div>
            </div>
        `;
        mangaContainer.appendChild(mangaDiv);

        const setBgElement = mangaDiv.querySelector('.set-bg');
        setBgElement.style.backgroundImage = `url(${setBgElement.getAttribute('data-setbg')})`;

        const mangaItem = mangaDiv.querySelector('.product__item');
        mangaItem.style.cursor = 'pointer';
        mangaItem.addEventListener('click', () => {
            window.location.href = `./anime-details.html?mangaID=${mangaID}`;
        });
    });
}

function displayFilteredManga(selectedGenres) {
    let filteredManga = selectedGenres.length === 0
        ? allManga
        : allManga.filter(manga => {
            if (!manga.genres) return false;
            const mangaGenres = manga.genres.split(',').map(g => g.trim().toLowerCase());
            return selectedGenres.some(selectedGenre => mangaGenres.includes(selectedGenre));
        });
    displayManga(filteredManga);
    updatePagination(filteredManga.length);
}

function updatePagination(totalManga) {
    const totalPages = Math.ceil(totalManga / itemsPerPage);
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.className = i === currentPage ? 'current-page' : '';
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            fetchMangaData(currentPage);
        });
        paginationContainer.appendChild(pageLink);
    }

    const nextButton = document.createElement('a');
    nextButton.href = '#';
    nextButton.innerHTML = '<i class="fa fa-angle-double-right"></i>';
    nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            fetchMangaData(currentPage);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
    genreMenu.style.display = isDropdownOpen ? 'block' : 'none';
    trendingProduct.style.marginTop = isDropdownOpen ? `${genreMenu.offsetHeight + 20}px` : '0';
    const genreDropdown = document.querySelector('.genre-dropdown');
    genreDropdown.classList.toggle('active', isDropdownOpen);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAllManga();
    genreToggle.addEventListener('click', toggleDropdown);

    document.addEventListener('click', (e) => {
        if (!genreToggle.contains(e.target) && !genreMenu.contains(e.target) && isDropdownOpen) {
            toggleDropdown();
        }
    });

    genreToggle.textContent = 'Select Genres';
});