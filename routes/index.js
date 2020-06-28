var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user) {
    console.log("[INDEX-SESSION] sessionID: " + req.sessionID);
    console.log("[INDEX-SESSION] user.id: " + req.session.user.id);
  }
  res.render('index', { title: 'Express' });
});

module.exports = router;
