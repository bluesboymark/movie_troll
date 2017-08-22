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
  FacebookStrategy = require('passport-facebook').Strategy,
  configAuth = require('./config/auth.js')
  passportLocalMongoose = require('passport-local-mongoose'),
  request = require('request'),
  User = require('./models/user'),
  Post = require('./models/post'),
  Comment = require('./models/comments'),

  app = express()

// connect to mongo
// mongoose.connect('mongodb://localhost/movie_troll')
mongoose.connect(process.env.DATABASEURL)

// express middleware
app.use(morgan('dev'))
// pull static files from public directory
app.use(express.static(__dirname + '/public'))
app.use(methodOverride("_method"))
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
//facebook
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

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


app.get('/search/:searchTerm', (req, res) => {
  var searchTerm = req.params.searchTerm;
  var initUrl = 'https://api.themoviedb.org/3/search/movie'
  var apiKey = process.env.MDB_API_KEY
  var apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MDB_API_KEY}&language=en-US&query=${searchTerm}&page=1&include_adult=false`

  request.get(apiUrl, (err, response, body) => {
    // console.log('body=',body)
    res.json(JSON.parse(body))
  });
});

//  ROUTES
  // greeting page
app.get('/',function(req,res){
    res.render('movies/home');
});

//  route to home - all posts.
app.get('/movies', (req, res) => {
  Post.find({}, (err, allPosts) => {
    if(err){
      console.log(err)
    } else {
      res.render('movies/movies', {posts: allPosts})
    }
  });
});

app.post('/movies',isLoggedIn, (req, res) =>{
  console.log("User:", req.user)
  // console.log('req.body is:',req.body)
  newPost = new Post(req.body);
  newPost.create = req.user;
  console.log('newPost:', newPost);
  newPost.save((err,post) => {
    if(err) {
       console.log('err', err)
    } else {
      res.redirect('/movies')
    }
  })
});
// redirect to login page if not logged in
app.get('/movies/new', isLoggedIn, (req, res) => {
  res.render('movies/new')
});

app.get('/movies/:id', isLoggedIn, (req, res) => {
  Post.findById(req.params.id).populate("comments").exec(function(err, foundPost){
    if(err) {
      console.log(err)
    } else {
      // console.log(foundPost)
      res.render('movies/show', {post: foundPost});
    }
  });
});

app.get('/movies/:id/edit',isLoggedIn, (req,res) => {
  Post.findById(req.params.id, function(err, foundPost){
    res.render('movies/edit', {post: foundPost})
  });
});

app.put('/movies/:id',isLoggedIn, function(req, res) {
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
    if(err){
      console.log(err)
      res.redirect('/movies')
    } else {
      res.redirect('/movies/' + req.params.id)
    }
  });


app.delete('/movies/:id', (req, res) => {
  Post.findByIdAndRemove(req.params.id, function(err){
    if(err){
      console.log(err)
      res.redirect('/movies')
    } else {
      res.redirect('/movies')
    }
  });
});


// ========= Comments
//route for posting comments
app.post('/movies/:id/comments', (req, res) => {

   var id = req.params.id
   Post.findById(req.params.id, (err, post) => {
     if (err) return err;

     console.log(post);
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
   });
  });
 });


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
    });
  });
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
      res.redirect('/movies');
    });
  });
});

//facebook
app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}))

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
	successRedirect: '/',
	failureRedirect: '/'
}))

// LOG IN ROUTE
app.get("/login", function(req, res){
  res.render("login")
});

// Create a SESSION
app.post('/login', passport.authenticate("local", {
  successRedirect: "/movies",
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


function ownsPost(req,res,next){
  if(req.isAuthenticated()){
    Post.findById(req.params.id, function(err, foundPost){
      if(err){
        res.redirect('back')
      } else {
        console.log(foundPost)
        if(foundPost.creator.id.equals(req.user._id)){
          console.log(req.user)
          conole.log('post creator:', foundPost.creator._id)
          next()
        } else {
          res.redirect('back')
        }
      }
    });
  } else {
    res.redirect('back')
  }
}



  console.log(err || `Server is listening on port ${PORT}`)
})
