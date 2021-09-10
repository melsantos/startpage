const API_KEY = 'PUT API KEY HERE'
const CITY_ID = 'PUT CITY ID HERE'
const SUBREDDIT = "https://www.reddit.com/r/EarthPorn/"

document.cookie = "promo_shown=1; Max-Age=2600000; Secure"

function getTopPost() {
  const site = `${SUBREDDIT}.json?limit=3;raw_json=1`
  var request = new Request(site)

  fetch(request)  
    .then(response => response.json())
    .then(data => {
        // grab the hottest post of today
        var posts = data.data.children
        for (post of posts) {
            if (!post.data['stickied']) {
                changeBackground(post)
                break
            }
        }
      })
}

function changeBackground(post) {
  var bg = document.getElementById("bg")
  var content = document.getElementById("content")
  var credit = document.getElementById("credit")
  var bgImg = new Image()
  
  try {
    bgImg.src = `${post.data['url']}`
  }
  catch(e) {
    console.log(post)
    bgImg.src = "media/default.jpg"
  }

  credit.innerHTML = `Photo Credit: u/${post.data['author']}`
  credit.href = `https://www.reddit.com${post.data['permalink']}`

  bgImg.onload = function() {
    bg.style.backgroundImage = `url('${post.data['url']}')`
    unfade(bg, 20)
    unblur(bg, 20)
    setTimeout(function() {
      unfade(content, 5)
    }, 770)
  }
}

function getWeather() {
  const OW = `https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&appid=${API_KEY}&units=imperial`
  var request = new Request(OW)
  var temp = document.getElementById("temp")

  fetch(request)  
    .then(response => response.json())
    .then(data => {
        temp.innerHTML = Math.trunc(data['main']['temp']) + "&#176;F " + "&nbsp" + data['weather'][0]['main'] + "&nbsp"
        setWeatherIcon(data['weather'][0]['id'])
        // icon.src = `https://openweathermap.org/img/wn/@2x.png`
      })
}

function setWeatherIcon(code) {
  var icon = document.getElementById("weather_icon")
  var weatherIcon = "wi ";

  switch(true) {
    case(code >= 200 && code < 300):
      console.log(`${code} Thunderstorm`)
      weatherIcon += "wi-thunderstorm"
      break;
    case(code >= 300 && code < 400):
      console.log(`${code} Drizzle`)
      weatherIcon += "wi-showers"
      break;
    case(code >= 500 && code < 600):
      console.log(`${code} Rain`)
      weatherIcon += "wi-rain"
      break;
    case(code >= 600 && code < 700):
      console.log(`${code} Snow`)
      weatherIcon += "wi-snow"
      break;
    case(code >= 700 && code < 800):
      console.log(`${code} Atmosphere`)
      weatherIcon += "wi-fog"
      break;
    case(code == 800):
      console.log(`${code} Clear`)
      weatherIcon += "wi-day-sunny"
      break;
    case (code >= 801 && code < 900):
      console.log(`${code} Clouds`)
      weatherIcon += "wi-cloudy"
      break;
    default:
      console.log(`${code} Default Clear`)
      weatherIcon += "wi-meteor"
      break;
  }

  icon.innerHTML = `<i class="${weatherIcon}"></i>`
}

function getTime() {
  const time = document.getElementById("time")
  const dt = new Date()
  const options = {hour12: true, hour: '2-digit', minute: '2-digit'}
  time.innerHTML = dt.toLocaleTimeString('en-US', options)
}

function getDate() {
  const date = document.getElementById("date")
  const dt = new Date()
  const options = {weekday: 'short', year: 'numeric', month: '2-digit', day:'2-digit'}
  date.innerHTML = dt.toLocaleDateString('en-US', options).replaceAll("/", "-").replace(",", "")
}

function getCovid() {
  var tracker = document.getElementById('tracker')
  var cases = document.getElementById('cases')
  var date = new Date()

  if (storageAvailable('localStorage')) {
    if(!localStorage.getItem('date') || !localStorage.getItem('cases') || localStorage.getItem('date') != date.getDate() ) { 
      localStorage.setItem('date', date.getDate())
      getCases()
    }

    cases.innerText = new Intl.NumberFormat().format(localStorage.getItem('cases'))
    tracker.style.opacity = 0;
    tracker.style.display = "block"
    unfade(tracker, 20)
  } else {
    console.log("We don't have local storage")
    document.getElementById('tracker').display="none";
  }
   
  function getCases() {
    var geoBaseIP = 'http://ip-api.com/json/'
    var request = new Request(geoBaseIP)

    fetch(request)
      .then(response => response.json())
      .then(data => {
        if (data.hasOwnProperty('countryCode')) {
          callCovidApi(data['countryCode'])
        } else {
          callCovidApi('ZW')
        }
      })

    // API case data is only up to date to yesterday
    function callCovidApi(isoCode) {
      const covidBase = `https://covid-api.mmediagroup.fr/v1/history?ab=${isoCode}&status=confirmed`
      var request = new Request(covidBase)
  
      fetch(request)  
        .then(response => response.json())
        .then(data => {
          var dates = data['All']['dates']
          var yest = new Date()
          var dayBeforeYest = new Date()
          const options = {year: 'numeric', month: '2-digit', day: '2-digit' };

          yest.setDate(yest.getDate() - 1)
          dayBeforeYest.setDate(yest.getDate() - 1)

          // key date format: YEAR-MM-DD
          yKey = yest.toLocaleDateString('ko-KR', options).replaceAll(/\.\s+/ig, "-").slice(0, -1)
          dKey = dayBeforeYest.toLocaleDateString('ko-KR', options).replaceAll(/\.\s+/ig, "-").slice(0, -1)
          localStorage.setItem('cases', dates[`${yKey}`] - dates[`${dKey}`]);
        })
    }
  }
}

/* Taken from https://stackoverflow.com/a/6121270 */
/* https://creativecommons.org/licenses/by-sa/3.0/ */
/* added unblur function */
function unfade(element, speed) {
  var op = 0.1
  var opTimer = setInterval(function () {
      if (op >= 1){
          clearInterval(opTimer)
      }
      element.style.opacity = op
      element.style.filter = 'alpha(opacity=' + op * 100 + ")"
      op += op * 0.1
  }, speed)
}

function unblur(element, speed) {
  var blur = 30
  var blurTimer = setInterval(function () {
      if (blur <= 5){
          clearInterval(blurTimer)
      }
      element.style.filter = "blur(" + blur + "px) brightness(50%)"
      blur -= 1
  }, speed)
}

// localStorage dectecting function
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } 
  catch(e) { return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}

getTime()
setInterval(getTime, 1000)
getDate()
getWeather()
getTopPost()
getCovid()
