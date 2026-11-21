const API_KEY = "155dcce6b2c38f5f94080010ce1698fe";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_PROFILE_BASE = "https://image.tmdb.org/t/p/w185";

const POSTER_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22450%22%20viewBox%3D%220%200%20300%20450%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23161b22%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22260%22%20height%3D%22410%22%20rx%3D%228%22%20fill%3D%22none%22%20stroke%3D%22%2330363d%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M110%20180h80v70h-80z%22%20fill%3D%22none%22%20stroke%3D%22%238b949e%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22135%22%20cy%3D%22205%22%20r%3D%2210%22%20fill%3D%22%238b949e%22%2F%3E%3Cpath%20d%3D%22M115%20245l25-30%2020%2020%2025-35%22%20fill%3D%22none%22%20stroke%3D%22%238b949e%22%20stroke-width%3D%223%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22285%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%238b949e%22%20text-anchor%3D%22middle%22%20font-weight%3D%22bold%22%3ENo%20Poster%3C%2Ftext%3E%3C%2Fsvg%3E";
const PROFILE_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%2321262d%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%238b949e%22%2F%3E%3Cpath%20d%3D%22M20%2085c0-16.5%2013.5-30%2030-30s30%2013.5%2030%2030z%22%20fill%3D%22%238b949e%22%2F%3E%3C%2Fsvg%3E";

function getWatchlist() {
    const data = localStorage.getItem("plotline_watchlist");
    return data ? JSON.parse(data) : [];
}

function saveWatchlist(list) {
    localStorage.setItem("plotline_watchlist", JSON.stringify(list));
}

function isItemInWatchlist(id, type) {
    const list = getWatchlist();
    return list.some(function (item) {
        return String(item.id) === String(id) && item.type === type;
    });
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
    const updated = list.filter(function (item) {
        return !(String(item.id) === String(id) && item.type === type);
    });
    saveWatchlist(updated);
}

function checkApiKey() {
    if (!API_KEY || API_KEY === "YOUR_TMDB_API_KEY_HERE") {
        const main = document.querySelector("main");
        if (main && !document.getElementById("api-notice")) {
            const notice = document.createElement("div");
            notice.id = "api-notice";
            notice.className = "api-notice";
            notice.innerHTML = "<strong>TMDB API Key Required:</strong> Please replace <code>YOUR_TMDB_API_KEY_HERE</code> in <code>script.js</code> with your TMDB v3 API key to load movies and TV shows.";
            main.insertBefore(notice, main.firstChild);
        }
        return false;
    }
    return true;
}

function createPosterCard(item, defaultType) {
    const mediaType = item.media_type || defaultType;
    const title = item.title || item.name || "Untitled";
    const releaseDate = item.release_date || item.first_air_date || "";
    const year = releaseDate ? releaseDate.slice(0, 4) : "N/A";
    const poster = item.poster_path ? (TMDB_IMAGE_BASE + item.poster_path) : POSTER_PLACEHOLDER;
    const typeLabel = mediaType === "tv" ? "TV Show" : "Movie";

    const card = document.createElement("a");
    card.className = "poster-card";
    card.href = "details.html?id=" + item.id + "&type=" + mediaType;

    card.innerHTML = `
        <div class="poster-image-wrap">
            <span class="type-badge">${typeLabel}</span>
            <img src="${poster}" alt="${title}" class="poster-image" onerror="this.src='${POSTER_PLACEHOLDER}'">
        </div>
        <div class="card-info">
            <div class="card-title">${title}</div>
            <div class="card-year">${year}</div>
        </div>
    `;

    return card;
}

function initHomePage() {
    if (!checkApiKey()) {
        const movieGrid = document.getElementById("popular-movies-grid");
        const tvGrid = document.getElementById("popular-tv-grid");
        if (movieGrid) movieGrid.innerHTML = "<div class='status-message'>Insert API key in script.js to view popular movies.</div>";
        if (tvGrid) tvGrid.innerHTML = "<div class='status-message'>Insert API key in script.js to view popular TV shows.</div>";
        return;
    }

    loadPopularMovies();
    loadPopularTVShows();
    initSearch();
}

function loadPopularMovies() {
    const grid = document.getElementById("popular-movies-grid");
    const url = TMDB_BASE_URL + "/movie/popular?api_key=" + API_KEY;

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            grid.innerHTML = "";
            if (data.results && data.results.length > 0) {
                for (let i = 0; i < data.results.length; i++) {
                    const card = createPosterCard(data.results[i], "movie");
                    grid.appendChild(card);
                }
            } else {
                grid.innerHTML = "<div class='status-message'>No popular movies found.</div>";
            }
        })
        .catch(function () {
            grid.innerHTML = "<div class='status-message'>Failed to load popular movies. Please check your internet connection or API key.</div>";
        });
}

function loadPopularTVShows() {
    const grid = document.getElementById("popular-tv-grid");
    const url = TMDB_BASE_URL + "/tv/popular?api_key=" + API_KEY;

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            grid.innerHTML = "";
            if (data.results && data.results.length > 0) {
                for (let i = 0; i < data.results.length; i++) {
                    const card = createPosterCard(data.results[i], "tv");
                    grid.appendChild(card);
                }
            } else {
                grid.innerHTML = "<div class='status-message'>No popular TV shows found.</div>";
            }
        })
        .catch(function () {
            grid.innerHTML = "<div class='status-message'>Failed to load popular TV shows. Please check your internet connection or API key.</div>";
        });
}

function initSearch() {
    const form = document.getElementById("search-form");
    const input = document.getElementById("search-input");
    const resultsSection = document.getElementById("search-results-section");
    const resultsGrid = document.getElementById("search-results-grid");
    const resultsTitle = document.getElementById("search-results-title");
    const clearBtn = document.getElementById("clear-search-btn");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;

        resultsSection.style.display = "block";
        resultsGrid.innerHTML = "<div class='status-message'>Searching...</div>";
        resultsTitle.textContent = "Search Results for \"" + query + "\"";

        const url = TMDB_BASE_URL + "/search/multi?api_key=" + API_KEY + "&query=" + encodeURIComponent(query);

        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                resultsGrid.innerHTML = "";

                let filtered = [];
                if (data.results && data.results.length > 0) {
                    filtered = data.results.filter(function (item) {
                        return item.media_type === "movie" || item.media_type === "tv";
                    });
                }

                if (filtered.length > 0) {
                    for (let i = 0; i < filtered.length; i++) {
                        const card = createPosterCard(filtered[i], filtered[i].media_type);
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

    clearBtn.addEventListener("click", function () {
        input.value = "";
        resultsSection.style.display = "none";
        resultsGrid.innerHTML = "";
    });
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

    if (!checkApiKey()) {
        container.innerHTML = "<div class='status-message'>Insert API key in script.js to view details.</div>";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const type = params.get("type");

    if (!id || !type) {
        container.innerHTML = "<div class='status-message'>Invalid title selection. Please return to the homepage.</div>";
        return;
    }

    const url = TMDB_BASE_URL + "/" + type + "/" + id + "?api_key=" + API_KEY + "&append_to_response=credits";

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            renderDetails(data, type);
        })
        .catch(function () {
            container.innerHTML = "<div class='status-message'>Failed to load title details. Please check your connection or API key.</div>";
        });
}

function renderDetails(data, type) {
    const container = document.getElementById("details-container");
    const title = data.title || data.name || "Untitled";
    const releaseDate = data.release_date || data.first_air_date || "Unknown";
    const year = releaseDate !== "Unknown" ? releaseDate.slice(0, 4) : "N/A";
    const rating = data.vote_average ? data.vote_average.toFixed(1) + " / 10" : "N/A";
    const overview = data.overview && data.overview.trim() !== "" ? data.overview : "No description available.";
    const poster = data.poster_path ? (TMDB_IMAGE_BASE + data.poster_path) : POSTER_PLACEHOLDER;
    const typeLabel = type === "tv" ? "TV Show" : "Movie";

    let castHtml = "";
    if (data.credits && data.credits.cast && data.credits.cast.length > 0) {
        const topCast = data.credits.cast.slice(0, 10);
        for (let i = 0; i < topCast.length; i++) {
            const member = topCast[i];
            const memberPhoto = member.profile_path ? (TMDB_PROFILE_BASE + member.profile_path) : PROFILE_PLACEHOLDER;
            castHtml += `
                <div class="cast-card">
                    <img src="${memberPhoto}" alt="${member.name}" class="cast-image" onerror="this.src='${PROFILE_PLACEHOLDER}'">
                    <span class="cast-name">${member.name}</span>
                    <span class="cast-character">${member.character || ""}</span>
                </div>
            `;
        }
    } else {
        castHtml = "<p style='color: #8b949e; font-size: 14px;'>Cast information unavailable.</p>";
    }

    const inWatchlist = isItemInWatchlist(data.id, type);
    const btnClass = inWatchlist ? "watchlist-btn remove" : "watchlist-btn add";
    const btnText = inWatchlist ? "Remove from Watchlist" : "+ Add to Watchlist";

    container.innerHTML = `
        <div class="details-container">
            <div class="details-poster-wrap">
                <img src="${poster}" alt="${title}" class="details-poster" onerror="this.src='${POSTER_PLACEHOLDER}'">
            </div>
            <div class="details-info">
                <h1 class="details-title">${title}</h1>
                <div class="details-meta">
                    <span class="meta-badge">${typeLabel}</span>
                    <span class="meta-badge">${year}</span>
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
        const currentSaved = isItemInWatchlist(data.id, type);
        if (currentSaved) {
            removeFromWatchlist(data.id, type);
            toggleBtn.className = "watchlist-btn add";
            toggleBtn.textContent = "+ Add to Watchlist";
        } else {
            const itemToSave = {
                id: data.id,
                type: type,
                title: title,
                year: year,
                poster: poster
            };
            addToWatchlist(itemToSave);
            toggleBtn.className = "watchlist-btn remove";
            toggleBtn.textContent = "Remove from Watchlist";
        }
    });
}

function initWatchlistPage() {
    renderWatchlistGrid();
}

function renderWatchlistGrid() {
    const grid = document.getElementById("watchlist-grid");
    const emptyState = document.getElementById("empty-watchlist");
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
                    <div class="card-year">${item.year}</div>
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
            renderWatchlistGrid();
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
