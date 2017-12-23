global.BASE_DIR = __dirname;
global.CONTROLLER = BASE_DIR + '/app/controller/';
global.ROUTER = BASE_DIR + '/app/router/';
global.DATABASE = BASE_DIR + '/app/database/';
global.SOLVERS = BASE_DIR + '/app/solvers/';
global.VIEW = BASE_DIR + '/app/view/';
global.CONFIG = BASE_DIR + '/config/';
global.PUBLIC = BASE_DIR + '/public/';

var express = require('express');
var router = require(ROUTER+'/router');
var app = express();
app.set('views', VIEW);
app.set('view engine', 'ejs');
app.use(express.static(PUBLIC));

router(app);

app.listen(3003, function() {
  console.log("Http server is running at port " + 3003 + ".");
});
