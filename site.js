const API_KEY = 'PUT API KEY HERE'
const CITY_ID = 'PUT CITY ID HERE'

function getTopPost() {
  const EP = `https://www.reddit.com/r/EarthPorn/hot/.json?limit=3;raw_json=1`
  var request = new Request(EP)

  fetch(request)  
    .then(response => response.json())
    .then(data => {
        // grab the hottest post of today
        var posts = data.data.children;
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
  
  try {
    bg.style.backgroundImage = `url('${post.data['url']}')`
  }
  catch(e) {
    console.log(post)
    bg.style.backgroundImage = "url('default.jpg')"
  }

  unfade(bg, 20)
  unblur(bg, 20)
  setTimeout(function() {
    unfade(content, 5)
  }, 725)
}


/* Taken from https://stackoverflow.com/a/6121270 */
/* https://creativecommons.org/licenses/by-sa/3.0/ */
/* added unblur function */
function unfade(element, speed) {
  var op = 0.1;
  var opTimer = setInterval(function () {
      if (op >= 1){
          clearInterval(opTimer);
      }
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op += op * 0.1;
  }, speed);
}

function unblur(element, speed) {
  var blur = 30;
  var blurTimer = setInterval(function () {
      if (blur <= 5){
          clearInterval(blurTimer);
      }
      element.style.filter = "blur(" + blur + "px)"
      blur -= 1;
  }, speed);
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
  var date = document.getElementById("date")
  var days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  var dt = new Date()
  var hours = (dt.getHours() % 12 == 0) ? pad(12) : pad(dt.getHours() % 12)
  var mins = pad(dt.getMinutes())
  var sec = pad(dt.getSeconds())
  var ampm = (dt.getHours() / 12 >= 1) ? "PM" : "AM"
  var month = pad(dt.getMonth() + 1)
  var numDate = pad(dt.getDate())
  var year = dt.getFullYear()
  
  time.innerHTML = `${hours}:${mins}:${sec}&nbsp${ampm}`
  date.innerHTML = `${days[dt.getDay()]}&nbsp${month}-${numDate}-${year}`

  function pad(num) {
    return num.toString().padStart(2, '0')
  }
}

setInterval(getTime, 1000)
getTopPost()
getWeather()
