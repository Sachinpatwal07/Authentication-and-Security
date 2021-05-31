require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate')
const GoogleStrategy = require('passport-google-oauth20').Strategy;



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,

}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true,  useUnifiedTopology: true });

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);



const userSchema = new mongoose.Schema ({

  email: String,
  password:String,
  googleId:String

})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);



const User= new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);

      // if(err)
      // {
      //   res.redirect("/register");
      // }
      // else{
      //
      //   passport.authenticate("google")(req,res,function(){
      //
      //       res.redirect("/secrets")
      //
      //   })
      //
      //
      //
      // }
    });
  }
));

app.get("/",(req,res)=>{

res.render("home");

})


app.get("/register",(req,res)=>{

res.render("register");

})

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"], prompt: 'select_account' }
));

  app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/secrets');
    });





app.get("/login",(req,res)=>{

res.render("login");

})

app.get("/logout",(req,res)=>{

    req.logout();
    res.redirect('/');



})

app.get("/secrets",(req,res)=>{

if(req.isAuthenticated())
res.render("secrets")
else
res.redirect("/");


})


app.post("/register",(req,res)=>{

User.register({username:req.body.username},req.body.password,(err,user)=>{
if(err)
console.log(err)
else
{
   passport.authenticate("local")(req,res,function(){

     res.redirect("/secrets");

   })

}

})


})

app.post("/login",(req,res)=>{


  const user = new User({

    email:req.body.username,
    password:req.body.password

  });

  req.login(user, function(err) {
  if (err)
  console.log(err)
  else{

  passport.authenticate("local")(req,res,function(){

    res.redirect("/secrets");

  })

  }

});


})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
