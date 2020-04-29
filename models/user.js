var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt-nodejs");

var UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },

    //reset password
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    //====4/28====//
    //followers & notification
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notification'
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);