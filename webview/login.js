var koa = require('koa');
var app = koa();
var Router = require('koa-router');
var bodyparser = require('koa-bodyparser');
var views = require('co-views');
var router = new Router();
const logger = require('koa-logger'); //show post||get log 
const session = require('koa-session');
const static = require('koa-static')
const path = require('path')
const staticPath = './img/'

var request = require('request');
app.use(static(
    path.join(__dirname, staticPath)
))
app.keys = ['this is my secret'];
app.use(session({
    key: 'koa:sess', // cookie name
    maxAge: 720000, // (number) maxAge in ms (default is 1 days) 
    overwrite: true, //(boolean) can overwrite or not (default true) //
    httpOnly: true, // (boolean) httpOnly or not (default true) //
    signed: true, // (boolean) signed or not (default true) //
}, app));

// var MongoClient = require('mongodb').MongoClient;
// var ObjectId = require('mongodb').ObjectID;
// var db;
// MongoClient.connect("mongodb://localhost:27017/apple", function (err, pDb) {
//     if (err) {
//         return console.dir(err);
//     }
//     db = pDb;
// });
var render = views(__dirname, {
    map: {
        html: 'swig'
    }
});
app.use(bodyparser());

// Api
var login;
var user;
var userId = new Array();
var userName = new Array();
var userAccount = new Array();
var userCreatTime = new Array();
var tableNum = new Array();
var feedbackNum = new Array();
var devID = new Array();
var devUser = new Array();
var devTime = new Array();
var devNum = new Array();

var brandName = new Array();
var num = new Array();
var customerErr = new Array();
var customerMsg = new Array();
var customerID = new Array();
var customerTime = new Array();
var data = {
    userID: ""
}

var getApi = function getApi(done) {
    request.get('http://smart-factory.nutc-imac.com/user/information', {
        form: data
    }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error(err);
        }
        console.log('body', body);
        var userInfo = JSON.parse(body);
        for (key in userInfo) {
            userName[key] = userInfo[key]["userName"];
            userId[key] = userInfo[key]["userID"];
            userAccount[key] = userInfo[key]["account"];
            userCreatTime[key] = new Date(userInfo[key]["setTime"]).toDateString();
            tableNum[key] = key;
        }
        done();
    });


    request.get('http://smart-factory.nutc-imac.com/popular', {
        form: data
    }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error(err);
        }
        //console.log('body', body);
        var popular = JSON.parse(body);
        for (key in popular) {
            brandName[key] = popular[key]["brand"];
            num[key] = popular[key]["count"];
        }
        done();
    });
    request.get('http://smart-factory.nutc-imac.com/customer/opinion', {
        form: data
    }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error(err);
        }
        //console.log('body', body);
        var customerOpinion = JSON.parse(body);
        for (key in customerOpinion) {
            customerMsg[key] = customerOpinion[key]["customerMsg"];
            customerErr[key] = customerOpinion[key]["errMsg"];
            customerID[key] = customerOpinion[key]["userID"];
            customerTime[key] = new Date(customerOpinion[key]["setTime"]).toDateString();
            feedbackNum[key] = key;
            // console.log(customerTime[key]);
            // console.log(customerMsg[key]);
            // console.log(customerErr[key]);
            // console.log(customerID[key]);
        }
        done();
    });
}


// var define mongo showUser collections 

//show USER DATA FUNC
// var showUserInfo = function showUserInfo(done) {
//     var collection = db.collection('user');
//     collection.find({}).sort({
//         setTime: -1
//     }).toArray(function (err, data) {
//         // console.log(data);
//         for (var i = 0; i < data.length; i++) {
//             userId[i] = data[i]._id.toString(),
//                 userName[i] = data[i].userName,
//                 userAccount[i] = data[i].account,
//                 time[i] = new Date(data[i].setTime).toDateString(),
//                 tableNum[i] = i;
//         }
//         done();
//     });
// };
var showDevInfo = function showDevInfo(done) {
    var collection = db.collection('sensorLog');
    collection.find({}).sort({
        setTime: -1
    }).toArray(function (err, data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
            devID[i] = data[i].deviceID,
            devUser[i] = data[i].userID,
            devTime[i] = new Date(data[i].setTime).toDateString(),
            // time[i] = new Date(data[i].setTime).toDateString(),
            devNum[i] = i
            console.log(devID[i]);
            console.log(devUser[i]);
            console.log(devTime[i]);
        }
       
        done();
    });
};

router.get('/', function* () {
    this.body = yield render("index");
});
router.get('/admin', function* () {
    if (this.session.user) {
        yield getApi;
        // yield showUserInfo;
        // yield showDevInfo;
        this.body = yield render("admin", {
            // for html's var
            "userId": userId,
            "userName": userName,
            "userAccount": userAccount,
            "time": userCreatTime,
            "num": tableNum,
            "brand": brandName,
            "brandNum": num,
            "feedbackMsg":customerMsg,
            "feedbackErr":customerErr,
            "feedbackUser":customerID,
            "feedbackTime":customerTime,
            "feedbackNum":feedbackNum,
            "devID":devID,
            "devUser":devUser,
            "devTime":devTime,
            "devNum":devNum

        });
    } else {
        this.redirect("/");
    }
});

router.post('/', function* () {
    this.body = yield render("index");
    login = this.request.body;
    username = login['adminLogin'];
    psw = login['adminPassword'];
    if (username == 'Admin' && psw === 'password') {
        //保存登入狀態
        console.log(this.session);
        this.session.user = username;
        this.redirect("admin");
    } else {
        this.redirect("/");
    }

});

app.use(router.middleware());
app.listen(5500, function () {
    console.log('listening port 5500');
});