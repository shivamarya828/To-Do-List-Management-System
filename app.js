//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://shivamarya828:12345qwert@cluster0.bka9pqk.mongodb.net/todolistDB", {useNewUrlParser: true});
const itemsSchema = new mongoose.Schema({
  name: String
});

let Item = mongoose.model('item', itemsSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1 = new Item({name: "Eat"});
const item2 = new Item({name: "Sleep"});
const item3 = new Item({name: "Rave"});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  const day = date.getDate();

  // let items = [];
  Item.find(function(err, i){
    if(i.length == 0){
      Item.insertMany(defaultItems, function(err){
        if(err)console.log(err);
        else console.log("Items added successfully");
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: i});
    }
  })
});

app.post("/", function(req, res){

  const item = new Item({name: req.body.newItem});
  const listName = req.body.list;

  if(listName == date.getDate()){
    Item.insertMany([item], function(err){
      if(err){
        console.log(err);
      }
    })
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  // console.log(req.body.listName);
  if(req.body.listName == date.getDate()){
    Item.findByIdAndRemove({_id: req.body.checkbox}, function(err){
      if(!err){
        console.log("Successfully deleted");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: req.body.listName}, {$pull: {items: {_id: req.body.checkbox}}}, function(err, foundlist){
      if(!err){
        res.redirect("/" + req.body.listName);
      }
    })
  }
});

app.get("/:para", function(req, res){
  const customListName = _.capitalize(req.params.para);

  List.findOne({name: customListName}, function(err, foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.render("list", {listTitle: customListName, newListItems: defaultItems});
      }
      else{
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items})
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
