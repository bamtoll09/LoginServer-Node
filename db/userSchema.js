var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    id: String,
    pw: String,
    email: String,
    posts: [Schema.Types.ObjectId]
});

module.exports = userSchema;