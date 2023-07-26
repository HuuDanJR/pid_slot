const historyModel = require('./schema_mongo/history_schema')


const listHistoryKiosk =async (req, res, next) => {
  console.log('create_history_kiosk');

    try {
        const data = await historyModel.find().exec();
        if (data == null || data.length === 0) {
            res.status(404).json({ "status": false, "message": "find list history kiosk fail", "totalResult": null, "data": data, });
        } else {
            res.json({ "status": true, "message": "find list promotion success", "totalResult": data.length, "data": data });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ "status": false, "message": "find list history kiosk fail", "totalResult": null, "data": data, });
        next(err);
    }
}

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
createHistoryKiosk:createHistoryKiosk,
listHistoryKiosk:listHistoryKiosk,
}