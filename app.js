const express = require('express');
const mustacheExpress = require('mustache-express');
const parseurl = require('parseurl');
const session = require('express-session');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator');

let app = express();
app.engine('mustache', mustacheExpress());
app.set('views','./views');
app.set('view engine', 'mustache');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

//an object that has our array of letters to guess
let lettersGuessed = {
  letters:[]
}

//so we can read in a form
app.use(bodyParser.urlencoded({extended:false}))
app.use(expressValidator());

//find out why we would use this
app.use(express.static('public'));

//pull up our site first
app.get('/', function(req, res, next){
  res.render('wordgame')
})
//post once we get our input
app.post('/', function(req, res, next){
  let guessLetter = req.body.guessLetter;

//check for valid input
req.checkBody('guessLetter', "You must type something").notEmpty();
let errors = req.validationErrors();

console.log(errors);
//check if we've guessed the letter before
 let alreadyGuessed = false;
  for (let i = 0; i < lettersGuessed.letters.length; i++) {
    if(lettersGuessed.letters[i] === guessLetter){
      alreadyGuessed = true;
    }
  }

  //add our letters to an array of letters guessed
  if (!alreadyGuessed) {
    lettersGuessed.letters.push(guessLetter);
  }
  res.render('wordgame', {lettersGuessed:lettersGuessed.letters, errs:errors});
})

app.listen(3000, function(){
  console.log('let\'s get you rollin');
})
