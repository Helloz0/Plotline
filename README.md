# Plotline – Movie and TV Show Discovery Website

Plotline is a lightweight, responsive movie and TV show discovery web application created as a college minor project. It allows users to browse trending titles, search for movies and TV shows, view detailed storylines and cast members, and maintain a personal watchlist stored directly in browser `localStorage`.

> **Note:** Plotline is an information catalog and discovery platform only. It does not stream, host, or download video content.

---

## 1. Technologies Used

- **HTML5:** Semantic website structure across separate pages.
- **CSS3:** Modern dark theme styling, responsive grid layout, flexbox, and smooth hover effects.
- **Vanilla JavaScript:** Simple, clean client-side logic with DOM manipulation, Fetch API, and LocalStorage.
- **TMDB API (v3):** The Movie Database REST API for fetching movie and TV show data, posters, and cast details.
- **Browser LocalStorage:** Client-side storage allowing saved watchlist titles to persist across page refreshes and browser restarts.

---

## 2. Project File Structure

The project uses a standard multi-page architecture with no frameworks, libraries, or backend dependencies:

```
proj_Plotline/
├── index.html        # Homepage (Hero section, search bar, popular movies & TV shows)
├── details.html      # Title details page (Poster, overview, rating, cast list, watchlist button)
├── watchlist.html    # Saved watchlist page (Grid of user-saved titles with remove option)
├── style.css         # Unified stylesheet for all pages
├── script.js         # Client-side JavaScript handling API requests, views, and LocalStorage
└── README.md         # Project documentation and setup guide
```

---

## 3. Features

### A. Homepage (`index.html`)
- **Brand Header & Navigation:** Clean navigation bar linking to Home and Watchlist.
- **Hero Section & Search Bar:** Unified search input querying both movies and TV shows using TMDB multi-search.
- **Popular Movies Grid:** Vertical grid displaying trending movies with poster images, titles, release years, and ratings.
- **Popular TV Shows Grid:** Vertical grid displaying popular television shows.
- **Fallback Resilience:** Multi-endpoint fallback strategy ensuring movies and TV shows load reliably regardless of network adblockers.

### B. Title Details (`details.html`)
- **Dynamic Content Loading:** Reads `id` and `type` from the URL query string (e.g., `details.html?id=550&type=movie`).
- **Comprehensive Information:** Displays poster image, media type tag, release date, rating (`★ X.X`), and storyline overview.
- **Contained Horizontal Cast List:** Shows circular cast member photos, actor names, and character roles in a smooth horizontally scrollable section.
- **Watchlist Toggle:** Dynamic button that toggles between "+ Add to Watchlist" and "Remove from Watchlist".
- **Navigation:** Back button to easily return to previous results or homepage.

### C. Personal Watchlist (`watchlist.html`)
- **Persistent Storage:** Saved titles are stored in browser `localStorage`.
- **Duplicate Prevention:** Prevents adding the same title multiple times.
- **Direct Removal:** Quick "Remove" button on each card to remove items from the list.
- **Empty State:** Shows a helpful message and an "Explore Titles" link when no titles are saved.

---

## 4. How to Run the Project

No web server, node installation, or build tool is required:

1. Download or clone this repository to your computer.
2. Open [`script.js`](script.js) in any text editor (Notepad, VS Code, etc.).
3. Ensure your TMDB API v3 key is placed on line 1:
   ```javascript
   const API_KEY = "YOUR_TMDB_API_KEY_HERE";
   ```
4. Double-click [`index.html`](index.html) to open the website directly in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 5. TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
All movie and TV show data and imagery are provided by [The Movie Database](https://www.themoviedb.org/).
