const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema ({

  email: String,
  password:String

})

var secret= "thisismysmallsecret";
userSchema.plugin(encrypt, { secret: secret ,encryptedFields:["password"]});


const User= new mongoose.model("User",userSchema);


app.get("/",(req,res)=>{

res.render("home");

})


app.get("/register",(req,res)=>{

res.render("register");

})



app.get("/login",(req,res)=>{

res.render("login");

})


app.post("/register",(req,res)=>{

const newUser = new User({

 email:req.body.username,
 password:req.body.password

})

newUser.save();
res.render("secrets");


})

app.post("/login",(req,res)=>{

  const userName=req.body.username;
  const password=req.body.password;

  User.findOne({email:userName},(err,foundUser)=>{

   if(!err)
   {
     if(foundUser)
     {
       if(foundUser.password===password)
          res.render("secrets")


     }

   }
   else
   console.log(err);


  })




})























app.listen(3000, function() {
  console.log("Server started on port 3000");
});
