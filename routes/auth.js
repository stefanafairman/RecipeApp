require("dotenv").config();
//REQUIRE
var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Notification = require("../models/notification");
var Recipe = require("../models/recipe");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

//ROOT ROUTE
router.get("", function(req, res){
    res.render("landing");
});

//==========
//AUTH ROUTES
//==========
//show register form
router.get("/register", function(req, res){
    res.render("register");
});

//handle signup logic
router.post("/register", function(req, res){
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar,
            facebookLink: req.body.facebookLink,
            pinterestLink: req.body.pinterestLink
        });
    //admin check    
    if(req.body.adminCode === "secretcode123"){
        newUser.isAdmin = true;
    }

    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to Fairman Kitchen " + user.username);
                res.redirect("/recipes");
            });
        }
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/recipes",
        failureRedirect: "/login"
    }), function(req, res){
    
});

//Logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged out");
    res.redirect("/recipes");
});

//=======4/29======//
//forgot password
router.get("/forgot", function(req, res){
    res.render("forgot");
});

router.post("/forgot", function(req, res, next){
    //array of functions that get called
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString("hex");
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if(!user){
                    req.flash("error", "No account with that email address exists!");
                    return res.redirect("/forgot");
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; //1 hour

                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: process.env.NODEMAILER_EMAIL,
                auth: {
                    user: process.env.NODEMAILER_USER,
                    pass: process.env.NODEMAILER_PASS 
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.NODEMAILER_USER,
                subject: "Fairman Kitchen Password Reset",
                text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                    "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                    "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                    "If you did not request this, please ignore this email and your password will remain unchanged.\n"
            };
            smtpTransport.sendMail(mailOptions, function(err){
                console.log("mail sent");
                req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
                done(err, "done");
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect("/forgot");
    });
});

//reset password
router.get("/reset/:token", function(req, res){
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
        if(!user){
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/forgot");
        }
        res.render("reset", { token: req.params.token });
    });
});

router.post("/reset/:token", function(req, res){
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
                if(!user) {
                    req.flash("error", "Password reset token is invalid or has expired.");
                    return res.redirect("back");
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err){
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err){
                            req.logIn(user, function(err){
                                done(err, user);
                            });
                        });
                    });
                }
                else{
                    req.flash("error", "Passwords do not match.");
                    return res.redirect("back");
                }
            });
        },
        function(user, done){
            var smtpTransport = nodemailer.createTransport({
                service: process.env.NODEMAILER_EMAIL,
                auth: {
                    user: process.env.NODEMAILER_USER,
                    pass: process.env.NODEMAILER_PASS 
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.NODEMAILER_USER,
                subject: "Fairman Kitchen Password Changed",
                text: "Hello,\n\n" + "This is a confirmation that the password for your account " + user.email + " has just been changed.\n"
            };
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash("success", "Success! Your password has been reset!");
                done(err);
            });
        }
    ],
    function(err){
        res.redirect("/recipes");
    });
});



//user profiles
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Something went wrong");
            return res.redirect("/");
        }
        User.findById(req.params.id).populate("followers").exec();
        Recipe.find().where('author.id').equals(foundUser._id).exec(function(err, recipes){
            if(err){
                req.flash("error", "Something went wrong");
                return res.redirect("/");
            }
            res.render("users/show", {user: foundUser, recipes: recipes});
        });
    });
});
  

//=========4/28========//
// follow user
router.get('/follow/:id', isLoggedIn, async function(req, res) {
    try {
      let user = await User.findById(req.params.id);
      user.followers.push(req.user._id);
      user.save();
      req.flash('success', 'Successfully followed ' + user.username + '!');
      res.redirect('/users/' + req.params.id);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  
  // view all notifications
  router.get('/notifications', isLoggedIn, async function(req, res) {
    try {
      let user = await User.findById(req.user._id).populate({
        path: 'notifications',
        options: { sort: { "_id": -1 } }
      }).exec();
      let allNotifications = user.notifications;
      res.render('notifications/index', { allNotifications });
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  
// handle notification
//   router.get('/notifications/:id', isLoggedIn, async function(req, res) {
//     try {
//       let notification = await Notification.findById(req.params.id);
//       notification.isRead = true;
//       notification.save();
//       res.redirect(`/recipes/${notification.recipeId}`);
//     } catch(err) {
//       req.flash('error', err.message);
//       res.redirect('back');
//     }
//   });

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect("/login");
    }
}

module.exports = router;