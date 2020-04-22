var mongoose = require("mongoose");

//SCHEMA setup
var recipeSchema = new mongoose.Schema({
   //Card
    name: String,
    image: String,
    description: String,
    //Info
    serving: String,
    ctime: String,
    ptime: String,
    //Important
    ingredients: [String],
    instructions: String,
    createdAt: { type: Date, default: Date.now },
    author: {
       id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
       },
       username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
});

module.exports = mongoose.model("Recipe", recipeSchema);