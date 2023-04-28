const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

const session = require('express-session');

const node_session_secret = 'e8bffe67-2632-4dfd-86d5-fa760ea33908';

app.use(express.json());

app.use(session({
    secret: node_session_secret,
    //store: MongoDBStore,
    saveUninitialized: false,
    resave: true
}
));

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
var html = `Sign up
<form action='/submitUser' method='post'>
<input name='name' type='text' placeholder='Name'>
<input name='email' type='email' placeholder='Email'>
<input name='password' type='password' placeholder='Password'>
<button>Submit</button>
</form>`;
res.send(html);
});

app.post('/submitUser', async (req,res) => {
    var name = req.body.name;
    var password = req.body.password;
    var email = req.body.emal;
});


app.get("*", (req,res) => {
    res.status(404);
    res.send("404 - Page not found");
});


app.listen(port, function() {
    console.log("Listening on port " + port + "!");
});