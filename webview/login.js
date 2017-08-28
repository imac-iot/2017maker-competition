var koa = require('koa');
var app = koa();
var Router = require('koa-router');
var bodyparser = require('koa-bodyparser');
var views = require('co-views');
var router = new Router();
const logger = require('koa-logger'); //show post||get log 
var LocalStrategy = require( 'passport-local' ).Strategy;

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
    console.log('123');
    var collection = db.collection('user');
    collection.find({}).sort( { insertTime: -1 } ).toArray(function (err, data) {
        console.log(data);
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
    yield showUserInfo;
    this.body = yield render("admin", {
        // for html's var
        "userId": userId, 
        "userName": userName,  
        "userAccount":userAccount,
        "time":time,
        "num": tableNum,
    });
});

router.post('/',function * (){
    this.body = yield render("index");
    login = this.request.body;
    user = login['adminLogin'];
    psw = login['adminPassword'];
    console.log('user:'+user+", password:"+ psw);
    if(user =="admin" && psw =="admin"){
        this.redirect('/admin');
    }else{
        console.log('password error!');
    }
});

app.use(router.middleware());
app.listen(3000,function(){
    console.log('listening port 3000');
});