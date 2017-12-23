var needle = require('needle');
var database = require('../database/mongodb');
var iconv = require('iconv-lite');
var codes = database.getAllCodes();
var errorCode = [];
// codes.then(function(doc){
//   doc.forEach(function(ele){
//
//       (function(ele) {
var i = 0;
var k = 0;
var j = 0;
while (i < 1000) {
  console.log('run while' + i);
  var code = '300100';
  code = code.charAt(0) == '6' ? 'sh' + code : 'sz' + code;

  needle.get('http://hq.sinajs.cn/list=' + code, function(error, response) {
    console.log(response == 'undefined');
    if (!error && response.statusCode == 200) {
      var data = iconv.decode(response.body, 'gb2312');
      var stockInfo;
      if (data) {
        stockInfo = data.split(',');
      }
      var open = parseFloat(stockInfo[1]);
      var high = parseFloat(stockInfo[4]);
      var low = parseFloat(stockInfo[5]);
      var close = parseFloat(stockInfo[3]);
      var preValue = parseFloat(stockInfo[2]);
      var obj = {
        date: stockInfo[30],
        open: open,
        high: high,
        low: low,
        close: close,
        vol: stockInfo[9],
        rate: ((close - preValue) / preValue * 100).toFixed(2)
      };
      console.log(obj);
      sleep(200);
      console.log('run correct ', ++j);
      console.log('errorcode', errorCode.length);
      //database.insertItemByCode(ele.code,obj);
    } else {
      console.log("run" + ++k);
      errorCode.push(code);
      console.log('errorcode', errorCode.length);
    }
  });
  i++;

}
// })(ele);

// });

// });


function sleep(ms) {
  var unixtime_ms = new Date().getTime();
  while (new Date().getTime() < unixtime_ms + ms) {}
}