//All Glocal Elements
const cityInput = document.getElementById('city');
const cityName = document.getElementById('cityName');
const getCurrentLocation = document.getElementById('location');
const searchIcon = document.getElementById('searchIcon');
const info = document.querySelector('.current-info');
const errScreen = document.querySelector('.search-something');
const temp = document.querySelector('.temp');
const weatherIcon = document.querySelector('.weather-img');
const toggleTempUnit = document.getElementById('temp-switch');
const weatherDescr = document.querySelector('.weather-type');
const feelsLikeTemp = document.getElementById("feels-like");
const sunsetTime = document.getElementById('sunset');
const sunriseTime = document.getElementById('sunrise');
const windSpeed = document.getElementById('wind-speed');
const windDirection = document.getElementById('wind-direction');
const speedToggle = document.getElementById('speed-switch');
const directionToggle = document.getElementById('direction-switch');
const latitude = document.getElementById('lat');
const longitude = document.getElementById('lon');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const pressureToggle = document.getElementById('pressure-switch');
const visibilityToggle = document.getElementById('visibility-switch');
const futureSwitch = document.getElementById('future-temp-switch');

async function loadCountries() {
    return fetch('countries.json')
        .then(response => response.json())
        .catch(error => {
            console.error(`${error}: Unable to load JSON file.`);
            return []; // Return an empty array in case of an error
        });
}

let countries;
const countriesPromise = loadCountries();
countriesPromise.then(data => {
    countries = data;
});

function getCurrentLocationWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError
      );
    } else {
      updateCityName("Location not supported on this browser.");
    }
}

function getLocationWeather () {
    const userInput = cityInput.value.trim();
    const isValidFormat = validateLocationFormat(userInput);

    if (isValidFormat) fetchWeatherData(userInput);
    else updateCityName(`Invalid format of ${userInput}`);
}

function validateLocationFormat(input) {
    const parts = input.split(',');
    return (parts.length === 1 || parts.length === 3);
}
  
function handleLocationSuccess(position) {
    const { latitude, longitude } = position.coords;
    fetchLocationData(latitude, longitude);
}

function handleLocationError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

function fetchLocationData(latitude, longitude) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
                const state = data.address.state || data.address.province;
                const country = data.address.country;
                const formattedLocation = `${city}, ${state ? state + ', ' : ''}${country}`;                
                fetchWeatherData(formattedLocation);
            } else {
                updateCityName('Location data not available');
            }
        })
        .catch(error => {
            console.error('Error fetching city:', error);
            updateCityName('Error fetching city');
        });
}

function fetchWeatherData(location) {

    if (!location) {
        cityInput.value = "";
        return;
    }

    const apiKey = "d4bb3287f300f3eb0ffde66cc48bf67d";
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            //Process the weather data here
            if (data && data.sys && data.sys.country){
                info.classList.remove('hide');
                const city = data.name;
                const countryCode = data.sys.country;
                const country = countries.find(item => item.code === countryCode);
                const countryName = country ? country.name : countryCode;
                const formattedLocation = `${city}, ${countryName}`;
                updateCityName(formattedLocation);
                toggleTempUnit.checked = false;
                speedToggle.checked = false;
                directionToggle.checked = false;
                pressureToggle.checked = false;
                visibilityToggle.checked = false;
                errScreen.classList.add('hide');
                cityInput.value = "";
                updateWeatherInfo(data);
                fetchForecastData(data, apiKey);
            } else {
                alert("City Not Found.");
                cityInput.value = "";
            }
        }).catch(error => {
            console.error('Error fetching weather data:', error);
            cityInput.value = "";
        });
}

function updateCityName(city) {
    cityName.textContent = city;
}

function updateWeatherInfo (data) {
    updateTemperature(data.main);
    updateWeatherIcon(data.weather[0]);
    updateHumidity(data.main.humidity);
    updatePressure(data.main.pressure);
    updateVisibility(data.visibility);
    calcSunriseSunset(data);
    calcWindSpeed(data.wind);
    updateWindDirection(data.wind);
    updateLat(data.coord.lat);
    updateLon(data.coord.lon);
}

function updateHumidity (value) {
    humidity.innerHTML = Math.round(Number(value)) + "%";
}

function updatePressure (value) {
    pressure.innerHTML = Math.round(Number(value)) + " hPa";
}

function updateVisibility (value) {
    visibility.innerHTML = Math.round(Number(value/100)) + " km";
}

function updateLat (lat) {
    latitude.innerHTML = Math.round(Number(lat)) + "°";
}

function updateLon(lon) {
    longitude.innerHTML = Math.round(Number(lon)) + "°";
}

function updateTemperature (tempObject) {
    let kelvinTemp = tempObject.temp;
    let kelvinFeelsLikeTemp = tempObject.feels_like;
    temp.innerHTML = Math.round(kelvinToCelsius(kelvinTemp)) + "°C";
    feelsLikeTemp.innerHTML = "Feels Like " + Math.round(kelvinToCelsius(kelvinFeelsLikeTemp)) + "°C";
}

function updateDescription (description) {
    weatherDescr.innerText = description;
}

function updateWeatherIcon(weatherObject) {
    let description = weatherObject.description;
    weatherIcon.src = `openweathermap/${weatherObject.icon}.svg`;
    const parts = description.split(' ');
    let newDescription = "";
    for (let part of parts) {
        newDescription += `${part[0].toUpperCase()}${part.slice(1)} `;
    }
    updateDescription(newDescription);
}

function kelvinToCelsius (kelvin) {
    return (kelvin - 273.15);
}

function celsiusToFahrenheit (celsius) {
    return Math.round((celsius * 9/5) + 32); 
}

function fahrenheitToCelsius (fahrenheit) {
    return Math.round(((fahrenheit - 32) * 5) / 9);
}

function calcSunriseSunset(data) { 
    const geoAPI = "582630bfc17d473398bba6fd8dce0dc8";
    fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${data.coord.lat}&lon=${data.coord.lon}&format=json&apiKey=${geoAPI}`)
        .then(response => response.json())
        .then(result => {
            const timeZoneName = result.results[0].timezone.name;
            const sunriseDate = new Date(data.sys.sunrise * 1000);
            const sunsetDate = new Date(data.sys.sunset * 1000);
            
            // Format sunrise and sunset times
            const sunriseTimeString = formatTime(sunriseDate, timeZoneName);
            const sunsetTimeString = formatTime(sunsetDate, timeZoneName);
            
            sunriseTime.innerHTML = sunriseTimeString;
            sunsetTime.innerHTML = sunsetTimeString;
        })
        .catch(error => console.log('error', error));
}

function formatTime(date, timeZone) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: timeZone
    }).format(date);
}

function convertMStoKMH (ms) {
    return Math.round(ms * 3.6);
}

function calcWindSpeed (windObject) {
    windSpeed.innerHTML = convertMStoKMH(windObject.speed) + " km/h";
}

function updateWindDirection (windObject) {
    windDirection.innerHTML = windObject.deg + "°";
}

getCurrentLocation.addEventListener('click', getCurrentLocationWeather);
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') getLocationWeather();
})

searchIcon.addEventListener('click', () => {
    getLocationWeather();
});

function spliceTemperature (temperature){
    let numericPart = '';
    for (let i = 0; i < temperature.length; i++) {
        if (!isNaN(temperature[i])) numericPart += temperature[i];
    }
    return numericPart;
}

function convertKMHtoMPH (kmh) {
    return Math.round(kmh / 1.6);
}

function convertMPHtoKMH (mph) {
    return Math.round(mph * 1.6);
}

function degreesToBearing(degrees) {
    const primaryDirections = ['N', 'E', 'S', 'W'];
    const secondaryDirections = ['N', 'E', 'S', 'W'];
    
    const primaryIndex = Math.floor((degrees + 22.5) / 90) % 4;
    const secondaryIndex = Math.floor((degrees + 67.5) / 90) % 4;

    const primaryDirection = primaryDirections[primaryIndex];
    const secondaryDirection = secondaryDirections[secondaryIndex];

    return `${primaryDirection} ${Math.round(degrees % 90)}° ${secondaryDirection}`;
}

function bearingToDegrees(bearingNotation) {
    const parts = bearingNotation.split(' ');
    const primaryDirection = parts[0];
    const secondaryDirection = parts[2];
    const degrees = parseInt(parts[1], 10);

    const primaryDirections = ['N', 'E', 'S', 'W'];
    const primaryIndex = primaryDirections.indexOf(primaryDirection);

    if (primaryIndex === -1) {
        return NaN; // Invalid bearing notation
    }

    const secondaryDirections = ['N', 'E', 'S', 'W'];
    const secondaryIndex = secondaryDirections.indexOf(secondaryDirection);

    if (secondaryIndex === -1) {
        return NaN; // Invalid bearing notation
    }

    const baseAngle = primaryIndex * 90;
    let secondaryAngle = 0;

    if (secondaryIndex === 1 || secondaryIndex === 3) {
        secondaryAngle = 45;
    }

    return baseAngle + degrees + secondaryAngle + '°';
}

toggleTempUnit.addEventListener('change', () => {
    const oldTemp = temp.innerHTML;
    const parts = feelsLikeTemp.textContent.split(' ');
    if (oldTemp.endsWith("°C")) {
        let celsiusFeelsLike = Number(parts[2].replace("°C", ""));
        feelsLikeTemp.textContent = "Feels Like " + celsiusToFahrenheit(celsiusFeelsLike) + "°F";
        temp.innerHTML = celsiusToFahrenheit(spliceTemperature(oldTemp)) + "°F";
    } else {
        let fahrenheitFeelsLike = Number(parts[2].replace("°F", ""));
        feelsLikeTemp.textContent = "Feels Like " + fahrenheitToCelsius(fahrenheitFeelsLike) + "°C";
        temp.innerHTML = fahrenheitToCelsius(spliceTemperature(oldTemp)) + "°C";
    }
});

speedToggle.addEventListener('change', () => {
    const parts = windSpeed.innerHTML.split(' ');
    if (parts[1] === 'km/h') windSpeed.innerHTML = convertKMHtoMPH(Number(parts[0])) + " mph"; 
    else windSpeed.innerHTML = convertMPHtoKMH(Number(parts[0])) + " km/h";
});

directionToggle.addEventListener('change', () => {
    if (windDirection.innerHTML.endsWith('°')) {
        const degrees = windDirection.innerHTML.slice(0, windDirection.innerHTML.indexOf('°'));
        windDirection.innerHTML = degreesToBearing(degrees);
    } else {
        windDirection.innerHTML = bearingToDegrees(windDirection.innerHTML);
    }
}); 

function convertHPAtoMMHG (hPa) {
    return Math.round(hPa * 0.75006375541921);
} 

function convertMMHGtoHPA (mmHg) {
    return Math.round(mmHg * 1.33322387415);
}

pressureToggle.addEventListener('change', () => {
    const parts = pressure.innerHTML.split(' ');
    if (parts[1] === 'hPa') pressure.innerHTML = convertHPAtoMMHG(Number(parts[0])) + " mmHg";
    else pressure.innerHTML = convertMMHGtoHPA(Number(parts[0])) + " hPa";
});

visibilityToggle.addEventListener('change', () => {
    const parts = visibility.innerHTML.split(' ');
    if (parts[1] === 'km') visibility.innerHTML = convertKMHtoMPH(Number(parts[0])) + ' miles';
    else visibility.innerHTML = convertMPHtoKMH(Number(parts[0])) + ' km';
});

function fetchForecastData(weatherData, key) {
    const futureUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${key}`;
    fetch(futureUrl)
        .then(response => response.json())
        .then(data => {
            futureSwitch.checked = false;
            updateForecastData(data);
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
        });
};

function updateForecastData(data) {
    const maxMinTemps = getMaxMinForecastTemps(data);
    updateDayNames(maxMinTemps);
    updateDailyWeather(maxMinTemps);
    updateWeatherForecast(data);
}

function updateDayNames(obj) {
    let counter = 1;
    for (let day in obj) {
        if (counter <= 5) { // Limit the loop to the available IDs
            let date = new Date(day);
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            let dayOfWeek = daysOfWeek[date.getDay()];
            document.getElementById(`future-day-${counter}`).innerHTML = dayOfWeek;
            counter++;
        } else {
            break; // Exit the loop when there are no more available IDs
        }
    }
}

function getMaxMinForecastTemps(data) {
    const dailyTemps = {};

    data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toISOString().split('T')[0];
        const highestTemperature = kelvinToCelsius(item.main.temp_max);
        const lowestTemperature = kelvinToCelsius(item.main.temp_min);

        if (!dailyTemps[day]) {
            dailyTemps[day] = { max: highestTemperature, min: lowestTemperature, day: day };
        } else {
            if (highestTemperature >= dailyTemps[day].max) {
                dailyTemps[day].max = highestTemperature;
            }
            if (lowestTemperature <= dailyTemps[day].min) {
                dailyTemps[day].min = lowestTemperature;
            }
        }
    });

    return dailyTemps;
}

function updateDailyWeather(maxMin) {
    let counter = 1;
    for (let day in maxMin) {
        if (counter <= 5) { // Limit the loop to the available IDs
            document.getElementById(`top-temp-${counter}`).innerHTML = Math.round(maxMin[day].max) + "°C";
            document.getElementById(`bottom-temp-${counter}`).innerHTML = Math.round(maxMin[day].min) + "°C";
            counter++;
        } else {
            break; // Exit the loop when there are no more available IDs
        }
    }
}

function updateWeatherForecast(data) {
    const forecastByDay = {};
    data.list.forEach(entry => {
        const timestamp = entry.dt * 1000;
        const date = new Date(timestamp);
        const day = date.toDateString();
        if (!forecastByDay[day]) {
            forecastByDay[day] = {
                weatherInfo: []
            };
        }

        if (entry.weather && entry.weather[0] && entry.weather[0].icon && entry.weather[0].description && entry.weather[0].icon.endsWith('d')) {
            forecastByDay[day].weatherInfo.push({
                code: entry.weather[0].icon,
                description: entry.weather[0].description
            });
        }
    });

    let count = 1;
    for (const day in forecastByDay) {
        if (count <= 5) {
            const mostCommonInfo = findMostCommonInfo(forecastByDay[day].weatherInfo);
            if (mostCommonInfo) {
                document.getElementById(`future-img-${count}`).src = `openweathermap/${mostCommonInfo.code}.svg`;
                document.getElementById(`future-descr-${count++}`).innerHTML = capitalizeEachWord(mostCommonInfo.description);
            }
        } else {
            break;
        }
    }
}


function findMostCommonInfo (infoArray) {
    const infoCounts = {};
    infoArray.forEach(info => {
        const code = info.code;
        infoCounts[code] = (infoCounts[code] || 0) + 1;
    });
    let mostCommonInfo = { code: '', count:0};
    for (const code in infoCounts) {
        if (infoCounts[code] > mostCommonInfo.count) {
            mostCommonInfo = {code, count: infoCounts[code]};
        }
    }

    return infoArray.find(info => info.code === mostCommonInfo.code);
}

function capitalizeEachWord (str) {
    const parts = str.split(' ');
    let newStr = '';
    for (let part of parts) {
        part = part.charAt(0).toUpperCase() + part.slice(1);
        newStr += part + " ";
    }
    return newStr;
}

futureSwitch.addEventListener('change', () => {
    if (document.getElementById('top-temp-1').innerHTML.endsWith("°C")) {
        for (let i = 1; i < 6; i++) {
            let oldMax = Number(document.getElementById(`top-temp-${i}`).innerHTML.split('°')[0]);
            let oldMin = Number(document.getElementById(`bottom-temp-${i}`).innerHTML.split('°')[0]);
            document.getElementById(`top-temp-${i}`).innerHTML = celsiusToFahrenheit(oldMax) + "°F";
            document.getElementById(`bottom-temp-${i}`).innerHTML = celsiusToFahrenheit(oldMin) + "°F";
        }
    } else {
        for (let i = 1; i < 6; i++) {
            let oldMax = Number(document.getElementById(`top-temp-${i}`).innerHTML.split('°')[0]);
            let oldMin = Number(document.getElementById(`bottom-temp-${i}`).innerHTML.split('°')[0]);
            document.getElementById(`top-temp-${i}`).innerHTML = fahrenheitToCelsius(oldMax) + "°C";
            document.getElementById(`bottom-temp-${i}`).innerHTML = fahrenheitToCelsius(oldMin) + "°C";
        }
    }
})


