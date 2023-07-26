var config = require('./dbconfig')
const sql = require('mssql');
const e = require('express');
const connection = require('./dbconfig_mysql');

const DBNAME = '[neoncmsprod]';


async function searchCustomerName(id) {
    const query = `SELECT TOP 100 [Number],[PreferredName],[Gender] FROM ${DBNAME}.[dbo].[Customer] Where dbo.customer.PreferredName like '%${id}%' ORDER BY [dbo].[Customer].[Number] ASC`;
    try {
        let pool = await sql.connect(config)
        console.log(`connection was established_getPointByID`);
        let points = await pool.request().query(`${query}`);
        return points.recordset;
    } catch (error) {
        console.log(`An error orcur get customer name by keyword: ${error}`);
    }
}

async function getUserRegisterDates(dateStart, dateEnd) {
    const query = `
    SELECT dbo.Customer.Number as number
          ,[Surname] as surname
          ,[Forename] as forename
          ,[MiddleName] as middle_name
          ,[Title] as title
          ,[PreferredName] as preferred_name
          ,[Gender] as gender
          ,[DateOfBirth]  as date_of_birth
          ,dbo.CustomerCard.TrackData  as card_number
         ,dbo.CustomerImage.ImageDataID as picture
         ,0 as 'loyalty_balance'
         ,0.0 as 'cashless_balance'
         ,dbo.customer.[MembershipTypeID]
         ,dbo.MembershipType.Name as 'membership_short_code'
         ,dbo.MembershipType.Colour as 'colour'
          ,dbo.MembershipType.Colour as 'colour_html'
          ,[GamingDateRegistered] as gaming_date_register
          ,[DateTimeRegistered] as datime_time_register
         
         ,dbo.customer.[PlayerTierID] 
         ,dbo.PlayerTier.Name as 'player_tier_name'
         ,dbo.PlayerTier.Name as 'player_tier_short_code'
         ,dbo.Playertier.Colour as 'Player Tier Colour'
          ,[PremiumPlayer] as premium_player
          ,[PremiumPlayerStatus] as premium_player_status
           ,[MembershipExpiryDate] as membership_last_issue_date
           ,'#0080FF' as 'comp_status_colour'
	,'#0080FF' as 'comp_status_colour_html'
	,0 as freeplay_balance
	,0 as has_online_account
	,0 as hide_comp_balance
         
      FROM ${DBNAME}.[dbo].[Customer]
      
      Join dbo.CustomerCard
      on dbo.CustomerCard.CustomerID=dbo.Customer.CustomerID
      Join dbo.CustomerImage
      on dbo.CustomerImage.CustomerID=dbo.customer.CustomerID
      
      Join dbo.MembershipType
      on dbo.Customer.MembershipTypeID=dbo.MembershipType.MembershipTypeID
      Join dbo.PlayerTier
      on dbo.Customer.PlayerTierID=dbo.PlayerTier.PlayerTierID

      Where dbo.Customer.GamingDateRegistered between @input_dateStart and @input_dateEnd  ORDER BY  dbo.Customer.GamingDateRegistered  DESC`;
    let status = false;
    let message = "can not get user for this date range";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let machine = await pool.request().input('input_dateStart', sql.NVarChar, dateStart).input('input_dateEnd', sql.NVarChar, dateEnd).query(query)

        if (machine.recordset.length > 0) {
            data = machine.recordset;
            status = true;
            message = `get new user register list from date range success,${machine.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            }
            // console.log.apply(status);
            // console.log(message)
            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
    } catch (error) {
        console.log(`An error orcur get user list for this date range: ${error}`)
        let map = {
            "status": false,
            "message": message + 'or an input error type',
            "data": null,
        }
        return map;
    }
}
async function getUserRegisterDate(date) {
    const query = `SELECT [CustomerID], [Number],[Title], [PreferredName],[Gender],[GamingDateRegistered],[DateTimeRegistered],[MobilePhone],[EmailAddress] FROM ${DBNAME}.[dbo].[Customer]
    Where GamingDateRegistered=@input_date`;
    let status = false;
    let message = "can not get user for this date";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let machine = await pool.request().input('input_date', sql.NVarChar, date).query(query)

        if (machine.recordset.length > 0) {
            data = machine.recordset;
            status = true;
            message = `get new user register list success,${machine.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            }
            // console.log.apply(status);
            // console.log(message)

            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
    } catch (error) {
        console.log(`An error orcur get user list for this date: ${error}`)
        let map = {
            "status": false,
            "message": message + 'or an input error type',
            "data": null,
        }
        return map;
    }

}



async function getMachinePlayer(date, customer_number) {
    const query = `SELECT [MachinePlayerSessionID]
      ,dbo.customer.Number as 'Customer_Number'
      ,dbo.machine.Number as 'Machine_Number'
      ,dbo.gametype.Name as 'Game'
      ,[StartDateTime]
      ,[EndDateTime]
      ,[Buyin]
      ,[CoinOut]
      ,[GamesPlayed]
      ,[Jackpots]
  FROM ${DBNAME}.[dbo].[MachinePlayerSession]
  join dbo.Customer
  on dbo.customer.CustomerID=dbo.MachinePlayerSession.CustomerID
  join dbo.Machine
  on dbo.machine.MachineID=dbo.MachinePlayerSession.MachineID
  join dbo.GameType
  on dbo.GameType.GameTypeID=dbo.MachinePlayerSession.GameTypeID
  Where dbo.customer.Number=@input_number
  and dbo.MachinePlayerSession.StartGamingDate=@input_date`;
    let status = false;
    let message = "can not get machine player list";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let machine = await pool.request().input('input_date', sql.NVarChar, date).input('input_number', sql.Int, customer_number).query(query)

        if (machine.recordset.length > 0) {
            data = machine.recordset;
            status = true;
            message = `get machine player list success,${machine.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            }
            // console.log.apply(status);
            // console.log(message)

            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
    } catch (error) {
        console.log(`An error orcur get machine player list: ${error}`)
        let map = {
            "status": false,
            "message": message + 'or an input error type',
            "data": null,
        }
        return map;
    }
}
async function getMachinePlayerByMachineNum(date, machine_number) {
    const query = `SELECT [MachinePlayerSessionID]
    ,dbo.customer.Number as 'Customer_Number'
    ,dbo.machine.Number as 'Machine_Number'
    ,dbo.gametype.Name as 'Game'
    ,[StartDateTime]
    ,[EndDateTime]
    ,[Buyin]
    ,[CoinOut]
    ,[GamesPlayed]
    ,[Jackpots]
FROM [neoncmsprod].[dbo].[MachinePlayerSession]
join dbo.Customer
on dbo.customer.CustomerID=dbo.MachinePlayerSession.CustomerID
join dbo.Machine
on dbo.machine.MachineID=dbo.MachinePlayerSession.MachineID
join dbo.GameType
on dbo.GameType.GameTypeID=dbo.MachinePlayerSession.GameTypeID
Where dbo.Machine.number = @input_number and dbo.MachinePlayerSession.StartGamingDate=@input_date ORDER BY [StartDateTime] DESC`;
    let status = false;
    let message = "can not get machine player by machine number ";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let machine = await pool.request().input('input_date', sql.NVarChar, date).input('input_number', sql.Int, machine_number).query(query)

        if (machine.recordset.length > 0) {
            data = machine.recordset;
            status = true;
            message = `get machine player by MC number list success,${machine.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            }
            // console.log.apply(status);
            // console.log(message)

            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
    } catch (error) {
        console.log(`An error orcur get machine player by MC number list: ${error}`)
        let map = {
            "status": false,
            "message": message + 'or an input error type',
            "data": null,
        }
        return map;
    }
}

async function getJackPotHistory(startDate, endDate) {
    const query = `SELECT [JackpotOccurrenceID]
    ,dbo.jackpot.JackpotID
    ,dbo.Jackpot.Name
    ,[HitGamingDate]
    ,[HitDateTime]
    ,dbo.machine.Number as 'Machine_Number'
    ,dbo.MachineGameTheme.Name as 'Game_Theme'
    ,[AmountPaidOut],[MinimumHitValue]
FROM ${DBNAME}.[dbo].[JackpotOccurrence]
Join dbo.Jackpot
on dbo.Jackpot.JackpotID=dbo.JackpotOccurrence.JackpotID
Join dbo.Customer
on dbo.customer.CustomerID=dbo.JackpotOccurrence.CustomerID
Join dbo.Machine
on dbo.Machine.MachineID=dbo.JackpotOccurrence.MachineID
Join dbo.MachineGameTheme
on dbo.machine.MachineGameThemeID=dbo.MachineGameTheme.MachineGameThemeID
Where HitGamingDate between @input_startDate and @input_endDate AND dbo.jackpot.JackpotID >1 AND dbo.Jackpot.JackpotID != 41 ORDER BY dbo.JackpotOccurrence.HitDateTime DESC`;
    let status = false;
    let message = "can not get jackpot history";
    let data = null;
    try {
        let pool = await sql.connect(config);
        let jackpot = await pool.request().input('input_startDate', sql.NVarChar, startDate).input('input_endDate', sql.NVarChar, endDate).query(query)

        if (jackpot.recordset.length > 0) {
            data = jackpot.recordset;
            status = true;
            message = `get jackpot history success,${jackpot.recordset.length} results`;
            let map = {
                "status": status,
                "message": message,
                "data": data,
            }
            // console.log.apply(status);
            // console.log(message)

            return map;
        } else {
            let map = {
                "status": false,
                "message": message,
                "data": data,
            }
            data = null;
            return map;
        }
    } catch (error) {
        console.log(`An error orcur getJackPotHistory: ${error}`)
        let map = {
            "status": false,
            "message": 'can not get jackpot history or an input error type',
            "data": null,
        }
        return map;
    }
}


async function getPointUser(id) {
    const query = `SELECT dbo.customer.[CustomerID]
          ,[PreferredName]
          ,dbo.CustomerAccount.DisplayBalance
          ,dbo.customeraccount.AccountType
      FROM ${DBNAME}.[dbo].[Customer]
      Join dbo.CustomerAccount
      on dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID
      Where Number=@input_id`;
    try {
        let pool = await sql.connect(config);
        let points = await pool.request().input('input_id', sql.Int, id).query(query)

        let status = false;
        let name = null;
        let number = null;
        let current_point = 0;
        let comp_point = 0;
        let casshlet_credit = 0;
        let fortune_credit = 0
        let message = "An error orcur or can not get the data";

        for (let i = 0; i < points.recordset.length; i++) {
            // console.log(points.recordset[i]['PreferredName']);
            // console.log(points.recordset[i]['CustomerID']);
            // console.log(points.recordset[i]['DisplayBalance']);
            // console.log(points.recordset[i]['AccountType']);

            number = points.recordset[i]['CustomerID'];
            name = points.recordset[i]['PreferredName'];
            if (name != null && number != null) {
                status = true;
                message = "get points success"
            } else {
                status = false;
            }
            if (points.recordset[i]['PreferredName'] != null) {
                name == points.recordset[i]['PreferredName'];
            }
            if (points.recordset[i]['AccountType'] == 1) {
                current_point = points.recordset[i]['DisplayBalance'];
            } if (points.recordset[i]['AccountType'] == 2) {
                comp_point = points.recordset[i]['DisplayBalance'];
            } if (points.recordset[i]['AccountType'] == 3) {
                casshlet_credit = points.recordset[i]['DisplayBalance'];
            } if (points.recordset[i]['AccountType'] == 4) {
                fortune_credit = points.recordset[i]['DisplayBalance'];
            }
        }

        let map = {
            "status": status,
            "message": message,
            "data": {
                "PreferredName": name,
                "CustomerNumber": number,
                "Current_Point": current_point,
                "Comp_Point": comp_point,
                "Casshless_Credit": casshlet_credit,
                "Fortune_Credit": fortune_credit,
            }
        }
        return map;
    } catch (error) {
        console.log(`An error orcur getPointUser: ${error}`);
        let map = {
            "status": false,
            "message": 'an error orcur or input error',
            "data": null
        }
        return map;
    }
}

async function getPointsByDates(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth) {
    try {
        let pool = await sql.connect(config)
        const querybyDates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Type]
      ,[PlayerTransactionID]
      ,[LastUpdatedByUserID]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
  FROM ${DBNAME}.[dbo].[PointTransaction]
  
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  
  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
  
  Where dbo.CustomerCard.TrackData=@input_id and dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;

        const queryAll = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Type]
      ,[PlayerTransactionID]
      ,[LastUpdatedByUserID]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]

  FROM [neoncmsprod].[dbo].[PointTransaction]
  
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  
  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
  
  Where dbo.CustomerCard.TrackData=@input_id`;

        const queryCurrentPoint = `SELECT dbo.customer.[CustomerID]
      ,dbo.customer.[Number]
     ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[Title]
      ,[PreferredName]
     ,dbo.CustomerAccount.DisplayBalance as 'Current_Point'
        
  FROM [neoncmsprod].[dbo].[Customer]
  
  Join dbo.CustomerAccount
  On dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID
  
  Join dbo.CustomerCard
  On dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID
  
  Where dbo.CustomerCard.TrackData=@input_id
  And dbo.CustomerAccount.AccountType=1`;

        console.log(`connection was established getPointsByDates`);


        const points = await pool.request()
            .input('input_id', sql.Int, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querybyDates}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        const points_week = await pool.request()
            .input('input_id', sql.Int, id)
            .input('input_startDate', sql.NVarChar, startDateWeek)
            .input('input_endDate', sql.NVarChar, endDateWeek)
            .query(`${querybyDates}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        const points_month = await pool.request()
            .input('input_id', sql.Int, id)
            .input('input_startDate', sql.NVarChar, startDateMonth)
            .input('input_endDate', sql.NVarChar, endDateMonth)
            .query(`${querybyDates}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        const pointAll = await pool.request()
            .input('input_id', sql.Int, id)
            .query(`${queryAll}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        const point_current = await pool.request()
            .input('input_id', sql.Int, id)
            .query(`${queryCurrentPoint}`).catch((err) => {

                if (err instanceof Errors.NotFound)
                    return res.status(HttpStatus.NOT_FOUND).send({ message: err.message }); // 404
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); //
            })
        let totalPoint_today = 0;
        let totalPoint_Week = 0;
        let totalPoint_Month = 0;
        let totalPoint_All = 0;
        let totalPoint_current = 0;

        let name = "";
        let number = 0;
        let dateTime = new Date();

        for (let i = 0; i < points.recordset.length; i++) {
            dateTime = new Date(points.recordset[i]['EntryDateTime'])
            //let d1 = new Date(`${dateToday}T06:00:00`);
            //let d2 = new Date(`${dateToday2}T06:00:00`);
            let dateData = ConvertDateFromClient(dateToday, dateToday2);
            let d1 = dateData.startDate;
            let d2 = dateData.endDate;
            // console.log(`${dateTime} ${d1} ${d2}`);
            if (points.recordset[i]['LoyaltyPoints'] >= 0) {
                if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                    totalPoint_today += points.recordset[i]['LoyaltyPoints'];
                }
            }

        }
        for (let i = 0; i < points_week.recordset.length; i++) {

            dateTime = new Date(points_week.recordset[i]['EntryDateTime'])
            //let d1 = new Date(`${startDateWeek}T06:00:00`);
            //let d2 = new Date(`${endDateWeek}T06:00:00`);
            let dateData = ConvertDateFromClient(startDateWeek, endDateWeek);
            let d1 = dateData.startDate;
            let d2 = dateData.endDate;
            //console.log(`${dateTime} ${d1} ${d2}`);
            if (points_week.recordset[i]['LoyaltyPoints'] >= 0) {
                if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                    totalPoint_Week += points_week.recordset[i]['LoyaltyPoints'];
                }
            }

        }
        for (let i = 0; i < points_month.recordset.length; i++) {
            dateTime = new Date(points_month.recordset[i]['EntryDateTime'])
            // let d1 = new Date(`${startDateMonth}T06:00:00`);
            //let d2 = new Date(`${endDateMonth}T06:00:00`);
            let dateData = ConvertDateFromClient(startDateMonth, endDateMonth);
            let d1 = dateData.startDate;
            let d2 = dateData.endDate;
            // console.log(`${dateTime} ${d1} ${d2}`);

            if (points_month.recordset[i]['LoyaltyPoints'] >= 0) {
                if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                    totalPoint_Month += points_month.recordset[i]['LoyaltyPoints'];
                }
            }

        }
        for (let i = 0; i < pointAll.recordset.length; i++) {
            number = pointAll.recordset[0]['Number'];
            name = pointAll.recordset[0]['PreferredName'];
            if (pointAll.recordset[i]['LoyaltyPoints'] >= 0) {
                totalPoint_All += pointAll.recordset[i]['LoyaltyPoints'];
            }
        }
        totalPoint_current = point_current.recordset[0]['Current_Point'];
        // console.log(`current point: ${totalPoint_current}`);
        // console.log(`total point: ${totalPoint_today}  ${name} ${number}`);
        let status = false
        if (name != "" && number != 0) {
            status = true;
        }

        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints": totalPoint_All,
                "LoyaltyPoints_Current": totalPoint_current,
                "LoyaltyPoints_Today": totalPoint_today,
                "LoyaltyPoints_Week": totalPoint_Week,
                "LoyaltyPoints_Month": totalPoint_Month
            }
        }
        return map
        // return points.recordset;
    } catch (error) {
        console.log(`An error orcur getPointsByDates: ${error}`);
    }
}
async function getPointsByDatesRange(id, startDate, endDate) {
    try {
        let pool = await sql.connect(config)
        const querybyDates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.CustomerCardID as 'Customer Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Type]
      ,[PlayerTransactionID]
      ,[LastUpdatedByUserID]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]

  FROM ${DBNAME}.[dbo].[PointTransaction]
  
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  
  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
  
  Where dbo.CustomerCard.TrackData=@input_id 
  And dbo.PointTransaction.Type=1
  and dbo.PointTransaction.GamingDate  between @input_startDate and @input_endDate`;

        const points = await pool.request()
            .input('input_id', sql.Int, id)
            .input('input_startDate', sql.NVarChar, startDate)
            .input('input_endDate', sql.NVarChar, endDate)
            .query(`${querybyDates}`)

        let totalPoint_today = 0;
        let dateTime = new Date();
        let name = "";
        let number = 0;

        for (let i = 0; i < points.recordset.length; i++) {
            dateTime = new Date(points.recordset[i]['EntryDateTime'])
            //let d1 = new Date(`${startDate}T06:00:00`);
            //let d2 = new Date(`${endDate}T06:00:00`);
            let dateData = ConvertDateFromClient(startDate, endDate);
            let d1 = dateData.startDate;
            let d2 = dateData.endDate;
            // console.log(`${dateTime} ${d1} ${d2}`);
            if (points.recordset[i]['LoyaltyPoints'] >= 0) {
                if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                    totalPoint_today += points.recordset[i]['LoyaltyPoints'];
                    name = points.recordset[0]['PreferredName'];
                    number = points.recordset[0]['Number'];
                }
            }

        }
        let status = false
        if (name != "" && number != 0) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints_Frame": totalPoint_today,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointsByDatesRange: ${error}`);
    }
}
async function getPointByID(id) {
    try {
        let pool = await sql.connect(config)
        console.log(`connection was established_getPointByID`);
        let points = await pool.request().query(`SELECT [PointTransactionID] ,dbo.Customer.PreferredName,dbo.Customer.Number,[GamingDate],[Type],[Comment] ,[LoyaltyPoints] FROM ${DBNAME}.[dbo].[PointTransaction] Join dbo.Customer On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID Where dbo.Customer.Number=${id}`)
        return points.recordset.reverse();
    } catch (error) {
        console.log(`An error orcur getPointByID: ${error}`);
    }
}
async function getCardNumberByID(id) {
    try {
        let pool = await sql.connect(config)
        console.log(`connection was established_getPointByID`);
        let points = await pool.request().query(`SELECT TOP (1000)
        dbo.CustomerCard.CustomerID as CustomerID,[CustomerCardID],
        [Status]
        ,[IssueNumber]
        ,[TrackData]
        ,dbo.Customer.Number as Number
  
    FROM ${DBNAME}.[dbo].[CustomerCard]
    Join dbo.Customer
    on dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID  
    where dbo.Customer.Number = ${id}`)
        for (let i = 0; i < points.recordset.length; i++) {
            if (points.recordset[i]['TrackData'].length >= 7) {
                // console.log(points.recordset[i]['TrackData'])
                return points.recordset;
            }
        }


    } catch (error) {
        console.log(`An error orcur getPointByID: ${error}`);
    }
}
//CARD TRACH DATA POINT CURRENT RL & TABLE


//CARD TRACK DATA
async function getPointCurrentByCardTrack(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth) {
    try {
        let pool = await sql.connect(config)
        const queryC = `SELECT dbo.customer.[CustomerID]
 ,dbo.customer.[Number]
 ,dbo.CustomerCard.CustomerCardID as 'Customer_Card'
 ,[Title]
 ,[PreferredName]
 ,dbo.CustomerAccount.DisplayBalance as 'Current_Point'
  FROM ${DBNAME}.[dbo].[Customer]
  Join dbo.CustomerAccount
  On dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID
  Join dbo.CustomerCard
  On dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID
  Where dbo.CustomerCard.TrackData=@input_id
  And dbo.CustomerAccount.AccountType=1`;


        const querySlotDaily = `SELECT [PointTransactionID]
    ,dbo.PointTransaction.[CustomerID]
    ,dbo.Customer.Number
    ,dbo.CustomerCard.TrackData as 'Customer Card'
    ,dbo.PointTransaction.[GamingDate]
    ,dbo.PointTransaction.[EntryDateTime]
    ,dbo.PointTransaction.PlayerTransactionID
    ,dbo.GameType.GameTypeID
    ,dbo.Gametype.GameGroup
    ,dbo.GameType.Name
    ,[LoyaltyPoints]
FROM ${DBNAME}.[dbo].[PointTransaction]
join dbo.PlayerTransaction
on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID
Join dbo.GameType
on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID
join dbo.Customer
on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID
join dbo.CustomerCard
on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
Where dbo.CustomerCard.TrackData=@input_id
And dbo.Gametype.GameGroup=2
And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;
        const queryRLTBDaily = `SELECT [PointTransactionID]
        ,dbo.PointTransaction.[CustomerID]
        ,dbo.Customer.Number
        ,dbo.CustomerCard.TrackData as 'Customer Card'
        ,dbo.PointTransaction.[GamingDate]
        ,dbo.PointTransaction.[EntryDateTime]
         ,dbo.PointTransaction.PlayerTransactionID
         ,dbo.GameType.GameTypeID
        ,dbo.Gametype.GameGroup
        ,dbo.GameType.Name
        ,[LoyaltyPoints]
        FROM ${DBNAME}.[dbo].[PointTransaction]
        join dbo.PlayerTransaction
        on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID
        Join dbo.GameType
        on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID
        join dbo.Customer
        on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID
        join dbo.CustomerCard
        on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
        Where dbo.CustomerCard.TrackData=@input_id
        And dbo.Gametype.GameGroup=3
        And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;

        const querybydates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
        FROM ${DBNAME}.[dbo].[PointTransaction]
        Join dbo.Customer
        On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
        Join dbo.CustomerCard
        on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
        Where dbo.CustomerCard.TrackData=@input_id 
        and dbo.PointTransaction.Type=1
        and dbo.PointTransaction.GamingDate >= @input_startDate and dbo.PointTransaction.GamingDate <= @input_endDate`

        const queryall = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
      ,dbo.MembershipType.name as 'TierName'
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
      ,dbo.Customer.DateOfBirth
        FROM ${DBNAME}.[dbo].[PointTransaction]
        Join dbo.Customer
        On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
        Join dbo.MembershipType
        On dbo.Customer.MembershipTypeID=dbo.MembershipType.MembershipTypeID
        Join dbo.CustomerCard
        on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
        Where dbo.CustomerCard.TrackData=@input_id`
        const queryInfor = `SELECT TOP (1000)
dbo.customer.Number
,[PreferredName]
,[DateOfBirth]
,dbo.PlayerTier.Name as 'TierName'
FROM ${DBNAME}.[dbo].[Customer]
JOIN dbo.CustomerCard
on dbo.customer.CustomerID = dbo.CustomerCard.CustomerID
Join dbo.PlayerTier
on dbo.customer.PlayerTierID = dbo.PlayerTier.PlayerTierID WHERE dbo.CustomerCard.TrackData =@input_id`
        let totalPoint_today = 0;
        let totalPoint_Week = 0;
        let totalPoint_Month = 0;
        let totalPoint_All = 0;
        let totalPoint_current = 0;
        let totalPoint_today_slot = 0;
        let totalPoint_today_rl_tb = 0;
        let name = "";
        let tierName = '';
        let number = 0;
        let dateofbirth = '';
        let dateTime = new Date();
        const point_current = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${queryC}`)
        const points = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querybydates}`)
        const points_slot_daily = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querySlotDaily}`)
        const points_rltb_daily = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${queryRLTBDaily}`)
        const points_week = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDateWeek)
            .input('input_endDate', sql.NVarChar, endDateWeek)
            .query(`${querybydates}`)
        const points_month = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDateMonth)
            .input('input_endDate', sql.NVarChar, endDateMonth)
            .query(`${querybydates}`)
        const pointAll = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${queryall}`)

        const inforData = await pool.request().input('input_id', sql.NVarChar, id).query(queryInfor);
        if (points.rowsAffected > 0) {
            for (let i = 0; i < points.recordset.length; i++) {
                dateTime = ConverDateInDb(points.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                //console.log(d1,d2);
                if (points.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today += points.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_slot_daily.rowsAffected > 0) {
            for (let i = 0; i < points_slot_daily.recordset.length; i++) {
                dateTime = ConverDateInDb(points_slot_daily.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_slot_daily.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today_slot += points_slot_daily.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_rltb_daily.rowsAffected > 0) {
            for (let i = 0; i < points_rltb_daily.recordset.length; i++) {
                dateTime = ConverDateInDb(points_rltb_daily.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_rltb_daily.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today_rl_tb += points_rltb_daily.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_week.rowsAffected > 0) {
            for (let i = 0; i < points_week.recordset.length; i++) {
                dateTime = ConverDateInDb(points_week.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDateWeek, endDateWeek);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;

                //let d1 = new Date(`${startDateWeek}T06:00:00`);
                //let d2 = new Date(`${endDateWeek}T06:00:00`);
                if (points_week.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Week += points_week.recordset[i]['LoyaltyPoints'];
                    }
                }

            }
        }
        if (points_month.rowsAffected > 0) {
            for (let i = 0; i < points_month.recordset.length; i++) {
                dateTime = ConverDateInDb(points_month.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDateMonth, endDateMonth);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                //let d1 = new Date(`${startDateMonth}T06:00:00`);
                //let d2 = new Date(`${endDateMonth}T06:00:00`);
                if (points_month.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Month += points_month.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (pointAll.rowsAffected > 0) {
            for (let i = 0; i < pointAll.recordset.length; i++) {
                number = pointAll.recordset[0]['Number'];
                name = pointAll.recordset[0]['PreferredName'];
                dateofbirth = pointAll.recordset[0]['DateOfBirth'];
                tierName = pointAll.recordset[0]['TierName'];
                if (pointAll.recordset[i]['LoyaltyPoints'] >= 0) {
                    totalPoint_All += pointAll.recordset[i]['LoyaltyPoints'];
                }
            }
        }

        if (point_current.rowsAffected > 0) {
            totalPoint_current = point_current.recordset[0]['Current_Point'];
        }
        // console.log('infor customer: ', inforData.recordset);
        // console.log('number: ', inforData.recordset[0]['Number']);
       
        let status = false
        if (name != "" && number != 0 && tierName != '') {
            status = true;
        } else if(inforData.recordset!=null) {
            name = inforData.recordset[0]['PreferredName'];
            number = inforData.recordset[0]['Number'];
            dateofbirth = inforData.recordset[0]['DateOfBirth'];
            tierName = inforData.recordset[0]['TierName'];
            status = true;
        }

        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "TierName": tierName,
                "DateOfBirth": dateofbirth,
                "LoyaltyPoints": totalPoint_All,
                "LoyaltyPoints_Current": totalPoint_current,
                "LoyaltyPoints_Today": totalPoint_today,
                "LoyaltyPoints_Week": totalPoint_Week,
                "LoyaltyPoints_Month": totalPoint_Month,
                "LoyaltyPoints_Today_Slot": totalPoint_today_slot,
                "LoyaltyPoints_Today_RLTB": totalPoint_today_rl_tb,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointCurrentByCardTrack local: ${error}`);
    }
}
//END CARD TRACK DATA


// //CARD TRACK DATA
// async function getPointCurrentByCardTrack(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth) {
//     console.log(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth);
//     try {
//         let pool = await sql.connect(config)
//         const queryC = `SELECT dbo.customer.[CustomerID]
//       ,dbo.customer.[Number]
//       ,dbo.CustomerCard.CustomerCardID as 'Customer_Card'
//       ,[Title]
//       ,[PreferredName]
//       ,dbo.CustomerAccount.DisplayBalance as 'Current_Point'
//   FROM ${DBNAME}.[dbo].[Customer]
//   Join dbo.CustomerAccount
//   On dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID
  
//   Join dbo.CustomerCard
//   On dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID
  
//   Where dbo.CustomerCard.TrackData=@input_id
//   And dbo.CustomerAccount.AccountType=1`;

//         //SLOT daily 
//         const querySlotDaily = `SELECT [PointTransactionID]
//         ,dbo.PointTransaction.[CustomerID]
//   ,dbo.Customer.Number
//   ,dbo.CustomerCard.TrackData as 'Customer Card'
//   ,dbo.PointTransaction.[GamingDate]
//         ,dbo.PointTransaction.[EntryDateTime]
//         ,dbo.PointTransaction.PlayerTransactionID
//         ,dbo.GameType.GameTypeID
//   ,dbo.Gametype.GameGroup
//   ,dbo.GameType.Name
//   ,[LoyaltyPoints]

// FROM ${DBNAME}.[dbo].[PointTransaction]

// join dbo.PlayerTransaction
// on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID

// Join dbo.GameType
// on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID

// join dbo.Customer
// on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID

// join dbo.CustomerCard
// on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID

// Where dbo.CustomerCard.TrackData=@input_id
// And dbo.Gametype.GameGroup=2
// And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;
//         const queryRLTBDaily = `SELECT [PointTransactionID]
//         ,dbo.PointTransaction.[CustomerID]
//         ,dbo.Customer.Number
//         ,dbo.CustomerCard.TrackData as 'Customer Card'
//         ,dbo.PointTransaction.[GamingDate]
//         ,dbo.PointTransaction.[EntryDateTime]
//          ,dbo.PointTransaction.PlayerTransactionID
//          ,dbo.GameType.GameTypeID
//         ,dbo.Gametype.GameGroup
//         ,dbo.GameType.Name
//         ,[LoyaltyPoints]
    
//       FROM ${DBNAME}.[dbo].[PointTransaction]
      
//       join dbo.PlayerTransaction
//       on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID
    
//       Join dbo.GameType
//       on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID
    
//       join dbo.Customer
//       on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID
    
//       join dbo.CustomerCard
//       on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
//       Where dbo.CustomerCard.TrackData=@input_id
//       And dbo.Gametype.GameGroup=3
//       And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;

//         const querybydates = `SELECT [PointTransactionID]
//       ,dbo.Customer.PreferredName
//       ,dbo.Customer.Number
// 	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
//       ,[GamingDate]
//       ,[EntryDateTime]
//       ,[Comment]
//       ,[LoyaltyPoints]
//       ,[CompPoints]

//   FROM ${DBNAME}.[dbo].[PointTransaction]
  
//   Join dbo.Customer
//   On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  
//   Join dbo.CustomerCard
//   on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
  
//   Where dbo.CustomerCard.TrackData=@input_id 
//   and dbo.PointTransaction.Type=1
//   and dbo.PointTransaction.GamingDate >= @input_startDate and dbo.PointTransaction.GamingDate <= @input_endDate`

//         const queryall = `SELECT [PointTransactionID]
//       ,dbo.Customer.PreferredName
//       ,dbo.Customer.Number
//       ,dbo.MembershipType.name as 'TierName'
// 	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
//       ,[GamingDate]
//       ,[EntryDateTime]
//       ,[Comment]
//       ,[LoyaltyPoints]
//       ,[CompPoints]
//       ,dbo.Customer.DateOfBirth

//   FROM ${DBNAME}.[dbo].[PointTransaction]
//   Join dbo.Customer
//   On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
//   Join dbo.MembershipType
//   On dbo.Customer.MembershipTypeID=dbo.MembershipType.MembershipTypeID
//   Join dbo.CustomerCard
//   on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
//   Where dbo.CustomerCard.TrackData=@input_id`
//         //console.log(`connection was established getPointCurrentByCardTrack`);
//         let totalPoint_today = 0;
//         let totalPoint_Week = 0;
//         let totalPoint_Month = 0;
//         let totalPoint_All = 0;
//         let totalPoint_current = 0;
//         let totalPoint_today_slot = 0;
//         let totalPoint_today_rl_tb = 0;
//         let name = "";
//         let tierName = '';
//         let number = 0;
//         let dateofbirth = '';
//         let dateTime = new Date();
//         const point_current = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .query(`${queryC}`)
//         const points = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, dateToday)
//             .input('input_endDate', sql.NVarChar, dateToday2)
//             .query(`${querybydates}`)
//         const points_slot_daily = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, dateToday)
//             .input('input_endDate', sql.NVarChar, dateToday2)
//             .query(`${querySlotDaily}`)
//         const points_rltb_daily = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, dateToday)
//             .input('input_endDate', sql.NVarChar, dateToday2)
//             .query(`${queryRLTBDaily}`)
//         const points_week = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, startDateWeek)
//             .input('input_endDate', sql.NVarChar, endDateWeek)
//             .query(`${querybydates}`)
//         const points_month = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .input('input_startDate', sql.NVarChar, startDateMonth)
//             .input('input_endDate', sql.NVarChar, endDateMonth)
//             .query(`${querybydates}`)
//         const pointAll = await pool.request()
//             .input('input_id', sql.NVarChar, id)
//             .query(`${queryall}`)
//         if (points.rowsAffected > 0) {
//             for (let i = 0; i < points.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points.recordset[i]['EntryDateTime']);
//                 //console.log(1,points[i])
//                 //console.log(points.recordset[i]['EntryDateTime'].toLocaleString());
//                 //console.log("abc");
//                 //console.log(points.recordset[i]['EntryDateTime'].toString());
//                 //console.log("xyz");
//                 //console.log(dateTime);
//                 //let d1 = new Date(`${dateToday}T06:00:00`);
//                 //let d2 = new Date(`${dateToday2}T06:00:00`);
//                 let dateData = ConvertDateFromClient(dateToday, dateToday2);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;
//                 //console.log(d1,d2);
//                 if (points.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_today += points.recordset[i]['LoyaltyPoints'];
//                     }
//                 }
//             }
//         }
//         if (points_slot_daily.rowsAffected > 0) {
//             for (let i = 0; i < points_slot_daily.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points_slot_daily.recordset[i]['EntryDateTime']);
//                 let dateData = ConvertDateFromClient(dateToday, dateToday2);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;
//                 if (points_slot_daily.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_today_slot += points_slot_daily.recordset[i]['LoyaltyPoints'];
//                     }
//                 }
//             }
//         }
//         if (points_rltb_daily.rowsAffected > 0) {
//             for (let i = 0; i < points_rltb_daily.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points_rltb_daily.recordset[i]['EntryDateTime']);
//                 let dateData = ConvertDateFromClient(dateToday, dateToday2);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;
//                 if (points_rltb_daily.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_today_rl_tb += points_rltb_daily.recordset[i]['LoyaltyPoints'];
//                     }
//                 }
//             }
//         }
//         if (points_week.rowsAffected > 0) {
//             for (let i = 0; i < points_week.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points_week.recordset[i]['EntryDateTime']);
//                 let dateData = ConvertDateFromClient(startDateWeek, endDateWeek);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;

//                 //let d1 = new Date(`${startDateWeek}T06:00:00`);
//                 //let d2 = new Date(`${endDateWeek}T06:00:00`);
//                 if (points_week.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_Week += points_week.recordset[i]['LoyaltyPoints'];
//                     }
//                 }

//             }
//         }
//         if (points_month.rowsAffected > 0) {
//             for (let i = 0; i < points_month.recordset.length; i++) {
//                 dateTime = ConverDateInDb(points_month.recordset[i]['EntryDateTime']);
//                 let dateData = ConvertDateFromClient(startDateMonth, endDateMonth);
//                 let d1 = dateData.startDate;
//                 let d2 = dateData.endDate;
//                 //let d1 = new Date(`${startDateMonth}T06:00:00`);
//                 //let d2 = new Date(`${endDateMonth}T06:00:00`);
//                 if (points_month.recordset[i]['LoyaltyPoints'] >= 0) {
//                     if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
//                         totalPoint_Month += points_month.recordset[i]['LoyaltyPoints'];
//                     }
//                 }
//             }
//         }
//         if (pointAll.rowsAffected > 0) {
//             for (let i = 0; i < pointAll.recordset.length; i++) {
//                 number = pointAll.recordset[0]['Number'];
//                 name = pointAll.recordset[0]['PreferredName'];
//                 dateofbirth = pointAll.recordset[0]['DateOfBirth'];
//                 tierName = pointAll.recordset[0]['TierName'];
//                 if (pointAll.recordset[i]['LoyaltyPoints'] >= 0) {
//                     totalPoint_All += pointAll.recordset[i]['LoyaltyPoints'];
//                 }
//             }
//         }
//         if (point_current.rowsAffected > 0) {
//             totalPoint_current = point_current.recordset[0]['Current_Point'];
//         }
//         let status = false
//         if (name != "" && number != 0) {
//             status = true;
//         }
//         const map = {
//             "status": status,
//             "data": {
//                 "PreferredName": name,
//                 "Number": number,
//                 "TierName": tierName,
//                 "DateOfBirth": dateofbirth,
//                 "LoyaltyPoints": totalPoint_All,
//                 "LoyaltyPoints_Current": totalPoint_current,
//                 "LoyaltyPoints_Today": totalPoint_today,
//                 "LoyaltyPoints_Week": totalPoint_Week,
//                 "LoyaltyPoints_Month": totalPoint_Month,
//                 "LoyaltyPoints_Today_Slot": totalPoint_today_slot,
//                 "LoyaltyPoints_Today_RLTB": totalPoint_today_rl_tb,

//             }
//         }
//         return map
//     } catch (error) {
//         console.log(`An error orcur getPointCurrentByCardTrack: ${error}`);
//     }
// }
// //END CARD TRACK DATA



//CARD TRACK DATA FULL INFOR
async function getPointCurrentByCardTrackFullInfor(id, dateToday, dateToday2, startDateWeek, endDateWeek, startDateMonth, endDateMonth) {
    try {
        let pool = await sql.connect(config)
        const queryC = `SELECT dbo.customer.[CustomerID]
        ,dbo.customer.[Number],dbo.Customer.MobilePhone,dbo.customer.EmailAddress
        ,dbo.CustomerCard.CustomerCardID as 'Customer_Card'
        ,[Title]
        ,[PreferredName]
        ,dbo.CustomerAccount.DisplayBalance as 'Current_Point',dbo.PlayerTier.Name as 'TierName'
    FROM ${DBNAME}.[dbo].[Customer]
    
    Join dbo.CustomerAccount
    On dbo.Customer.CustomerID=dbo.CustomerAccount.CustomerID
    
    Join dbo.CustomerCard
    On dbo.Customer.CustomerID=dbo.CustomerCard.CustomerID
  
    Join dbo.PlayerTier
    on dbo.customer.PlayerTierID = dbo.PlayerTier.PlayerTierID
    
    Where dbo.CustomerCard.TrackData=@input_id
    And dbo.CustomerAccount.AccountType=1`;

        //SLOT daily 
        const querySlotDaily = `SELECT [PointTransactionID] ,dbo.PointTransaction.[CustomerID]
  ,dbo.Customer.Number
  ,dbo.CustomerCard.TrackData as 'Customer Card'
  ,dbo.PointTransaction.[GamingDate]
        ,dbo.PointTransaction.[EntryDateTime]
        ,dbo.PointTransaction.PlayerTransactionID
        ,dbo.GameType.GameTypeID
  ,dbo.Gametype.GameGroup
  ,dbo.GameType.Name
  ,[LoyaltyPoints]
FROM ${DBNAME}.[dbo].[PointTransaction]
join dbo.PlayerTransaction
on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID
Join dbo.GameType
on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID
join dbo.Customer
on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID
join dbo.CustomerCard
on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
Where dbo.CustomerCard.TrackData=@input_id
And dbo.Gametype.GameGroup=2
And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;
        const queryRLTBDaily = `SELECT [PointTransactionID]
        ,dbo.PointTransaction.[CustomerID]
        ,dbo.Customer.Number
        ,dbo.CustomerCard.TrackData as 'Customer Card'
        ,dbo.PointTransaction.[GamingDate]
        ,dbo.PointTransaction.[EntryDateTime]
         ,dbo.PointTransaction.PlayerTransactionID
         ,dbo.GameType.GameTypeID
        ,dbo.Gametype.GameGroup
        ,dbo.GameType.Name
        ,[LoyaltyPoints]
      FROM ${DBNAME}.[dbo].[PointTransaction]
      join dbo.PlayerTransaction
      on dbo.PointTransaction.PlayerTransactionID=dbo.PlayerTransaction.PlayerTransactionID
      Join dbo.GameType
      on dbo.PlayerTransaction.GameTypeID=dbo.GameType.GameTypeID
      join dbo.Customer
      on dbo.PointTransaction.CustomerID=dbo.customer.CustomerID
      join dbo.CustomerCard
      on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
      Where dbo.CustomerCard.TrackData=@input_id
      And dbo.Gametype.GameGroup=3
      And dbo.PointTransaction.GamingDate between @input_startDate and @input_endDate`;
        const querybydates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
  FROM ${DBNAME}.[dbo].[PointTransaction]
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
  Where dbo.CustomerCard.TrackData=@input_id 
  and dbo.PointTransaction.Type=1
  and dbo.PointTransaction.GamingDate >= @input_startDate and dbo.PointTransaction.GamingDate <= @input_endDate`
        const queryall = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]
  FROM ${DBNAME}.[dbo].[PointTransaction]
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
  Where dbo.CustomerCard.TrackData=@input_id`
        let totalPoint_today = 0;
        let totalPoint_Week = 0;
        let totalPoint_Month = 0;
        let totalPoint_All = 0;
        let totalPoint_current = 0;
        let totalPoint_today_slot = 0;
        let totalPoint_today_rl_tb = 0;
        let name = ""; let email = ''; let tiername = ''; let phone = '';
        let number = 0;
        let title = '';
        let dateTime = new Date();
        const point_current = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${queryC}`)
        const points = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querybydates}`)
        const points_slot_daily = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${querySlotDaily}`)
        const points_rltb_daily = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, dateToday)
            .input('input_endDate', sql.NVarChar, dateToday2)
            .query(`${queryRLTBDaily}`)
        const points_week = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDateWeek)
            .input('input_endDate', sql.NVarChar, endDateWeek)
            .query(`${querybydates}`)
        const points_month = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDateMonth)
            .input('input_endDate', sql.NVarChar, endDateMonth)
            .query(`${querybydates}`)
        const pointAll = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${queryall}`)
        if (points.rowsAffected > 0) {
            for (let i = 0; i < points.recordset.length; i++) {
                dateTime = ConverDateInDb(points.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today += points.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_slot_daily.rowsAffected > 0) {
            for (let i = 0; i < points_slot_daily.recordset.length; i++) {
                dateTime = ConverDateInDb(points_slot_daily.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_slot_daily.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today_slot += points_slot_daily.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_rltb_daily.rowsAffected > 0) {
            for (let i = 0; i < points_rltb_daily.recordset.length; i++) {
                dateTime = ConverDateInDb(points_rltb_daily.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(dateToday, dateToday2);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_rltb_daily.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_today_rl_tb += points_rltb_daily.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (points_week.rowsAffected > 0) {
            for (let i = 0; i < points_week.recordset.length; i++) {
                dateTime = ConverDateInDb(points_week.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDateWeek, endDateWeek);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_week.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Week += points_week.recordset[i]['LoyaltyPoints'];
                    }
                }

            }
        }
        if (points_month.rowsAffected > 0) {
            for (let i = 0; i < points_month.recordset.length; i++) {
                dateTime = ConverDateInDb(points_month.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDateMonth, endDateMonth);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_month.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Month += points_month.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        if (pointAll.rowsAffected > 0) {
            for (let i = 0; i < pointAll.recordset.length; i++) {
                number = pointAll.recordset[0]['Number'];
                name = pointAll.recordset[0]['PreferredName'];
                if (pointAll.recordset[i]['LoyaltyPoints'] >= 0) {
                    totalPoint_All += pointAll.recordset[i]['LoyaltyPoints'];
                }
            }
        }
        if (point_current.rowsAffected > 0) {
            totalPoint_current = point_current.recordset[0]['Current_Point'];
            phone = point_current.recordset[0]['MobilePhone'];
            email = point_current.recordset[0]['EmailAddress'];
            title = point_current.recordset[0]['Title'];
            tiername = point_current.recordset[0]['TierName'];
        }
        let status = false
        if (name != "" && number != 0) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints": totalPoint_All,
                "LoyaltyPoints_Current": totalPoint_current,
                "LoyaltyPoints_Today": totalPoint_today,
                "LoyaltyPoints_Week": totalPoint_Week,
                "LoyaltyPoints_Month": totalPoint_Month,
                "LoyaltyPoints_Today_Slot": totalPoint_today_slot,
                "LoyaltyPoints_Today_RLTB": totalPoint_today_rl_tb,
                "Phone": phone,
                "Email": email,
                "TierName": tiername,
                "Title": title,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointCurrentByCardTrackFullInfor: ${error}`);
    }
}
//END CARD TRACK DATA FULL INFOR

//START GET POINT BY CARDTRACK RANGE
async function getPointCurrentByCardTrackRange(id, startDate, endDate) {
    try {
        let pool = await sql.connect(config)
        let querybydates = `SELECT [PointTransactionID]
      ,dbo.Customer.PreferredName
      ,dbo.Customer.Number
	  ,dbo.CustomerCard.TrackData as 'Customer_Card'
      ,[GamingDate]
      ,[EntryDateTime]
      ,[Comment]
      ,[LoyaltyPoints]
      ,[CompPoints]

  FROM ${DBNAME}.[dbo].[PointTransaction]
  
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  
  Join dbo.CustomerCard
  on dbo.customer.CustomerID=dbo.CustomerCard.CustomerID
  
  Where dbo.CustomerCard.TrackData=@input_id 
  and dbo.PointTransaction.Type=1
  and dbo.PointTransaction.GamingDate  between @input_startDate and @input_endDate`

        console.log(`connection was established getPointCurrentByCardTrackRanges`);

        let totalPoint_Frame = 0;
        let name = "";
        let number = 0;
        let dateTime = new Date();

        const points_frame = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDate)
            .input('input_endDate', sql.NVarChar, endDate)
            .query(`${querybydates}`)

        if (points_frame.rowsAffected > 0) {
            for (let i = 0; i < points_frame.recordset.length; i++) {
                name = points_frame.recordset[i]['PreferredName'];
                number = points_frame.recordset[i]['Number'];
                //console.log(1,points[i])
                //console.log(points.recordset[i]['EntryDateTime'].toLocaleString());
                //console.log("abc");
                //console.log(points.recordset[i]['EntryDateTime'].toString());
                //console.log("xyz");
                //console.log(dateTime);
                dateTime = new Date(points_frame.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDate, endDate);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_frame.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Frame += points_frame.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }

        let status = false
        if (name != "" && number != 0 && totalPoint_Frame != 0) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints_Frame": totalPoint_Frame,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointCurrentByCardTrackRanges: ${error}`);
    }
}
//END HERE
//GET POINT BY CUSTOMER NUMBER RANGE


async function getPointCurrentByNumberRange(id, startDate, endDate) {
    try {
        let pool = await sql.connect(config)
        let querybydates = `SELECT  dbo.Customer.PreferredName
      ,dbo.Customer.Number
      ,[EntryDateTime],[GamingDate]
      ,[LoyaltyPoints]
  FROM ${DBNAME}.[dbo].[PointTransaction]
  Join dbo.Customer
  On dbo.Customer.CustomerID=dbo.PointTransaction.CustomerID
  Where dbo.Customer.Number=@input_id
  and dbo.PointTransaction.Type=1
  and dbo.PointTransaction.GamingDate  between @input_startDate and @input_endDate`
        console.log(`connection was established getPointCurrentByNumberRanges`);
        let totalPoint_Frame = 0;
        let name = "";
        let number = 0;
        let dateTime = new Date();

        const points_frame = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .input('input_startDate', sql.NVarChar, startDate)
            .input('input_endDate', sql.NVarChar, endDate)
            .query(`${querybydates}`)

        if (points_frame.rowsAffected > 0) {
            for (let i = 0; i < points_frame.recordset.length; i++) {
                name = points_frame.recordset[i]['PreferredName'];
                number = points_frame.recordset[i]['Number'];
                dateTime = new Date(points_frame.recordset[i]['EntryDateTime']);
                let dateData = ConvertDateFromClient(startDate, endDate);
                let d1 = dateData.startDate;
                let d2 = dateData.endDate;
                if (points_frame.recordset[i]['LoyaltyPoints'] >= 0) {
                    if (dateTime.getTime() >= d1 && dateTime.getTime() < d2) {
                        totalPoint_Frame += points_frame.recordset[i]['LoyaltyPoints'];
                    }
                }
            }
        }
        let status = false
        if (name != "" && number != 0 && totalPoint_Frame != 0) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
                "LoyaltyPoints_Frame": totalPoint_Frame,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getPointCurrentByNumberRanges: ${error}`);
    }
}


//CUSTOMER FIND FRAME DATE

async function getDateFrameByNumber(number, callback) {
    let query = `SELECT number,forename,frame_start_date,frame_end_date FROM vcms_dev.customers WHERE number = ${number}`;
    try {
       await connection.getConnection(function (err, conn) {
            // Do something with the connection
            if(err){
                console.log(`getConnection error : ${err}`)
            }
            connection.query(query, function (err, result,fields) {
                if (err)(
                    console.log(err)
                );
                console.log(result);
                //USE CALLBACK FUNCTION TO GET RESULT
                callback(err, result)
            });
            // connection_end;
            conn.release()
            // Don't forget to release the connection when finished!
           
        })
    } catch (error) {
        console.log(`An error orcur getDateFrameByNumber: ${error}`);
    }
}

//FINd NEW USER 
async function findFrameCustomer(date, callback) {
    let query = `SELECT number,forename,frame_start_date,frame_end_date FROM vcms_dev.customers 
    WHERE frame_start_date >= ${date} ORDER BY frame_start_date DESC LIMIT 100`;
    try {
        await connection.getConnection(function (err, conn) {
            // Do something with the connection
            if(err){
                console.log(`getConnection error : ${err}`)
            }
            connection.query(query, function (err, result,fields) {
                if (err)(
                    console.log(err)
                );
                // console.log(result);
                //USE CALLBACK FUNCTION TO GET RESULT
                callback(err, result)
            });
            // conn.getConnection()
            conn.end();
            // Don't forget to release the connection when finished!
        })
       
    } catch (error) {
        console.log(`An error orcur findFrameDateCustomer: ${error}`);
    }
}
//MYSQL FIND USER LOGIN STATUS
async function findUserLoginStatus(number, callback) {
    let query = `SELECT email,sign_in_count,current_sign_in_at,last_sign_in_at FROM vcms_dev.users where email = ${number} ;`;
    try {
        await connection.getConnection(function (err, conn) {
            if (err) {
                console.log(`getConnection error : ${err}`)
            }
            connection.query(query, function (err, result, fields) {
                if (err) (
                    console.log(err)
                );
                console.log(result);
                callback(err, result)
            });
            conn.release();
            
        })

    } catch (error) {
        console.log(`An error orcur findFrameDateCustomer: ${error}`);
    }
}

async function findGameThemeNumber(number) {
    try {
        let pool = await sql.connect(config)
        let query = `SELECT dbo.Machine.Number,dbo.MachineGameTheme.MachineGameThemeID,dbo.MachineGameTheme.Name FROM ${DBNAME}.[dbo].[Machine] Join dbo.MachineGameTheme  On dbo.MachineGameTheme.MachineGameThemeID=dbo.Machine.MachineGameThemeID
      WHERE dbo.Machine.Number = @input_id`;

        const data_query = await pool.request()
            .input('input_id', sql.NVarChar, number)
            .query(`${query}`)
        return data_query.recordset[0];
    } catch (error) {
        console.log(`An error orcur findGameThemeNumber: ${error}`);
    }
}
async function getallGameTheme() {
    try {
        let pool = await sql.connect(config)
        let query = `SELECT dbo.Machine.Number,dbo.MachineGameTheme.MachineGameThemeID,dbo.MachineGameTheme.Name FROM ${DBNAME}.[dbo].[Machine] 
        Join dbo.MachineGameTheme  On dbo.MachineGameTheme.MachineGameThemeID=dbo.Machine.MachineGameThemeID where dbo.machine.status ='1' 
        ORDER BY dbo.MachineGameTheme.GameTypeID ASC , dbo.machine.Number
        `;

        const data_query = await pool.request().query(`${query}`)
        return data_query;
    } catch (error) {
        console.log(`An error orcur findGameThemeNumber: ${error}`);
    }
}


//TOURNAMENT BY DATE
async function listTournamentByDate(date) {
    try {
        let pool = await sql.connect(config)
        let query = `SELECT TOP 20 dbo.machine.Number as 'Machine_Number'
        ,[GamingDate]
        ,[NetTransactions]
        ,[ActualWinLoss]
    FROM  ${DBNAME}.[dbo].[MachineResult]
    Join dbo.Machine
    On dbo.machine.MachineID=dbo.MachineResult.MachineID
    Where GamingDate=@input_id`;

        const data_query = await pool.request()
            .input('input_id', sql.NVarChar, date)
            .query(`${query}`)
        return data_query.recordset;
    } catch (error) {
        console.log(`An error orcur tournament: ${error}`);
    }
}

//LIST CUSTOMER BY LEVEL W LIMIT
async function listCustomerByLevelLimit(level){
    try{
        let pool = await sql.connect(config)
        let query = `SELECT TOP (100) 
        [CustomerID]
        ,[Number]
        ,[Title]
        ,[PreferredName]
        ,[DateOfBirth]
        ,dbo.MembershipType.name
    FROM ${DBNAME}.[dbo].[Customer]
    JOIN dbo.MembershipType 
    On dbo.Customer.MembershipTypeID=dbo.MembershipType.MembershipTypeID
  
    WHERE dbo.MembershipType.name =@input_level`;
        const data_query = await pool.request()
            .input('input_level', sql.NVarChar, level)
            .query(`${query}`)
            // console.log(data_query.rowsAffected)
        return data_query.recordset;
    }
    catch(error){
        console.log(`An error orcur listCustomerByLevelLimit: ${error}`);
    }
}


function ConverDateInDb(entryDate) {
    return new Date(entryDate.toUTCString());
}

function ConvertDateFromClient(startDate, endDate) {
    return {
        "startDate": new Date(`${startDate}T06:00:00.000+00:00`).getTime(),
        "endDate": new Date(`${endDate}T06:00:00.000+00:00`).getTime() + 86400000
    }
}

//GET POINT BY CUSTOMER NUMBER RANGE
async function getUserNameNumber(id) {
    try {
        let pool = await sql.connect(config)
        let query = `SELECT TOP (5)[Number],[PreferredName] FROM ${DBNAME}.[dbo].[Customer] WHERE dbo.Customer.number = @input_id`;
        let name = "";
        let number = 0;
        const data = await pool.request()
            .input('input_id', sql.NVarChar, id)
            .query(`${query}`)

        if (data.rowsAffected > 0) {
            for (let i = 0; i < data.recordset.length; i++) {
                name = data.recordset[i]['PreferredName'];
                number = data.recordset[i]['Number'];
            }
        }
        let status = false
        if (name != "" && number != 0 ) {
            status = true;
        }
        const map = {
            "status": status,
            "data": {
                "PreferredName": name,
                "Number": number,
            }
        }
        return map
    } catch (error) {
        console.log(`An error orcur getUserNameNumber: ${error}`);
    }
}

module.exports = {
    //tournament
    listTournamentByDate:listTournamentByDate,
    //list customer by level
    listCustomerByLevelLimit:listCustomerByLevelLimit,
    
    getPointByID: getPointByID,
    getPointsByDates: getPointsByDates,
    getPointsByDatesRange: getPointsByDatesRange,
    getCardNumberByID: getCardNumberByID,
    getPointCurrentByCardTrack: getPointCurrentByCardTrack,
    getPointCurrentByCardTrackFullInfor: getPointCurrentByCardTrackFullInfor,
    getPointCurrentByCardTrackRange: getPointCurrentByCardTrackRange,
    getPointCurrentByNumberRange: getPointCurrentByNumberRange,
    getPointUser: getPointUser,
    getJackPotHistory: getJackPotHistory,
    getMachinePlayer: getMachinePlayer,
    getUserRegisterDate: getUserRegisterDate,
    getUserRegisterDates: getUserRegisterDates,
    searchCustomerName: searchCustomerName,
    getMachinePlayerByMachineNum: getMachinePlayerByMachineNum,


  
    findGameThemeNumber: findGameThemeNumber,
    findUserLoginStatus:findUserLoginStatus,
    findFrameCustomer: findFrameCustomer,
    getDateFrameByNumber: getDateFrameByNumber,
    getallGameTheme:getallGameTheme,
    getUserNameNumber:getUserNameNumber
}