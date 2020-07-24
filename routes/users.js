var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var UserSchema = require('../db/userSchema');
var Users = mongoose.model('Users', UserSchema);

var transporter = require('../data/mailer');

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
  var id = new mongoose.Types.ObjectId;

  Users.create({
    _id: id,
    email: req.body.email,
    id: req.body.id,
    pw: req.body.pw,
    code: authCode,
    date: getTimeStamp(),
    posts: []
  });

  var link = 'http://' + req.get('host') + '/users/auth?key=' + makeKey(id, authCode);
  console.log(link);

  var mailOptions = {
    from: 'devPBstudio@gmail.com',
    to: req.body.email,
    subject: '[LoginServer] Authorize Your Email',
    generateTextFromHTML: true,
    html: '<p>Please enter this link to authorize your email: </p>' +
    '<a href="' + link + '">' + link + '</a>'
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
  var key = req.query.key;

  decoded = decode(key);

  var id = decoded[0];
  var code = decoded[1];

  console.log("[AUTH] id: " + id);
  console.log("[AUTH] code: " + code);

  Users.findById(id.toString(), function(err, result) { // findBy"_id"
    if (err) {
      res.render('result', { result: 'Error 1: Link Crashed.' });
    } else {
      // console.log(result);
      if (result.code == "xxxx") {
        res.render('result', { result: "Your email is alreay authorized." });
      } else if (result.code == code) {
        res.render('result', { result: "Your email is Authorized!" });
        Users.updateOne({'_id': id }, { 'code':  "xxxx" }, function(err, raw) {
          if (err) console.log(err);
        });
      } else {
        res.render('result', { result: 'Error 2: Link Crashed.' });
      }
    }
    res.end();
  });
});

// resend authorization code
router.get('/resend', function(req, res) {
  var sess = req.session;

  if (sess.user) {
    var authCode = Math.floor(Math.random() * 10000).toString();
    
    sess.user.code = authCode;

    Users.updateOne({'_id': sess.user._id }, { 'code':  authCode }, function(err, raw) {
      if (err) console.log(err);
    });

    var link = 'http://' + req.get('host') + '/users/auth?key=' + makeKey(sess.user._id, authCode);

    var mailOptions = {
      from: 'devPBstudio@gmail.com',
      to: sess.user.email,
      subject: '[LoginServer] Authorize Your Email',
      generateTextFromHTML: true,
      html: '<p>Please enter this link to authorize your email: </p>' +
      '<a href="' + link + '">' + link + '</a>'
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

function makeKey(id, code) {
  _code = code.toString(16);
  _id = id.toString();
  console.log('[AUTH] _id: ' + _id + '\n_code: ' + _code);
  var res = '';

  while (_code.length < 4) {
    _code = "0" + _code;
  }
  
  for (var i=1; i<=8; ++i) {
    if (i%2 == 0) res += _code[i/2 - 1];
    else res += _id[parseInt(i/2)];
  }

  res += _id.substring(4, _id.length);

  console.log("[MAKEKEY] res: " + res);

  return res;
}

function decode(key) {
  var id = "";
  var code = "";

  for (var i=1; i<=8; ++i) {
    if (i%2 == 0) code += key[i-1];
    else id += key[i-1];
  }

  id += key.substring(8, key.length);

  console.log('[DECODE] id:' + id);
  console.log('[DECODE] code:' + code);

  return [id, code];
}

module.exports = router;
