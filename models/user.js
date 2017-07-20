const
  mongoose = require('mongoose'),
  passportLocalMongoose = require('passport-local-mongoose')

  const UserSchema = new mongoose.Schema({
    local : {
    username: String,
    password: String
  },
  facebook: {
		id: String,
		name: String,
		token: String,
		email: String
	}
  });

 // PLM has built in methods to encode decode
 // user info that passport proveides
  UserSchema.plugin(passportLocalMongoose)

  module.exports = mongoose.model("User", UserSchema);
