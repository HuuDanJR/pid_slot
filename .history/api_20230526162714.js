var dboperation = require('./dboperation')
var express = require('express')
var body_parser = require('body-parser')
var cors = require('cors')
var app = express();
var router = express.Router();
var fs = require('fs');
var cmd = require('node-cmd');
var app = express();
var router = express.Router();
var path = require('path');
var soap = require('./soap');
const morgan = require('morgan');


// // Create a write stream (in append mode) for the log file
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log_api.txt'), { flags: 'a' });
// app.use(morgan('common', { stream: accessLogStream }));

//SWAGGER
const swaggerUi = require("swagger-ui-express"),
    swaggerDocument = require("./swagger.json");

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.use(cors())
app.use('/api', router)

router.use((request, response, next) => {
    console.log('middleware!');
    next();
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Error:', err.message);
    // Continue server execution
    res.status(500).json({ error: 'Internal Server Error' });
});


//connect mongoDB
var config = require('./dbconfig_mongo')
config.connectDB()


var port = process.env.PORT || 8090;
app.listen(port);
console.log('app running at port: ' + port);

//FRONT END VIEw
app.use('/ui', router)
app.use(express.static('web_new/web'));
app.use(express.static('web_new/web/assets'));
app.use(express.static('web_new/web-staff'));
app.use(express.static('web_new/web-staff/assets'));
router.get('/client', (request, response) => {
    response.sendFile(path.resolve('./web_new/web/index.html'));
})


//Customer date frame 
router.route('/dateframe_by_number').post((request, response, next) => {
    const { number } = request.body;
    // console.log(number)
    dboperation.getDateFrameByNumber(number, function (err, result) {
        if (err) {
            console.log(`error dateframe by number ${err}`)
            next(err);
        }
        response.json(result)
    }).catch(err => {
        next(err)
    })

})

//FIND FRAME CUSTOMER
router.route('/dateframe_list').post((request, response, next) => {
    const { date } = request.body;
    dboperation.findFrameCustomer(date, function (err, result) {
        if (err) {
            console.log(err);
            next(err);
        }
        response.json(result)
    }).catch(err => {
        next(err)
    })
})


//FIND KIOSK POINT
const historyModel = require('./schema_mongo/history_schema');
app.get('/list_history_kiosk', async (req, res, next) => {
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
});
const dboperationMongoDB = require('./dboperation_mongodb');
app.post('/create_history_kiosk', dboperationMongoDB.createHistoryKiosk);




//FIND USER LOGIN STATUS
// router.route('/user_login_status').post((request, response) => {
//     const { number } = request.body;
//     dboperation.findUserLoginStatus(number, function (err, result) {
//         if (err) {
//             console.log(err)
//         }
//         response.json(result)
//     })
// })
//TOURNAMENT LIST BY DATE POST 
// router.route('/tournament').post((request, response) => {
//     const { date } = request.body;

//     dboperation.listTournamentByDate(date).then(result => {response.json(result)})
// })


//LIST CUSTOMER BY LEVEL W LIMIT
router.route('/customer_level_limit').post((request, response) => {
    const { level } = request.body;
    // console.log(level)
    dboperation.listCustomerByLevelLimit(level).then(result => { response.json(result) })

})


//Customer Image
router.route('/customer_image').post((request, response) => {
    const { number, computer } = request.body;
    soap.getCustomerImage({ number: number, res: response, computer: computer })
});
//Customer In Casino
router.route('/customer_in_casino').post((request, response) => {
    const { gammingdate, computer } = request.body;
    soap.getCustomerInCasino({ gammingdate: gammingdate, res: response, computer: computer })
});
router.route('/active_voucher').post((request, response) => {
    const { number, computer } = request.body;
    soap.getActiveVoucher({ number: number, res: response, computer: computer })
});

//GET LIST USER REGISTER NEW DATE
router.route('/user_register_date').post((req, res) => {
    let { date } = req.body;
    dboperation.getUserRegisterDate(date).then(result => { res.json(result) })
})
//END 

//GET LIST USER REGISTER NEW DATE BETWEEN DATE AND DATE
router.route('/user_register_dates').post((req, res) => {
    let { dateStart, dateEnd } = req.body;
    dboperation.getUserRegisterDates(dateStart, dateEnd).then(result => { res.json(result) })

})
//END 
router.route('/search_customer_name/:id').get((request, response) => {
    dboperation.searchCustomerName(request.params.id).then(result => {
        response.json(result)
    })

})
//USER POINT CURRENT POINT,CREDIT POINT, FORTUNE POINT
router.route('/point_user').post((request, response) => {
    let { id } = request.body;
    dboperation.getPointUser(id).then(result => { response.json(result) })
})
//END HERE

//JACKPOT HISTORY
router.route('/jackpot_history').post((request, response) => {
    let { startDate, endDate } = request.body;
    dboperation.getJackPotHistory(startDate, endDate).then(result => {
        response.json(result)
    })
})
//MACHINE PLAYER
router.route('/machine_player').post((request, response) => {
    let { date, customer_number } = request.body;
    dboperation.getMachinePlayer(date, customer_number).then(result => {
        response.json(result)
    })
})
//MACHINE PLAYER
router.route('/machine_player_by_machine_number').post((request, response) => {
    let { date, machine_number } = request.body;
    dboperation.getMachinePlayerByMachineNum(date, machine_number).then(result => {
        response.json(result)
    })
})

router.route('/card_number/:id').get((request, response) => {
    dboperation.getCardNumberByID(request.params.id).then(result => {
        response.json(result)
    })
})

//USER AND NUMBER
router.route('/user_number_by_id').post((request, response) => {
    let { id } = request.body;
    dboperation.getUserNameNumber(id).then(result => {
        response.json(result)
    })
})

router.route('/point/:id').get((request, response, next) => {
    dboperation.getPointByID(request.params.id).then(result => {
        response.json(result)
    }).catch(err => {
        next(err);
    })
})



router.route('/point_by_date').post((request, response) => {
    const { id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth } = request.body;
    let now = new Date();
    let startDay = new Date();
    startDay.setHours(6, 0, 0, 0);
    let startWeek = new Date();
    startWeek.setDate(now.getDate() - (now.getDay() + 2));
    startWeek.setHours(6, 0, 0, 0);
    let startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(6, 0, 0, 0);
    // console.log(id, startDay, now, startWeek, now, startMonth, now);
    dboperation.getPointsByDates(id, startDay, now, startWeek, now, startMonth, now)
        .then(result => { response.json(result) })
})

/*router.route('/point_by_date').post((request, response) => {
    const {id,dateToday,dateToday2,startDateWeek,endDateWeek,startDateMonth,endDateMonth} = request.body;
    // console.log(request.params.id,request.params.startDate,endDate);
    dboperation.getPointsByDates(id,dateToday,dateToday2,startDateWeek,endDateWeek,startDateMonth,endDateMonth)
    .then(result => {response.json(result)})
})*/

function convertISODate(date) {
    const offset = new Date().getTimezoneOffset();
    const myDate = date - (offset * 60 * 1000);
    const dateAsISO = new Date(myDate).toISOString();

    return dateAsISO;
}

function getDateRange(now) {
    if (now.getHours() < 6) {
        now.setDate(now.getDate() - 1);
    }
    let startDay = new Date(now.toLocaleDateString('sv'));
    startDay.setHours(6, 0, 0, 0);
    let nextDay = new Date();
    nextDay.setDate(startDay.getDate() + 1);
    let startWeek = new Date();
    startWeek.setDate(now.getDate() - 7 + [5, 4, 3, 2, 1, 7, 6][now.getDay()]);
    startWeek.setHours(6, 0, 0, 0);
    let startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(6, 0, 0, 0);

    return {
        startDay: startDay,
        nextDay: nextDay,
        startWeek: startWeek,
        startMonth: startMonth
    }
}


router.route('/point_by_date_cardtrack2').post(async (request, response) => {
    const { id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth } = request.body;
    let now = new Date();
    let dateRange = getDateRange(now);
    let element;
    //check card valid before get point first
    await dboperation.getCardNumberByID(id).then(result => {
        if (result == null) {
            console.log('no card or data found');
            return response.json('data not found');
        } else
            element = result[0]['TrackData'];
    })
    //then call get point current by card track
    // console.log(`then element: ${element}`)
    dboperation.getPointCurrentByCardTrack(element, dateRange.startDay.toLocaleDateString('sv'),
        dateRange.nextDay.toLocaleDateString('sv'),
        dateRange.startWeek.toLocaleDateString('sv'),
        dateRange.nextDay.toLocaleDateString('sv'),
        dateRange.startMonth.toLocaleDateString('sv'),
        dateRange.nextDay.toLocaleDateString('sv'))
        .then(result => { response.json(result) })

})

router.route('/point_by_date_cardtrack').post((request, response) => {
    const { id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth } = request.body;
    let now = new Date();
    let dateRange = getDateRange(now);
    dboperation.getPointCurrentByCardTrack(id, dateRange.startDay.toLocaleDateString('sv'),
        dateRange.nextDay.toLocaleDateString('sv'),
        dateRange.startWeek.toLocaleDateString('sv'),
        dateRange.nextDay.toLocaleDateString('sv'),
        dateRange.startMonth.toLocaleDateString('sv'),
        dateRange.nextDay.toLocaleDateString('sv'))
        .then(result => { response.json(result) })
})
router.route('/point_by_date_cardtrack_fullinfor').post((request, response) => {
    const { id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth } = request.body;
    let now = new Date();
    let dateRange = getDateRange(now);
    dboperation.getPointCurrentByCardTrackFullInfor(id, dateRange.startDay.toLocaleDateString('sv'),
        dateRange.nextDay.toLocaleDateString('sv'),
        dateRange.startWeek.toLocaleDateString('sv'),
        dateRange.nextDay.toLocaleDateString('sv'),
        dateRange.startMonth.toLocaleDateString('sv'),
        dateRange.nextDay.toLocaleDateString('sv')).then(result => { response.json(result) })
})

router.route('/point_by_date/range').post((request, response) => {
    const { id, startDate, endDate } = request.body;
    dboperation.getPointsByDatesRange(id, startDate, endDate)
        .then(result => { response.json(result) })
})
router.route('/point_by_date_cardtrack/range').post((request, response) => {
    const { id, startDate, endDate } = request.body;
    dboperation.getPointCurrentByCardTrackRange(id, startDate, endDate)
        .then(result => { response.json(result) })
})

router.route('/point_by_date_number/range').post((request, response) => {
    const { number, startDate, endDate } = request.body;
    dboperation.getPointCurrentByNumberRange(number, startDate, endDate)
        .then(result => { response.json(result) })
})

//FIND FRAME DATE
// router.route('/dateframe_by_number').post((request, response) => {
//     const { number } = request.body;
//     console.log(number)
//     dboperation.getDateFrameByNumber(number, function (err, result) {
//         if(err)
//         {console.log(`error dateframe by number ${err}`)
//         }
//         response.json(result)

//     })

// })
// //FIND FRAME CUSTOMER
// router.route('/dateframe_list').post((request, response) => {
//     const { date } = request.body;
//     dboperation.findFrameCustomer(date, function (err, result) {
//         if(err){
//             console.log(err)
//         }
//         response.json(result)
//     })
// })
//FIND GAME THEME BY NUMBER MACHINE
router.route('/find_gametheme_by_number').post((request, response) => {
    const { number } = request.body;
    // console.log(number)
    dboperation.findGameThemeNumber(number).then(result => { response.json(result) })

})
router.route('/all_gametheme').get((request, response) => {
    // console.log('get all gametheme')
    dboperation.getallGameTheme().then(result => { response.json(result) })
})

//PRINTER ESC POS
function sendPrintCommand(filename) {
    let fullpath = path.resolve(filename);
    // console.log(fullpath);
    cmd.run(`notepad /p ${fullpath}`);
}

function createPrintFile(cusname, cusnumber, cpoint, dpoint, wpoint, mpoint, fpoint) {
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

router.route('/print/vegaspoint').post((req, res) => {
    let { cusname, cusnumber, cpoint, dpoint, wpoint, mpoint, fpoint } = req.body;
    createPrintFile(cusname, cusnumber, cpoint, dpoint, wpoint, mpoint, fpoint);
    //  res.json(req.body);
    res.json({
        "result": 'data print'
    });
});

