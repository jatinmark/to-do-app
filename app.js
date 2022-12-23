//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _= require("lodash");
const ejs= require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin-jatin:jatinchoudhary@cluster0.gfq4qvg.mongodb.net/todolistDB');

const itemschema = {
  Name : String
};

const Item = mongoose.model("Item",itemschema);

const item1 = new Item({
  Name: "work out"
});
const item2 = new Item({
  Name: "study"
});
const item3 = new Item({
  Name: "personal development"
});



const listschema = {
  name : String,
  items : [itemschema]
};
const List = mongoose.model("List",listschema);


const defaulItem = [item1,item2,item3];


//  Item.deleteMany({Name: "jay"}, function (err){
//   if (err){
//     console.log("error");
//   }
//   else {
//     console.log("success");
//   }
// });

app.get("/", function(req, res) {

  Item.find({}, function (err,result){
   if (result.length===0){
     Item.insertMany(defaulItem,function(err){
       if (err){
         console.log("error");
       }
       else {
         console.log("success");
       }
     });

   res.redirect("/");
 }
   else {
     res.render("list", {listTitle: "Today", newListItems: result});
   }
 });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    Name : itemName
  });


  if (listName === "Today"){
    item.save();
      res.redirect("/");
  }
else {
  List.findOne({name: listName}, function(err,foundlist){
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/"+listName);
  });
}

});

app.post("/delete", function(req, res){
const task = req.body.checked ;
const listName = req.body.listName;
if (listName==="Today") {
  Item.findByIdAndRemove(task,function(err){
    if (!err){
      console.log("success");
      res.redirect("/");
    }
  });
}
else {
  List.findOneAndUpdate({name:listName},{$pull : {items: {_id:task}}},function (err,foundlist){
    if(!err){
      res.redirect("/"+listName);
    }


  });
}

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customlist" ,function (req,res) {
  const category =  _.capitalize(req.params.customlist);
List.findOne({name:category},function(err,foundlist){
  if (!err){
    if(!foundlist){
      // create new list
      const list = new List({
        name : category,
        items : defaulItem
      }) ;
      list.save();
        console.log("saved successfully");
        res.redirect("/"+category);
    }
    else {
      // show existed list
    res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items });
    }
  }

});

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started successfully");
});
