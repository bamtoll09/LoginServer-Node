var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    email: String,
    id: String,
    pw: String,
    code: String,
    date: String,
    posts: [Schema.Types.ObjectId]
});

module.exports = userSchema;