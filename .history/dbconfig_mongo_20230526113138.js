const mongoose = require('mongoose')
const username = "LeHuuDan99";
const password = "3lyIxDXEzwCtzw2i";
const database = "KioskPoint";
const URL = `mongodb+srv://${username}:${password}@clustervegas.ym3zd.mongodb.net/${database}?retryWrites=true&w=majority`;
const DB_OPTIONS = {
useNewUrlParser: true,
useUnifiedTopology: true,
};


const connectDB = async () => {
  try {
    const connect = await mongoose.connect(
      URL,
      { useNewUrlParser: true, useUnifiedTopology: true, useUnifiedTopology: true }
    )
    console.log(`Connected to mongoDB kiosk `);
    return connect;
  } catch (error) {
    console.log('cannot connect mongoDB kiosk')
    process.exit(1)
  }
}

module.exports={
    connectDB:connectDB
}