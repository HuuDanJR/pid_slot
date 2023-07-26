const historyModel = require('./schema_mongo/history_schema')


const createHistoryKiosk = async (req, res, next) => {
  console.log('create_history_kiosk');
  const pointKiosk = new historyModel(req.body);
  const message = 'created new point';

  try {
    const existingData = await historyModel.findOne({ id: pointKiosk.id }).exec();
    if (existingData) {
      res.send({ "status": false, "message": "Failed to create pointKiosk", "data": null });
    } else {
      const savedData = await pointKiosk.save();
      res.send({ "status": true, "message": message, "data": savedData });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error while ${message}: ${error}` });
    next(error);
  }
};

module.exports={
createHistoryKiosk:
}