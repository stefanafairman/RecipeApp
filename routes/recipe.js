//REQUIRE
var express = require("express");
var router = express.Router();
var Recipe = require("../models/recipe");
var middleware = require("../middleware"); //automatically requires index.js

//INDEX
router.get("/", function(req, res){
    var noMatch;
    if(req.query.search) {
        //
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        
        //get searched Recipes from database
        Recipe.find({name: regex}, function(err, allRecipes){
            if(err){
                console.log(err);
            }
            else {
                if(allRecipes.length < 1){
                    noMatch = "No recipes matched that query, please try again!";
                }
                res.render("recipes/index", {recipes: allRecipes, noMatch: noMatch});
            }
        }); 
    }
    else {
        //get all Recipes from database
        Recipe.find({}, function(err, allRecipes){
            if(err){
                console.log(err);
            }
            else {
                res.render("recipes/index", {recipes: allRecipes, noMatch: noMatch});
            }
        });    
    }
});

//show the form that will send the data to the Recipes post route
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("recipes/new");
});

//create Recipe
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to Recipes array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var serving = req.body.serving;
    var ctime = req.body.ctime;
    var ptime = req.body.ptime;
    var ingredients = req.body.ingredients;
    var split = ingredients.split(",");
    var instructions = req.body.instructions;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newRecipe = {name: name, image: image, description: desc, serving: serving, ctime: ctime, ptime: ptime, ingredients: split, instructions: instructions, author: author};
    //create new Recipe and save to database
    Recipe.create(newRecipe, function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/recipes"); //redirect back to Recipes page
        }
    });
});

//SHOW
router.get("/:id", function(req, res){
    //find the Recipe with provided ID
    //populate it with the existing comments
    //execute the query
    Recipe.findById(req.params.id).populate("comments").exec(function(err, foundRecipe){
        if(err){
            console.log(err);
        }
        else{
            //render the show template with that Recipe
            res.render("recipes/show", {recipe: foundRecipe});
        }
    });
});

//EDIT
router.get("/:id/edit", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findById(req.params.id, function(err, foundRecipe){
        res.render("recipes/edit", {recipe: foundRecipe});
    });
});

//UPDATE
router.put("/:id", middleware.checkRecipeOwnership, function(req, res){
    //find and update the correct Recipe
    req.body.recipe.ingredients = req.body.recipe.ingredients.split(",");
    Recipe.findByIdAndUpdate(req.params.id, req.body.recipe, function(err, updatedRecipe){
        if(err){
            res.redirect("/recipes");
        }
        else{
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

//DESTROY
router.delete("/:id", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/recipes");
        }
        else{
            res.redirect("/recipes");
        }
    });
});

//match any characters globally
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;