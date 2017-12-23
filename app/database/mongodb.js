var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var database;

function Mongodb() {
  MongoClient.connect("mongodb://localhost:27017/stock", function(err, dbb) {
    if (dbb == null) {
      console.log("连接数据库不成功。仅能使用缓存功能。");
      return -1;
    }
    database = dbb;
    //console.log("连接库成功");
  });
};

/**
 *数据库连接构造函数
 */
function connection(callback) {
  if (!database) {
    MongoClient.connect("mongodb://localhost:27017/stock", function(err, dbb) {
      if (dbb == null) {
        console.log("连接数据库不成功。仅能使用缓存功能。");
        return -1;
      }
      database = dbb;
      callback(database);
      //sserver.sserverInitial();
      //console.log("database info:", database);
      //console.log("连接库成功");
    });
  } else {
    console.log("数据库已连接");
    callback(database);
  }
};

Mongodb.prototype.insertItem = function(obj) {
  connection(function(database) {
    database.collection('stock').insert(obj);
  });
};

Mongodb.prototype.insertItemByCode = function(code, obj) {
  connection(function(database) {
    database.collection('stock').update({
      code: code
    }, {
      $push: {
        data: obj
      }
    });
  });
};


Mongodb.prototype.getAllCodes = function() {
  return new Promise(function(resolve, reject) {
    connection(function(database) {
      database.collection('stock').find({}, {
        code: 1
      }).toArray().then(function(doc) {
        resolve(doc);
      });
    });
  });
}

Mongodb.prototype.getStockByCode = function(code) {
  return new Promise(function(resolve, reject) {
    connection(function(database) {
      database.collection('stock').find({
        code: code
      }).toArray().then(function(doc) {
        resolve(doc);
      });
    });
  });
};

Mongodb.prototype.getManyStocksBycodes = function(arr) {
  return new Promise(function(resolve, reject) {
    connection(function(database) {
      database.collection('stock').find({
        code: {
          $in: arr
        }
      }).toArray().then(function(doc) {
        resolve(doc);
      });
    });
  });
};

Mongodb.prototype.getModelByType = function(type) {
  return new Promise(function(resolve, reject) {
    connection(function(database) {
      database.collection('model').find({
        type: type
      }).toArray().then(function(doc) {
        console.log("doc", doc);
        resolve(doc);
      });
    });
  });
}

Mongodb.prototype.getModels = function() {
  return new Promise(function(resolve, reject) {
    connection(function(database) {
      database.collection('model').find({}, {
        type: 1
      }).toArray().then(function(doc) {
        console.log(doc);
        resolve(doc);
      });
    });
  });
}

Mongodb.prototype.getStcoksByDate = function(type, date) {
  console.log("date", date);
  return new Promise(function(resolve, reject) {
    connection(function(database) {
      database.collection('model').find({
          type: type
        }, {
          stocks: {
            $elemMatch: {
              date: date
            }
          }
        })
        .toArray().then(function(doc) {
          if (doc) {
            resolve(doc[0].stocks[0].data);
          } else {
            resolve([]);
          }

        });
    });
  });
}

module.exports = new Mongodb();