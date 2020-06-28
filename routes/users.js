var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var UserSchema = require('../db/userSchema');
var Users = mongoose.model('Users', UserSchema);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'Express' });

  Users.find({} , function(err, result) {
    console.log(JSON.stringify(result));
  });
});

router.get('/signup', function(req, res) {
  res.render('signup', {});
});

router.post('/signup', function(req, res) {
  Users.create({
    _id: new mongoose.Types.ObjectId,
    id: req.body.id,
    pw: req.body.pw
  });

  res.render('result', {result: "Success!"});
  res.end();
});

router.get('/login', function(req, res) {
  if (!req.sessionID) {
    res.render('login');
  } else {
    // res.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
    res.send("<h1>Already Logged in</h1>");
    res.end();

    console.log("[LOGIN-SESSION] sessionID: " + req.sessionID);
  }
});

router.post('/login', function (req, res) {
  if (req.sessionID) {
    // res.writeHead(200, {"Content-Type" : "application/html; charset=utf-8"});
    res.send("<h1>Already Log inned</h1>");
    res.end();

    console.log("[LOGIN-SESSION] sessionID: " + req.sessionID);
  } else {
    Users.findOne({ "id": req.body.id }, function (err, result) {
      if (err || !result) {
        res.status(404).render('result', { result: "Login Fail!" });
        console.log("Login Fail!");
        res.end();
      } else {
        if (result.pw == req.body.pw) {
          // res.writeHead(200, {"Content-Type" : "application/json; charset=utf-8"});
          req.session.user = result;
          req.session.save(function () {
            console.log("[SESSION] saved");
            console.log("[SESSION] sessionID: " + req.sessionID);
          });
          res.status(200).render('result', { result: "Login Success!" });
          console.log("Login Success!");
        } else {
          // res.writeHead(404, {"Content-Type" : "application/json; charset=utf-8"});'
          // res.send(404);
          res.status(404).render('result', { result: "Login Fail!" });
          console.log("Login Fail!");
        }
        res.end();
      }
    });
  }
  req.session.destroy();
});

module.exports = router;
