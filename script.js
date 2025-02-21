const API_KEY = 'YOUR_API_KEY'; // Get from OpenWeatherMap
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feels-like');
const tempMin = document.getElementById('temp-min');
const tempMax = document.getElementById('temp-max');
const uvIndex = document.getElementById('uv-index');
const cityName = document.getElementById('city-name');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const favoritesList = document.getElementById('favorites-list');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function getWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        // Get UV index from OneCall API using coordinates
        const uvResponse = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`
        );
        const uvData = await uvResponse.json();
        
        updateWeatherUI(data, uvData);
        updateFavoriteButton(city);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function updateWeatherUI(data, uvData) {
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    tempMin.textContent = `${Math.round(data.main.temp_min)}°C`;
    tempMax.textContent = `${Math.round(data.main.temp_max)}°C`;
    uvIndex.textContent = uvData.current.uvi.toFixed(1);
}

function updateFavoriteButton(city) {
    const isFavorite = favorites.includes(city);
    favoriteBtn.classList.toggle('active', isFavorite);
    favoriteBtn.innerHTML = isFavorite ? 
        '<i class="fas fa-heart"></i>' : 
        '<i class="far fa-heart"></i>';
}

function toggleFavorite() {
    const city = cityName.textContent;
    if (!city) return;

    const index = favorites.indexOf(city);
    if (index === -1) {
        favorites.push(city);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton(city);
    renderFavorites();
}

function renderFavorites() {
    favoritesList.innerHTML = '';
    favorites.forEach(city => {
        const div = document.createElement('div');
        div.className = 'favorite-item';
        div.textContent = city;
        div.onclick = () => getWeatherData(city);
        favoritesList.appendChild(div);
    });
}

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) getWeatherData(city);
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) getWeatherData(city);
    }
});

favoriteBtn.addEventListener('click', toggleFavorite);

// Initialize with a default city
window.addEventListener('load', () => {
    renderFavorites();
    getWeatherData('London');
}); 