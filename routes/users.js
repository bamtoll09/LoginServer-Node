var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var UserSchema = require('../db/userSchema');
var Users = mongoose.model('Users', UserSchema);

var transporter = require('../data/mailer');
const { render } = require('pug');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'Express' });

  Users.find({} , function(err, result) {
    console.log(JSON.stringify(result));
  });
});

// signup
router.get('/signup', function(req, res) {
  res.render('signup', {});
});

router.post('/signup', function(req, res) {
  var authCode = Math.floor(Math.random() * 10000).toString();

  Users.create({
    _id: new mongoose.Types.ObjectId,
    email: req.body.email,
    id: req.body.id,
    pw: req.body.pw,
    code: authCode,
    date: getTimeStamp(),
    posts: []
  });

  var mailOptions = {
    from: 'devPBstudio@gmail.com',
    to: req.body.email,
    subject: '[LoginServer] Authorize Your Email',
    text: 'The code is ' + authCode
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log('[EMAIL-ERROR] ' + err);
      res.render('result', {result: "Signup Success!", detail: "But it faild to send authorization email, please check it."});
      res.end();
    } else {
      res.render('result', {result: "Signup Success!", detail: "Please check your email to authorize it's email."});
      res.end();
    }
  });
});

// login
router.get('/login', function(req, res) {
  var sess = req.session;

  if (!sess.user) {
    res.render('login');
  } else {
    // res.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
    res.send("<h1>Already Logged in</h1>");
    res.end();

    console.log("Already Logged in!");
    console.log("[LOGIN-SESSION] sessionID: " + req.sessionID);
    console.log("[LOGIN-SESSION] session.user.id: " + sess.user.id);
  }
});

router.post('/login', function (req, res) {
  var sess = req.session;

  console.log("[LOGIN-SESSION] sessionID: " + req.sessionID);

  if (sess.user) {
    // res.writeHead(200, {"Content-Type" : "application/html; charset=utf-8"});
    res.send("<h1>Already Log inned</h1>");
    res.end();

    console.log("Already Logged in!");
    console.log("[LOGIN-SESSION] session.user.id: " + sess.user.id);
  } else {
    Users.findOne({ "id": req.body.id }, function (err, result) {
      if (err || !result) {
        res.status(404).render('result', { result: "Login Fail!" });
        console.log("Login Fail!");
        res.end();
      } else {
        if (result.pw == req.body.pw) {
          // res.writeHead(200, {"Content-Type" : "application/json; charset=utf-8"});
          sess.user = result;
          sess.save(function () {
            console.log("[SESSION] saved");
            console.log("[SESSION] sessionID: " + req.sessionID);
            console.log("[SESSION] session.user.id: " + sess.user.id);
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
  // sess.destroy(); // Holy Mxxxer Fxxking Shxx
});

// logout
router.get('/logout', function(req, res) {
  var sess = req.session;

  if (sess.user) {
    sess.destroy(function(err) {
      console.log("[LOGOUT-SESSION] destroyed");
    });
    res.render('result', { result: "Logout Success!"});
  } else {
    res.render('result', { result: "Already Logged Out."});
  }

  res.end();
});

// authorize code
router.get('/auth', function(req, res) {
  var sess = req.session;

  if (sess.user) {
    res.render('auth');
    res.end();
  } else {
    // res.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
    res.send("<h1>Please Log in</h1>");
    res.end();
  }
});

router.post('/auth', function(req, res) {
  var sess = req.session;

  if (sess.user) {
    if (sess.user.code == "xxxx") {
      res.render('result', { result: "Your email is alreay authorized." });
    } else {
      if (req.body.code == sess.user.code) {
        sess.user.code = "xxxx";
        res.render('result', { result: "Your email is Authorized!" });
      } else {
        res.render('result', { result: "Code isn't same. Please check it again." });
      }
    }
    res.end();
  } else {
    // res.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
    res.send("<h1>Please Log in</h1>");
    res.end();
  }
});

// resend authorization code
router.get('/resend', function(req, res) {
  var sess = req.session;

  if (sess.user) {
    var authCode = Math.floor(Math.random() * 10000).toString();
    
    sess.user.code = authCode;

    var mailOptions = {
      from: 'devPBstudio@gmail.com',
      to: sess.user.email,
      subject: '[LoginServer] Authorize Your Email',
      text: 'The code is ' + authCode
    };
  
    transporter.sendMail(mailOptions, function(err, info) {
      if (err) {
        console.log('[EMAIL-ERROR] ' + err);
        res.render('result', {result: "Resend Failed!", detail: "But....why???"});
        res.end();
      } else {
        res.render('result', {result: "Resend Success!", detail: "Please check your email to authorize it's email."});
        res.end();
      }
    });
  } else {
    // res.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
    res.send("<h1>Please Log in</h1>");
    res.end();
  }
  
});

function getTimeStamp() {
  var d = new Date();
  var s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + ' ' +

    leadingZeros(d.getHours(), 2) + ':' +
    leadingZeros(d.getMinutes(), 2) + ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

module.exports = router;
