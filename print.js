var dboperation = require('./dboperation')
var express = require('express')
var body_parser = require('body-parser')
var fs= require('fs');
var cmd =require('node-cmd');
var app = express();
var router = express.Router();
var path = require('path');

app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.use('/', router);

//PRINTER ESC POS
function sendPrintCommand(filename){
    let fullpath = path.resolve(filename);
    console.log(fullpath);
    cmd.run(`notepad /p ${fullpath}`);
}

function createPrintFile(cusname, cusnumber, cpoint, dpoint, wpoint, mpoint, fpoint){
    let temp = fs.readFileSync('print.tmp', 'utf8');
    temp = temp.replace('<cusName>', cusname)
        .replace('<cusNumber>', cusnumber)
        .replace('<cPoint>', cpoint)
        .replace('<dPoint>', dpoint)
        .replace('<wPoint>', wpoint)
        .replace('<mPoint>', mpoint)
        .replace('<fPoint>', fpoint)
        .replace('<time>', (new Date()).toLocaleString());

    fs.writeFileSync('print.txt', temp);
    sendPrintCommand('print.txt');
}

router.route('/print/vegaspoint').get((req, res) => {
    let {cusname, cusnumber, cpoint, dpoint, wpoint, mpoint, fpoint} = req.body;
    createPrintFile(cusname, cusnumber, cpoint, dpoint, wpoint, mpoint, fpoint);
     res.json({a:1});
    //res.json({
    //    "result": 'data print'
    //});
});
//END PRINTER ESC POS






//createPrintFile()
fs.writeFileSync('print.txt', 'temp');
sendPrintCommand('print.txt');
var port = process.env.PORT || 8080;
app.listen(port);
console.log('app running at port: ' + port);