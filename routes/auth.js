//REQUIRE
var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
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

    Recipe.find().where('author.id').equals(foundUser._id).exec(function(err, recipes){
        if(err){
            req.flash("error", "Something went wrong");
            return res.redirect("/");
        }
        res.render("users/show", {user: foundUser, recipes: recipes});
    });
    });
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