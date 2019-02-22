const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const request = require("request");

var app = express();
const PORT = 3000;

hbs.registerPartials(__dirname + "/views/partials");
app.set("view engine", "hbs");

// tell express where the static pages are
app.use(express.static(__dirname + "/public")); // dirname always holds the absolute path to the current directory the app is in.

// add middleware to express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// custom middleware to log any api calls
app.use((req, res, next) => {
  var log = `${req.method} ${req.url}`;
  ServerLog(log);
  next(); // Call next to release control from this middleware to the next.
});

hbs.registerHelper("getCurrentYear", () => {
  return new Date().getFullYear();
});

// Serve landing page
app.get("/", (req, res) => {
  res.render("index.hbs", {
    pageTitle: "Home"
  });
});

var gifArray = [];

// POST gif
app.post("/", function(req, res) {
  // console.log(req.body);
  // res.status(200).send('You sent the name "' + req.body.text + '".');
  var gifName = req.body.text ? req.body.text : "random";
  ServerLog(`Search: ${gifName}`);

  callGiphyAPI(gifName, (errorMessage, result) => {
    var gifURL = result.data;

    ServerLog(gifURL);
    gifArray.unshift({ gifName, gifURL });

    res.render("index.hbs", {
      pageTitle: "Home",
      gifArray,
      gifURL
    });
  });
});

app.listen(PORT, () => {
  ServerLog(`Started server on port ${PORT}`);
});

module.exports = { app };

/***********Functions************/
const API_KEY = "53eOmYmTnZP6iTrKJmLJ9JsbOszh0I4G";

function callGiphyAPI(gifName, callback) {
  var url = "";

  if (
    (typeof gifName === "string" || gifName instanceof String) &&
    gifName.length === 0
  ) {
    url = `https://api.giphy.com/v1/gifs/random?api_key=${API_KEY}&tag=&rating=G`;
    ServerLog(`Search URL: ${url}`);
    request(
      {
        url,
        json: true
      },
      (error, response, body) => {
        if (error) {
          callback("Unable to connect to server.");
        } else {
          callback(undefined, {
            data: body.data.images["downsized_medium"].url
          });
          // console.log(JSON.stringify(error, undefined, 2));
          // console.log(JSON.stringify(response, undefined, 2));
        }
      }
    );
  } else {
    var encodedGifName = encodeURIComponent(gifName);
    url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodedGifName}&limit=1&offset=0&rating=G&lang=en`;
    ServerLog(`Search URL: ${url}`);
    request(
      {
        url,
        json: true
      },
      (error, response, body) => {
        if (error) {
          callback("Unable to connect to server.");
        } else {
          callback(undefined, {
            data: body.data[0].images["downsized_medium"].url
          });
          // console.log(JSON.stringify(error, undefined, 2));
          // console.log(JSON.stringify(response, undefined, 2));
        }
      }
    );
  }
}

function ServerLog(message) {
  var now = new Date().toString();
  var log = `${now}: ${message}`;

  /* eslint-disable no-alert, no-console */
  console.log(log);
  /* eslint-disable no-alert, no-console */
  fs.appendFile("server.log", log + "\n", err => {
    if (err) {
      /* eslint-disable no-alert, no-console */
      console.log("Unable to append to server.log.");
      /* eslint-disable no-alert, no-console */
    }
  });
}
