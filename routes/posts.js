var express = require('express');
var router = express.Router();

var global = require('./global');
var PostSchema = require('../db/postSchema');
var Posts = global.mongoose.model('Posts', PostSchema);

var UserSchema = require('../db/userSchema');
var Users = global.mongoose.model('Users', UserSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Posts' });
});

router.get('/all', function(req, res) {
  Posts.find({}, function(err, result) {
    res.writeHead(200, {'Content-Type': 'text/json; charset=utf-8'});
    res.write(JSON.stringify(result));
    res.end();
  });
});

router.get('/write', function(req, res) {
  res.render('write');
});

router.post('/write', function(req, res) {
// write post
  const postId = new global.mongoose.Types.ObjectId;
  Posts.create({
    _id: postId,
    title: req.body.title,
    contents: req.body.contents,
    date: new Date(),
    writer: req.body.writer
  });
// add writer by session

// update user posts
  console.log("TYPEOF_POST_ID: " + postId.toString());
  Users.findByIdAndUpdate(req.body.writer, { $push: { posts: postId.toString() } }, function() {} );

// success  
  res.status(200).render('result', {result: "Write Success!"});
  res.end();
});

module.exports = router;
