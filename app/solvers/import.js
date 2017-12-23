var fs = require('fs');
var _ = require('lodash');
var iconv = require('iconv-lite');
var database = require('../database/mongodb');


var TEST = '/home/dongyin/stock/test/'

fs.readdir(TEST, (err, files) => {
  if (err) throw err;
  files.forEach(function(file, index) {

    var code = file.split('#')[1].split('.')[0];
    fs.readFile(TEST + file, (err, data) => {
      var preValue;
      var temp = [];
      if (err) throw err;
      var data = iconv.decode(data, 'gb2312');
      data = data.toString();
      var arr = data.split('\r\n');
      arr = arr.slice(0, -2);
      var words = arr.shift();
      console.log(words.split(' '));
      var name = words.split(' ')[1];
      arr.shift();
      arr = arr.length < 40 ? arr : arr.slice(Math.max(arr.length - 40, 1));
      arr.forEach(function(ele) {
        var stockInfo = ele.split(',');
        var open = parseFloat(stockInfo[1]);
        var high = parseFloat(stockInfo[2]);
        var low = parseFloat(stockInfo[3]);
        var close = parseFloat(stockInfo[4]);
        var obj = {
          date: stockInfo[0],
          open: open,
          high: high,
          low: low,
          close: close,
          vol: stockInfo[6],
          rate: preValue == 'undefined' ? 0 : ((close - preValue) / preValue * 100).toFixed(2)
        }
        temp.push(obj);
        preValue = close;
      });
      var stock = {
        code: code,
        name: name,
        data: temp
      }
      console.log(stock);
      database.insertItem(stock);
    });
  });
});



// fs.readFile('/home/dongyin/stock/test/SH#600000.txt',(err, data) => {
//   var preValue;
//   var temp = [];
//   if (err) throw err;
//   var data =  data.toString();
//   var arr = data.split('\r\n');
//   arr = arr.slice(0, -2)
//   arr = arr.slice(Math.max(arr.length -40 , 1));
//   console.log(arr);
//   arr.forEach(function(ele){
//     var stockInfo = ele.split(',');
//     var open = parseFloat(stockInfo[1]);
//     var high = parseFloat(stockInfo[2]);
//     var low = parseFloat(stockInfo[3]);
//     var close = parseFloat(stockInfo[4]);
//     var obj = {
//       date : stockInfo[0],
//       open:open,
//       high:high,
//       low:low,
//       close:close,
//       vol:stockInfo[6],
//       rate: preValue == 'undefined'? 0:((close-preValue)/preValue * 100).toFixed(2)
//     }
//     temp.push(obj);
//     preValue = close;
//   });
//   var stock = {
//     code : '600000',
//     data : temp
//   }
//   console.log(stock);
// });