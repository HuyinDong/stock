var fs = require('fs');
var _ = require('lodash');
var iconv = require('iconv-lite');
var database = require('../database/mongodb');

//导入目录
var TEST = '/home/dongyin/stock/test/'

//读取文件夹每个文件信息
fs.readdir(TEST, (err, files) => {
  if (err) throw err;
  //循环读取每个文件
  files.forEach(function(file, index) {
    //根据文件名解析股票代码
    var code = file.split('#')[1].split('.')[0];
    var market = file.split('#')[0].toLowerCase();
    //读取单个文件信息
    fs.readFile(TEST + file, (err, data) => {

      var preValue;
      var temp = [];
      if (err) throw err;
      //中文解码
      var data = iconv.decode(data, 'gb2312');
      data = data.toString();
      var arr = data.split('\r\n');
      console.log(code);
      console.log(market);
      if (market == 'sh' && code[0] == '0' || market == 'sz' && code[1] == '9') {
        code = market + code;
      }
      arr = arr.slice(0, -2);
      var words = arr.shift();
      console.log(words.split(' '));
      //得到股票名称
      var name = words.split(' ')[1];
      //去掉最后的来自‘通达信’
      arr.shift();
      //只取数组的后40条数据
      arr = arr.length < 40 ? arr : arr.slice(Math.max(arr.length - 40, 1));
      //循环单只股票每天信息，按照固定格式保存，准备入库
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
          rate: preValue == 'undefined' ? 0 : ((close - preValue) / preValue * 100).toFixed(2) //保留两位小数点
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
      //入库
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