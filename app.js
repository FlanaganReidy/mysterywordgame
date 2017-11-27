const express = require('express');
const mustacheExpress = require('mustache-express');
const parseurl = require('parseurl');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator');
const countrynames = require('./models/countrynames.js');
const PORT = process.env.PORT || 3000;
var path = require('path');

let app = express();
app.use('/public',express.static(path.join(__dirname, '/public')));
app.engine('mustache', mustacheExpress());
app.set('views','./views');
app.set('view engine', 'mustache');

app.use(cookieSession({
  name: 'session',

  keys: [],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
//an object that has our whole page
let view = {
  letters:[]
}

//so we can read in a form
app.use(bodyParser.urlencoded({extended:false}))
app.use(expressValidator());


app.use( function (req, res, next){
  if(!req.session.game){

    console.log('let\'s start a new game')
    req.session.game = true;
    view.letters=[]
    view.countryToGuess = countrynames.randomName(countrynames.countryList).split('');
    view.numGuesses = view.countryToGuess.length-1;
    view.unknownWord = [];
    for (var i = 0; i < view.countryToGuess.length; i++) {
      view.unknownWord.push('_');
    }
    next('route');
  }
  else{
    next();
  }
})

//pull up our site first
app.get('/', function(req, res, next){
  res.render('wordgame', view);
})

app.get('/newgame', function(req,res,next){
  res.render('newgame', view)
})

app.post('/', function(req, res, next){
  let guessLetter = req.body.guessLetter;

//check for valid input
req.checkBody('guessLetter', "You must type something").notEmpty();
req.checkBody('guessLetter', "It must be a letter").isAlpha();
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
    else if(view.letters[i].toUpperCase() === guessLetter){
      alreadyGuessed = true;
    }
    else if(view.letters[i].toLowerCase() === guessLetter){
      alreadyGuessed = true;
    }
  }

  if(view.errors){
    delete view['errors'];
  }


  //add our letters to an array of letters guessed
  if (!alreadyGuessed) {
    view.letters.push(guessLetter);
    let isRight = false;
    for (var i = 0; i < view.countryToGuess.length; i++) {
      if(guessLetter === view.countryToGuess[i]){
      view.unknownWord[i] = guessLetter;
      isRight = true;
      }
      else if (guessLetter.toUpperCase() === view.countryToGuess[i]) {
        view.unknownWord[i] = guessLetter.toUpperCase();
        isRight = true;
      }
      else if (guessLetter.toLowerCase() === view.countryToGuess[i]){
        view.unknownWord[i] = guessLetter.toLowerCase();
        isRight = true;
      }

    }
    if(isRight === false){
      view.numGuesses--;
    }
  }
  if (view.unknownWord.toString()===view.countryToGuess.toString()) {
    res.redirect('/newgame');
    view.win = true;

  }
  else if(view.numGuesses === 0){
    view.win =false;
    res.redirect('/newgame')
  }
  else{
  res.render('wordgame', view);
}
}
})

app.post('/newgame', function(req,res,next){
  req.session.game = false;
  res.redirect('/')
})


app.listen(PORT, function(){
  console.log('let\'s get you rollin on' + PORT);
})
