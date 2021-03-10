const express=require("express");
const bodyParser=require("body-parser");
const https=require("https");

const mongoose=require('mongoose');
const _=require('lodash');
const env=require("dotenv");
env.config();


//const request=require("request");
const app=express();



app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect(`${process.env.MONGO_URI}`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
})
    .then(() => console.log("Connected to Database"))
    .catch(err => console.error("An error has occured", err));
	
	
const listschema=new mongoose.Schema({
	list:{
		type:String,
		required:[true,"plz enter"]
	}
});
const List=mongoose.model("List",listschema);
var workitems=[];

const item1=new List({
	list:"Enter your daily goals"
});
const items=[item1];	

const lischema =({
	name:String,
	ite:[listschema]
});
const Lis=mongoose.model("Lis",lischema);



app.get("/",function(request,response){
		
	List.find({},function(err,founditems){
		if(founditems.length==0){
		  List.insertMany(items,function(err){
	if(err){
		console.log(err);
	}else{
		console.log("Success")
	}
});
		   response.redirect("/");	
		}else{
		   response.render('list',{listTitle:"Today",newitemlist:founditems});	
		}
	});
	
});

app.get("/:customlistname",function(request,response){
	const customlistname=_.capitalize(request.params.customlistname);
	Lis.findOne({name:customlistname},function(err,foundList){
		if(!err){
			if(!foundList){
				
				//new list creation
				const listt=new Lis({
					name:customlistname,
					ite:items
				});
				listt.save();
				response.redirect("/"+ customlistname);
			}else{
				
				//showing an existing list
				response.render('list',{listTitle:foundList.name,newitemlist:foundList.ite});
			}
		}
	});
});

	
	
app.post("/",function(request,response){
	let itemName=request.body.newitem;
	const listName=request.body.list;
	const item=new List({
		list:itemName
	});
	
	if(listName=="Today"){
		item.save();	
	    response.redirect("/");
	}else{
		Lis.findOne({name:listName},function(err,foundList){
			foundList.ite.push(item);
			foundList.save();
			response.redirect("/"+listName);
		});
	}
	
});



//deletion post
app.post("/delete",function(request,response){
	const checkeditem= request.body.check;
	const listName= request.body.listName;
	console.log(checkeditem);
	if(listName==="Today"){
		List.findByIdAndRemove(checkeditem,function(err){
		if(err){
		   console.log(err);	
		}else{
			console.log("Successfully deleted");
			response.redirect("/");
		}
	});
	}else{
		Lis.findOneAndUpdate({name:listName},{$pull:{ite:{_id:checkeditem}}},function(err,foundList){
			if(!err){
				response.redirect("/"+listName);
			}
		});
	}
	
	
	
});






app.listen(
    process.env.PORT || 3000, 
    console.log("Server started")
);
