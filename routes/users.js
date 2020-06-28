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
  res.render('login');
});

router.post('/login', function(req, res) {
  Users.findOne({"id": req.body.id}, function(err, result) {
    if (result.pw == req.body.pw) {
      // res.writeHead(200, {"Context-Type" : "application/json; charset=utf-8"});
      res.status(200).render('result', {result: "Login Success!"});
      console.log("Login Success!");
    } else {
      // res.writeHead(404, {"Context-Type" : "application/json; charset=utf-8"});'
      // res.send(404);
      res.status(404).render('result', {result: "Login Fail!"});
      console.log("Login Fail!");
    }
    res.end();
  });
});

module.exports = router;
