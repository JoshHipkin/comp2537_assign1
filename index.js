

const session = require('express-session');
const express = require('express');
const Joi = require("joi");
const saltRounds = 12;
const bcrypt = require('bcrypt');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 8000;



const node_session_secret = process.env.NODE_SESSION_SECRET;

app.use(express.json());
app.use(express.urlencoded({extended: false}));


app.get('/', (req, res) => {
    var buttons = '<a href="/login"><button>Login</button>';
    buttons += '<a href="/signup"><button>Signup</button>';
    res.send(buttons);
});

app.get('/login', (req, res) => {
var html = `Log in
<form action='/loggingin' method='post'>
<input name='username' type='text' placeholder='username'>
<input name='password' type='password' placeholder='password'>
<button>Submit</button>
</form>`;
res.send(html);
});


app.get('/signup', (req, res) => {
var emptyfields = req.query.missing;
var html = `Sign up
<form action='/submitUser' method='post'>
<input name='name' type='text' placeholder='Name'>
<input name='email' type='email' placeholder='Email'>
<input name='password' type='password' placeholder='Password'>
<button>Submit</button>
</form>`;

if(emptyfields) {
    html += "<br> Please fill in all fields!";
}
res.send(html);
});

app.post('/submitUser', async (req,res) => {
    var name = req.body.name;
    var password = req.body.password;
    var email = req.body.email;

    const schema = Joi.object(
        {
            name: Joi.string().alphanum().max(20).required(),
            password: Joi.string().max(20).required(),
            email: Joi.string().required()
        });

        const validInput = schema.validate({name, password, email});


    if (validInput.error != null) {
        console.log(validInput.error);
        res.redirect('/signup?missing=1');
    } else {
        var hashedPassword = await bcrypt.hash(password, saltRounds);
        res.send("Thanks for signing up!");
    }
});


app.get("*", (req,res) => {
    res.status(404);
    res.send("404 - Page not found");
});


app.listen(port, function() {
    console.log("Listening on port " + port + "!");
});