var stock = angular.module('stock', []);
var dataset = [];
var table;
stock.controller('stockCtrl', function($scope, $http, $compile) {
  $scope.isVolumnHigherchecked = false;
  $scope.isVolumnHighestchecked = false;
  $http.get('/allmodels').then(function(data) {
    console.log("type", data);
    $scope.types = data.data;
  });
  //储存列表数据
  var currentData;
  $scope.go = function() {
    var date = ($scope.date.getYear() + 1900) + "/" + ($scope.date.getMonth() + 1) + "/" + $scope.date.getDate() || '2018/01/01';
    var arr = date.split('/');
    var month = parseInt(arr[1]) < 10 ? '0' + arr[1] : arr[1];
    var day = parseInt(arr[2]) < 10 ? '0' + arr[2] : arr[2];
    date = arr[0] + "/" + month + "/" + day;
    var params = {
      params: {
        type: $scope.type,
        date: date
      }
    };
    $http.get('/stocks/type/date', params).then(function(data) {
      if (data.data.length == 0) {
        alert("无数据");
      }
      $http.get('/previousstocks/type/date', params).then(function(previousData) {
        console.log("prev", previousData);
        data = data.data || [];
        previousData = previousData.data.data ? [] : previousData.data;
        var ratioValue = $("input[type=radio][name=selection]:checked").val();
        //对数据进行处理
        var chunkedData = chunkData(data, date);

        previousData = chunkData(previousData, date);
        switch (ratioValue) {
          case 'all':
            console.log("all run");
            break;
          case 'less':
            data = getLess(chunkedData, previousData);
            break;
          case 'more':
            data = getMore(chunkedData, previousData);
            break;
          case 'volumnHighest':
            var volumnHighest = $("input[type=text][name=volumnHighest]").val();
            data = getVolumnHighest(data, volumnHighest);
            break;
          case 'volumnHigher':
            var volumnHigher = $("input[type=text][name=volumnHigher]").val();
            data = getVolumnHigher(data, volumnHigher);
            break;
        }

        //开始生成表格
        if (table) {
          table.destroy();
        }
        console.log("data", data);
        currentData = data;
        table = $('#ongoing').DataTable({
          data: data,
          // order: [
          //     [2, "desc"]
          // ],

          "pagingType": "full_numbers",
          columns: [{
              "data": "code",
              "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                $(nTd).html(date);
              }
            }, {
              "data": "code"
            },
            {
              "data": "name",
              "width": "8%",
              "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                var ccode = _.find(data, function(ele) {
                  return ele.code == oData.code;
                })
                var url = "JavaScript:newPopup('/detail?code=" + ccode.code + "&date=" + date + "');";
                $(nTd).html("<a href=" + url + ">" + oData.name + "</a>");
              }
            }, {
              "data": "data.0.rate"
            }, {
              "data": "data.1.rate"
            }, {
              "data": "data.2.rate"
            }, {
              "data": "data.3.rate"
            }, {
              "data": "data.4.rate"
            }, {
              "data": "data.5.rate"
            }, {
              "data": "data.1.open"
            }, {
              "data": "data.2.high"
            }, {
              "data": "data.5.close"
            }
          ]
        });
      });

    });
  };

  //跳转查看明细
  $scope.goDetail = function(code) {
    $('.modal-body').html(code);
    //$('.modal-body').modal('show', {backdrop: 'static'});
  }

  //将入选股票转化为csv格式下载
  $scope.downloadCSV = function(args) {
    var data, filename, link;
    var csv = convertDataToCSV(currentData);
    if (csv == null) return;
    filename = args.filename || 'export.csv';
    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  };

  //当选项改变的时候运行该事件
  $("input[type=radio][name=selection]").change(function() {
    var value = $("input[type=radio][name=selection]:checked").val();
    if (value == 'volumnHigher') {
      $scope.$apply(function() {
        $scope.isVolumnHigherchecked = true;
        $scope.isVolumnHighestchecked = false;
      });
    } else if (value == 'volumnHighest') {
      $scope.$apply(function() {
        $scope.isVolumnHigherchecked = false;
        $scope.isVolumnHighestchecked = true;
      });
    } else {
      $scope.$apply(function() {
        $scope.isVolumnHigherchecked = false;
        $scope.isVolumnHighestchecked = false;
      });
    }
  });

  // function getAll(data, date) {
  //   for (var i = 0; i < data.data.length; i++) {
  //     for (var j = 0; j < data.data[i].data.length; j++) {
  //       console.log(data.data[i].data[j].date);
  //       console.log("date", date);
  //       if (data.data[i].data[j].date == date) {
  //         data.data[i].data = data.data[i].data.slice(j, j + 6);
  //         break;
  //       }
  //     }
  //     var length = data.data[i].data.length;
  //     var m = 0;
  //     while (m < 6 - length) {
  //       data.data[i].data.push({
  //         rate: 'null',
  //         close: 'null',
  //         high: 'null',
  //         open: 'null',
  //         low: 'null'
  //       });
  //       m++;
  //     }
  //   }
  //   return data;
  // }

  //截取输入日期之后6日的数据，如果不足的补足为空
  function chunkData(data, date) {
    var isFound = false;
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].data.length; j++) {
        if (data[i].data[j].date == date) {
          data[i].data = data[i].data.slice(j, j + 6);
          isFound = true;
          break;
        }
      }
      //若没找到，说明停牌了
      if (!isFound) {
        data[i].data = [];
      }

      var length = data[i].data.length;
      var m = 0;
      while (m < 6 - length) {
        data[i].data.push({
          rate: 'null',
          close: 'null',
          high: 'null',
          open: 'null',
          low: 'null'
        });
        m++;
      }
      isFound = false;
    }
    return data;
  }

  //当选择‘相比昨天减少的股’时运行
  function getLess(data, previousData) {
    return getDiff(previousData, data);
  };

  //当选择'相比昨天增加的股'时运行
  function getMore(data, previousData) {
    return getDiff(data, previousData);
  };

  //当选择'成交量高于多少'时运行
  function getVolumnHigher(data, volumnHigher) {
    data.sort(function(a, b) {
      var valueA = a.data[0].vol || 0;
      var valueB = b.data[0].vol || 0;
      if (valueA < valueB) {
        return 1;
      }
      if (valueA > valueB) {
        return -1;
      }
      // names must be equal
      return 0;
    });
    for (var i = 0; i < data.length; i++) {
      if (data[i].data[0].vol < parseInt(volumnHigher)) {
        break;
      }
    }
    data = data.slice(0, i);
    return data;
  };

  //当选择'成交量排名前多少'时运行
  function getVolumnHighest(data, volumnHighest) {

    data.sort(function(a, b) {
      var valueA = parseFloat(a.data[0].vol) || 0;
      var valueB = parseFloat(b.data[0].vol) || 0;

      if (valueA < valueB) {
        return 1;
      }
      if (valueA > valueB) {
        return -1;
      }
      // names must be equal
      return 0;
    });
    // var test = _.sortBy(data, parseFloat(data[0].vol));
    // console.log("test", test);
    data = data.slice(0, parseInt(volumnHighest));
    return data;
  };
});

//找出两个数组中不同的项
function getDiff(arr1, arr2) {

  var diff = [];
  var temp1 = arr1.sort();
  var temp2 = arr2.sort();
  var isIn = false;
  for (var i = 0; i < temp1.length; i++) {
    for (var j = 0; j < temp2.length; j++) {
      if (temp2[j].code == temp1[i].code) {
        isIn = true;
      }
    }
    if (!isIn) {
      diff.push(temp1[i]);
    }
    isIn = false;
  }
  return diff;
}

//统计用，现在还没写
function calculateStatistics(data) {

};

//将列表数据转换为csv格式
function convertDataToCSV(data) {
  var csv = "";
  data.forEach(function(ele) {
    if (ele.code[0] == '6') {
      // 将格式转换为直接覆盖通达信软件的格式，上证股票前面加1,深证前面加0
      csv += '1' + ele.code + '\n';
    } else {
      csv += '0' + ele.code + '\n';
    }

  });
  return csv;
}