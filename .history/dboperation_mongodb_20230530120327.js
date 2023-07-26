const historyModel = require('./schema_mongo/history_schema')


const listHistoryKioskAll=async (req, res, next) => {
  console.log('list_History_Kiosk');
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



const listHistoryKioskPaging = async (req, res, next) => {
  console.log('list_History_Kiosk');
  //HOW TO USE => /api/list_history_kiosk?_start={startIndex}&_limit={limit}
  try {
    const { _start, _limit } = req.query;
    const startIndex = parseInt(_start) || 0;
    const limit = parseInt(_limit) || 10;

    const countPromise = historyModel.countDocuments().exec();
    const dataPromise = historyModel.find().skip(startIndex).limit(limit).exec();

    const [count, data] = await Promise.all([countPromise, dataPromise]);

    if (data == null || data.length === 0) {
      res.status(404).json({
        status: false,
        message: 'find list history kiosk fail',
        totalResult: null,
        data: data,
      });
    } else {
      res.json({
        status: true,
        message: 'find list promotion success',
        totalResult: count,
        data: data,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: 'find list history kiosk fail',
      totalResult: null,
      data: data,
    });
    next(err);
  }
};


const listHistoryKioskPaging2 = async (req, res, next) => {
  console.log('list_History_Kiosk2');
  //HOW TO USE => /api/list_history_kiosk?_start={startIndex}&_limit={limit}
  try {
    const { _start, _limit } = req.query;
    const startIndex = parseInt(_start) || 0;
    const limit = parseInt(_limit) || 10;

    const countPromise = historyModel.countDocuments().exec();
    const dataPromise = historyModel.find().skip(startIndex).limit(limit).exec();

    const [count, data] = await Promise.all([countPromise, dataPromise]);

    if (data == null || data.length === 0) {
      res.status(404).json([]);
    } else {
const reversedData = data.reverse();
      res.json(reversedData);
      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json([]);
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
listHistoryKioskPaging:listHistoryKioskPaging,
listHistoryKioskPaging2:listHistoryKioskPaging2,
listHistoryKioskAll:listHistoryKioskAll,
}