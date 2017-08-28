var koa = require('koa');
var Router = require('koa-router')
var bodyParser = require('koa-bodyparser');
var MongoClient = require('mongodb').MongoClient;

var app = koa();
app.use(bodyParser());

var router = new Router();
var db;

MongoClient.connect("mongodb://localhost:27017/apple",function(err,pDb){
  if(err){
    return console.dir(err);
  }
  db = pDb;
});

router.post('/create/user',createUser);
router.post('/login',login);
router.post('/sensor/create',createSensor);
router.post('/sensor/status',sensorStatus);
router.post('/sensor/update',sensorUpdate);
router.get('/mbed/:sensor_1/:w1/:sensor_2/:w2/:sensor_3/:w3/:sensor_4/:w4/',mbedSensor);

function * createUser(){
  var request = this.request.body;
  var userName = request.userName;
  var account = request.account;
  var password = request.password;
  var collection = db.collection('user');
  var judgmentAccount = yield collection.find({account:account}).toArray();
  if(judgmentAccount != ""){
    this.body = {message:"此信箱已註冊"};
    console.log(1);
  }else{
    if(userName != "" && account != "" && password != ""){
      var data = {
        userName : userName,
        account : account,
        password : password
      }
      yield collection.insert(data);
      this.body = {message:"成功"};
    }else{
      this.body = {message:"輸入格式錯誤"};
    }
  }
  console.log(userName,account,password);
}

function * login(){
  var request = this.request.body;
  var account = request.account;
  var password = request.password;
  var collection = db.collection('user');
  var judgmentAccount = yield collection.findOne({account:account,password:password});
  if(judgmentAccount != null){
    this.body = {
      message : "成功",
      userName : judgmentAccount.userName,
      userID : judgmentAccount._id
    }
  }else{
    this.body = {
      message : "查無此用戶",
      userName : "",
      userID : ""
    }
  }
}

function * createSensor(){
  var request = this.request.body;
  var userID = request.userID;
  var sensorID = request.sensorID;
  var containerName = request.containerName;
  var collection = db.collection('sensor');
  var sensorStatus = yield collection.findOne({sensorID:sensorID});
  if(sensorStatus == null){
    if(userID != "" && sensorID != "" && containerName != ""){
      var data = {
        userID : userID,
        sensorID : sensorID,
        containerName : containerName,
        weight : 100
      }
      yield collection.insert(data);
      this.body = {
        message : "成功"
      }
    }else{
      this.body = {
        message : "失敗"
      }
    }
  }else {
    this.body = {
      message : "此裝置已註冊"
    }
  }
}

function * sensorStatus(){
  var request = this.request.body;
  var userID = request.userID;
  var collection = db.collection('sensor');
  var sensorStatus = yield collection.find({userID:userID}).toArray();
  var data = new Array();
  yield function(done){
    for(var i=0 ; i<sensorStatus.length ; i++){
      let sensorData = {
        sensorID : sensorStatus[i].sensorID,
        containerName : sensorStatus[i].containerName,
        percent : sensorStatus[i].weight
      }
      data.push(sensorData);
    }
    done();
  }

  this.body = {
    data : data
  }
}

function * sensorUpdate(){
  var request = this.request.body;
  var userID = request.userID;
  var sensorID = request.sensorID;
  var containerName = request.containerName;
  var collection = db.collection('sensor');
  var sensorStatus = yield collection.findOne({sensorID:sensorID});
  if(userID != "" && sensorID != "" && containerName != ""){
    yield collection.update({sensorID:sensorID},{
      '$set': {
          'containerName': containerName
      }
    });
    this.body = {
      message : "成功"
    }
  }else{
    this.body = {
      message : "失敗"
    }
  }
}

function * mbedSensor(){
  var collection = db.collection('sensor');
  yield collection.update({sensorID:this.params.sensor_1},{
    '$set': {
        'weight': this.params.w1/1000
    }
  });
  yield collection.update({sensorID:this.params.sensor_2},{
    '$set': {
        'weight': this.params.w2/1000
    }
  });
  yield collection.update({sensorID:this.params.sensor_3},{
    '$set': {
        'weight': this.params.w3/1000
    }
  });
  yield collection.update({sensorID:this.params.sensor_4},{
    '$set': {
        'weight': this.params.w4/1000
    }
  });
  this.body = {
    R_1:this.params.w1/1000*100,
    R_2:this.params.w2/1000*100,
    R_3:this.params.w3/1000*100,
    R_4:this.params.w4/1000*100
  }
}

app.use(router.middleware());
app.listen(3000,function(){
  console.log('listening port on 3000');
});
