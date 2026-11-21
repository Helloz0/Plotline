const API_KEY = "insert_API_key";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_PROFILE_BASE = "https://image.tmdb.org/t/p/w185";

const POSTER_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' fill='%23151a23'%3E%3Crect width='100%25' height='100%25'/%3E%3Ctext x='50%25' y='50%25' fill='%2364748b' font-family='sans-serif' font-size='16' text-anchor='middle' dy='.3em'%3ENo Poster%3C/text%3E%3C/svg%3E";
const PROFILE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%231c2230'%3E%3Ccircle cx='50' cy='50' r='50'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%2364748b'/%3E%3Cpath d='M25 80c0-14 11-25 25-25s25 11 25 25z' fill='%2364748b'/%3E%3C/svg%3E";

function getWatchlist() {
    const data = localStorage.getItem("plotline_watchlist");
    return data ? JSON.parse(data) : [];
}

function saveWatchlist(list) {
    localStorage.setItem("plotline_watchlist", JSON.stringify(list));
}

function isItemInWatchlist(id, type) {
    const list = getWatchlist();
    for (let i = 0; i < list.length; i++) {
        if (String(list[i].id) === String(id) && list[i].type === type) {
            return true;
        }
    }
    return false;
}

function addToWatchlist(item) {
    const list = getWatchlist();
    if (!isItemInWatchlist(item.id, item.type)) {
        list.push(item);
        saveWatchlist(list);
    }
}

function removeFromWatchlist(id, type) {
    const list = getWatchlist();
    const updated = [];
    for (let i = 0; i < list.length; i++) {
        if (!(String(list[i].id) === String(id) && list[i].type === type)) {
            updated.push(list[i]);
        }
    }
    saveWatchlist(updated);
}

function createPosterCard(item, defaultType, showBadge) {
    const mediaType = item.media_type || defaultType;
    const title = item.title || item.name || "Untitled";
    const releaseDate = item.release_date || item.first_air_date || "";
    const year = releaseDate ? releaseDate.slice(0, 4) : "N/A";
    const poster = item.poster_path ? (TMDB_IMAGE_BASE + item.poster_path) : POSTER_PLACEHOLDER;
    const typeLabel = mediaType === "tv" ? "TV Show" : "Movie";

    let ratingHtml = "";
    if (item.vote_average) {
        ratingHtml = "<span class=\"card-rating\">&#9733; " + item.vote_average.toFixed(1) + "</span>";
    }

    let badgeHtml = "";
    if (showBadge) {
        badgeHtml = "<span class=\"type-badge\">" + typeLabel + "</span>";
    }

    const card = document.createElement("a");
    card.className = "poster-card";
    card.href = "details.html?id=" + item.id + "&type=" + mediaType;

    card.innerHTML = `
        <div class="poster-image-wrap">
            ${badgeHtml}
            <img src="${poster}" alt="${title}" class="poster-image" onerror="this.src='${POSTER_PLACEHOLDER}'">
        </div>
        <div class="card-info">
            <div class="card-title">${title}</div>
            <div class="card-bottom">
                <span class="card-year">${year}</span>
                ${ratingHtml}
            </div>
        </div>
    `;

    return card;
}

function loadPopularSection(type, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const urls = [
        TMDB_BASE_URL + "/discover/" + type + "?api_key=" + API_KEY + "&sort_by=popularity.desc",
        TMDB_BASE_URL + "/" + type + "/popular?api_key=" + API_KEY,
        TMDB_BASE_URL + "/trending/" + type + "/week?api_key=" + API_KEY
    ];

    function tryFetch(index) {
        if (index >= urls.length) {
            grid.innerHTML = "<div class='status-message'>Unable to load titles right now. Please check your internet connection or ad-blocker settings.</div>";
            return;
        }

        fetch(urls[index])
            .then(function (res) {
                if (!res.ok) {
                    throw new Error("HTTP " + res.status);
                }
                return res.json();
            })
            .then(function (data) {
                grid.innerHTML = "";
                const items = data.results || [];
                if (items.length > 0) {
                    for (let i = 0; i < items.length; i++) {
                        const card = createPosterCard(items[i], type, false);
                        grid.appendChild(card);
                    }
                } else {
                    tryFetch(index + 1);
                }
            })
            .catch(function () {
                tryFetch(index + 1);
            });
    }

    tryFetch(0);
}

function initHomePage() {
    loadPopularSection("movie", "popular-movies-grid");
    loadPopularSection("tv", "popular-tv-grid");

    const form = document.getElementById("search-form");
    const input = document.getElementById("search-input");
    const resultsSection = document.getElementById("search-results-section");
    const resultsGrid = document.getElementById("search-results-grid");
    const resultsTitle = document.getElementById("search-results-title");
    const clearBtn = document.getElementById("clear-search-btn");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;

        resultsSection.style.display = "block";
        resultsGrid.innerHTML = "<div class='status-message'>Searching...</div>";
        resultsTitle.textContent = "Search Results for \"" + query + "\"";

        const url = TMDB_BASE_URL + "/search/multi?api_key=" + API_KEY + "&query=" + encodeURIComponent(query);

        fetch(url)
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
                resultsGrid.innerHTML = "";
                const list = [];
                const raw = data.results || [];

                for (let i = 0; i < raw.length; i++) {
                    if (raw[i].media_type === "movie" || raw[i].media_type === "tv") {
                        list.push(raw[i]);
                    }
                }

                if (list.length > 0) {
                    for (let i = 0; i < list.length; i++) {
                        const card = createPosterCard(list[i], list[i].media_type, true);
                        resultsGrid.appendChild(card);
                    }
                } else {
                    resultsGrid.innerHTML = "<div class='status-message'>No movies or TV shows found matching \"" + query + "\".</div>";
                }

                resultsSection.scrollIntoView({ behavior: "smooth" });
            })
            .catch(function () {
                resultsGrid.innerHTML = "<div class='status-message'>Search request failed. Please check your network or API key.</div>";
            });
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            input.value = "";
            resultsSection.style.display = "none";
            resultsGrid.innerHTML = "";
        });
    }
}

function initDetailsPage() {
    const container = document.getElementById("details-container");
    const backBtn = document.getElementById("back-btn");

    if (backBtn) {
        backBtn.addEventListener("click", function () {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = "index.html";
            }
        });
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const type = params.get("type");

    if (!id || !type || !container) {
        if (container) container.innerHTML = "<div class='status-message'>Invalid title selection. Please return to the homepage.</div>";
        return;
    }

    const url = TMDB_BASE_URL + "/" + type + "/" + id + "?api_key=" + API_KEY + "&append_to_response=credits";

    fetch(url)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            const title = data.title || data.name || "Untitled";
            const releaseDate = data.release_date || data.first_air_date || "Unknown";
            const year = releaseDate !== "Unknown" ? releaseDate.slice(0, 4) : "N/A";
            const rating = data.vote_average ? data.vote_average.toFixed(1) : "N/A";
            const overview = data.overview && data.overview.trim() !== "" ? data.overview : "No description available.";
            const poster = data.poster_path ? (TMDB_IMAGE_BASE + data.poster_path) : POSTER_PLACEHOLDER;
            const typeLabel = type === "tv" ? "TV Show" : "Movie";

            document.title = title + " - Plotline";

            let castHtml = "";
            if (data.credits && data.credits.cast && data.credits.cast.length > 0) {
                const count = Math.min(data.credits.cast.length, 10);
                for (let i = 0; i < count; i++) {
                    const member = data.credits.cast[i];
                    const photo = member.profile_path ? (TMDB_PROFILE_BASE + member.profile_path) : PROFILE_PLACEHOLDER;
                    castHtml += `
                        <div class="cast-card">
                            <img src="${photo}" alt="${member.name}" class="cast-image" onerror="this.src='${PROFILE_PLACEHOLDER}'">
                            <span class="cast-name">${member.name}</span>
                            <span class="cast-character">${member.character || ""}</span>
                        </div>
                    `;
                }
            } else {
                castHtml = "<p style='color: #94a3b8; font-size: 14px;'>Cast information unavailable.</p>";
            }

            const inWatchlist = isItemInWatchlist(data.id, type);
            const btnClass = inWatchlist ? "watchlist-btn remove" : "watchlist-btn add";
            const btnText = inWatchlist ? "Remove from Watchlist" : "+ Add to Watchlist";

            container.innerHTML = `
                <div class="details-card">
                    <div class="details-poster-wrap">
                        <img src="${poster}" alt="${title}" class="details-poster" onerror="this.src='${POSTER_PLACEHOLDER}'">
                    </div>
                    <div class="details-info">
                        <h1 class="details-title">${title}</h1>
                        <div class="details-meta">
                            <span class="meta-badge">${typeLabel}</span>
                            <span class="meta-badge rating-badge">&#9733; ${rating}</span>
                            <span>Released: ${releaseDate}</span>
                        </div>
                        <div>
                            <button id="watchlist-toggle-btn" class="${btnClass}">${btnText}</button>
                        </div>
                        <h3 class="details-overview-heading">Storyline</h3>
                        <p class="details-overview">${overview}</p>
                        <div class="cast-section">
                            <h3 class="cast-heading">Cast</h3>
                            <div class="cast-scroll-container">
                                ${castHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const toggleBtn = document.getElementById("watchlist-toggle-btn");
            toggleBtn.addEventListener("click", function () {
                const isSaved = isItemInWatchlist(data.id, type);
                if (isSaved) {
                    removeFromWatchlist(data.id, type);
                    toggleBtn.className = "watchlist-btn add";
                    toggleBtn.textContent = "+ Add to Watchlist";
                } else {
                    addToWatchlist({
                        id: data.id,
                        type: type,
                        title: title,
                        year: year,
                        poster: poster
                    });
                    toggleBtn.className = "watchlist-btn remove";
                    toggleBtn.textContent = "Remove from Watchlist";
                }
            });
        })
        .catch(function () {
            container.innerHTML = "<div class='status-message'>Failed to load title details. Please check your connection or API key.</div>";
        });
}

function initWatchlistPage() {
    const grid = document.getElementById("watchlist-grid");
    const emptyState = document.getElementById("empty-watchlist");
    if (!grid || !emptyState) return;

    const list = getWatchlist();
    grid.innerHTML = "";

    if (list.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const card = document.createElement("div");
        card.className = "poster-card";
        const typeLabel = item.type === "tv" ? "TV Show" : "Movie";

        card.innerHTML = `
            <a href="details.html?id=${item.id}&type=${item.type}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column;">
                <div class="poster-image-wrap">
                    <span class="type-badge">${typeLabel}</span>
                    <img src="${item.poster}" alt="${item.title}" class="poster-image" onerror="this.src='${POSTER_PLACEHOLDER}'">
                </div>
                <div class="card-info">
                    <div class="card-title">${item.title}</div>
                    <div class="card-bottom">
                        <span class="card-year">${item.year}</span>
                    </div>
                </div>
            </a>
            <div class="card-action">
                <button class="remove-btn">Remove</button>
            </div>
        `;

        const removeBtn = card.querySelector(".remove-btn");
        removeBtn.addEventListener("click", function (e) {
            e.preventDefault();
            removeFromWatchlist(item.id, item.type);
            initWatchlistPage();
        });

        grid.appendChild(card);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.getAttribute("data-page");
    if (page === "home") {
        initHomePage();
    } else if (page === "details") {
        initDetailsPage();
    } else if (page === "watchlist") {
        initWatchlistPage();
    }
});
