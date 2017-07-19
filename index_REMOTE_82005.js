const
  express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  mongoose = require('mongoose'),
  dotenv = require('dotenv').load(),
  morgan = require('morgan'),
  methodOverride = require('method-override'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  passportLocalMongoose = require('passport-local-mongoose'),
  fs = require('fs'),
  multer = require('multer'),
  request = require('request'),
  User = require('./models/user'),
  Post = require('./models/post'),
  Comment = require('./models/comments')
const
  PORT = 3000,
  app = express()

// connect to mongo
mongoose.connect('mongodb://localhost/movie_troll')
// express middleware
app.use(morgan('dev'))
// pull static files from public directory
app.use(express.static(__dirname + '/public'))
// use ejs for rendering
app.set('view engine', 'ejs')
// parse to deal with nested objects
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())
app.use(cookieParser())
// require and use session in one swoop,
// secret required to encode/decode session data
app.use(require("express-session")({
  secret: "Luna is the best dog in the world",
  resave: false,
  saveUninitialized: false
}));
//  Auth middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//  make the current user available globally
app.use(function (req, res, next) {
   res.locals.currentUser = req.user;
  //  console.log(req.user)
   next()
 });
// console.log(process.env.MDB_API_KEY)

 // API Search===============

app.get('/search/:searchTerm', (req, res) => {
  var searchTerm = req.params.searchTerm;
  var initUrl = 'https://api.themoviedb.org/3/search/movie'
  var apiKey = process.env.MDB_API_KEY
  var apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MDB_API_KEY}&language=en-US&query=${searchTerm}&page=1&include_adult=false`

  request.get(apiUrl, (err, response, body) => {
    console.log('body=',body)
    res.json(JSON.parse(body))
  });
});

//  ROUTES=========================
  // greeting page
app.get('/',function(req,res){
    res.render('home');
});

//  route to home - all posts.
app.get('/movies', (req, res) => {
  Post.find({}, (err, allPosts) => {
    if(err){
      console.log(err)
    } else {
      res.render('movies', {posts: allPosts})
    }
  });
});

app.post('/movies', isLoggedIn, (req, res) =>{
  var title = req.body.title
  var year = req.body.year
  var image = req.body.image
  var plot = req.body.plot
  var newPost = {title:title, year:year, image: image, plot: plot}
  Post.create(newPost, function(err, newPosting){
    if(err){
      console.log(err)
    } else {
      res.redirect('/movies')
    }
  });
});

app.get('/movies/new', isLoggedIn, (req, res) => {
  res.render('new')
});

app.get('/movies/:id', (req, res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    if(err) {
      console.log(err)
    } else {
      console.log(foundPost)
      res.render('show', {post: foundPost});
    }
  });
});

app.get('/movies/:id/edit', (req,res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    if(err){
      console.log(err)
    } else {
      res.render('edit', {post: foundPost});
    }
  });
});

app.put('/movies/:id', (req, res) => {
  res.send('update route')
});



// use to prove auth works.
app.get('/secret', isLoggedIn, function(req, res){
  console.log(req.user)
  res.render('secret')
});
// AUTH ROUTES=================
// render SIGN UP form
app.get('/signup', function(req, res){
  res.render('signup');
});

// post to create a new USER
app.post('/signup', function(req, res){
  req.body.username
  req.body.password
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
    if(err) {
      console.log(err);
      return res.render('signup');
    }
    passport.authenticate("local")(req,res,function(){
      res.redirect('/secret');
    });
  });
});

// LOG IN ROUTE
app.get("/login", function(req, res){
  res.render("login")
});

// Create a SESSION
app.post('/login', passport.authenticate("local", {
  successRedirect: "/secret",
  failureRedirect: "/login"
}), function(req, res){
});

// DESTROY SEssion/ logout
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/')
})


// middleware to check status
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login')
}
//comments
//route for posting comments
app.post('/movies/:id/comments', (req, res) => {
  var id = req.params.id
  Post.findById(req.params.id, (err, post) => {
    if (err) return err;

    console.log();
    console.log("++++++++++++++++++++++");
    // var newComment = {text:text}
    var newCom = new Comment(req.body)
    newCom._movieid = post._id
    console.log(newCom);
    console.log("++++++++++++++++++++++");
    newCom.save((err, put) => {
      if (err) {
        console.log(err)
      } else {
        post.comments.push(newCom)
        post.save()
        res.redirect('/movies/'+id)
      }
    })
  })
})

app.listen(PORT, function(err){
  console.log(err || `Server is listening on port ${PORT}`)
})
