const mongoose = require('mongoose')
const { MongoClient, GridFSBucket } = require("mongodb");
const username = "LeHuuDan99";
const password = "3lyIxDXEzwCtzw2i";
const imageBucket = 'photos';
const database = "PromotionVegas";
// const DB_NAME = 'PromotionVegas';
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const host_imge = 'http://localhost:8090/files/'
const URL = `mongodb+srv://${username}:${password}@clustervegas.ym3zd.mongodb.net/${database}?retryWrites=true&w=majority`;
const DB_OPTIONS = {
useNewUrlParser: true,
useUnifiedTopology: true,
};