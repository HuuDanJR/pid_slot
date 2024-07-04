var config = require('./config/dbconfig')
const DBNAME = '[neoncmsprod]';
const sql = require('mssql');



// GET MACHINE ONLINE STATUS
async function getMachineOnlineStatus(date) {
    try {
    let pool = await sql.connect(config)
    let query = `SELECT dbo.Machine.Number, dbo.machineplayersession.[Status] FROM ${DBNAME}.[dbo].[MachinePlayerSession] Join dbo.Machine
        On dbo.machine.MachineID=dbo.MachinePlayerSession.MachineID
        Where dbo.machineplayersession.Status='1'
        And dbo.machine.number IN ('901','902','903','904','905','906','601','602','603','604')
        And StartGamingDate=@input_id`;
    const data_query = await pool.request().input('input_id', sql.NVarChar, date).query(`${query}`)
    return data_query.recordset;
    } catch (error) {
        console.log(`An error orcur tournament: ${error}`);
    }
}


module.exports = {
    getMachineOnlineStatus: getMachineOnlineStatus,
}