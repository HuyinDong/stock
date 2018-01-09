var stock = angular.module('stock', []);
var dataset = [];
var table;
stock.controller('stockCtrl', function($scope, $http, $compile) {
  $scope.isVolumnHigherchecked = false;
  $scope.isVolumnHighestchecked = false;
  $http.get('/allmodels').then(function(data) {
    $scope.types = data.data;
  });
  var currentData;
  $scope.go = function() {
    var date = ($scope.date.getYear() + 1900) + "/" + ($scope.date.getMonth() + 1) + "/" + $scope.date.getDate();
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

      $http.get('/previousstocks/type/date', params).then(function(previousData) {
        console.log("1111data", data);
        console.log("previousData", previousData);
        data = data.data;
        previousData = previousData.data;
        var ratioValue = $("input[type=radio][name=selection]:checked").val();
        //对数据进行处理
        var chunkedData = chunkData(data, date);
        previousData = chunkData(previousData, date);
        console.log("ratiovalue", ratioValue);
        switch (ratioValue) {
          case 'all':

            break;
          case 'less':
            console.log("1");
            console.log(previousData);
            data = getLess(chunkedData, previousData);
            break;
          case 'more':
            data = getMore(chunkedData, previousData);
            break;
          case 'volumnHighest':
            var volumnHighest = $("input[type=text][name=volumnHighest]").val();

            data = getVolumnHighest(data, date, volumnHighest);
            break;
          case 'volumnHigher':
            var volumnHigher = $("input[type=text][name=volumnHigher]").val();
            console.log("1", $scope.isVolumnHigherchecked);
            console.log("2", $scope.isVolumnHighestchecked);
            data = getVolumnHigher(data, date, volumnHigher);
            break;
        }
        console.log("2");
        console.log("1111", data);
        //开始生成表格
        if (table) {
          table.destroy();
        }
        currentData = data;
        console.log("currentData", currentData);
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

  $scope.goDetail = function(code) {
    $('.modal-body').html(code);
    console.log("run");
    //$('.modal-body').modal('show', {backdrop: 'static'});
  }

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

  $("input[type=radio][name=selection]").change(function() {

    var value = $("input[type=radio][name=selection]:checked").val();

    if (value == 'volumnHigher') {
      $scope.isVolumnHigherchecked = true;
      $scope.isVolumnHighestchecked = false;
    } else if (value == 'volumnHighest') {
      $scope.isVolumnHigherchecked = false;
      $scope.isVolumnHighestchecked = true;
    } else {
      $scope.isVolumnHigherchecked = false;
      $scope.isVolumnHighestchecked = false;
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
    console.log("data222", data);
    var isFound = false;
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].data.length; j++) {
        console.log(data[i].data[j].date);
        console.log("date", date);
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

  function getLess(data, previousData) {
    return getDiff(previousData, data);
  };

  function getMore(data, previousData) {
    return getDiff(data, previousData);
  };

  function getVolumnHigher(data, date, volumnHigher) {
    console.log("volumnHigher", data);
    console.log(volumnHigher);
    return data;
  };

  function getVolumnHighest(data, date, volumnHighest) {
    console.log("volumnHighest", data);
    console.log(volumnHighest);
    return data;
  };

});

function getDiff(arr1, arr2) {
  console.log("arr2", arr2);
  var diff = [];
  var temp1 = arr1.sort();
  var temp2 = arr2.sort();
  console.log("temp1", temp1);
  console.log("temp2", temp2);
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

function calculateStatistics(data) {

};

function convertDataToCSV(data) {
  var csv = "";
  console.log("data,,,111", data);
  data.forEach(function(ele) {
    csv += ele.code + '\n';
  });
  return csv;
}