//REQUIRE
var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

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
    var newUser = new User({username: req.body.username});
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

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect("/login");
    }
}

module.exports = router;