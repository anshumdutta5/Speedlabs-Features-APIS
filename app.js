const mysql = require("mysql2");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

require('dotenv').config()

app.use(bodyParser.urlencoded({
  extended: true
}));

//*************************************************************Setting Up Mysql Connection*************************************************************

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

  mysqlConnection.query("SELECT * FROM web_notification WHERE inst_hash=? ORDER BY notify_id DESC", id, function(err, rows) {
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


//******************************************************************Get Package Details**************************************************************

app.post("/Get_package_detail", function(req, res) {

  function NewRow(course_slug, course_name, course_start_date, course_duration, course_price) {
    this.course_slug = course_slug;
    this.course_name = course_name;
    this.course_start_date = course_start_date;
    this.course_duration = course_duration;
    this.course_price = course_price;
  }

  var newRows = [];
  var newRowsobj = {
    response: newRows,
    status: ""
  }
  var response = {};
  var id = req.body.id;
  var n = req.body.limit;


  mysqlConnection.query("SELECT * FROM web_course_package wcp INNER JOIN web_course wc ON wcp.course_id=wc.course_id WHERE inst_hash =? ORDER BY package_id DESC", id, function(err, rows) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      if (n == 0) {
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else if (rows.length > 0 && n > 0) {
        rows.every(function(row) {
          //console.log(row.course_price);
          var newRow = new NewRow(row.course_slug, row.course_name, row.course_start_date, row.course_duration, row.course_price);
          //console.log(newRow);
          newRows.push(newRow);
          n--;
          if (n === 0) {
            return false;
          } else {
            return true;
          }

        })
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else {
        newRowsobj.status = "failed";
        res.send(newRowsobj);
      }
    }


  })

});


//******************************************************************Get PDF***********************************************************************

app.post("/Get_pdf_new1", function(req, res) {

  function NewRow(title, sub_title, pdf_name, url) {
    this.title = title;
    this.sub_title = sub_title;
    this.pdf_name = pdf_name;
    this.url = url;
  }


  var newRows = [];
  var newRowsobj = {
    response: newRows,
    status: ""
  }
  var response = {};
  var id = req.body.id;
  var n = req.body.limit;


  mysqlConnection.query("SELECT * FROM web_downloads WHERE inst_hash=? ORDER BY pdf_id DESC", id, function(err, rows) {


    if (err) {
      console.log(err);
      res.send(err);
    } else {
      if (n == 0) {
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else if (rows.length > 0 && n > 0) {
        rows.every(function(row) {
          var url = "https://careerliftprod.s3.amazonaws.com/mcllearnoadminpdf/" + row.pdf_name;
          var newRow = new NewRow(row.title, row.sub_title, row.pdf_name, url);
          newRows.push(newRow);
          n--;
          if (n === 0) {
            return false;
          } else {
            return true;
          }
        })
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else {
        newRowsobj.status = "failed";
        res.send(newRowsobj);
      }
    }

  })

});


//*******************************************************************Get Slider*******************************************************************


app.post("/Get_slider", function(req, res) {
  function NewRow(img, text, url) {
    this.slider_image = img;
    this.slider_text = text;
    this.img_url = url;
  }

  var newRows = [];
  var newRowsobj = {
    response: newRows,
    status: ""
  }
  var response = {};
  var id = req.body.id;

  mysqlConnection.query("SELECT * FROM web_slider WHERE inst_hash=? ORDER BY slider_order_no ASC", id, function(err, rows) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      if (rows.length > 0) {
        rows.forEach(function(row) {
          var url = "https://careerliftprod.s3.amazonaws.com/mcllearnoadminslider/" + row.slider_image;
          var newRow = new NewRow(row.slider_image, row.slider_text, url);
          newRows.push(newRow);
        })
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else {
        newRowsobj.status = "failed"
        res.send(newRowsobj);
      }
    }

  })

});

//*******************************************************************Get Video************************************************************************

app.post("/Get_video1", function(req, res) {

  function NewRow(video_id, desc, video_title) {
    this.video_id = video_id;
    this.desc = desc;
    this.video_title = video_title;
  }

  var newRows = [];
  var newRowsobj = {
    response: newRows,
    status: ""
  }
  var response = {};
  var id = req.body.id;
  var n = req.body.limit;

  mysqlConnection.query("SELECT * FROM web_video WHERE inst_hash =? ORDER BY video_id DESC", id, function(err, rows) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      if (n == 0) {
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else if (rows.length > 0 && n > 0) {
        rows.every(function(row) {
          var newRow = new NewRow(row.video_id, row.video_description, row.video_title);
          newRows.push(newRow);
          n--;
          if (n === 0) {
            return false;
          } else {
            return true;
          }
        })
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else {
        newRowsobj.status = "failed";
        res.send(newRowsobj);
      }
    }

  })

});


//****************************************************************Get Faculty***********************************************************************


app.post("/Get_faculty", function(req, res) {

  function NewRow(faculty_name, faculty_image, faculty_detail, url) {
    this.faculty_name = faculty_name;
    this.faculty_image = faculty_image;
    this.faculty_detail = faculty_detail;
    this.url = url;
  }

  var newRows = [];
  var newRowsobj = {
    response: newRows,
    status: ""
  }
  var response = {};
  var id = req.body.id;
  var n = req.body.limit;

  mysqlConnection.query("SELECT * FROM web_faculty WHERE inst_hash =? ORDER BY faculty_id DESC", id, function(err, rows) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      if (n == 0) {
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else if (rows.length > 0 && n > 0) {
        rows.every(function(row) {
          var url = "https://careerliftprod.s3.amazonaws.com/mcllearnoadminfaculty/" + row.faculty_image;
          var newRow = new NewRow(row.faculty_name, row.faculty_image, row.faculty_detail, url);
          newRows.push(newRow);
          n--;
          if (n === 0) {
            return false;
          } else {
            return true;
          }
        })
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else {
        var obj = {
          faculty_name: "No faculty"
        }
        console.log(obj);
        var newRowsobj1 = {
          response: obj,
          status: "failed"
        }
        res.send(newRowsobj1);
      }
    }


  })

});


//******************************************************************Get Image**********************************************************************

app.post("/Get_image1", function(req, res) {

  function NewRow(image, image_title, url) {
    this.image = image;
    this.image_title = image_title;
    this.url = url;
  }

  var newRows = [];
  var newRowsobj = {
    response: newRows,
    status: ""
  }
  var response = {};
  var id = req.body.id;
  var n = req.body.limit;

  mysqlConnection.query("SELECT * FROM web_image WHERE inst_hash =? ORDER BY image_id DESC", id, function(err, rows) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      if (n == 0) {
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else if (rows.length > 0 && n > 0) {
        rows.every(function(row) {
          var url = "https://careerliftprod.s3.amazonaws.com/mcllearnoadminimage/" + row.image;
          var newRow = new NewRow(row.image, row.image_title, url);
          newRows.push(newRow);
          n--;
          if (n === 0) {
            return false;
          } else {
            return true;
          }
        })
        newRowsobj.status = "success";
        res.send(newRowsobj);
      } else {
        newRowsobj.status = "failed";
        res.send(newRowsobj);
      }
    }

  })

});




//***************************************************************Listening on PORT******************************************************************

app.listen(process.env.PORT, function() {
  console.log("Server started on port 3000");
})
