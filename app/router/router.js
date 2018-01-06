var IndexCtrl = require(CONTROLLER + 'indexCtrl');

module.exports = function(app) {
  app.get('/', IndexCtrl.getFn);
  app.get('/detail', IndexCtrl.getDetail);

  app.get('/stocks', IndexCtrl.getStockByCode);
  app.get('/models', IndexCtrl.getModelByType);
  app.get('/manystocks', IndexCtrl.getManyStocksBycodes);
  app.get('/allmodels', IndexCtrl.getModels);
  app.get('/stocks/type/date', IndexCtrl.getStcoksByDate);
  app.get('/previousstocks/type/date', IndexCtrl.getStcoksByPreviousDate);
};