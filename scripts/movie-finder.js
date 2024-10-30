document.getElementById("search-form").addEventListener("submit", searchMovie);
const movieList = document.getElementById("movie-list");
const errorMessage = document.getElementById("error-message");
const apiKey = "9ec30f610d3dc47d57d05d68a5c2885d";

let currentPage = 1;
let totalPages = 1;

async function searchMovie(e) {
    e.preventDefault(); // Prevent the default form submission behavior (page refresh)
    const query = document.getElementById("search-query").value;

    if (query === "") {
        errorMessage.textContent = "Please enter a valid movie title.";
        return; // Exit the function if the input is invalid
    }

    errorMessage.textContent = "";
    movieList.innerHTML = "";
    currentPage = 1; // Reset to the first page

    try {
        const movies = await fetchAllMovies(query, apiKey);
        totalPages = Math.ceil(movies.length / 20);
        displayMovies(movies.slice(0, 20)); // Display the first page of movies
        updatePagination();
        updateRecentSearches(query);
    } catch (err) {
        console.error(err);
        errorMessage.textContent = "Something went wrong while retrieving data!";
    }
}

async function fetchAllMovies(query, apiKey) {
    const allMovies = [];
    let page = 1;
    let totalPages = 1;

    do {
        const data = await fetchMovies(query, apiKey, page);
        if (data.results) {
            // Filter for movies in English
            const englishMovies = data.results.filter(movie => movie.original_language === 'en');
            allMovies.push(...englishMovies); //Pushes each element of the array
            totalPages = data.total_pages;
        }
        page++;
    } while (page <= totalPages && page <= 5); // Limit to first 5 pages

    return allMovies;
}


async function fetchMovies(query, apiKey, page) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&page=${page}`);
    return response.json();
}

function displayMovies(movies) {
    const movieList = document.getElementById("movie-list");
    movieList.innerHTML = ""; // Clear previous results

    movies.forEach((movie) => {
        const movieCard = createMovieCard(movie);
        movieList.appendChild(movieCard);
    });
}


function createMovieCard(movie) {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";

    const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "assets/no-image-placeholder.png";

    movieCard.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                <img src="${posterUrl}" alt="${movie.title}">
                <h2>${movie.title} (${movie.release_date ? movie.release_date.split('-')[0] : 'Unknown'})</h2>
            </div>
            <div class="card-back">
                <h2>Overview</h2> 
                <p>${movie.overview}</p>
                <p>Rating: ${movie.vote_average ? movie.vote_average.toFixed(2) : 'N/A'}</p>
            </div>
        </div>`;

    return movieCard;
}

// Function to save movie to local storage
function saveToLocalStorage(movie) {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    if (!recentSearches.some(m => m.id === movie.id)) {
        recentSearches.push(movie);
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        displayRecentSearches(recentSearches);
    }
}

// Function to update and display recent searches
function updateRecentSearches(query) {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    // Ensure only unique titles are saved
    if (!recentSearches.some(m => m.Title.toLowerCase() === query.toLowerCase())) {
        recentSearches.push({ Title: query });
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }
    displayRecentSearches(recentSearches);
}

// Function to display recent searches
function displayRecentSearches(searches) {
    const recentSearchesContainer = document.getElementById("recent-searches");
    recentSearchesContainer.innerHTML = ""; // Clear previous searches
    searches.forEach(movie => {
        const searchItem = document.createElement("div");
        searchItem.textContent = movie.Title;
        searchItem.addEventListener("click", () => {
            document.getElementById("search-query").value = movie.Title;
            document.getElementById("search-form").dispatchEvent(new Event("submit")); // Trigger search
        });
        recentSearchesContainer.appendChild(searchItem);
    });
}

// On page load, display recent searches
window.onload = function () {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    displayRecentSearches(recentSearches);
};

document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        fetchAndDisplayCurrentPage();
    }
});

document.getElementById("next-page").addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchAndDisplayCurrentPage();
    }
});

function updatePagination() {
    document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prev-page").disabled = currentPage === 1;
    document.getElementById("next-page").disabled = currentPage === totalPages;
}

function fetchAndDisplayCurrentPage() {
    const query = document.getElementById("search-query").value;
    const apiKey = "9ec30f610d3dc47d57d05d68a5c2885d";

    fetchMovies(query, apiKey, currentPage)
        .then(data => {
            if (data.results) {
                displayMovies(data.results);
                updatePagination();
            }
        })
        .catch(err => {
            console.error(err);
            showError("Failed to fetch movies for the current page.");
        });
}

async function fetchSimilarMovies(movieId, apiKey) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${apiKey}`);
    if (!response.ok) {
        throw new Error("Failed to fetch similar movies");
    }
    return response.json();
}

async function showMovieDetails(movie) {
    const detailSection = document.getElementById("movie-details");
    detailSection.innerHTML = `
        <h2>${movie.title} (${movie.release_date ? movie.release_date.split('-')[0] : 'Unknown'})</h2>
        <p><strong>Overview:</strong> ${movie.overview}</p>
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Genres:</strong> ${movie.genres.map(genre => genre.name).join(', ')}</p>
        <p><strong>Rating:</strong> ${movie.vote_average ? movie.vote_average.toFixed(2) : 'N/A'}</p>
        <h3>Similar Movies:</h3>
        <div id="similar-movies"></div>
        <button id="close-details">Close</button>
    `;
    detailSection.style.display = "block"; // Show the details section

    // Fetch and display similar movies
    try {
        const similarMovies = await fetchSimilarMovies(movie.id, apiKey);
        displaySimilarMovies(similarMovies.results);
    } catch (error) {
        console.error(error);
        detailSection.innerHTML += `<p>Could not load similar movies.</p>`;
    }

    // Add an event listener to close the details
    document.getElementById("close-details").addEventListener("click", () => {
        detailSection.style.display = "none"; // Hide the details section
    });
}

function displaySimilarMovies(movies) {
    const similarMoviesContainer = document.getElementById("similar-movies");
    similarMoviesContainer.innerHTML = ""; // Clear previous similar movies

    movies.forEach(movie => {
        const similarMovieCard = createMovieCard(movie); // Reuse createMovieCard for similar movies
        similarMoviesContainer.appendChild(similarMovieCard);
    });
}