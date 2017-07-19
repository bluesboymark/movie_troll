const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    year: Number,
    image: String,
    plot: String,
    creator: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String
    },
      comments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment"
        }
    ]
});

postSchema.pre("findOne", function() {
  this.populate("comments")
})

module.exports = mongoose.model("Post",postSchema)
