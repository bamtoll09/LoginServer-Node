var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    _id: Schema.Types.ObjectId,
    title: String,
    contents: String,
    date: String,
    writer: Schema.Types.ObjectId
});

module.exports = postSchema;