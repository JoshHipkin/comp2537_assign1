require('dotenv').config();

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;

const MongoClient = require("mongodb").MongoClient;
const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}.j5iks8k.mongodb.net/?retryWrites=true&w=majority`;
var database = new MongoClient(atlasURI, {useNewUrlParser: true, useUnifiedTopology: true});
database.connect((err) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('connected to mongo db');
})