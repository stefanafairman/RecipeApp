//REQUIRE
var express = require("express");
var router = express.Router({mergeParams: true}); //merges the params so we can access them through the id
var recipe = require("../models/recipe");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// =================
//COMMENTS ROUTES
// =================
//NEW comment
router.get("/new", middleware.isLoggedIn, function(req, res){
    Recipe.findById(req.params.id, function(err, recipe){
        if(err){
            console.log(err);
        }
        else {
            res.render("comments/new", {recipe: recipe});
        }
    });
});

//CREATE comment
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup recipe looking ID
    Recipe.findById(req.params.id, function(err, recipe){
        if(err){
            req.flash("error", "Something went wrong!");
            res.redirect("/recipes");
        }
        else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //pushes the comment into the comments array into the recipe
                    recipe.comments.push(comment);
                    recipe.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/recipes/" + recipe._id);
                }
            });
        }
    })
});

//EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        }
        else{
            res.render("comments/edit", {recipe_id: req.params.id, comment: foundComment});
        }
    });
});

//UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

//DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success", "Comment deleted!");
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

module.exports = router;