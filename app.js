var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var moment = require('moment-timezone');
// require('console-stamp')(console, { pattern: 'dd/mm HH:MM:ss.l' });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');

var app = express();

var sessionParser = require('express-session');

var mongoose = require('mongoose');
var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  console.log('Connected to mongod server');
});

mongoose.connect('mongodb://localhost:27017/lee', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var port = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// logger.token('date', function(req, res ,tz) {
//   return moment().tz(tz).format('MM/DD HH:mm:ss.SSS');
// });
// logger.format('myformat', '[:date[Asia/Seoul]] :method :url :status :response-time ms - :res[content-length] :remote-addr');

app.use(logger('dev'));
// app.use(logger('myformat'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(sessionParser({
  secret: 'sesesesesesese',
  resave: false,
  saveUninitialized: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log("Server is Openned!");
});

module.exports = app;