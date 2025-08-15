import requests
import json
import pyodbc

def get_manga_details(manga_id, thumbnail_url):
    manga_url = f"https://api.mangadex.org/manga/{manga_id}"
    response = requests.get(manga_url)
    if response.status_code == 200:
        data = response.json()
        manga_name = data["data"]["attributes"]["title"].get("en", "Unknown Title")
        description = data["data"]["attributes"].get("description", {}).get("en", "No description available.")[:300]  # Truncate to 300 chars
        genres = ", ".join([tag["attributes"]["name"].get("en", "Unknown Genre") for tag in data["data"]["attributes"].get("tags", [])])
        author_id = next((rel["id"] for rel in data["data"]["relationships"] if rel["type"] == "author"), None)
        author_name = get_author_name(author_id) if author_id else "Unknown Author"
        return manga_name, description, genres, author_name, thumbnail_url
    return None, None, "", "Unknown Author", ""

def get_author_name(author_id):
    author_url = f"https://api.mangadex.org/author/{author_id}"
    response = requests.get(author_url)
    if response.status_code == 200:
        data = response.json()
        return data["data"]["attributes"].get("name", "Unknown Author")
    return "Unknown Author"

def get_chapters(manga_id):
    chapters_url = f"https://api.mangadex.org/manga/{manga_id}/feed"
    params = {"translatedLanguage[]": "en"}  # Filter chapters by English language
    response = requests.get(chapters_url, params=params)
    if response.status_code == 200:
        data = response.json()
        chapter_list = []
        for chap in data.get("data", []):
            chapter_id = chap["id"]
            chapter_no = chap["attributes"].get("chapter", "0")  # Default to "0" if missing
            try:
                chapter_no = float(chapter_no)  # Convert to float instead of int
            except ValueError:
                chapter_no = None  # Handle cases where conversion fails
            chapter_list.append((chapter_id, chapter_no))
        return chapter_list
    return []

def get_chapter_images(chapter_id):
    base_url = "https://api.mangadex.org/at-home/server/"
    chapter_url = f"{base_url}{chapter_id}"
    response = requests.get(chapter_url)
    if response.status_code == 200:
        data = response.json()
        base_path = data['baseUrl']
        hash_value = data['chapter']['hash']
        images = data['chapter']['data']
        return [f"{base_path}/data/{hash_value}/{img}" for img in images]
    return []

def insert_into_db(manga_id, manga_name, author_name, description, genres, thumbnail_url, chapter_data):
    conn = pyodbc.connect('DRIVER={SQL Server};SERVER=cmcsv.ric.vn,10000;DATABASE=N10_NHOM4;UID=cmcsv;PWD=cM!@#2025;')
    cursor = conn.cursor()
    
    # Check if manga already exists
    cursor.execute("SELECT COUNT(*) FROM Manga WHERE MangaID = ?", manga_id)
    if cursor.fetchone()[0] == 0:
        # Insert into Manga table only if it does not exist
        cursor.execute("""
            INSERT INTO Manga (MangaID, Title, Genres, Thumbnails, Descriptions)
            VALUES (?, ?, ?, ?, ?)
        """, manga_id, manga_name, genres, thumbnail_url, description)
    
    for chapter_id, chapter_no, images in chapter_data:
        # Check if chapter already exists
        cursor.execute("SELECT COUNT(*) FROM Chapter WHERE ChapterID = ?", chapter_id)
        if cursor.fetchone()[0] == 0:
            # Insert into Chapter table only if it does not exist
            cursor.execute("""
                INSERT INTO Chapter (ChapterID, MangaID, chapter_no)
                VALUES (?, ?, ?)
            """, chapter_id, manga_id, chapter_no)
            
            for index, img_link in enumerate(images, start=1):
                # Insert into Content table without specifying ContentID (auto-increment)
                cursor.execute("""
                    INSERT INTO Content (ChapterID, Image_no, Image_path)
                    VALUES (?, ?, ?)
                """, chapter_id, index, img_link)
    
    conn.commit()
    conn.close()
    print("Data inserted into the database successfully.")

if __name__ == "__main__":
    manga_id = input("Enter MangaDex Manga ID: ")
    thumbnail_url = input("Enter Thumbnail URL: ")
    manga_name, description, genres, author_name, thumbnail_url = get_manga_details(manga_id, thumbnail_url)
    
    if manga_name:
        chapters = get_chapters(manga_id)
        chapter_data = []
        for chapter_id, chapter_num in chapters:
            # Check if chapter already exists before fetching images
            conn = pyodbc.connect('DRIVER={SQL Server};SERVER=cmcsv.ric.vn,10000;DATABASE=N10_NHOM4;UID=cmcsv;PWD=cM!@#2025;')
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM Chapter WHERE ChapterID = ?", chapter_id)
            if cursor.fetchone()[0] == 0:
                images = get_chapter_images(chapter_id)
                chapter_data.append((chapter_id, chapter_num, images))
            conn.close()
        
        insert_into_db(manga_id, manga_name, author_name, description, genres, thumbnail_url, chapter_data)
    else:
        print("Manga not found.")
