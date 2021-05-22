const mysql = require("mysql2");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

require('dotenv').config()

app.use(bodyParser.urlencoded({
  extended: true
}));


var mysqlConnection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});


mysqlConnection.connect(function(err) {
  if (!err) {
    console.log("DB connection succeded");
  } else {
    console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
  }
})





app.post("/", function(req, res) {

  var test={
    title:[],
    content:[]
  }
var id = req.body.id;
var response={};
var result={
  response:{},
  status:""
};

mysqlConnection.query("SELECT * FROM web_institute_detail WHERE inst_hash=?", id, function(err, rows){
  if(err){
    console.log(err);
  }else{
    if (rows.length > 0){
      var img="imgURL";
      rows.forEach(function(row){
        test.title.push(row.title);
        test.content.push(row.content);
      })

      response[img]="https://careerliftprod.s3.amazonaws.com/mcllearnoadminimage/";
      for( var i=0;i<test.title.length;i++){
        response[test.title[i]]=test.content[i];
      }
      result.response=response;
      result.status="Success";
      res.send(result);
  }

}
})
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
})
