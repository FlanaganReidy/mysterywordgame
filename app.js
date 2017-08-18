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
let view = {
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
if (errors) {
  view.errors = errors;
  console.log(errors);
  res.render('wordgame', view);
}

else{
//check if we've guessed the letter before
 let alreadyGuessed = false;
  for (let i = 0; i < view.letters.length; i++) {
    if(view.letters[i] === guessLetter){
      alreadyGuessed = true;
    }
  }
  if(view.errors){
    delete view['errors'];
    console.log('oh hey there')
  }


  //add our letters to an array of letters guessed
  if (!alreadyGuessed) {
    view.letters.push(guessLetter);
  }
  res.render('wordgame', view);
}
})

app.listen(3000, function(){
  console.log('let\'s get you rollin');
})
