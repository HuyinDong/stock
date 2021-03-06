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

IndexCtrl.prototype.getCamera = function(req, res, next) {
  res.render('camera');
};

IndexCtrl.prototype.getTest = function(req, res, next) {
  res.render('test');
};

IndexCtrl.prototype.getStockByCode = function(req, res, next) {
  var code = req.query.code;
  var promise = database.getStockByCode(code);
  promise.then(function(doc) {
    console.log("dpc", doc);
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
    console.log("stocks", doc);
    if (doc) {
      doc.forEach(function(ele, index) {
        if (ele.date == date) {
          console.log("index", index);
          console.log(doc[index - 1]);
          if (index == 0) {
            res.json({
              date: date,
              data: []
            });
            return;
          } else {
            database.getManyStocksBycodes(doc[index - 1].data).then(function(doc) {
              console.log("get previous by date run");
              res.json(doc);
            })
          }
        }
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
  console.log("run...");
  var promise = database.getStcoksByDate(type, date);
  promise.then(function(doc) {
    console.log("doc1", doc);
    if (doc) {
      var stocks = doc;
      //console.log("stocks", stocks);
      var ret = database.getManyStocksBycodes(stocks);
      console.log("asdasfasdasdasd");
      ret.then(function(doc2) {
        console.log(doc2.length);
        var count = 6;
        var isRun = false;
        // doc2.forEach(function(ele) {
        //   for (var info of ele.data) {
        //     if (info.date == date) {
        //       isRun = true;
        //     }
        //     if (isRun) {
        //       suitable.push(info);
        //       count--;
        //     }
        //     if (count < 0) {
        //       isRun = false;
        //       //console.log(suitable);
        //       info.data = suitable;
        //       suitable = [];
        //       count = 6;
        //       break;
        //     }
        //   }
        // })
        console.log("doc2", doc2);

        res.json(doc2);
      });
    } else {
      console.log("null run");
      res.json({
        data: ''
      })
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

IndexCtrl.prototype.getMylife = function(req, res, next) {
  res.render('mylife');
}

IndexCtrl.prototype.getLife = function(req, res, next) {
  database.getLife().then(function(doc) {
    res.json(doc);
  });
}

IndexCtrl.prototype.insertLife = function(req, res, next) {
  date = new Date();
  var point = parseInt(req.query.point);
  var desc = req.query.desc;
  console.log(req.query);
  var obj = {
    date: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
    point: point,
    desc: desc
  };
  database.insertLife(obj);
  res.json({
    msg: 'ok'
  });
}
module.exports = new IndexCtrl();