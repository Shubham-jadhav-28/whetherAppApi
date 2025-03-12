const apiKey = "YOUR_API_KEY"; // Replace with your actual API key

// Function to fetch weather data
async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== "200") {
      alert("City not found! Please enter a valid city name.");
      return;
    }

    updateWeatherUI(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// Function to update UI with fetched weather data
function updateWeatherUI(data) {
  const cityName = document.getElementById("cityName");
  const temperature = document.getElementById("temperature");
  const feelsLike = document.getElementById("feelsLike");
  const sunrise = document.getElementById("sunrise");
  const sunset = document.getElementById("sunset");
  const weatherIcon = document.getElementById("weatherIcon");
  const weatherCondition = document.querySelector(".weatherCondition");

  // Extract data from API response
  const currentWeather = data.list[0];
  const city = data.city.name;
  const temp = Math.round(currentWeather.main.temp);
  const feels = Math.round(currentWeather.main.feels_like);
  const sunriseTime = new Date(data.city.sunrise * 1000).toLocaleTimeString();
  const sunsetTime = new Date(data.city.sunset * 1000).toLocaleTimeString();
  const weatherDesc = currentWeather.weather[0].description;
  const iconCode = currentWeather.weather[0].icon;

  // Update UI
  cityName.textContent = city;
  temperature.textContent = `${temp}°C`;
  feelsLike.textContent = `${feels}°C`;
  sunrise.textContent = sunriseTime;
  sunset.textContent = sunsetTime;
  weatherCondition.textContent = weatherDesc;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // Update 5-day forecast
  updateForecast(data.list);
}

// Function to update 5-day forecast
function updateForecast(forecastList) {
  const forecastContainer = document.querySelector(".forecast");

  // Clear previous forecast
  forecastContainer.innerHTML = "";

  for (let i = 0; i < forecastList.length; i += 8) {
    // Every 24 hours
    const forecast = forecastList[i];
    const date = new Date(forecast.dt * 1000).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
    const temp = Math.round(forecast.main.temp);
    const iconCode = forecast.weather[0].icon;

    const forecastItem = `
            <div class="forecast-item">
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${forecast.weather[0].description}" />
                <p>${temp}°C</p>
                <span>${date}</span>
            </div>
        `;

    forecastContainer.innerHTML += forecastItem;
  }
}

// Function to update hourly forecast
function updateHourlyForecast(forecastList) {
  const hourlyContainer = document.querySelector(".hourly-forecast");

  // Clear previous data
  hourlyContainer.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    // Show next 5 hours
    const forecast = forecastList[i];
    const time = new Date(forecast.dt * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const temp = Math.round(forecast.main.temp);
    const iconCode = forecast.weather[0].icon;
    const windSpeed = forecast.wind.speed;

    const hourlyItem = `
            <div class="hour-item">
                <p>${time}</p>
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${forecast.weather[0].description}" />
                <p>${temp}°C</p>
                <img src="./Images (2)/navigation 1.png" alt="Wind" />
                <p>${windSpeed} km/h</p>
            </div>
        `;

    hourlyContainer.innerHTML += hourlyItem;
  }
}

// Event listener for search button
document.getElementById("searchBtn").addEventListener("click", function () {
  const city = document.getElementById("search").value;
  if (city) {
    fetchWeather(city);
  } else {
    alert("Please enter a city name.");
  }
});

// Get user's location and fetch weather
document.getElementById("locationBtn").addEventListener("click", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(lat);

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          updateWeatherUI(data);
        } catch (error) {
          console.error("Error fetching location-based weather:", error);
        }
      },
      function () {
        alert("Unable to retrieve location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// Toggle dark mode
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

darkModeToggle.addEventListener("change", function () {
  body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
});

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  body.classList.add("dark-mode");
  darkModeToggle.checked = true;
}

// Function to update time and date
function updateTime() {
  const now = new Date();
  const options = { weekday: "long", day: "numeric", month: "short" };

  document.getElementById("time").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("date").textContent = now.toLocaleDateString(
    undefined,
    options
  );
}

// Update time every second
setInterval(updateTime, 1000);
updateTime();
