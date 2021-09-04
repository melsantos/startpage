const API_KEY = 'PUT API KEY HERE'
const CITY_ID = 'PUT CITY ID HERE'
const SUBREDDIT = "https://www.reddit.com/r/EarthPorn/hot/"

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
    bgImg.src = "default.jpg"
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

function getWeather() {
  const OW = `https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&appid=${API_KEY}&units=imperial`
  var request = new Request(OW)
  var temp = document.getElementById("temp")
  var icon = document.getElementById("weather_icon")

  fetch(request)  
    .then(response => response.json())
    .then(data => {
        temp.innerHTML = Math.trunc(data['main']['temp']) + "&#176;F " + "&nbsp" + data['weather'][0]['main'] + "&nbsp"
        icon.src = `https://openweathermap.org/img/wn/${data['weather'][0]['icon']}@2x.png`
      })
}

function getTime() {
  var time = document.getElementById("time")

  var dt = new Date()
  var hours = (dt.getHours() % 12 == 0) ? pad(12) : pad(dt.getHours() % 12)
  var mins = pad(dt.getMinutes())
  var ampm = (dt.getHours() / 12 >= 1) ? "PM" : "AM"
  
  time.innerHTML = `${hours}:${mins}&nbsp${ampm}`
}

function getDate() {
  var date = document.getElementById("date")
  var days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  var dt = new Date()
  var month = pad(dt.getMonth() + 1)
  var numDate = pad(dt.getDate())
  var year = dt.getFullYear()

  date.innerHTML = `${days[dt.getDay()]}&nbsp${month}-${numDate}-${year}`
}

function pad(num) {
  return num.toString().padStart(2, '0')
}

getTime()
setInterval(getTime, 1000)
getDate()
getWeather()
getTopPost()
