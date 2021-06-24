//------------------------------------------New Code-----------------------------------------

//jshint esversion:6
const mysql = require("mysql2");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
const moment = require('moment');
const dateFormat = require("dateformat");
const nodemailer = require('nodemailer');
const multer = require('multer');
const upload = multer({
  dest: 'uploads/'
});
const md5 = require('md5');
app.use(cors());
require('dotenv').config();

app.use(bodyParser.urlencoded({
  extended: true
}));
const key = "25f9e794323b453885f5181f1b624d0b";

//*************************************************************Setting Up Mysql Connection*************************************************************

const pool = mysql.createPool({
  host: '162.214.80.49',
  user: 'qjzcohmy_vasudha',
  password: 'NO*2mJ=fEx2I',
  database: 'qjzcohmy_educms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


//ROUTES..............................

app.get("/", function(req, res) {

  console.log("Get Request success");
  res.send("Get Request success");
});

//*********************************Dynamic Button************************************************


app.post("/Get_dynamic_button",function(req,res){
  var id = req.body.id;
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)){
    pool.getConnection(function(err,conn){
      if(err){
        console.log(err);
        res.send(err);
      }else{
        conn.query("SELECT * FROM web_institute_detail WHERE inst_hash=?", id, function(err, rows){
          if(err){
            console.log(err);
            res.send(err)
          }else{
            var x="";
            if (rows.length > 0) {
              rows.forEach(function(row) {
                if(row.title === "dynamic_tab_name")
                x = row.content;
              })
          }
          if(x===""){
            var result = {
              response: "This institute does not have dynamic button",
              status: "failed"
            };
            res.send(result);
          }else{
            conn.query("SELECT title,url FROM dynamic_menu_bar WHERE dynamic_tab_name=?",x,function(err,rows){
              if(err){
                console.log(err);
                res.send(err);
              }else{

                var obj = {
                  tab_name:x
                }
                // rows.unshift(obj);
                var result = {
                  tab_name:x,
                  response: rows,
                  status: "success"
                };
                res.send(result);
              }
            })
          }
        }
      })
        pool.releaseConnection(conn);
      }
    })
  }else{
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }
})


//*********************************Students Achievements************************************************


app.post("/Get_students_achievements", function(req, res) {


  function NewRow(image, name, class_, marks, session, note_student) {
    this.image = image;
    this.name = name;
    this.class = class_;
    this.marks = marks;
    this.session = session;
    this.note_student = note_student;
  }

  var newRows = [];

  var newRowsobj = {
    response: newRows,
    status: ""
  }

  var data = [];

  var id = req.body.id;
  var date;


  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    pool.getConnection(function(err, conn) {
      if (err) {
        console.log(err);
      } else {
        //console.log("DB success");
        conn.query("SELECT * FROM achievement WHERE inst_hash=? ", id, function(err, rows) {
          if (!err) {
            //console.log(rows.length);
            if (rows.length > 0) {


              rows.forEach(function(row) {
                //console.log(row);
                var newRow = new NewRow(row.image, row.name, row.class, row.marks, row.session, row.note_student);
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
            //res.send(newRow);
          }
        });

        pool.releaseConnection(conn);
      }

    })
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});

//**************************************faq*******************************

app.post("/Get_Faq", function(req, res) {


  function NewRow(ques, ans, category, image) {
    this.category = category;
    this.Question = ques;
    this.Answer = ans;
    this.image = image;
  }

  var newRows = [];

  var newRowsobj = {
    response: newRows,
    status: ""
  }

  var data = [];

  var id = req.body.id;
  var date;


  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    pool.getConnection(function(err, conn) {
      if (err) {
        console.log(err);
      } else {
        //console.log("DB success");
        conn.query("SELECT * FROM faq WHERE inst_hash=? ORDER BY sequence_no DESC", id, function(err, rows) {
          if (!err) {
            //console.log(rows.length);
            if (rows.length > 0) {


              rows.forEach(function(row) {
                //console.log(row);
                var newRow = new NewRow(row.category, row.Question, row.Answer, row.image);
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
            //res.send(newRow);
          }
        });

        pool.releaseConnection(conn);
      }

    })
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});

//******************************************feedback**************************************

app.post("/Feedback", function(req, res) {

  var newRowsobj = {
    status: ""
  }

  var flag_sql = 0;
  var flag_mail = 0;
  var id = req.body.id;
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var query_type = req.body.query_type;
  var message = req.body.message;
  var clientMail = req.body.clientMail;
  var clientName = req.body.clientName;
  // var clientPass = 'welcome$1234';
  // var clientMailFrom = 'newleadsmails@gmail.com';
  var clientPass = 'saket@123';
  var clientMailFrom = 'anshumdutta5@gmail.com';
  var clientPort = 465;
  var clientSmtp = 'smtp.gmail.com';

  var insertQuery = "INSERT INTO feedback (inst_hash,name,email,phone,query_type,message) VALUES ?";

  var obj = {
    inst_hash: id,
    Name: name,
    email: email,
    Phone: phone,
    query_type: query_type,
    message: message
  }
  var values = Object.values(obj);
  pool.getConnection(function(err, conn) {
    if (err) {
      console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
    } else {
      conn.query(insertQuery, [
        [values]
      ], function(err) {
        if (err) {
          console.log(err);
          flag_sql = 1;
          //res.send(`{"flag":0}`);
        } else {
          flag_sql = 0;
          //res.send(`{"flag":1}`);
        }
      });
      pool.releaseConnection(conn);
    }

  })

  var useSmtp = clientSmtp ? clientSmtp : 'smtp.gmail.com';
  var usePort = clientPort ? clientPort : 465;

  var message =
    "Full Name: " + name + "<br /> <br />" +
    "Email: " + email + "<br /> <br />" +
    "Phone: " + phone + "<br /> <br />" +
    "Query Type: " + query_type + "<br /> <br />" +
    "Message: " + message + "<br /> <br />";



  const mailData = {
    from: clientMailFrom, // sender address
    to: clientMail, // list of receivers
    subject: "New Feedback",
    html: message
  };
  const transporter = nodemailer.createTransport({
    port: usePort, // true for 465, false for other ports
    host: useSmtp,
    auth: {
      user: clientMailFrom,
      pass: clientPass,
    },
    secure: true,
  });
  transporter.sendMail(mailData, function(err, info) {
    if (err) {
      console.log(err);
      flag_mail = 1;
      //res.send(`{"message":"Sending Failed!"}`);
    } else {
      console.log("Success");
      flag_mail = 0;
      //res.send(`{"message":"Successfully Sent!"}`);
    }
  });

  if (flag_sql === 0 && flag_mail === 0) {
    newRowsobj.status = "success";
  } else if (flag_sql === 1 && flag_mail === 0) {
    newRowsobj.status = "Mail sent but did not store in sql";
  } else if (flag_sql === 0 && flag_mail === 1) {
    newRowsobj.status = "Mail not sent but stored in sql";
  } else {
    newRowsobj.status = "Mail not sent and did not store in sql";
  }
  res.send(newRowsobj);
});

//*************************************Image popup*************************************

app.post("/Get_image_popup", function(req, res) {


  function NewRow(title, content, image, image_default, url, expiry_date) {
    this.title = title;
    this.content = content;
    this.image = image;
    this.image_default = image_default
    this.url = url;
    this.expiry_date = expiry_date;
  }

  var newRows = [];

  var newRowsobj = {
    response: newRows,
    status: ""
  }

  var data = [];

  var id = req.body.id;
  var date;

  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log(err);
      } else {
        //console.log("DB success");
        conn.query("SELECT * FROM image_popup WHERE inst_hash=?", id, function(err, rows) {
          if (!err) {
            //console.log(rows.length);
            if (rows.length > 0) {


              rows.forEach(function(row) {
                //console.log(row);
                var d = new Date(row.expiry_date);
                var day = moment(d).format();
                var newRow = new NewRow(row.title, row.content, row.image, row.image_default, day.toString().slice(0, 10));
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
            //res.send(newRow);
          }
        });

        pool.releaseConnection(conn);
      }

    })
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});



//___________________________________ GET_ALERT___________________________________
app.post("/get_alert1", function(req, res) {
  var inst_id = req.body.id;
  var randomLimit = req.body.limit;
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var sql = `SELECT * from web_alert WHERE inst_hash="` + inst_id + `" LIMIT ` + randomLimit + ` OFFSET 0`;

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            if (result.length === 0) {
              var errRes = `{"response":{"message":"No alert"},"status":"failed"}`;
              res.send(errRes);
            } else {
              var resultarray = [];
              result.forEach(function(item) {
                var obj = {
                  message: item.alert,
                  link: item.link
                };
                resultarray.push(obj);
              });
              var resobj = {
                response: resultarray,
                status: "success"
              };
              res.send(JSON.stringify(resobj));
            }
          }
        });
        pool.releaseConnection(conn);
      }

    });

  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }


});
//___________________________________ GET_BASIC_QUESTION___________________________________

app.post("/get_basic_question", function(req, res) {
  var inst_id = req.body.id;
  var instKey = req.body.key;
  if (key === instKey) {
    var sql = `SELECT ques_hash,question,opt_1,opt_2,opt_3,opt_4,correct_opt from web_basic_question WHERE inst_hash="` + inst_id + `"ORDER BY id ASC LIMIT 10 OFFSET 0`;
    console.log(sql);

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            if (result.length === 0) {
              var errRes = `{"response":{"basic_ques":"No Question"},"status":"failed"}`;
              res.send(errRes);
            } else {
              var resobj = {
                response: result,
                status: "success"
              };
              res.send(JSON.stringify(resobj));
            }
          }
        });
        pool.releaseConnection(conn);
      }

    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }
});


//___________________________________ GET_BATCH___________________________________
app.post("/get_batch", function(req, res) {
  var inst_id = req.body.id;
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var sql = `SELECT batch_name,batch_timing,batch_subject from batch_master WHERE inst_hash="` + inst_id + `"`;


    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            if (result.length === 0) {
              var errRes = `{"response":{"message":"No Batch"},"status":"failed"}`;
              res.send(errRes);
            } else {
              var resobj = {
                response: result,
                status: "success"
              };
              res.send(JSON.stringify(resobj));
            }
          }
        });
        pool.releaseConnection(conn);
      }

    })

  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }


});




//___________________________________ GET_BLOGS___________________________________
app.post("/get_blogs", function(req, res) {
  var inst_id = req.body.id;
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var sql = `SELECT blog_id,user_first_name,user_last_name,post_image,post_title,post_description from web_institute_blogs WHERE inst_hash="` + inst_id + `"ORDER BY blog_id DESC`;
    //console.log(sql);

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            var test = {
              title: [],
              content: []
            }
            var response = {};
            var x = "blog_img";
            conn.query("SELECT * FROM default_table WHERE section=?", x, function(err1, rows1) {
              if (err1) {
                console.log(err1);
                res.send(err1);
              } else {
                if (result.length === 0) {
                  var errRes = `{"response":{"basic_ques":"No Question"},"status":"failed"}`;
                  res.send(errRes);
                } else {
                  if (rows1.length > 0) {
                    var i = 1;
                    rows1.forEach(function(row) {
                      test.title.push("default_img" + i++);
                      test.content.push(row.image);
                    })
                  }
                  for (var i = 0; i < test.title.length; i++) {
                    response[test.title[i]] = test.content[i];
                  }
                  var resobj = {
                    response: result,
                    default_img: response,
                    status: "success"
                  };
                  res.send(JSON.stringify(resobj));
                }


              }
            })

          }
        });
        pool.releaseConnection(conn);
      }

    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }
});

//___________________________________ GET_CORE_FEATURES___________________________________
app.post("/get_core_features", function(req, res) {
  var inst_id = req.body.id;
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var sql = `SELECT core_feature1_heading,core_feature1_icon,core_feature1_detail,core_feature2_heading,core_feature2_icon,core_feature2_detail,core_feature3_heading,core_feature3_icon,core_feature3_detail,core_feature4_heading,core_feature4_icon,core_feature4_detail from web_institute_config WHERE inst_hash="` + inst_id + `"`;
    console.log(sql);

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            if (result.length === 0) {
              var errRes = `{"response":{"feature1_icon":"","feature1_title":"","feature1_detail":"","feature2_icon":"","feature2_title":"","feature2_detail":"","feature3_icon":"","feature3_title":"","feature3_detail":"","feature4_icon":"","feature4_title":"","feature4_detail":""},"status":"failed"}`;
              res.send(errRes);
            } else {
              var resultarray = [];
              result.forEach(function(item) {
                var obj = {
                  feature1_icon: item.core_feature1_icon,
                  feature1_title: item.core_feature1_heading,
                  feature1_detail: item.core_feature1_detail,
                  feature2_icon: item.core_feature2_icon,
                  feature2_title: item.core_feature2_heading,
                  feature2_detail: item.core_feature2_detail,
                  feature3_icon: item.core_feature3_icon,
                  feature3_title: item.core_feature3_heading,
                  feature3_detail: item.core_feature3_detail,
                  feature4_icon: item.core_feature4_icon,
                  feature4_title: item.core_feature4_heading,
                  feature4_detail: item.core_feature4_detail
                };
                resultarray.push(obj);
              });
              var resobj = {
                response: resultarray,
                status: "success"
              };
              res.send(JSON.stringify(resobj));
            }
          }
        });
        pool.releaseConnection(conn);
      }

    });

  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});





//___________________________________ GET_TESTIMONIALS___________________________________
app.post("/get_testimonial1", function(req, res) {
  var inst_id = req.body.id;
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var sql = `SELECT first_name,last_name,image_url,description,video_url,title from web_testimonial WHERE inst_hash="` + inst_id + `"ORDER BY testm_id DESC LIMIT 10 OFFSET 0`;
    //console.log(sql);

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            if (result.length === 0) {
              var errRes = `{"response":{"img_url":""},"status":"failed"}`;
              res.send(errRes);
            } else {
              var resultarray = [];
              result.forEach(function(item) {
                var obj = {
                  img_url: item.image_url,
                  fname: item.first_name,
                  lname: item.last_name,
                  title: item.title,
                  desc: item.description
                };
                resultarray.push(obj);
              });
              var resobj = {
                response: resultarray,
                status: "success"
              };
              res.send(JSON.stringify(resobj));
            }
          }
        });
        pool.releaseConnection(conn);
      }
    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});


//___________________________________ GET_COURSE_DETAILS____________________________________
app.post("/get_course_detail", function(req, res) {
  var inst_id = req.body.id;
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var sql = `SELECT course_name,course_slug,course_detail,course_key_benefits,course_eligibility,course_overview from web_course WHERE inst_hash="` + inst_id + `"ORDER BY course_id ASC`;


    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            var test = {
              title: [],
              content: []
            }
            var response = {};
            var x = "course_img";
            conn.query("SELECT * FROM default_table WHERE section=?", x, function(err1, rows1) {
              if (err1) {
                console.log(err1);
                res.send(err1);
              } else {
                if (result.length === 0) {
                  var errRes = `{"response":{"course_name":"","course_slug":"","course_detail":"","course_key_benefits":"","course_eligibility":"","course_overview":""},"status":"failed"}`;
                  res.send(errRes);
                } else {
                  if (rows1.length > 0) {
                    var i = 1;
                    rows1.forEach(function(row) {
                      test.title.push("default_img" + i++);
                      test.content.push(row.image);
                    })
                  }
                  for (var i = 0; i < test.title.length; i++) {
                    response[test.title[i]] = test.content[i];
                  }
                  var resobj = {
                    response: result,
                    default_img: response,
                    status: "success"
                  };
                  res.send(JSON.stringify(resobj));
                }
              }
            })

          }
        });
        pool.releaseConnection(conn);
      }
    });

  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});



//___________________________________ course_detail_by_id___________________________________
app.post("/get_course_detail/course_detail_by_id", function(req, res) {
  var inst_id = req.body.id;
  var inst_slug = req.body.slug;
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var sql = `SELECT course_id,course_name,course_slug,course_detail,course_key_benefits,course_eligibility,course_overview from web_course WHERE inst_hash="` + inst_id + `" AND course_slug="` + inst_slug + `"`;

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            var test = {
              title: [],
              content: []
            }
            var response = {};
            x = "course_img";
            conn.query("SELECT * FROM default_table WHERE section=?", x, function(err1, rows1) {
              if (err1) {
                console.log(err1);
                res.send(err1);
              } else {
                if (result.length === 0) {
                  var errRes = `{"response":{"course_id":"","course_name":"","course_slug":"","course_detail":"","course_key_benefits":"","course_eligibility":"","course_overview":""},"status":"failed"}`;
                  res.send(errRes);
                } else {
                  if (rows1.length > 0) {
                    var i = 1;
                    rows1.forEach(function(row) {
                      test.title.push("default_img" + i++);
                      test.content.push(row.image);
                    })
                  }
                  for (var i = 0; i < test.title.length; i++) {
                    response[test.title[i]] = test.content[i];
                  }
                  var resobj = {
                    response: result,
                    default_img: response,
                    status: "success"
                  };
                  res.send(JSON.stringify(resobj));
                }
              }
            })

          }
        });
        pool.releaseConnection(conn);
      }
    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});
//___________________________________top_courses___________________________________
app.post("/get_course_detail/top_courses", function(req, res) {
  var inst_id = req.body.id;
  var limit = req.body.limit;
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var sql = `SELECT course_name,course_slug,course_detail from web_course WHERE inst_hash="` + inst_id + `" AND is_top_course=1 ORDER BY course_id ASC LIMIT ` + limit;

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            var test = {
              title: [],
              content: []
            }
            var response = {};
            var x = "course_img";
            conn.query("SELECT * FROM default_table WHERE section=?", x, function(err1, rows1) {
              if (err1) {
                console.log(err1);
                res.send(err1);
              } else {
                if (result.length === 0) {
                  var errRes = `{"response":{"course_name":"","course_slug":""},"status":"failed"}`;
                  res.send(errRes);
                } else {
                  if (rows1.length > 0) {
                    var i = 1;
                    rows1.forEach(function(row) {
                      test.title.push("default_img" + i++);
                      test.content.push(row.image);
                    })
                  }
                  for (var i = 0; i < test.title.length; i++) {
                    response[test.title[i]] = test.content[i];
                  }
                  var resobj = {
                    response: result,
                    default_img: response,
                    status: "success"
                  };
                  res.send(JSON.stringify(resobj));
                }
              }
            })

          }
        });
        pool.releaseConnection(conn);
      }
    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});

//___________________________________CONTACT_FRANCHISE___________________________________
app.post("/Contact_franchise", function(req, res) {
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var fname = req.body.name_franchise;
    var lname = req.body.dlastname_franchise;
    var dob = req.body.dob_franchise;
    var email = req.body.email_franchise;
    var contct1 = req.body.phone1_franchise;
    var contct2 = req.body.phone2_franchise;
    var quali = req.body.qualification_contact;
    var status = req.body.status_contact;
    var location = req.body.location_contact;
    var investment = req.body.investment_contact;
    var enquiry = req.body.enquiry_contact;
    var clientMail = req.body.clientMail;
    var clientName = req.body.clientName;
    var clientPass = 'welcome$1234';
    var clientMailFrom = 'newleadsmails@gmail.com';
    var clientPort = 465;
    var clientSmtp = 'smtp.gmail.com';

    var useSmtp = clientSmtp ? clientSmtp : 'smtp.gmail.com';
    var usePort = clientPort ? clientPort : 465;

    var message =
      "Full Name: " + fname + " " + lname + "<br /> <br />" +
      "Date of Birth: " + dob + "<br /> <br />" +
      "Email: " + email + "<br /> <br />" +
      "Phone1: " + contct1 + "<br /> <br />" +
      "Phone2: " + contct2 + "<br /> <br />" +
      "Qualification: " + quali + "<br /> <br />" +
      "status: " + status + "<br /> <br />" +
      "location: " + location + "<br /> <br />" +
      "investment: " + investment + "<br /> <br />" +
      "Message: " + enquiry + "<br /> <br />";


    const mailData = {
      from: clientMailFrom, // sender address
      to: clientMail, // list of receivers
      subject: "New Franchise Enquiry",
      text: 'That was easy!',
      html: message
    };
    const transporter = nodemailer.createTransport({
      port: usePort, // true for 465, false for other ports
      host: useSmtp,
      auth: {
        user: clientMailFrom,
        pass: clientPass,
      },
      secure: true,
    });
    transporter.sendMail(mailData, function(err, info) {
      if (err) {
        console.log(err);
        res.send(`{"message":"Sending Failed!"}`);
      } else {
        res.send(`{"message":"Successfully Sent!"}`);
      }
    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});
//___________________________________CONTACT_US_NEW___________________________________
app.post("/contact_us_new", function(req, res) {
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var data = req.body;
    var obj = {
      inst_hash: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      mobile_no: data.contact_no,
      message: data.your_query
    };
    var keys = Object.keys(obj);
    var values = Object.values(obj);
    const today = new Date().toISOString().slice(0, 10);
    values.push("no");
    values.push(today);
    var insertQuery = "INSERT INTO web_enquiry (inst_hash,first_name,last_name,email,mobile_no,message,replied,enquiry_date) VALUES ?";


    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(insertQuery, [
          [values]
        ], function(err) {
          if (err) {
            res.send(`{"flag":0}`);
          } else {
            res.send(`{"flag":1}`);
          }
        });
        pool.releaseConnection(conn);
      }

    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }
});

//___________________________________CAREER_FORM___________________________________
app.post("/careerform", upload.single('file'), function(req, res) {
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    console.log(req.file);
    var fname = req.body.career_fname;
    var lname = req.body.career_lname;
    var dob = req.body.career_dob;
    var email = req.body.career_email;
    var phone1 = req.body.career_phone1;
    var phone2 = req.body.career_phone2;
    var education = req.body.career_qualification;
    var status = req.body.career_status;
    var location = req.body.career_location;
    var clientMail = req.body.clientMail;
    var clientName = req.body.clientName;

    var clientPass = 'welcome$1234';
    var clientMailFrom = 'newleadsmails@gmail.com';
    var clientPort = 465;
    var clientSmtp = 'smtp.gmail.com';

    var useSmtp = clientSmtp ? clientSmtp : 'smtp.gmail.com';
    var usePort = clientPort ? clientPort : 465;

    var message =
      "Full Name: " + fname + " " + lname + "<br /> <br />" +
      "Email: " + email + "<br /> <br />" +
      "Date of Birth: " + dob + "<br /> <br />" +
      "Phone1: " + phone1 + "<br /> <br />" +
      "Phone2: " + phone2 + "<br /> <br />" +
      "Education: " + education + "<br /> <br />" +
      "Current profile status: " + status + "<br /> <br />" +
      "location: " + location + "<br /> <br />";

    const mailData = {
      from: clientMailFrom, // sender address
      to: clientMail, // list of receivers
      subject: "New Career form submission",
      text: 'That was easy!',
      html: message,
      attachments: [{
        filename: req.file.originalname,
        path: req.file.path
      }]
    };
    const transporter = nodemailer.createTransport({
      port: usePort, // true for 465, false for other ports
      host: useSmtp,
      auth: {
        user: clientMailFrom,
        pass: clientPass,
      },
      secure: true,
    });
    transporter.sendMail(mailData, function(err, info) {
      if (err) {
        console.log(err);
        res.send(`{"message":"Sending Failed!"}`);
      } else {
        res.send(`{"message":"Successfully Sent!"}`);
      }
    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});
//**************************************************************Web Domain Details*******************************************************************


app.post("/web_hash", function(req, res) {

  function NewRow(inst_hash, domain_expiry_date) {
    this.inst_hash = inst_hash;
    this.expiry_date = domain_expiry_date;
  }
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var newRows = [];
    var newRowsobj = {
      response: newRows,
      status: ""
    };
    var response = {};
    var name = req.body.domain_name;

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query("SELECT * FROM web_domain_details WHERE domain_name=?", name, function(err, rows) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            if (rows.length > 0) {
              rows.forEach(function(row) {
                var d = new Date(row.domain_expiry_date);
                var day = moment(d).format();

                var newRow = new NewRow(row.inst_hash, day.toString().slice(0, 10));
                newRows.push(newRow);
              });
              newRowsobj.status = "success";
              res.send(newRowsobj);
            } else {
              newRowsobj.status = "failed";
              res.send(newRowsobj);
            }
          }

        });
        pool.releaseConnection(conn);
      }

    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }
});




//**********************************************************************Institute Details*************************************************************

app.post("/Get_institute_details", function(req, res) {
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {

  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

  var test = {
    title: [],
    content: []
  };
  var id = req.body.id;
  var response = {};
  var result = {
    response: {},
    status: ""
  };
  var x = "about_img";
  pool.getConnection(function(err, conn) {
    if (err) {
      console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
    } else {
      conn.query("SELECT * FROM web_institute_detail WHERE inst_hash=?", id, function(err, rows) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          conn.query("SELECT * FROM default_table WHERE section=?", x, function(err1, rows1) {
            if (err1) {
              console.log(err1);
              res.send(err1);
            } else {
              if (rows.length > 0) {
                var img = "imgURL";
                rows.forEach(function(row) {
                  test.title.push(row.title);
                  test.content.push(row.content);
                });
                if (rows1.length > 0) {
                  var i = 1;
                  rows1.forEach(function(row) {
                    test.title.push("default_img" + i++);
                    test.content.push(row.image);
                  })
                }
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


        }
      });
      pool.releaseConnection(conn);
    }

  });


});



//**********************************************************************Notifications*****************************************************************


app.post("/Get_notification1", function(req, res) {


  function NewRow(notify_id, notify_title, notify_description, date) {
    this.notify_id = notify_id;
    this.notify_title = notify_title;
    this.notify_description = notify_description;
    this.date = date;
  }
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var newRows = [];
    var newRowsobj = {
      response: newRows,
      status: ""
    };
    var data = [];
    var id = req.body.id;
    var date;

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query("SELECT * FROM web_notification WHERE inst_hash=? ORDER BY notify_id DESC", id, function(err, rows) {
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
              });
              //console.log("Success");
              newRowsobj.status = "success";

              res.send(newRowsobj);
            } else {
              newRowsobj.status = "failed";
              res.send(newRowsobj);
            }

          } else {
            console.log(err);
            res.send(err);
            //res.send(newRow);
          }

        });
        pool.releaseConnection(conn);
      }

    })
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }



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
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {

    var newRows = [];
    var test = {
      title: [],
      content: []
    }
    var response = {};
    var newRowsobj = {
      response: newRows,
      default_img: response,
      status: ""
    }
    var id = req.body.id;
    var n = req.body.limit;
    var x = "course_img";
    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query("SELECT * FROM web_course_package wcp INNER JOIN web_course wc ON wcp.course_id=wc.course_id WHERE inst_hash =? ORDER BY package_id DESC", id, function(err, rows) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            conn.query("SELECT * FROM default_table WHERE section=?", x, function(err1, rows1) {
              if (err1) {
                console.log(err1);
                res.send(err1);
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

                  });
                  if (rows1.length > 0) {
                    var i = 1;
                    rows1.forEach(function(row) {
                      test.title.push("default_img" + i++);
                      test.content.push(row.image);
                    })
                  }
                  for (var i = 0; i < test.title.length; i++) {
                    response[test.title[i]] = test.content[i];
                  }
                  newRowsobj.default_img = response;
                  newRowsobj.status = "success";
                  res.send(newRowsobj);
                } else {
                  newRowsobj.status = "failed";
                  res.send(newRowsobj);
                }
              }
            })

          }


        });
        pool.releaseConnection(conn);
      }

    })
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }
});


//******************************************************************Get PDF***********************************************************************

app.post("/Get_pdf_new1", function(req, res) {

  function NewRow(title, sub_title, pdf_name, url) {
    this.title = title;
    this.sub_title = sub_title;
    this.pdf_name = pdf_name;
    this.url = url;
  }

  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var newRows = [];
    var newRowsobj = {
      response: newRows,
      status: ""
    };
    var response = {};
    var id = req.body.id;
    var n = req.body.limit;

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query("SELECT * FROM web_downloads WHERE inst_hash=? ORDER BY pdf_id DESC", id, function(err, rows) {


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
              });
              newRowsobj.status = "success";
              res.send(newRowsobj);
            } else {
              newRowsobj.status = "failed";
              res.send(newRowsobj);
            }
          }

        });
        pool.releaseConnection(conn);
      }

    })
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }




});


//*******************************************************************Get Slider*******************************************************************



app.post("/Get_slider", function(req, res) {
  function NewRow(img, text, url) {
    this.slider_image = img;
    this.slider_text = text;
    this.img_url = url;
  }
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var newRows = [];
    var test = {
      title: [],
      content: []
    }
    var response = {};
    var newRowsobj = {
      response: newRows,
      default_img: response,
      status: ""
    }
    var id = req.body.id;
    var x = "home_img";
    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query("SELECT * FROM web_slider WHERE inst_hash=? ORDER BY slider_order_no ASC", id, function(err, rows) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            conn.query("SELECT * FROM default_table WHERE section=?", x, function(err1, rows1) {
              if (err1) {
                console.log(err1);
                res.send(err1);
              } else {
                if (rows.length > 0) {
                  rows.forEach(function(row) {
                    var url = "https://careerliftprod.s3.amazonaws.com/mcllearnoadminslider/" + row.slider_image;
                    var newRow = new NewRow(row.slider_image, row.slider_text, url);
                    newRows.push(newRow);
                  });
                  if (rows1.length > 0) {
                    var i = 1;
                    rows1.forEach(function(row) {
                      test.title.push("default_img" + i++);
                      test.content.push(row.image);
                    })
                  }
                  for (var i = 0; i < test.title.length; i++) {
                    response[test.title[i]] = test.content[i];
                  }
                  newRowsobj.default_img = response;
                  newRowsobj.status = "success";
                  res.send(newRowsobj);
                } else {
                  newRowsobj.status = "failed";
                  res.send(newRowsobj);
                }
              }
            })

          }

        });
        pool.releaseConnection(conn);
      }

    })

  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }




});
//*******************************************************************Get Video************************************************************************

app.post("/Get_video1", function(req, res) {

  function NewRow(video_id, desc, video_title) {
    this.video_id = video_id;
    this.desc = desc;
    this.video_title = video_title;
  }
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var newRows = [];
    var newRowsobj = {
      response: newRows,
      status: ""
    };
    var response = {};
    var id = req.body.id;
    var n = req.body.limit;

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query("SELECT * FROM web_video WHERE inst_hash =? ORDER BY video_id DESC", id, function(err, rows) {
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
              });
              newRowsobj.status = "success";
              res.send(newRowsobj);
            } else {
              newRowsobj.status = "failed";
              res.send(newRowsobj);
            }
          }

        });
        pool.releaseConnection(conn);
      }

    })
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }




});


//****************************************************************Get Faculty***********************************************************************


app.post("/Get_faculty", function(req, res) {

  function NewRow(faculty_name, faculty_image, faculty_detail, url) {
    this.faculty_name = faculty_name;
    this.faculty_image = faculty_image;
    this.faculty_detail = faculty_detail;
    this.url = url;
  }
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var newRows = [];
    var test = {
      title: [],
      content: []
    }
    var response = {};
    var newRowsobj = {
      response: newRows,
      default_img: response,
      status: ""
    }
    var x = "instructor_img";
    var id = req.body.id;
    var n = req.body.limit;

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query("SELECT * FROM web_faculty WHERE inst_hash =? ORDER BY faculty_id DESC", id, function(err, rows) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            conn.query("SELECT * FROM default_table WHERE section=?", x, function(err1, rows1) {
              if (err1) {
                console.log(err1);
                res.send(err1);
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
                  });
                  if (rows1.length > 0) {
                    var i = 1;
                    rows1.forEach(function(row) {
                      test.title.push("default_img" + i++);
                      test.content.push(row.image);
                    })
                  }
                  for (var i = 0; i < test.title.length; i++) {
                    response[test.title[i]] = test.content[i];
                  }
                  newRowsobj.default_img = response;
                  newRowsobj.status = "success";
                  res.send(newRowsobj);
                } else {
                  var obj = {
                    faculty_name: "No faculty"
                  };
                  console.log(obj);
                  var newRowsobj1 = {
                    response: obj,
                    status: "failed"
                  };
                  res.send(newRowsobj1);
                }
              }
            })

          }


        });
        pool.releaseConnection(conn);
      }

    })
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }





});


//******************************************************************Get Image**********************************************************************

app.post("/Get_image1", function(req, res) {

  function NewRow(image, image_title, url) {
    this.image = image;
    this.image_title = image_title;
    this.url = url;
  }
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var newRows = [];
    var test = {
      title: [],
      content: []
    }
    var response = {};
    var newRowsobj = {
      response: newRows,
      default_img: response,
      status: ""
    }
    var id = req.body.id;
    var n = req.body.limit;
    var x = "gallery_img";
    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query("SELECT * FROM web_image WHERE inst_hash =? ORDER BY image_id DESC", id, function(err, rows) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            conn.query("SELECT * FROM default_table WHERE section=?", x, function(err1, rows1) {
              if (err1) {
                console.log(err1);
                res.send(err1);
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
                  });
                  if (rows1.length > 0) {
                    var i = 1;
                    rows1.forEach(function(row) {
                      test.title.push("default_img" + i++);
                      test.content.push(row.image);
                    })
                  }
                  for (var i = 0; i < test.title.length; i++) {
                    response[test.title[i]] = test.content[i];
                  }
                  newRowsobj.default_img = response;
                  newRowsobj.status = "success";
                  res.send(newRowsobj);
                } else {
                  newRowsobj.status = "failed";
                  res.send(newRowsobj);
                }
              }
            })

          }

        });
        pool.releaseConnection(conn);
      }
    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});
//___________________________________ADMISSION_FORM___________________________________
app.post("/AdmissionForm", upload.array('files', 3), function(req, res) {
  var instKey = req.body.key;
  if (instKey && key === md5(instKey)) {
    var uploadedFiles = req.files;
    console.log(uploadedFiles);
    var attachments = [];
    uploadedFiles.forEach((file) => {
      var obj = {
        filename: file.originalname,
        path: file.path
      };
      attachments.push(obj);
    });
    console.log(uploadedFiles[0]);
    var user_name = req.body.user_full_name;
    var gender = req.body.gender;
    var dob = req.body.user_dob;
    var email = req.body.user_email;
    var address = req.body.user_address;
    var city = req.body.user_city;
    var state = req.body.user_state;
    var country = req.body.user_country;
    var mobile_number = req.body.mobile_number;
    var qualification = req.body.qualification;
    var pre_year_per = req.body.previous_year_percentage;
    var admission_for = req.body.admission_for;
    var clientMail = req.body.clientMail;
    var clientName = req.body.clientName;
    var sql = "INSERT INTO web_admission_form (user_picture,user_full_name,gender,user_dob,user_email,user_address,user_state,user_country,mobile_number,qualification,previous_year_percentage,admission_for) VALUES ?";
    var values = [uploadedFiles[0], user_name, gender, dob, email, address, state, country, mobile_number, qualification, pre_year_per, admission_for];
    console.log(values);

    pool.getConnection(function(err, conn) {
      if (err) {
        console.log("DB connection failed \n Error : " + JSON.stringify(err, undefined, 2));
      } else {
        conn.query(sql, [
          [values]
        ], function(err) {
          if (err) {
            console.log(`{"flag":0}`);
          } else {
            console.log(`{"flag":1}`);
          }
        });
        pool.releaseConnection(conn);
      }

    });

    var clientPass = 'welcome$1234';
    var clientMailFrom = 'newleadsmails@gmail.com';
    var clientPort = 465;
    var clientSmtp = 'smtp.gmail.com';
    var useSmtp = clientSmtp ? clientSmtp : 'smtp.gmail.com';
    var usePort = clientPort ? clientPort : 465;
    var message =
      "Full Name: " + user_name + "<br /> <br />" +
      "Email: " + email + "<br /> <br />" +
      "Date of Birth: " + dob + "<br /> <br />" +
      "Phone: " + mobile_number + "<br /> <br />" +
      "Previous Year Percentage (e.g. 85%, 78.83%): " + pre_year_per + "<br /> <br />" +
      "Education: " + qualification + "<br /> <br />" +
      " Admission For (e.g. IIT-JEE Coaching): " + admission_for + "<br /> <br />" +
      "location: " + address + ", " + city + ", " + state + ", " + country + "<br /> <br />";
    const mailData = {
      from: clientMailFrom, // sender address
      to: clientMail, // list of receivers
      subject: "New Admission form submission",
      text: 'That was easy!',
      html: message,
      attachments: attachments
    };
    const transporter = nodemailer.createTransport({
      port: usePort, // true for 465, false for other ports
      host: useSmtp,
      auth: {
        user: clientMailFrom,
        pass: clientPass,
      },
      secure: true,
    });
    transporter.sendMail(mailData, function(err, info) {
      if (err) {
        console.log(err);
        res.send(`{"message":"Sending Failed!"}`);
      } else {
        res.send(`{"message":"Successfully Sent!"}`);
      }
    });
  } else {
    res.send(`{"response":"unauthorized","status":"Failed"}`);
  }

});



//***************************************************************Listening on PORT******************************************************************

app.listen(process.env.PORT || 3000, function(req, res) {
  console.log("Server started at port 3000");
});
