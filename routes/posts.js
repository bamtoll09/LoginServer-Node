var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var PostSchema = require('../db/postSchema');
var Posts = mongoose.model('Posts', PostSchema);

var UserSchema = require('../db/userSchema');

var Users = mongoose.model('Users', UserSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Posts' });
});

router.get('/all', function(req, res, next) {
  // res.writeHead(200, {'Content-Type': 'text/json; charset=utf-8'});
  
  var sess = req.session;
  // sess.destroy();

  var result;
  var writers = []
  Posts.find({}, function(err, posts) {
    result = JSON.parse(JSON.stringify(posts)); // to modify values
    for (var i=0; i<posts.length; ++i) {
      writers.push(posts[i].writer);
    }

    Users.find({ '_id': { $in: writers } }, function(err, users) {
      // console.log(JSON.stringify(users));
      
      for (var i=0; i<result.length; ++i) {
        for (var j=0; j<users.length; ++j) {
          // console.log("WRITER: " + result[i].writer);
          // console.log("ID: " + users[j].id);
          if (result[i].writer.toString() === users[j]._id.toString()) {
            result[i].writer = users[j].id;
            // console.log("WRITER2: " + result[i].writer);
            // console.log("FOUND!");
          }
        }
      }
      res.write(JSON.stringify(result));
      res.end();
    });
  });
});

router.get('/write', function(req, res) {
  res.render('write');
});

router.post('/write', function(req, res) {
// write post
  const postId = new mongoose.Types.ObjectId;
  var writer = req.body.writer;
  if (!writer) writer = "5ece8039e45f9c2d9b4808dd";
  Posts.create({
    "_id": postId,
    "title": req.body.title,
    "contents": req.body.contents,
    "date": getTimeStamp(),
    "writer": writer,
    'type': req.body.type
  });
// add writer by session

// update user posts
  console.log("TYPEOF_POST_ID: " + postId.toString());
  Users.findByIdAndUpdate(writer, { $push: { posts: postId.toString() } }, function() {} );

// success  
  res.status(200).render('result', {result: "Write Success!"});
  res.end();
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
