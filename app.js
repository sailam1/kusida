const express=require("express")
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
// const fs=require("fs");
// const jsdom=require("jsdom");
// const { start } = require("repl");
// const { reverse } = require("dns");
// const {JSDOM}=jsdom;


const app=express();



app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");


async function test(){
    await mongoose.connect("mongodb+srv://sailam:sailam2000@cluster0.jquj8.mongodb.net/accont?retryWrites=true/userData",{useNewUrlParser:true,useUnifiedTopology: true});
}

test();

mongoose.set("useCreateIndex",true);


const userScema=new mongoose.Schema({
    username:String,
    fullName:String,
    token:Number,
    village:String
});
const amountSchema=new mongoose.Schema({
    amount:[],
    date:[],
    cod:[],
    token:Number,
    totalSum:Number
})

const User=mongoose.model("User",userScema);
const Amount=mongoose.model("Amount",amountSchema);


app.get("/",function(req,res){
    res.sendFile(__dirname+"/home.html");
});
app.get("/registerUser",function(req,res){
    res.render("newUser");
});

app.post("/registered",function(req,res){
    var username=req.body.username;
    var fullName=req.body.fullName;
    var token=req.body.tokenNumber;
    var village=req.body.village;

    const data=new User({
        username:username,
        fullName:fullName,
        token:token,
        village:village
    });
    const amountData=new Amount({
        amount:[0],
        date:["start"],
        cod:["none"],
        token:token,
        totalSum:0
    });
    data.save();
    amountData.save();
    res.render("success.ejs");

});

//search by person name

app.get("/personName",function(req,res){
    res.sendFile(__dirname+"/personName.html");
});
app.post("/personName",function(req,res){
    var name=req.body.person_name;
    var amount=req.body.money;
    var summary=req.body.summary;
    var add=req.body.add;
    var substract=req.body.substract;
    options={
        runScripts:"dangerously",
        resources:"usable"
    }
    if(summary){
        User.find({username:name},function(err,data){
            if(err){
                res.send(err);
            }
            else if(data.length===0){
                res.send("person with username "+name+" is not registered");
            }
            else{
                var tokenNumbers=data[0].token;
                var fullName=data[0].fullName;
                var village=data[0].village;
                Amount.find({token:tokenNumbers},function(err,data){
                    if(err){
                        console.log(err);
                    }
                    else{
                        const money_list=data[0].amount;
                        const date_list=data[0].date;
                        const cod=data[0].cod;
                        const totalSum=parseFloat(data[0].totalSum);
                        res.render("data",{fullName:fullName,tokenNumbers:tokenNumbers,village:village,money_list:money_list,date_list:date_list,cod:cod,totalSum:totalSum});
                    }
                });
            }
        })
    }
    else if(add){
        User.find({username:name},function(err,data){
            if(err){
                console.log(err);
            }
            else if(data.length===0){
                console.log("no user");
            }
            else{
                const tokenNumber=data[0].token;
                const fullName=data[0].fullname;
                const village=data[0].village;
                const dateObj=new Date();
                var date=dateObj.getDate().toString();
                var month=(dateObj.getMonth()+1).toString();
                if(month.length===1){
                    month="0"+month;
                }
                if(date.length===1){
                    date="0"+date;
                }
                var year=dateObj.getFullYear().toString();
                var fullDate=date+"/"+month+"/"+year;
                Amount.find({token:tokenNumber},function(err,data){
                    if(err){
                        console.log(err);
                    }
                    else{
                        const totalSum=data[0].totalSum;
                        const totalAmount=parseFloat(amount)+parseFloat(totalSum);
                        Amount.updateOne({token:tokenNumber},{$push:{amount:amount,date:fullDate,cod:"credited"},totalSum:totalAmount},function(err,data){
                            if(err){
                                console.log(err);
                            }
                            else{
                                console.log("amount added");
                            }
                        })
                        Amount.find({token:tokenNumber},function(err,data){
                            if(err){
                                console.log(err);
                            }
                            else{
                                const money_list=data[0].amount;
                                const date_list=data[0].date;
                                const cod=data[0].cod;
                                const total_remain=data[0].totalSum;
                                res.render("data",{fullName:fullName,tokenNumbers:tokenNumber,village:village,money_list:money_list,date_list:date_list,cod:cod,totalSum:total_remain})
                            }
                        })
                    }
                })
            }
        });
    }
    
    else if(substract){
        User.find({username:name},function(err,data){
            if(err){
                console.log(err);
            }
            else if(data.length===0){
                console.log("no user");
            }
            else{
                const tokenNumber=data[0].token;
                const fullName=data[0].fullname;
                const village=data[0].village;
                const dateObj=new Date();
                var date=dateObj.getDate().toString();
                var month=(dateObj.getMonth()+1).toString();
                if(month.length===1){
                    month="0"+month;
                }
                if(date.length===1){
                    date="0"+date;
                }
                var year=dateObj.getFullYear().toString();
                var fullDate=date+"/"+month+"/"+year;
                var cc=true;
                Amount.find({token:tokenNumber},function(err,data){
                    if(err){
                        console.log(err);
                    }
                    else{
                        const totalSum=data[0].totalSum;
                        const totalAmount=parseFloat(totalSum)-parseFloat(amount);
                        if(totalAmount<0){
                            res.send("total amount is getting less than 0");
                            var cc=false;
                        }
                        else{
                            var cc=true;
                        }
                        if(cc){
                            Amount.updateOne({token:tokenNumber},{$push:{amount:amount,date:fullDate,cod:"debited"},totalSum:totalAmount},function(err,data){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    console.log("amount added");
                                }
                            })
                            Amount.find({token:tokenNumber},function(err,data){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    const money_list=data[0].amount;
                                    const date_list=data[0].date;
                                    const cod=data[0].cod;
                                    const total_remain=data[0].totalSum;
                                    res.render("data",{fullName:fullName,tokenNumbers:tokenNumber,village:village,money_list:money_list,date_list:date_list,cod:cod,totalSum:total_remain})
                                }
                            });
                        }
                    }
                })
            }
        });

    }
});
app.get("/tokenNumber",function(req,res){
    res.sendFile(__dirname+"/token.html");
});
app.post("/tokenNumber",function(req,res){
    const tokenNumber=req.body.token_number;
    const amount=req.body.money;
    const summary=req.body.summary;
    const add=req.body.add;
    const substract=req.body.substract;
    if(summary){
        User.find({token:tokenNumber},function(err,data){
            if(err){
                console.log(err);
            }
            else if(data.length===0){
                res.send("user with token number="+tokenNumber+" doesnt exist");
            }
            else{
                const username=data[0].username;
                const village=data[0].village;
                const fullName=data[0].fullName;
                Amount.find({token:tokenNumber},function(err,data){
                    if(err){console.log(err);}
                    else{
                        var money_list=data[0].amount;
                        var date_list=data[0].date;
                        var cod=data[0].cod;
                        var totalSum=data[0].totalSum;
                        res.render("data",{fullName:fullName,tokenNumbers:tokenNumber,village:village,money_list:money_list,date_list:date_list,cod:cod,totalSum:totalSum});
                    }
                })
            }
        })
    }
    else{
        User.find({token:tokenNumber},function(err,data){
            if(err){
                console.log(err);
            }
            else if(data.length===0){
                res.send("user with token number="+tokenNumber+" doesnt exist");
            }
            else{
                const username=data[0].username;
                const village=data[0].village;
                const fullName=data[0].fullName;
                const dateObj=new Date();
                var date=dateObj.getDate().toString();
                var month=(dateObj.getMonth()+1).toString();
                if(month.length===1){
                    month="0"+month;
                }
                if(date.length===1){
                    date="0"+date;
                }
                var year=dateObj.getFullYear().toString();
                var fullDate=date+"/"+month+"/"+year;
                Amount.find({token:tokenNumber},function(err,data){
                    if(err){
                        console.log("err");
                    }
                    else{
                        var totalSum=data[0].totalSum;
                        if(add){
                            var finalAmount=parseFloat(amount)+parseFloat(totalSum);
                            var cod2="credited";
                            var cc=true
                        }
                        if(substract){
                            if(totalSum-amount>=0){
                                var finalAmount=parseFloat(totalSum)-parseFloat(amount);
                                var cod2="debited";
                                var cc=true
                            }
                            else{
                                res.send("cant debit if debited will go less than 0... customer loss");
                                var cc=false;
                            }
                        }
                        if(cc){
                            Amount.updateOne({token:tokenNumber},{$push:{amount:amount,date:fullDate,cod:cod2},totalSum:finalAmount},function(err,data){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    console.log("credited or debited amount")
                                }
                            })
                        
                            Amount.find({token:tokenNumber},function(err,data){
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    var money_list=data[0].amount;
                                    var date_list=data[0].date;
                                    var cod=data[0].cod;
                                    var finalAmount=data[0].totalSum;
                                    res.render("data",{money_list:money_list,date_list:date_list,village:village,cod:cod,fullName:fullName,totalSum:finalAmount,tokenNumbers:tokenNumber});
                                }
                            })
                        }
                    }
                })
            }
        })
    }
});
app.get("/dateSort",function(req,res){
    res.render("dateSort");
});
app.post("/dateSort",async function(req,res){
    var fromDate=req.body.fromDate;
    var toDate=req.body.toDate;
    var today=req.body.today;

    var dateObj=new Date();
    var fDate=fromDate.slice(8,10)+"/"+fromDate.slice(5,7)+"/"+fromDate.slice(0,4);
    var tDate=toDate.slice(8,10)+"/"+toDate.slice(5,7)+"/"+toDate.slice(0,4);
    if(!fromDate){
        fromDate="0000-01-01"
        fDate=fromDate;
    }
    var date=dateObj.getDate().toString();
    var month=(dateObj.getMonth()+1).toString();
    if(date.length===1){
        date="0"+date;
    }
    if(month.length===1){
        month="0"+month;
    }
    if(!toDate){
        toDate=dateObj.getFullYear().toString()+"-"+month+"-"+date;
        tDate=toDate;
    }
    if(today){
        fromDate=dateObj.getFullYear().toString()+"-"+month+"-"+date;
        toDate=fromDate;
        fDate=toDate;
        tDate=toDate;
    }
    const final=[];                   //all users with their data
    let eachUser=[];                  //format: username,contact n.o,village,dates,money,cod,remaining balance
    let amounts=[];
    let dates=[];
    let cods=[];
    function fromToIndex(list,value1,value2){
        var v1=new Date(value1);
        var v2=new Date(value2);
        for(var i=1;i<list.length;i++){
            var checker=list[i].slice(6,10)+"-"+list[i].slice(3,5)+"-"+list[i].slice(0,2);
            var obj1=new Date(checker);
            if(+obj1>=+v1){
                break;
            }
        }
        for(var j=i;j<list.length;j++){
            var checker2=list[j].slice(6,10)+"-"+list[j].slice(3,5)+"-"+list[j].slice(0,2);
            var obj2=new Date(checker2);
            if(obj2>v2){
                break;
            }
        }
        

        return [i,j-1];
    }
    var output1=await Amount.find({},function(err,data){
        if(err){
            console.log(err);
        }
        else{
            output1=data;
        }
    });
    var totalRemains=0;
    for(var i=0;i<output1.length;i++){             //i denotes each user
        var token_number=output1[i].token;
        var output2=await User.find({token:token_number},function(err,data){
            if(err){
                console.log(err);
            }
            else{
                output2=data;
            }
        });
        var village=output2[0].village;
        var username=output2[0].username;
        var remains=output1[i].totalSum;
        var indexes=fromToIndex(output1[i].date,fromDate,toDate);
        for(var j=indexes[0];j<=indexes[1];j++){
            amounts.push(output1[i].amount[j]);
            dates.push(output1[i].date[j]);
            cods.push(output1[i].cod[j]);
        }
        if(dates.length!==0){
            eachUser.push(username);
            eachUser.push(token_number);
            eachUser.push(village);
            eachUser.push(remains);
            eachUser.push(dates);
            eachUser.push(amounts)
            eachUser.push(cods);                              
            totalRemains=totalRemains+remains;
            final.push(eachUser);
        }
        eachUser=[];
        amounts=[];
        dates=[];
        cods=[];

    }
    res.render("dateSortOut",{final:final,fDate:fDate,tDate:tDate,tRemains:totalRemains});
});

app.get("/villageSort",function(req,res){
    res.sendFile(__dirname+"/villageSort.html");
});

app.post("/villageSort",function(req,res){
    var village=req.body.village;
    if(village){
        User.find({village:village},async function(err,data){
            if(err){
                console.log(err);
            }
            else if(data.length===0){
                res.send("nothing found");
            }
            else{
                const usernames=[];
                const tokenNumbers=[];
                const totalAmount=[];
                var remains=0;
                for(var i=0;i<data.length;i++){
                    usernames.push(data[i].username);
                    tokenNumbers.push(data[i].token);
                    var token_number=data[i].token;
                    var output=await Amount.find({token:token_number},function(err,data){
                        if(err){
                            console.log(err);
                        }
                        else{
                            output=data;
                        }
                    });
                    totalAmount.push(output[0].totalSum);
                    remains=remains+output[0].totalSum;
                }
                res.render("villageSort",{village:village,usernames:usernames,tokenNumbers:tokenNumbers,totalAmount:totalAmount,remains:remains});
            }
        });
    }
});


app.listen(3000,function(){
    console.log("listening to port set");
});
