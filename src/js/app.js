// Javascript Logic

// create variables that will hold data from API and link them to html elements via the DOM  
let search = document.querySelector('.weather_search');
let city = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let humidity = document.querySelector('.weather_indicator-humidity>.value');
let wind = document.querySelector('.weather_indicator-wind>.value');
let pressure = document.querySelector('.weather_indicator-pressure>.value');
let image = document.querySelector('.weather_image');
let temperature = document.querySelector('.weather_temperature>.value');
let forecastBlock = document.querySelector('.weather_forecast');
let suggestions = document.querySelector('#suggestions');
// decide whether to use metric or imperial as units of measurement  
let units = document.querySelector('#units');

// private API key
let privateAPIKey = ''; // use your own private API key 

// API calls (create endpoints)
let weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + privateAPIKey;
let forecastBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + privateAPIKey;
let cityBaseEndpoint = 'https://api.teleport.org/api/cities/?search='; // Teleport public API @ developers.teleport.org/api

// create an array that holds objects, where each object contains two keys (a url and one or more ID's)
let weatherImages = [
    {
        url: 'images/clear-sky.png',
        ids: [800] // weather condition code
    },
    {
        url: 'images/broken-clouds.png',
        ids: [803, 804] // weather condition codes
    },
    {
        url: 'images/few-clouds.png',
        ids: [801] // weather condition code
    },
    {
        url: 'images/mist.png',
        ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781] // weather condition codes
    }, 
    {
        url: 'images/rain.png',
        ids: [500, 501, 502, 503, 504] // weather condition codes
    },
    {
        url: 'images/scattered-clouds.png',
        ids: [802] // weather condition code
    },
    {
        url: 'images/shower-rain.png',
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321] // weather condition codes
    },
    {
        url: 'images/snow.png',
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622] // weather condition codes
    },
    {
        url: 'images/thnderstorm.png',
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232] // weather condition codes
    }
]

// create a function that returns the weather by a city name
let getWeatherByCityName = async (cityName) => { 
    // create an endpoint
    let endpoint = '';
    // create a variable for the city
    let city;
    // if the input is a zip code (check that the search itself matches a zip code)
    if (cityName.length === 5 && Number.parseInt(cityName) + '' === cityName) {
        // store the zip code
        city = cityName;
        // use custom endpoint which is slightly different when using a zip code
        endpoint =  'https://api.openweathermap.org/data/2.5/weather?units=imperial&'  
        + 'zip=' + city + ',us&appid=' + privateAPIKey;
        // use imperial units of measurement
        units.textContent = 'F'; // display Fahrenheit  
    }
    // if the string entered includes a comma
    else if (cityName.includes(',')) {
        // retrieve the substring before the comma and then retrieve the substring after the last comma and then combine the two (i.e. New York, New York)
        city = cityName.substring(0, cityName.indexOf(',')) + cityName.substring(cityString.lastIndexOf(',')); // modify the string to exclude the comma and then store it
        endpoint = weatherBaseEndpoint + '&q=' + city;
        // use metric units of measurement
        units.textContent = 'C'; // Celcius
    } 
    // if no comma in the string
    else {
        // only need to store the string
        city = cityName;
        endpoint = weatherBaseEndpoint + '&q=' + city;
        // use metric units of measurement
        units.textContent = 'C'; // Celcius
    }
    // make a request to this endpoint
    let response = await fetch(endpoint); // fetch is asynchronous and returns a promise
    // if the code isn't 200 (such as a 404) it means it wasn't successful in finding the city entered
    if(response.status !== 200) { // run a check to make sure the requested resource is found before converting into a json object
        alert('City not found!'); // send an alert to user and
        return; // stop the excution of the function (exit)
    }
    // if successul get the response in json format 
    let weather = await response.json(); // response is asynchronous and returns a promise
    // return the json results (response)
    return weather;
}

// a function that returns the daily forecast by city ID
let getForecastByCityID = async (id) => {
    // create an endpoint
    let endpoint = forecastBaseEndpoint + '&id=' + id;
    // make a call to the fetch function and wait for the results to come back before storing them
    let result = await fetch(endpoint); // make a request
    let forecast = await result.json(); // convert the results to a json object
    // store the json list that contains an array (40 element array)  
    let forecastList = forecast.list;
    let daily = []; // create an empty array 
    // check every element in the array (40 items)
    forecastList.forEach(day => {
        // grab the date and time
        let date = new Date(day.dt_txt.replace(' ', 'T')); // replace the empty space with the letter T 
        let hours = date.getHours(); // get the time from the date 
        // if the time is 12:00, then the object has to be added to the daily array 
        if(hours === 12) {
            daily.push(day); // add day to the array
        }
    })
    return daily; // return the array
}

// a function that returns weather data via another function that makes the initial API request
let weatherForCity = async (city) => { // used by init()
    // call function that returns the weather by city name 
    let weather = await getWeatherByCityName(city);
    // a check to make sure the city was found     
    if(!weather) {
        return; // otherwise stop the function (exit)    
    }
    // retreive the city ID
    let cityID = weather.id;
    // update the weather to current conditions
    updateCurrentWeather(weather);
    // get the forecast
    let forecast = await getForecastByCityID(cityID);
    // update the forecast
    updateForecast(forecast);
}

// a function that initializes the app with a pre-selected city  
let init = () => {
    // choose a default city and use DOM property filter to add visual effects for smoothly refreshing the page 
    weatherForCity('Las Vegas').then(() => document.body.style.filter = 'blur(0)'); // .then() can be used as weatherForCity is an asynchronous function
}

// initialization
init(); // call function to initialize the app with a pre-selected city 

// add an event listener for when the (enter) key is pressed which triggers an action to performed
search.addEventListener('keydown', async (e) => { // e is the special object that stores all information about the event
    // if enter key is pressed 
    if(e.keyCode === 13) { // 13 is the key code for the enter key (keyboard event)
       weatherForCity(search.value); // make a call to the function that returns weather data by city search
    }
})

// a function that performs an action based on the input (event) from the search box  
search.addEventListener('input', async () => { // this function handles the logic related to the 'city suggestions' functionality
    // create an endpoint
    let endpoint = cityBaseEndpoint + search.value;
    // make a request to the url and get the response back in the form of a json object
    let result = await (await fetch(endpoint)).json(); // use json function after fetching the response
    // delete all option tags before adding new ones (suggestions)
    suggestions.innerHTML = '';
    // search for 5 citites (names are based on the keys in API)
    let cities = result._embedded['city:search-results']; // use [] instead of . since the column symbol is used inside the name of the key 
    // only display the first 5 suggested cities (only up to 5 cities will be shown) 
    let length = cities.length > 5 ? 5 : cities.length;
    // cycle through the number of cities 
    for(let i = 0; i < length; i++) {
        // create an option tag
        let option = document.createElement('option');
        // set the value for the option tag
        option.value = cities[i].matching_full_name;
        // assign the value to suggestions.innerHTML
        suggestions.appendChild(option);
    }
})

// a function that updates the weather
let updateCurrentWeather = (data) => {
    // update weather details
    city.textContent = data.name + ', ' + data.sys.country; // store the city name and country 
    day.textContent = dayOfWeek(); // call the function and store the day of the week
    humidity.textContent = data.main.humidity; // update humidity data
    pressure.textContent = data.main.pressure; // update pressure data
    // need two parameters for the wind indicator (wind direction and its speed) 
    let windDirection; // wind direction  
    let deg = data.wind.deg; // degree
    // each direction is determined by a 90 degree rotation around a circle  
    if(deg > 45 && deg <= 135) {
        windDirection = 'East';
    } 
    else if(deg > 135 && deg <= 225) {
        windDirection = 'South';
    } 
    else if(deg > 225 && deg <= 315) {
        windDirection = 'West';
    } 
    else {
        windDirection = 'North';
    }
    wind.textContent = windDirection + ', ' + data.wind.speed; // wind direction and speed for the wind indicator
    // store the temperature and a plus sign in front if it's a positive number (use Math.round to get an integer value)
    temperature.textContent = data.main.temp > 0 ? '+' + Math.round(data.main.temp) : Math.round(data.main.temp);  
    // get the image ID from the API data
    let imgID = data.weather[0].id;
    // check every object in the weatherImages array 
    weatherImages.forEach(obj => {
        // if the current object's ID matches the image ID that we get from the API
        if(obj.ids.includes(imgID)) {
            // use the corresponding image url to display the correct image icon  
            image.src = obj.url; 
        }
    })
}

// a function that updates the forecast
let updateForecast = (forecast) => {
    // delete everything already stored inside the forecast block
    forecastBlock.innerHTML = '';
    // create an article for each day of the array called forecast 
    forecast.forEach(day => {
        // grab some data via API:
        // add weather condition codes to the fixed part of the url to get the desired weather image 
        let iconUrl = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png'; // '@2x.png' -> increases the resolution of the pgn 
        // get the relevant day
        let dayName = dayOfWeek(day.dt * 1000); // convert seconds into milliseconds (1 sec = 1000 ms)
        // get the temperature of the relevant day 
        let temperature = day.main.temp > 0 ? '+' + Math.round(day.main.temp) : Math.round(day.main.temp); 
        // create an article (can use any article from the html but it must be enclosed in backticks or ` ` and also use ${} to insert js code where apprioriate)
        let forecastItem = ` 
            <article class="weather_forecast_item">
                <h3 class="weather_forecast_day">${dayName}</h3>
                <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather_forecast_icon"> 
                <h3 class="weather_forecast_temperature"><span class="value">${temperature}</span>&deg; C</h3>
            </article>
        `;
        // convert the html into a DOM object and then insert the article inside the forecast block
        forecastBlock.insertAdjacentHTML('beforeend', forecastItem); // two arguments: where and what
    })
}

// a function that returns the day of the week
let dayOfWeek = (dt = new Date().getTime()) => { // dt = day/time
    // convert object to the local date string 
    return new Date(dt).toLocaleDateString('en-EN', {'weekday': 'long'}); // en-EN -> English and long -> the whole name of the weekday
}

