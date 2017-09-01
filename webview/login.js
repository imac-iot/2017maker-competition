var koa = require('koa');
var app = koa();
var Router = require('koa-router');
var bodyparser = require('koa-bodyparser');
var views = require('co-views');
var router = new Router();
const logger = require('koa-logger'); //show post||get log 
const session=require('koa-session');
const static = require('koa-static')
const path = require('path')
const staticPath = './img/'
app.use(static(
    path.join( __dirname,staticPath)
  ))
app.keys = ['this is my secret']; 
app.use(session({
  key: 'koa:sess', // cookie name
  maxAge: 720000, // (number) maxAge in ms (default is 1 days) 
  overwrite: true, //(boolean) can overwrite or not (default true) //
  httpOnly: true, // (boolean) httpOnly or not (default true) //
  signed: true, // (boolean) signed or not (default true) //
},app));

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db;
MongoClient.connect("mongodb://localhost:27017/apple", function (err, pDb) {
    if (err) {
        return console.dir(err);
    }
    db = pDb;
});
var render = views(__dirname, {
    map : {html : 'swig'}
});
app.use(bodyparser());

var login;
var user,pwd;
var userId = new Array();
var userName = new Array();
var userAccount = new Array();
var time = new Array();
var tableNum = new Array();

//SHOW USER DATA FUNC
var showUserInfo = function showUserInfo(done) {
    var collection = db.collection('user');
    collection.find({}).sort( { insertTime: -1 } ).toArray(function (err, data) {
        //onsole.log(data);
        for (var i = 0; i < data.length; i++) {
            userId[i] = data[i]._id.toString(),
            userName[i] = data[i].userName,
            userAccount[i] = data[i].account,
            time[i] = data[i].insertTime
            tableNum[i] = i;
        }
      done();
     });
};


router.get('/',function * (){
    this.body = yield render("index");
});
router.get('/admin',function * (){
    //console.log('>>>>>>>>>>>>>>>>>>'+this.session.user);
    if (this.session.user ) {
        console.log('admin')
        yield showUserInfo;
        this.body = yield render("admin", {
            // for html's var
            "userId": userId, 
            "userName": userName,  
            "userAccount":userAccount,
            "time":time,
            "num": tableNum,
        });
     }
    else {
        this.redirect("/");
     }    
});

router.post('/',function * (){
    this.body = yield render("index");
    login = this.request.body;
    username = login['adminLogin'];
    psw = login['adminPassword'];
    if (username=='Admin'&&psw==='password') {
        //保存登入狀態
       console.log(this.session);
       this.session.user = username;
       this.redirect("admin");
   }
   else{
       this.redirect("/");
   }


    // console.log('user:'+user+", password:"+ psw);
    // if(user =="admin" && psw =="admin"){
    //     this.redirect('/admin');
    // }else{
    //     console.log('password error!');
    // }
});

app.use(router.middleware());
app.listen(3000,function(){
    console.log('listening port 3000');
});