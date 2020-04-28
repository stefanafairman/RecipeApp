//REQUIRE
var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Notification = require("../models/notification");
var Recipe = require("../models/recipe");

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
            avatar: req.body.avatar
        });

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
//app.post("/path", middleware, callback);
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
  router.get('/notifications/:id', isLoggedIn, async function(req, res) {
    try {
      let notification = await Notification.findById(req.params.id);
      notification.isRead = true;
      notification.save();
      res.redirect(`/recipes/${notification.recipeId}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect("/login");
    }
}

module.exports = router;