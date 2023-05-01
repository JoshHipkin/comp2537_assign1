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
        res.send(buttons);
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
<input name='email' type='text' placeholder='Email'>
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

  const validationResult = schema.validate({ name, password, email });

  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/signup?missing=1");
  } else {
    var hashedPassword = await bcrypt.hash(password, saltRounds);
    await userCollection.insertOne({
        name: name,
        password: hashedPassword,
        email: email
    });
    console.log("signup successful");
    req.session.authenticated = true;
    req.session.name = name;
    res.redirect("/");
  }
});

app.post("/loggingin", async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(email);
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect("/login");
        return;
    } 
        const result = await userCollection
        .find({email: email})
        .project({name: 1, email: 1, password: 1, _id: 1})
        .toArray();

        console.log(result);
        if (result.length != 1) {
            console.log("incorrect combination of credentials");
            window.alert("incorrect combination of credentials");
            res.redirect("/login");
            return;
        }
        if (await bcrypt.compare(password, result[0].password)) {
            console.log("good password");
            req.session.authenticated = true;
            req.session.email = email;
            req.session.name = result[0].name;
            req.session.cookie.maxAge = expire;

            res.redirect("/loggedin");
            return;
        }
        else {
            console.log("password no good")
            window.alert("password incorrect")
            res.redirect("/login");
            return;
        }
    });

    app.get("/loggedin", (req, res) => {
        if (!req.session.authenticated) {
            res.redirect("/login");
        } else {
            res.redirect("/members");
        }
    });

    app.get ("/logout", (req, res) => {
        req.session.destroy((e) => {
            if (e) {
                console.log(e)
            } else {
                res.redirect("/");
            }
        });
    });

    const imageUrl = [

    ]

    app.get("/image/:id", (req, res) => {
        var pic = req.params.id;
        if (pic == 1) {
            res.send();
        } else if (pic == 2) {
            res.send();
        } else if (pic == 3) {
            res.send();
        }
    });

    app.get("/members", (req, res) => {
        if (!req.session.name) {
            res.redirect("/");
            return;
        }

        const name = request.session.name;
        const pic = imageUrl[Math.floor(Math.random() * imageUrl.length)];

        const html = `<h1>Welcome to the elite members club${name}</h1>
        <img src= "/${image}" alt= "oops, there's supposed to be an image here"
        <br>
        <button onclick= "window.loction.href= '/logout'">Log out</button>`;
        res.send(html);
    });

    app.use(express.static(__dirname + "/public"));

app.get("*", (req, res) => {
  res.status(404);
  res.send("404 - Page not found");
});

app.listen(port, function () {
  console.log("Listening on port " + port + "!");
});
