

    function hello(){

    };

  // Iterate the array.
  hello.prototype.each = function(arr,callback){
      if(arr instanceof Array){
    for(var i = 0 ; i < arr.length; i ++){
        callback(arr[i]);
      }
    }else{
      for(var property in arr){
        callback(property,arr[property]);
      }
}
};

  // Return the results of applying the iteratee to each element.
  hello.prototype.map = function(arr,callback){
    var one = [];
    console.log(arguments);
    console.log(arr instanceof Array);
    if(!(arr instanceof Array)){
      for(var property in arr){
        one.push(callback(property,arr[property]));
      }
    }else{
    for(var i = 0 ; i<arr.length;i++){
       one.push(callback(arr[i]));
     }
    }
    return one;
  };

  hello.prototype.pluck = function(arr,key){
      var three = [];
      _.each(arr,function(ele){
        three.push(ele[key]);
      });
      return three;
  };

  hello.prototype.sortBy = function(arr,callback){
    var two = [];
    return _.pluck(_.map(arr,function(ele){
      return {
        criteria : callback(ele),
        value : ele
      };
    }).sort(function(a,b){
      return a.criteria-b.criteria;
    }),'value');

  };
var _ = new hello();
