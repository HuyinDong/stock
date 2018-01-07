var database = require(DATABASE + 'mongodb');
var _ = require('lodash');

function IndexCtrl() {

}

IndexCtrl.prototype.getFn = function(req, res, next) {
  res.render('index');
};

IndexCtrl.prototype.getDetail = function(req, res, next) {
  res.render('detail');
};

IndexCtrl.prototype.getStockByCode = function(req, res, next) {
  var code = req.query.code;
  var promise = database.getStockByCode(code);
  promise.then(function(doc) {
    res.json(doc);
  });
};

IndexCtrl.prototype.getModelByType = function(req, res, next) {
  var type = req.query.type;
  console.log("type", type);
  var promise = database.getModelByType(type);
  promise.then(function(doc) {
    res.json(doc);
  });
}

IndexCtrl.prototype.getManyStocksBycodes = function(req, res, next) {
  var arr = [];
  var promise = database.getManyStocksBycodes(arr);
  promise.then(function(doc) {
    res.json(doc);
  });
}

IndexCtrl.prototype.getStcoksByPreviousDate = function(req, res, next) {
  var type = req.query.type;
  var date = req.query.date;
  var promise = database.getModelByType(type);
  promise.then(function(doc) {
    console.log(doc.stocks);
    if (doc) {
      doc[0].stocks.forEach(function(ele, index) {
        if (ele.date == date) {
          console.log("index", index);
          res.json(doc[0].stocks[index - 1]);
          return;
        }
      });
      res.json({
        date: date,
        data: []
      });
    } else {
      res.json({
        date: date,
        data: []
      });
    }
  });
}

IndexCtrl.prototype.getStcoksByDate = function(req, res, next) {
  var type = req.query.type;
  var date = req.query.date;
  var suitable = [];
  // var arr = date.split('/');
  // var month = parseInt(arr[1]) < 10 ? '0' + arr[1] : arr[1];
  // var day = parseInt(arr[2]) < 10 ? '0' + arr[2] : arr[2];
  // date = arr[0] + "/" + month + "/" + day;
  var promise = database.getStcoksByDate(type, date);
  promise.then(function(doc) {
    if (doc) {
      var stocks = doc;
      console.log(stocks);
      var ret = database.getManyStocksBycodes(stocks);
      ret.then(function(doc2) {
        //   var count = 6;
        //   var isRun = false;
        //   doc2.forEach(function(ele){
        //       for (var info of ele.data) {
        //       if(info.date == date){
        //         isRun = true;
        //       }
        //       if(isRun){
        //         suitable.push(info);
        //         count--;
        //       }
        //       if(count <0){
        //         isRun = false;
        //         console.log(suitable);
        //         info.data = suitable;
        //         suitable = [];
        //         count = 6;
        //         break;
        //       }
        //     }
        //   })
        res.json(doc2);
      });
    }
  });
}

IndexCtrl.prototype.getModels = function(req, res, next) {
  var promise = database.getModels();
  promise.then(function(doc) {
    console.log(doc);
    res.json(doc);
  });
}


module.exports = new IndexCtrl();