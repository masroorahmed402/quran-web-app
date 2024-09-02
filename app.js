document.addEventListener('DOMContentLoaded', () => {
    const chaptersListButton = document.getElementById('chapters-list-btn');
    const chaptersContainer = document.getElementById('chapters');
    const chaptersSection = document.getElementById('main2');
    const versesContainer = document.getElementById('verses-container');
    const chapterTitle = document.getElementById('chapter-title');
    const urlParams = new URLSearchParams(window.location.search);
    const chapterName = urlParams.get('chapter_name');
    
    if (chapterTitle && chapterName) {
        chapterTitle.textContent = chapterName;
    }
    if (chaptersListButton && chaptersContainer && chaptersSection) {
        fetch('https://api.quran.com/api/v4/chapters')
            .then(response => response.json())
            .then(data => {
                const chapters = data.chapters;
                chapters.forEach(chapter => {
                    const chapterElement = document.createElement('div');
                    chapterElement.classList.add('chapter');
                    chapterElement.innerHTML = `
                        <strong>Chapter ${chapter.id}</strong><br>
                        <span>${chapter.name_complex} <br> (${chapter.translated_name.name})</span><br>
                        <span>${chapter.name_arabic}</span>
                    `;
                    chapterElement.addEventListener('click', () => {
                        handleChapter(chapter.id, chapter.name_complex);
                    });
                    chaptersContainer.appendChild(chapterElement);
                });
            })
            .catch(error => {
                console.error('Error fetching chapters:', error);
            });

        chaptersListButton.addEventListener('click', (event) => {
            event.preventDefault();
            chaptersSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    function handleChapter(chapterId, chapterName) {
        window.location.href = `chapter.html?chapter_id=${chapterId}&chapter_name=${encodeURIComponent(chapterName)}`;
    }

    const fetchIndopakScript = async (verseKey) => {
        const apiUrl = `https://api.quran.com/api/v4/quran/verses/indopak?verse_key=${verseKey}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.verses[0]?.text_indopak || '';
        } catch (error) {
            console.error('Error fetching Indopak script:', error);
            return '';
        }
    };

    if (versesContainer && chapterTitle) {
        const chapterId = urlParams.get('chapter_id');

        if (chapterId) {
            const fetchAllVerses = async (chapterId) => {
                let allVerses = [];
                let page = 1;
                let hasMorePages = true;

                while (hasMorePages) {
                    try {
                        const apiUrl = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?translations=131&words=true&page=${page}&per_page=50`;
                        const response = await fetch(apiUrl);
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        const data = await response.json();
                        const verses = data.verses;

                        if (verses.length === 0) {
                            hasMorePages = false;
                        } else {
                            allVerses = allVerses.concat(verses);
                            page++;
                        }
                    } catch (error) {
                        console.error('Error fetching verses:', error);
                        hasMorePages = false;
                    }
                }
                return allVerses;
            };

            fetchAllVerses(chapterId)
            .then(async (verses) => {
                for (const verse of verses) {
                    const verseBox = document.createElement('div');
                    verseBox.classList.add('verse-box');
                    const arabicText = await fetchIndopakScript(verse.verse_key);
                    const englishText = verse.translations[0].text;
        
                    verseBox.innerHTML = `
                        <h2>Verse ${verse.verse_key}</h2>
                        <p class="arabic-text">${arabicText}</p>
                        <p class="english-text">${englishText}</p>
                        <button class="bookmark-btn" data-verse-key="${verse.verse_key}">Bookmark</button>
                    `;
                    const bookmarkBtn = verseBox.querySelector('.bookmark-btn');
                    bookmarkBtn.addEventListener('click', () => {
                        bookmarkVerse(verse.verse_key, arabicText, englishText);
                    });
                    versesContainer.appendChild(verseBox);
                }
            })
            .catch(error => {
                console.error('Error fetching verses:', error);
            });
        }
    }

    function bookmarkVerse(verseKey, arabicText, englishText) {
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        const bookmark = {
            verseKey,
            arabicText,
            englishText
        };
        bookmarks.push(bookmark);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        const bookmarkBtn = document.querySelector(`button[data-verse-key="${verseKey}"]`);
        if (bookmarkBtn) {
            bookmarkBtn.textContent = 'Bookmarked';
            bookmarkBtn.disabled = true;
        }
        alert('Verse bookmarked!');
    }
});
