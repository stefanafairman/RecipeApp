var Recipe = require("../models/recipe");
var Comment = require("../models/comment");

//all the middleware goes here
var middlewareObj = {};

middlewareObj.checkRecipeOwnership = function(req, res, next){
        if(req.isAuthenticated()){
            Recipe.findById(req.params.id, function(err, foundRecipe){
                if(err){
                    req.flash("error", "Recipe not found!");
                    res.redirect("back");
                }
                else{
                    //does the user own the Recipe?
                    if(foundRecipe.author.id.equals(req.user._id) || req.user.isAdmin){
                        next();
                    }
                    else{
                        req.flash("error", "You don't have permission to do that!");
                        res.redirect("back");
                    }
                }
            });
        }
        else{
            req.flash("error", "You need to be logged in to do that!")
            res.redirect("back");
        }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
        if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err){
                    console.log(err);
                    res.redirect("back");
                }
                else{
                    //does the user own the comment?
                    if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                        next();
                    }
                    else{
                        req.flash("error", "You don't have permission to do that!");
                        res.redirect("back");
                    }
                }
            });
        }
        else{
            req.flash("error", "You need to be logged in for that!");
            res.redirect("back");
        }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash("error", "You need to be logged in to do that!")
        res.redirect("/login");
    }
}

module.exports = middlewareObj;