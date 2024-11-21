const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const USER_API_URL = 'https://randomuser.me/api/';
const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Programming?safe-mode';

let apiKey = '';

function updateApiKey() {
    const newApiKey = document.getElementById('apiKey').value.trim();
    if (newApiKey) {
        apiKey = newApiKey;
        updateContent();
    }
}

async function getWeatherData(city = 'Seoul') {
    if (!apiKey) {
        document.querySelector('.weather-content').innerHTML = '<p class="error">Please enter API key</p>';
        return null;
    }

    try {
        const url = `${WEATHER_API_URL}?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) {
            document.querySelector('.weather-content').innerHTML = '<p class="error">Invalid API key or weather data unavailable</p>';
            throw new Error('Weather data fetch failed');
        }
        return response.json();
    } catch (error) {
        console.error('Weather API Error:', error);
        return null;
    }
}

async function updateContent() {
    try {
        const [weatherData, userResponse, jokeResponse] = await Promise.all([
            getWeatherData(),
            fetch(USER_API_URL),
            fetch(JOKE_API_URL)
        ]);
        
        const [userData, jokeData] = await Promise.all([
            userResponse.json(),
            jokeResponse.json()
        ]);
        
        const user = userData.results[0];
        
        if (weatherData) {
            document.querySelector('.weather-content').innerHTML = `
                <div class="weather-details">
                    <p class="temp">${Math.round(weatherData.main.temp)}°C</p>
                    <p class="desc">${weatherData.weather[0].description}</p>
                    <div class="extra-info">
                        <p>Humidity: ${weatherData.main.humidity}%</p>
                        <p>Wind: ${weatherData.wind.speed} m/s</p>
                    </div>
                </div>
            `;
        }

        document.querySelector('.user-content').innerHTML = `
            <p class="user-name">${user.name.first} ${user.name.last}</p>
            <p class="user-email">${user.email}</p>
            <p class="user-location">${user.location.country}</p>
        `;

        document.querySelector('.joke-content').innerHTML = jokeData.type === 'single' ? 
            `<p class="joke-text">${jokeData.joke}</p>` :
            `<p class="joke-text">${jokeData.setup}</p>
             <p class="joke-answer">${jokeData.delivery}</p>`;

    } catch (error) {
        console.error('API Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateContent();
    setInterval(updateContent, 300000);
});