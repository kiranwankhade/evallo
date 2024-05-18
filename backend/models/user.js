const mongoose = require('mongoose');

const userSchema =  new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  name: { type: String}
});


const UserModel = mongoose.model('User', userSchema);

module.exports ={
    UserModel
}
