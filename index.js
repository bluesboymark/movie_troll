const
  express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  dotenv = require('dotenv').load(),
  morgan = require('morgan'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),

  app = express()

// express middleware
app.use(morgan('dev'))
// parse to deal with nested objects
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
// connect to mongo
mongoose.connect('mongodb://localhost/movie_troll')
