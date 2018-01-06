var stock = angular.module('stock', []);
var dataset = [];
var table;
stock.controller('stockCtrl', function($scope, $http, $compile) {
  $scope.isVolumnHigherchecked = false;
  $scope.isVolumnHighestchecked = false;
  $http.get('/allmodels').then(function(data) {
    $scope.types = data.data;
  });

  $scope.go = function() {
    var date = ($scope.date.getYear() + 1900) + "/" + ($scope.date.getMonth() + 1) + "/" + $scope.date.getDate();
    var arr = date.split('/');
    var month = parseInt(arr[1]) < 10 ? '0' + arr[1] : arr[1];
    var day = parseInt(arr[2]) < 10 ? '0' + arr[2] : arr[2];
    date = arr[0] + "/" + month + "/" + day;
    $http.get('/stocks/type/date', {
      params: {
        type: $scope.type,
        date: date
      }
    }).then(function(data) {
      var data = data;
      var ratioValue = $("input[type=radio][name=selection]:checked").val();
      //对数据进行处理
      switch (ratioValue) {
        case 'all':
          data = getAll(data, date);
          break;
        case 'less':
          data = getLess(data, date);
          break;
        case 'more':
          data = getMore(data, date);
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



      //开始生成表格
      if (table) {
        table.destroy();
      }
      console.log("data", data);
      table = $('#ongoing').DataTable({
        data: data.data,
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
              var ccode = _.find(data.data, function(ele) {
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
  };

  $scope.goDetail = function(code) {
    $('.modal-body').html(code);
    console.log("run");
    //$('.modal-body').modal('show', {backdrop: 'static'});
  }

  $("input[type=radio][name=selection]").change(function() {
    console.log("run");
    var value = $("input[type=radio][name=selection]:checked").val();
    console.log(value);
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
    console.log("1", $scope.isVolumnHigherchecked);
    console.log("2", $scope.isVolumnHighestchecked);
  });


});

function getAll(data, date) {
  for (var i = 0; i < data.data.length; i++) {
    for (var j = 0; j < data.data[i].data.length; j++) {
      console.log(data.data[i].data[j].date);
      console.log("date", date);
      if (data.data[i].data[j].date == date) {
        data.data[i].data = data.data[i].data.slice(j, j + 6);
        break;
      }
    }
    var length = data.data[i].data.length;
    var m = 0;
    while (m < 6 - length) {
      data.data[i].data.push({
        rate: 'null',
        close: 'null',
        high: 'null',
        open: 'null',
        low: 'null'
      });
      m++;
    }
  }
  return data;
}

function getLess(data, date) {
  console.log("less", data);
  return data;
};

function getMore(data, date) {
  console.log("more", data);
  return data;
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

function calculateStatistics(data) {

};