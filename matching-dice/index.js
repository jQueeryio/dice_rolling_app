const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const credentials = require('./credentials.js');

//Setup mongoose
const dbURL = credentials.dbURL;
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(dbURL, mongooseOptions, function(error){
    checkError(error, "Successfully connected to MongoDB!");
});

let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB Error: "));
mongoose.Promise = global.Promise;

//Setup mongoDB
const diceStructure = {
    userName: String,
    diceRoll1: Number,
    diceRoll2: Number,
    timestamp: Date
}

let diceSchema = new mongoose.Schema(diceStructure);
let diceModel = new mongoose.model("dice_rolls", diceSchema);

//Set up express server
const app = express();
const http = require('http').Server(app);
const port = 3000;
app.listen(port);
console.log(`Express is running at port ${port}`);

//Set up body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Express Routes
app.use("/", express.static("public_html/"));

app.post("/rollDice1", function(request, response){
    let dice1 = _.random(1, 20);
    console.log(`Dice 1: ${dice1}`);

    let responseObject = {
        dice: dice1
    }
    response.send(responseObject);
});

app.post("/rollDice2", function(request, response){
    let dice2 = _.random(1, 20);
    console.log(`Dice 2: ${dice2}`);

    let responseObject = {
        dice: dice2
    }
    response.send(responseObject);
});

app.post("/submitDiceRoll", function(request, response){
    let user = request.body.userName;
    let dice1 = dice1;
    let dice2 = dice2;
    request.body.timestamp = new Date();

    //Create
    let newDiceRollEntry = new diceModel(request.body);
    newDiceRollEntry.save(function(error){
        checkError(error, "Successfully saved entry.");
    });

    let responseObject;
    if(dice1 === dice2){
        responseObject = {
            serverMessage: `Congrats ${user}, you won!`,
            error: false
        }
    }
    else {
        responseObject = {
            serverMessage: `Sorry ${user}, you didn't roll matching die. Better luck next time!`,
            error: true
        }
    }
    
    response.send(responseObject);
});

function checkError(error, successMessage){
    if(error){
        console.log(`There was an error: ${error}`);
    } else {
        console.log(successMessage);
    }
}