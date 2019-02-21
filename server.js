const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

var app = express();
const PORT = 3000;

// tell express where the static pages are
app.use(express.static(__dirname + "/public")); // dirname always holds the absolute path to the current directory the app is in.

// add middleware to express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// log any api calls
app.use((req, res, next) => {
  var now = new Date().toString();

  var log = `${now}: ${req.method} ${req.url}`;
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
  next(); // Call next to release control from this middleware to the next.
});

// Serve landing page
app.get("/", (req, res) => {
  res.render("index.html");
});

// POST meme
app.post("/meme", function(req, res) {
  console.log(req.body);
  res.status(200).send('You sent the name "' + req.body.text + '".');
});

app.listen(PORT, () => {
  console.log(`Started server on port ${PORT}`); // eslint-disable-line no-console
});

module.exports = { app };
