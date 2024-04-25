var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")

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

app.post("/sumbit-order",(req,res)=>{
    var shirt=req.body.shirt;
   var pants=req.body.pants;
   var suit=req.body.suit;
   var socks=req.body.socks;
   var saree=req.body.saree;
   var jacket=req.body.jacket;
   var other=req.body.other;
   var special_instructions=req.body.special_instructions;

    // Check if user with the same email or phone number already exists
    var data = {
        "shirts":shirt,
        "pants":pants,
        "suits":suit,
        "sarees":saree,
        "jackets":jacket,
        "others":other,
        "socks":socks,
        "name":special_instructions,
    }

    db.collection('order').insertOne(data,(err,collection)=>{
        if(err){
            // Handle database insertion error
            console.error("Error inserting user:", err);
            return res.status(500).send("Internal Server Error");
        }
        console.log("Record Inserted Successfully");
        return res.redirect('profile.ejs');
    });
});



app.post("/sign_up",(req,res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var phno = req.body.phno;
    var password = req.body.password;

    // Check if user with the same email or phone number already exists
    db.collection('users').findOne({ $or: [ { email: email }, { phno: phno } ] }, (err, user) => {
        if (err) {
            // Handle database error
            console.error("Error checking user existence:", err);
            return res.status(500).send("Internal Server Error");
        }

        if (user) {
            // User already exists
            console.log("User already exists");
             res.send("<script>alert('User already exists'); </script>");
             return res.redirect("/profile.ejs");
        } else {
            // User doesn't exist, insert into database
            var data = {
                "name": name,
                "email" : email,
                "phno": phno,
                "password" : password
            }

            db.collection('users').insertOne(data,(err,collection)=>{
                if(err){
                    // Handle database insertion error
                    console.error("Error inserting user:", err);
                    return res.status(500).send("Internal Server Error");
                }
                console.log("Record Inserted Successfully");
                return res.redirect('profile.ejs');
            });
        }
    });
});
app.post("/profilee",(req,res)=>{res.render("public\profile.ejs");});
app.post("/login",(req,res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var phno = req.body.phno;
    var password = req.body.password;

    // Check if user with the same email or phone number already exists
    db.collection('users').findOne({ $and: [ { email: email }, { phno: phno },{name:name},{password:password} ] }, (err, user) => {
        if (err) {
            // Handle database error
            console.error("Error checking user existence:", err);
            return res.status(500).send("Internal Server Error");
        }

        if (user) {
            // User already exists
            console.log("logged in");
            app.get('/', (req, res) => {
                // Render the index.ejs file in the views directory
                res.render(__dirname+"/profile.ejs", {name:name});
            });
        } else {
            res.send("<script>alert('Wrong details');</script>");
            returnres.redirect("/profile.ejs");
        }
        
    });
});

app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('index.html');
}).listen(3000);


console.log("Listening on PORT 3000");