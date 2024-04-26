var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const { redirect } = require("statuses");
const app = express()
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect('mongodb://localhost:27017/pp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))

app.get("/", function (req, res) {
    res.render("index",{islogin:false});
  });
  app.get("/about", function (req, res) {
    res.render("about");
  });
  app.get("/logout", function (req, res) {
    res.render("ls",{islogin:false,userExists: false, useradded:false,inv:false });
  });
  app.get("/service", function (req, res) {
    res.render("service");
  });
  app.get("/contact", function (req, res) {
    res.render("contact");
  });
 
  app.get("/home", function (req, res) {
    res.render("index",{islogin:false});
  });
  app.get("/profile", function (req, res) {
    res.render("profile");
  });
  app.get("/book", function (req, res) {
    res.render("book");
  });
  app.get("/payment", function (req, res) {
    res.render("payment");
  });
  app.get("/confirmorder", function (req, res) {
    res.render("confirmorder");
  });
  app.get("/ls", (req, res) => {
    // Check if the query parameter indicates that the user already exists
    if (req.query.userExists === 'true') {
        // Render the page and pass a variable indicating that the user already exists
        res.render('ls', { userExists: true, useradded:false,inv:false });
    } else if(req.query.useradded === 'true'){
        // Render the page without indicating that the user already exists
        res.render('ls', { userExists: false,useradded:true,inv:false});
    }
    else if(req.query.inv === 'true'){
        // Render the page without indicating that the user already exists
        res.render('ls', { userExists: false,useradded:false,inv:true});
    }
    else
    {
        res.render('ls', { userExists: false,useradded:false,inv:false});
    }
});
// app.post("/sign_up",(req,res)=>{
//     var name = req.body.name;
//     var email = req.body.email;
//     var phno = req.body.phno;
//     var password = req.body.password;

//     var data = {
//         "name": name,
//         "email" : email,
//         "phno": phno,
//         "password" : password
//     }

//     db.collection('users').insertOne(data,(err,collection)=>{
//         if(err){
//             throw err;
//         }
//         console.log("Record Inserted Successfully");
//     });

//     return res.redirect('signup_success.html')

// })


// app.get("/",(req,res)=>{
//     res.set({
//         "Allow-access-Allow-Origin": '*'
//     })
//     return res.redirect('index.html');
// }).listen(3000);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  });
  
  const User = mongoose.model('User', UserSchema);
  
//   app.use(bodyParser.json());
  
  // Signup endpoint
  app.post('/signup', async (req, res) => {
    try {
      const { name,email, password } = req.body;
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // return res.status(400).json({ message: 'User already exists' });
        // User already exists
        res.render('ls', { userExists: true, useradded:false,inv:false });
    

      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword
      });
      await newUser.save();
      // After successfully adding a new user
      res.render('ls', { userExists: false,useradded:true,inv:false});
    

      
    } catch (error) {
        res.status(404).send("Internal Server Error");
    }
  });
  
  // Login endpoint
  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return     res.render('ls', { userExists: false,useradded:false,inv:true});
      }
      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return     res.render('ls', { userExists: false,useradded:false,inv:true});
     
      
      }
      res.render('index',{name:user.name , islogin:true});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/sumbit-order",(req,res)=>{
    var shirt=req.body.shirt;
   var pants=req.body.pants;
   var suit=req.body.suit;
   var socks=req.body.socks;
   var saree=req.body.saree;
   var jacket=req.body.jacket;
   var other=req.body.other;
   var name=req.body.name;
   var email=req.body.email;
   var price=shirt*10+pants*10+socks*10+saree*30+jacket*40+suit*50+other*100;
    // Check if user with the same email or phone number already exists
    var data = {
        "shirts":shirt,
        "pants":pants,
        "suits":suit,
        "sarees":saree,
        "jackets":jacket,
        "others":other,
        "socks":socks,
        "name":name,
        "email":email,
        "price":price,
    }

    db.collection('order').insertOne(data,(err,collection)=>{
        if(err){
            // Handle database insertion error
            console.error("Error inserting user:", err);
            return res.status(500).send("Internal Server Error");
        }
        console.log("Record Inserted Successfully");
        return res.render('book',{email:email,price:price});
    });
});


app.post("/address",(req,res)=>{
  
    var paddress=req.body.paddress;
   var daddress=req.body.daddress;
   var email=req.body.email;
   var time=req.body.time;
   var date=req.body.date;
   var price=req.body.price;
    // Check if user with the same email or phone number already exists
    var data = {
      "email":email,
        "paddress":paddress,
        "daddress":daddress,
        "time":time,
        "date":date,
        "price":price,
    } 
  
   
    db.collection('address').insertOne(data,(err,collection)=>{
        if(err){
            // Handle database insertion error
            console.error("Error inserting user:", err);
            return res.status(500).send("Internal Server Error");
        }
        console.log("Record Inserted Successfully");
        
        return res.render('payment',{price:price,date:date});
    });
});

app.post("/pay",(req,res)=>{
  var fullname=req.body.fullname;
 var address=req.body.address;
 var state=req.body.state;
 var email=req.body.email;
 var city=req.body.city;
 var zip=req.body.zip;
 var cardname=req.body.cardname;
 var cardno=req.body.cardno;
 var date=date;
 var price =price;
  // Check if user with the same email or phone number already exists
  var data = {
      "address":address,
      "fullname":fullname,
      "state":state,
      "email":email,
      "city":city,
      "zip":zip,
      "cardname":cardname,
      "cardno":cardno,
      "date":date,
      "price":price,
  }

  db.collection('payment').insertOne(data,(err,collection)=>{
      if(err){
          // Handle database insertion error
          console.error("Error inserting user:", err);
          return res.status(500).send("Internal Server Error");
      }
      console.log("Record Inserted Successfully");
      return res.render('confirmorder',{date:date,price:price});
  });
});

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
// console.log("Listening on PORT 3000");