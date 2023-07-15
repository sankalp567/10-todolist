//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // version 6.10.0
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

// now we are using mongodb altas to deplay your apllication
// mongoose.connect("mongodb+srv://sankalpturankar567:<password>@cluster0.ihp0drj.mongodb.net/")

// here we have to replave password with password we set up in atlas and we ahve to give name of database
mongoose.connect("mongodb+srv://sankalpturankar567:Manjusha77@cluster0.ihp0drj.mongodb.net/todolistDB");

// by this we dont have to run mongod every time we lunch our application

const itemschema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemschema); 

const item1 = new Item({name:"welcome to your todolist!"});

const item2 = new Item({name:"hit the + button to add new item"});

const item3 = new Item({name:"<-- hit this delete an item"});

const defaultItem=[item1,item2,item3];

// Item.insertMany(defaultItem,function(err){
//   if(err){console.log(err);}else{console.log("successfully inseted in db");};
// });

app.get("/", function(req, res) {

  Item.find((err,items)=>{
    // here we are getting all item present in our database
    if(err){
      console.log(err);
    }else{
      // console.log(items);
      if(items.length === 0){
        Item.insertMany(defaultItem,function(err){
          if(err){
            console.log(err);
          }else{
            console.log("successfully inseted in db");
          };
        });
        // here we are checking if our items in database is empty or not and if it is empty then insert defultitem in it
        res.redirect("/");
      }else{
        res.render("list", {listTitle:"today", newListItems: items});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname = req.body.list;

    const item=new Item({
      name:itemname
    }) // created new item

    if(listname === "today"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name:listname},function(err,foundlist){ // List is define below
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+listname);
      })
    }
});

app.post("/delete",function(req,res){
  // console.log(req.body);
  const checkedItemId=req.body.checkbox;
  const listname = req.body.listname;
  if(listname === "today"){
    Item.deleteOne({_id : checkedItemId},function(err){
      // deleting item which is checked
      if(err){
        console.log(err);
      }
      else{
        console.log("succesfully deleted");
      }
    });
    res.redirect("/");
  }else{
    // this is for list collection
    List.findOneAndUpdate({name:listname},{$pull : {items:{_id:checkedItemId}}},function(err,foundlist){
      // here we ahve to give selector,what_to_do,callback_funciton
      // $pull     it will remove element form array (items) of given selector(_id)
      if(!err){
        res.redirect("/"+listname);
      }
    })
  }
})



/////////////////////////////////// below code is for dynamic routes

const listschema = new mongoose.Schema({
  name:String,
  items:[itemschema]
})

const List = mongoose.model("List",listschema);

app.get("/:topic", function(req,res){
  // here we are using express routing 
  // console.log(req.params.topic);
  const listname = _.capitalize(req.params.topic);
  // here we have use lodash so that Home or HOME or home it means same route Home

  List.findOne({name:listname},function(err,foundlist){
    // this will check whether our list conatian record with given name or not then return it
    if(!err){
      if(!foundlist){
        // console.log("doesnt exist");
        const list = new List({
          name: listname,
          items: defaultItem
        })

        list.save()
        // here we are creating new list
        res.redirect("/"+listname);
      }else{
        // console.log("exists");
        res.render("list", {listTitle:foundlist.name, newListItems: foundlist.items});
        // showing existing list

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
