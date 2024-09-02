const clearAllButton = document.getElementById('clearall');
document.addEventListener('DOMContentLoaded', () => {
    const bookmarksContainer = document.getElementById('bookmarks-container');

    function loadBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        
        bookmarksContainer.innerHTML = ''; 

        bookmarks.forEach(bookmark => {
            const bookmarkBox = document.createElement('div');
            bookmarkBox.classList.add('bookmark-box');

            bookmarkBox.innerHTML = `
                <h2>Verse ${bookmark.verseKey}</h2>
                <p class="arabic-text">${bookmark.arabicText}</p>
                <p class="english-text">${bookmark.englishText}</p>
            `;
            bookmarksContainer.appendChild(bookmarkBox);
        });

        if (bookmarks.length === 0) {
            bookmarksContainer.innerHTML = '<p>No bookmarks found.</p>';
        }
    }
    function clearAllBookmarks() {
        localStorage.removeItem('bookmarks');
        loadBookmarks();
    }
    clearAllButton.addEventListener('click', clearAllBookmarks);
    loadBookmarks();
});