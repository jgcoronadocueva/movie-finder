const apiKey = '2199039347msh457761ea8143adbp1a5b80jsnde02344f4ff7';
const apiHost = 'imdb-top-100-movies.p.rapidapi.com';

document.getElementById('findMovies').addEventListener('click', fetchMovies);

function fetchMovies() {
    const movieTitle = getMovieTitle();
    if (validateMovieTitle(movieTitle)) {
        const url = `https://${apiHost}/search?query=${movieTitle}`;
        makeApiCall(url)
            .then(data => displayMovies(data.results))
            .catch(handleError);
    }
}

function getMovieTitle() {
    return document.getElementById('movieTitle').value.trim();
}

function validateMovieTitle(movieTitle) {
    if (!movieTitle) {
        alert('Please enter a movie title.');
        return false;
    }
    return true;
}

async function makeApiCall(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
        }
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

function displayMovies(movies) {
    const resultsDiv = document.getElementById('movieResults');
    resultsDiv.innerHTML = '';
    if (movies.length === 0) {
        resultsDiv.innerHTML = '<p>No movies found.</p>';
        return;
    }
    movies.forEach(movie => {
        const movieDiv = createMovieElement(movie);
        resultsDiv.appendChild(movieDiv);
    });
}

function createMovieElement(movie) {
    const div = document.createElement('div');
    div.className = 'movie';
    div.innerHTML = `
        <h3>${movie.title} (${movie.year})</h3>
        <p>${movie.plot}</p>
        <button onclick="viewMovie('${movie.imdb_id}')">View Details</button>
    `;
    return div;
}

function viewMovie(imdbId) {
    window.open(`https://www.imdb.com/title/${imdbId}/`, '_blank');
}

function handleError(error) {
    console.error('Error:', error);
    alert('Failed to fetch movies. Please try again later.');
}

// Additional utility functions
function clearResults() {
    document.getElementById('movieResults').innerHTML = '';
}

function toggleLoading(isLoading) {
    const loadingText = document.getElementById('loadingText');
    loadingText.style.display = isLoading ? 'block' : 'none';
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        fetchMovies();
    }
}

document.getElementById('movieTitle').addEventListener('keydown', handleEnterKey);