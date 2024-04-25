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

mongoose.connect('mongodb://localhost:27017/mydb',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))
app.get("/", function (req, res) {
    res.render("index");
  });
  app.get("/about", function (req, res) {
    res.render("about");
  });
  app.get("/service", function (req, res) {
    res.render("service");
  });
  app.get("/contact", function (req, res) {
    res.render("contact");
  });
  app.get("/home", function (req, res) {
    res.render("index");
  });
  app.get("/profile", function (req, res) {
    res.render("profile");
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
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  });
  
  const User = mongoose.model('User', UserSchema);
  
//   app.use(bodyParser.json());
  
  // Signup endpoint
  app.post('/signup', async (req, res) => {
    try {
      const { email, password } = req.body;
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // return res.status(400).json({ message: 'User already exists' });
        // User already exists
        res.redirect('/ls?userExists=true&useradded=false&inv=false');


      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create new user
      const newUser = new User({
        email,
        password: hashedPassword
      });
      await newUser.save();
      // After successfully adding a new user
      res.redirect('/ls?userExists=false&useradded=true&inv=false');


      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Login endpoint
  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.redirect('/ls?userExists=false&useradded=false&inv=true');  }
      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.redirect('/ls?userExists=false&useradded=false&inv=false');  
      
      }
      res.send(`
      <script>
        alert('Login successful');
        window.location.href = '/';
      </script>
    `);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
// console.log("Listening on PORT 3000");