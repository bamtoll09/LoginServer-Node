var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var db = mongoose.connection;
var UserSchema = require('./DB/schema');
var Users = mongoose.model('Users', UserSchema);

db.on('error', console.error);
db.once('open', function() {
  console.log('Connected to mongod server');
});

mongoose.connect('mongodb://localhost:27017/lee', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });

  Users.find({} , function(err, result) {
    console.log(JSON.stringify(result));
  });
});

router.get('/signup', function(req, res) {
  res.render('signup', {});
})

router.post('/signup', function(req, res) {
  Users.create({
    _id: new mongoose.Types.ObjectId,
    id: req.body.id,
    pw: req.body.pw
  });

  res.writeHead(200, {"Context-Type" : "text/html; charset=utf-8"});
  res.write("<h1>Success!</h1>");
  res.end();
});

router.post('/login', function(req, res) {
  Users.findOne({"id": req.body.id}, function(err, result) {
    if (result.pw == req.body.pw) {
      res.writeHead(200, {"Context-Type" : "application/json; charset=utf-8"});
      console.log("Login Success!");
    } else {
      res.writeHead(404, {"Context-Type" : "application/json; charset=utf-8"});
      console.log("Login Fail!");
    }
    res.end();
  });
});

module.exports = router;
