var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var sess = req.session;

  var isLoggedIn = false;
  if (sess.user) {
    console.log("[INDEX-SESSION] sessionID: " + req.sessionID);
    console.log("[INDEX-SESSION] user.id: " + req.session.user.id);
    isLoggedIn = true;
  }
  res.render('index', { title: 'Express', isLoggedIn: isLoggedIn });
});

module.exports = router;
