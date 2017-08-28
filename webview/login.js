var koa = require('koa');
var app = koa();
var Router = require('koa-router');
var bodyparser = require('koa-bodyparser');
var views = require('co-views');
var router = new Router();
const logger = require('koa-logger'); //show post||get log 
var LocalStrategy = require( 'passport-local' ).Strategy;
// mongodb
// var mongodb = require('mongodb');
// var mongodbServer = new mongodb.Server('localhost', 27017, {
//     auto_reconnect: true,
//     poolSize: 10
// });
//var db = new mongodb.Db('dbname', mongodbServer); // use 'dbname' db
var render = views(__dirname, {
    map : {html : 'swig'}
});
app.use(bodyparser());

var login;
var user , pwd ;

router.get('/',function * (){
    this.body = yield render("index");
});
router.get('/admin',function * (){
    this.body = yield render("admin");
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