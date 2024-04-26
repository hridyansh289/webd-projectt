app.post("/faq",(req,res)=>{
  var question=req.body.question;
 
  // Check if user with the same email or phone number already exists
  var data = {
      "question":question,
  }

  db.collection('faq').insertOne(data,(err,collection)=>{
      if(err){
          // Handle database insertion error
          console.error("Error inserting user:", err);
          return res.status(500).send("Internal Server Error");
      }
      console.log("Record Inserted Successfully");
      return res.render('index');
  });
});