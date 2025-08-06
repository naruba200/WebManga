const API_BASE_URL = 'http://localhost:5000/api/';

// Lấy các phần tử DOM
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');

// Xử lý sự kiện nhấn nút Search
searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) {
        searchResults.innerHTML = '<p>Please enter a manga title to search.</p>';
        return;
    }

    searchResults.innerHTML = '<p>Loading...</p>'; 

    try {
        const response = await fetch(`${API_BASE_URL}Manga/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to search manga: ${response.status} - ${errorText}`);
        }

        const mangas = await response.json();
        console.log('Raw API response:', mangas); 

        // Lấy mảng từ "data" nếu API trả về 
        const mangaList = mangas.data || mangas;
        displaySearchResults(mangaList);
    } catch (error) {
        console.error('Error searching manga:', error.message);
        searchResults.innerHTML = `<p>Error: ${error.message}. Please check if the backend is running and try again.</p>`;
    }
});

// Xử lý sự kiện nhấn Enter trong ô nhập liệu
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Hiển thị kết quả tìm kiếm 
function displaySearchResults(mangas) {
    console.log('Processing mangas:', mangas); 

    // Kiểm tra dữ liệu hợp lệ
    if (!Array.isArray(mangas)) {
        console.error('API response is not an array:', mangas);
        searchResults.innerHTML = '<p>Invalid response from server. Expected an array.</p>';
        return;
    }

    if (mangas.length === 0) {
        console.log('No mangas found in response');
        searchResults.innerHTML = '<p>No results found for your search.</p>';
        return;
    }

    const html = mangas.map((manga, index) => {
        console.log(`Processing manga #${index}:`, manga); 

        const mangaId = manga.mangaID;
        const title = manga.title;
        const thumbnails = manga.thumbnails;
        const genres = manga.genres;

        if (!manga || !title) {
            console.warn(`Invalid manga data at index ${index} (missing title):`, manga);
            return ''; 
        }

        const linkId = mangaId || 'unknown'; 

        return `
            <div class="search-item">
                <img src="${thumbnails}" alt="${title}">
                <div class="info">
                    <a href="anime-details.html?mangaID=${linkId}">${title}</a>
                    <span>Genres: ${genres || 'N/A'}</span>
                </div>
            </div>
        `;
    }).filter(item => item).join(''); 

    console.log('Generated HTML:', html); 

    
    if (!html) {
        console.warn('No valid manga data to display. Missing required field (title).');
        searchResults.innerHTML = '<p>No valid manga data to display. Missing required field (title).</p>';
        return;
    }

    searchResults.innerHTML = html;
}


document.querySelector('.back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});