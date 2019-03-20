var IndexCtrl = require(CONTROLLER + 'indexCtrl');

module.exports = function(app) {
  app.get('/', IndexCtrl.getFn);
  app.get('/detail', IndexCtrl.getDetail);
  app.get('/camera', IndexCtrl.getCamera);
  app.get('/test', IndexCtrl.getTest);

  app.get('/stocks', IndexCtrl.getStockByCode);
  app.get('/models', IndexCtrl.getModelByType);
  app.get('/manystocks', IndexCtrl.getManyStocksBycodes);
  app.get('/allmodels', IndexCtrl.getModels);
  app.get('/stocks/type/date', IndexCtrl.getStcoksByDate);
  app.get('/previousstocks/type/date', IndexCtrl.getStcoksByPreviousDate);

  app.get('/mylife', IndexCtrl.getMylife);
  app.get('/getlife', IndexCtrl.getLife);
  app.get('/insertlife', IndexCtrl.insertLife);
};