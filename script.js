document.getElementById("search-form")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const query = document.getElementById("search-query").value;
        const apiKey = "162d09e"; // Replace with your actual API key
        const errorMessage = document.getElementById("error-message");
        const movieList = document.getElementById("movie-list");


        errorMessage.textContent = "";
        movieList.innerHTML = "";

        try {
            const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`);
            const data = await response.json();
            console.log(data); // For debugging

            if (data.Response === "True") {
                data.Search.forEach((movie) => {
                    const movieCard = document.createElement("div");
                    movieCard.className = "movie-card";

                    const posterUrl = movie.Poster !== "N/A" ? movie.Poster : "path/to/default/image.jpg";

                    movieCard.innerHTML = `
                        <div class="card-inner">
                            <div class="card-front">
                                <img src="${posterUrl}" alt="${movie.Title}">
                                <h2>${movie.Title}</h2>
                            </div>
                            <div class="card-back">
                                <h2>${movie.Title}</h2>
                                <p>${movie.Year}</p>
                                <p>More info</p>
                            </div>
                        </div>`;

                    movieList.appendChild(movieCard);

                    // Add click event to save to local storage
                    movieCard.addEventListener("click", () => saveToLocalStorage(movie));
                });

                // Update recent searches
                updateRecentSearches(query);
            } else {
                errorMessage.textContent = data.Error;
            }
        } catch (err) {
            console.error(err);
            errorMessage.textContent = "Something went wrong while fetching data!";
        }
    });

// Function to save movie to local storage
function saveToLocalStorage(movie) {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    if (!recentSearches.some(m => m.imdbID === movie.imdbID)) {
        recentSearches.push(movie);
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        displayRecentSearches(recentSearches);
    }
}

// Function to update and display recent searches
function updateRecentSearches(query) {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
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