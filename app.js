const request = require('request')
var cron = require('node-cron');
var firebase = require("firebase");
firebase.initializeApp({
  serviceAccount: "line-thanapons-firebase-adminsdk-r2qly-4976068a30",
  databaseURL: "https://line-thanapons.firebaseio.com"
});
var db = firebase.database();
var ref = db.ref("/data");

//NETPIE
var MicroGear = require('microgear')

const KEY = 'uQHkfL7uxfYm9hv'
const SECRET = '4pP0RdTeIajLI38FaubzfTc7z'
const APPID = 'thanapon1195'
var microgear = MicroGear.create({
  gearkey: KEY,
  gearsecret: SECRET,
  alias: 'app'
});

microgear.on('connected', function () {
  console.log('Connected...');
  microgear.setname("APP");
  microgear.subscribe('/gearname/Count');
  microgear.subscribe('/gearname/mygear');
});
microgear.on('message', function (topic, body) {
  //console.log('incoming : '+topic+' : '+body);
  if (topic == '/thanapon1195/gearname/Count') {
    person = Number(body)
  }
  if (topic == '/thanapon1195/gearname/mygear') {
    power = Number(body)
    if (Number(body) > 0 && statusTask == false) {
      task.start();
    }
    if (Number(body) == 0) {
      if (sendStatus == true) {
        notic('ปิดไฟแล้ว')
      }
      task.stop();
      sendStatus = false
      statusTask = false
    }
  }
});

microgear.on('closed', function () {
  console.log('Closed...');
});

microgear.connect(APPID);
//end
var sec = 0
var person = 0
var power = 0
var sendStatus = false
var statusTask = false


var task = cron.schedule('*/5 * * * * *', () => {
  statusTask = true
  console.log('ตรวจสอบ');
  console.log('จำนวนคน: ', person, '  การใช้ไฟฟ้า: ', power.toString());
  console.log('การส่งข้อความ', sendStatus);
  if ((person < 0) && (power > 0) && (sendStatus == false)) {
    console.log('เริ่มจับเวลา');
    check.start();
    task.stop();
  }

}, {
  scheduled: false
});

var check = cron.schedule('*/1 * * * * *', () => {
  console.log(sec + ' วินาที');
  if (power == 0) {
    check.stop();
    sec = 0;
    console.log('หยุดจับเวลา');
  }
  if (sec == 20) {
    notic('มีไฟเปิดทิ้งไว้')
    sendStatus = true
    console.log(sendStatus);
    task.start();
    sec = 0;
    check.stop();

  }
  sec++
}, {
  scheduled: false
});



const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message";
const LINE_HEADER = {
  "Content-Type": "application/json",
  "Authorization": "Bearer {XbZT8OPxuekGYmEqqn8fCw1Fd9Q0MDezGsa2XkGoxrahQMBnNU8oSNDZKRZTMuZGOCaugwTZQP6kqhGVCHsCtaIFSuTrV3vjxjWf9zOtJqgXHCz4RS6r1NykSjhfBpatmp2gQ5bHKkmeIeXkOziA5wdB04t89/1O/w1cDnyilFU=}"
};



var d = new Date()
var data
ref.once("value", function(snapshot) {
  data = snapshot.val();
});

function notic(text) {
  return request({
    method: "POST",
    uri: `${LINE_MESSAGING_API}/push`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      to: data.room417.userId,
      messages: [{
        type: "text",
        text: text + '\n' + new Date()
      }]
    })
  }, (err, httpResponse, body) => {
    if (err) {
      console.log(err)
    } else {
      console.log(body)
    }
  })

}

