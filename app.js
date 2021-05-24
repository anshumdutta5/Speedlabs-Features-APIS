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



//**********************************************************************Institute Details*************************************************************

app.post("/Get_institute_details", function(req, res) {

  var test = {
    title: [],
    content: []
  }
  var id = req.body.id;
  var response = {};
  var result = {
    response: {},
    status: ""
  };

  mysqlConnection.query("SELECT * FROM web_institute_detail WHERE inst_hash=?", id, function(err, rows) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      if (rows.length > 0) {
        var img = "imgURL";
        rows.forEach(function(row) {
          test.title.push(row.title);
          test.content.push(row.content);
        })

        response[img] = "https://careerliftprod.s3.amazonaws.com/mcllearnoadminimage/";
        for (var i = 0; i < test.title.length; i++) {
          response[test.title[i]] = test.content[i];
        }
        result.response = response;
        result.status = "Success";
        res.send(result);
      } else {
        result.status = "failed";
        res.send(result);
      }

    }
  })
});



//**********************************************************************Notifications*****************************************************************


app.post("/Get_notification1", function(req, res) {


  function NewRow(notify_id, notify_title, notify_description, date) {
    this.notify_id = notify_id;
    this.notify_title = notify_title;
    this.notify_description = notify_description;
    this.date = date;
  }

  var newRows = [];
  var newRowsobj = {
    response: newRows,
    status: ""
  }
  var data = [];
  var id = req.body.id;
  var date;

  mysqlConnection.query("SELECT * FROM web_notification WHERE inst_hash=?", id, function(err, rows) {
    if (!err) {
      //console.log(rows.length);
      if (rows.length > 0) {


        rows.forEach(function(row) {
          //console.log(row);

          if (row.notify_date_update === null || row.notify_date_update === "" || row.notify_date_update === '0000-00-00') {
            date = row.notify_date;
          } else {
            date = row.notify_date_update;
          }


          var newRow = new NewRow(row.notify_id, row.notify_title, row.notify_description, date);
          newRows.push(newRow);
          //res.send(newRow);
        })
        //console.log("Success");
        newRowsobj.status = "success"

        res.send(newRowsobj);
      } else {
        newRowsobj.status = "failed"
        res.send(newRowsobj);
      }

    } else {
      console.log(err);
      res.send(err);
      //res.send(newRow);
    }

  })
});





app.listen(process.env.PORT, function() {
  console.log("Server started on port 3000");
})
