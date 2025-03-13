document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "d5dbf21f34e39fe0d03583a5aee721bc"; // OpenWeather API Key
  const darkModeToggle = document.getElementById("darkModeToggle");
  const body = document.body;

  darkModeToggle.addEventListener("change", function () {
    if (body.classList.contains("dark-mode")) {
      body.classList.remove("dark-mode");
      body.style.backgroundColor = "#474343";
      body.style.backgroundImage =
        "linear-gradient(72deg, #474343 0%, #1e1e1e 100%)";
    } else {
      body.classList.add("dark-mode");
      body.style.backgroundColor = "#1e1e1e";
      body.style.backgroundImage =
        "linear-gradient(264deg, #1e1e1e 0%, #D9AFD9 100%)";
    }
    localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
  });

  // Load user preference
  if (localStorage.getItem("darkMode") === "true") {
    body.classList.add("dark-mode");
    darkModeToggle.checked = true;
    body.style.backgroundColor = "#1e1e1e";
    body.style.backgroundImage =
      "linear-gradient(72deg, #1e1e1e 0%, #D9AFD9 100%)";
  } else {
    body.style.backgroundColor = "#D9AFD9";
    body.style.backgroundImage =
      "linear-gradient(72deg, #D9AFD9 0%, #1e1e1e 100%)";
  }

  const cityInput = document.getElementById("cityInput");
  const searchButton = document.getElementById("searchButton");
  const cityName = document.getElementById("cityName");
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");
  const temperatureElement = document.getElementById("temperature");
  const feelsLikeElement = document.getElementById("feelsLike");
  const sunriseElement = document.getElementById("sunrise");
  const sunsetElement = document.getElementById("sunset");
  const humidityElement = document.getElementById("humidity");
  const windSpeedElement = document.getElementById("windSpeed");
  const pressureElement = document.getElementById("pressure");
  const uvIndexElement = document.getElementById("uvIndex");
  const forecastContainer = document.getElementById("forecast");
  const hourlyForecastContainer = document.getElementById("hourlyForecast");

  async function fetchCityCoordinates(city) {
    try {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
      );
      const geoData = await geoResponse.json();

      if (geoData.length === 0) {
        alert("City not found! Please try again.");
        return;
      }

      const { lat, lon, name } = geoData[0];
      cityName.textContent = name; // Update city name
      fetchWeather(lat, lon);
    } catch (error) {
      console.error("Error fetching city coordinates:", error);
      alert("Error fetching city coordinates. Check console for details.");
    }
  }

  async function fetchWeather(lat, lon) {
    try {
      console.log("Fetching weather for:", lat, lon);
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );

      if (!weatherResponse.ok) {
        throw new Error(
          `API request failed: ${weatherResponse.status} ${weatherResponse.statusText}`
        );
      }

      const weatherData = await weatherResponse.json();
      console.log("Full API Response:", weatherData);

      if (!weatherData || !weatherData.list) {
        throw new Error("Invalid weather data received.");
      }

      updateWeatherDetails(weatherData);
      updateForecast(weatherData);
      updateHourlyForecast(weatherData);
      updateLocalTime();

      const weatherIconElement = document.getElementById("weatherIcon");
      const weatherConditionElement =
        document.querySelector(".weatherCondition");
      if (weatherIconElement && weatherConditionElement) {
        const currentWeather = weatherData.list[0];
        const iconCode = currentWeather.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        weatherIconElement.src = iconUrl;
        weatherConditionElement.textContent =
          currentWeather.weather[0].description;
      }
    } catch (error) {
      console.error("Error fetching weather data:", error.message);
      alert(`Error fetching weather data: ${error.message}`);
    }
  }

  function updateWeatherDetails(data) {
    const currentWeather = data.list[0];

    if (!currentWeather) {
      console.error("Weather data is missing.");
      return;
    }

    if (temperatureElement) {
      temperatureElement.textContent = `${Math.round(
        currentWeather.main.temp
      )}°C`;
    }
    if (humidityElement) {
      humidityElement.textContent = `Humidity: ${currentWeather.main.humidity}%`;
    }
    if (windSpeedElement) {
      windSpeedElement.textContent = `Wind Speed: ${currentWeather.wind.speed} m/s`;
    }
    if (pressureElement) {
      pressureElement.textContent = `Pressure: ${currentWeather.main.pressure} hPa`;
    }
    if (uvIndexElement) {
      uvIndexElement.textContent = "N/A"; // UV Index is not available in this API
    }
    if (feelsLikeElement) {
      feelsLikeElement.textContent = `${Math.round(
        currentWeather.main.feels_like
      )}°C`;
    }
    if (data.city && data.city.sunrise && data.city.sunset) {
      const sunriseTime = new Date(data.city.sunrise * 1000).toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit", hour12: true }
      );
      const sunsetTime = new Date(data.city.sunset * 1000).toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit", hour12: true }
      );

      sunriseElement.textContent = sunriseTime;
      sunsetElement.textContent = sunsetTime;
    }
  }
  function updateForecast(data) {
    const forecastContainer = document.querySelector(".forecast");
    forecastContainer.innerHTML = ""; // Clear previous forecast

    // Get daily forecast (every 8th item = next day's forecast)
    const dailyForecasts = data.list.filter(
      (reading, index) => index % 8 === 0
    );

    dailyForecasts.forEach((day) => {
      const date = new Date(day.dt * 1000);
      const dayName = date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
      });
      const temp = Math.round(day.main.temp);
      const iconCode = day.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

      // Create forecast item
      const forecastItem = document.createElement("div");
      forecastItem.classList.add("forecast-item");
      forecastItem.innerHTML = `
            <img src="${iconUrl}" alt="${day.weather[0].description}" />
            <p>${temp}°C</p>
            <span>${dayName}</span>
        `;

      forecastContainer.appendChild(forecastItem);
    });
  }

  function updateLocalTime() {
    if (!timeElement || !dateElement) {
      console.error("Time or Date element not found in the DOM.");
      return;
    }

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    timeElement.textContent = `${hours}:${minutes}`;

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    dateElement.textContent = now.toLocaleDateString("en-US", options);
  }
  function updateHourlyForecast(data) {
    const hourlyForecastContainer = document.querySelector(".hourly-forecast");
    hourlyForecastContainer.innerHTML = ""; // Clear previous hourly forecast

    // Get hourly forecast for the next 5 intervals (every 3 hours)
    const hourlyForecasts = data.list.slice(0, 5);

    hourlyForecasts.forEach((hour) => {
      const time = new Date(hour.dt * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const temp = Math.round(hour.main.temp);
      const windSpeed = hour.wind.speed;
      const iconCode = hour.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

      // Create hourly forecast item
      const hourItem = document.createElement("div");
      hourItem.classList.add("hour-item");
      hourItem.innerHTML = `
            <p>${time}</p>
            <img src="${iconUrl}" alt="${hour.weather[0].description}" />
            <p>${temp}°C</p>
            <img src="./Images (2)/navigation 1.png" alt="Wind" />
            <p>${windSpeed} km/h</p>
        `;

      hourlyForecastContainer.appendChild(hourItem);
    });
  }

  // Ensure this function is called inside fetchWeather(lat, lon)
  // Example:
  // updateHourlyForecast(weatherData);

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const city = cityInput.value.trim();
      if (city) {
        fetchCityCoordinates(city);
      }
    });
  } else {
    console.error("Search button not found in the DOM.");
  }

  setInterval(() => {
    updateLocalTime();
  }, 60000);

  // Initialize local time on page load
  updateLocalTime();
});
