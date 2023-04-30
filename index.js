require("dotenv").config();
require("./utils.js");
const session = require("express-session");
const express = require("express");
const Joi = require("joi");
const saltRounds = 12;
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const app = express();
const port = process.env.PORT || 8000;

const expire = 1 * 60 * 60 * 1000;

var users = [];

var { database } = include("databaseConnection");

const userCollection = database.db(mongodb_database).collection("users");

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
  })
);

app.get("/", (req, res) => {
  if (!req.session.authenticated) {
    var buttons = '<a href="/login"><button>Login</button>';
    buttons += '<a href="/signup"><button>Signup</button>';
    res.send(buttons);
  } else {
    var buttons = `<button onclick="window.location.href='/members'">Go to Members Area</button>
        <button onclick="window.location.href='/logout'">Log out</button>`;
  }
});

app.get("/nosql-injection", async (req, res) => {
  var name = req.query.user;
  if (!name) {
    res.send(
      `<h3>No user provided - try /nosql-injection?user=name</h3> <h3>or /nosql-injection?user[$ne]=name</h3>`
    );
    return;
  }
  const schema = Joi.string().max(20).required();
  const validationResult = schema.validate(name);

  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.send(`<h3>Oops! not sure what happened there, try again!</h3>`);
    return;
  }

  const result = await userCollection
    .find({ name: name })
    .project({ name: 1, password: 1, _id: 1 })
    .toArray();

  console.log(result);

  res.send(`<h1>Hello, ${name}!</h1>`);
});

app.get("/login", (req, res) => {
  var html = `Log in
<form action='/loggingin' method='post'>
<input name='username' type='text' placeholder='username'>
<input name='password' type='password' placeholder='password'>
<button>Submit</button>
</form>`;
  res.send(html);
});

app.get("/signup", (req, res) => {
  var emptyfields = req.query.missing;
  var html = `Sign up
<form action='/submitUser' method='post'>
<input name='name' type='text' placeholder='Name'>
<input name='email' type='email' placeholder='Email'>
<input name='password' type='password' placeholder='Password'>
<button>Submit</button>
</form>`;

  if (emptyfields) {
    html += "<br> Please fill in all fields!";
  }
  res.send(html);
});

app.post("/submitUser", async (req, res) => {
  var name = req.body.name;
  var password = req.body.password;
  var email = req.body.email;

  const schema = Joi.object({
    name: Joi.string().alphanum().max(20).required(),
    password: Joi.string().max(20).required(),
    email: Joi.string().required(),
  });

  const validInput = schema.validate({ name, password, email });

  if (validInput.error != null) {
    console.log(validInput.error);
    res.redirect("/signup?missing=1");
  } else {
    var hashedPassword = await bcrypt.hash(password, saltRounds);

    res.send("Thanks for signing up!");
  }
});

app.get("*", (req, res) => {
  res.status(404);
  res.send("404 - Page not found");
});

app.listen(port, function () {
  console.log("Listening on port " + port + "!");
});
