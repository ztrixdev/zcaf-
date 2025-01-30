import { notify, sendOTC } from '../bot.js';
import { ConnectRunClose } from './misc.js';

export async function getCustomerByPhone(phone) {
    try {
        const customer = await ConnectRunClose(`select * from customers where phone=${phone}`);
        if (customer.length != 0) { return customer; }
        else { return null; }
    } catch (err) {
        console.error(err);
        return 0;
    }
}

/* 
CODE: DESCRIPTION
______________________________________________________________________
404: Customer with the provided phone number was not found;  
200: Credentials checked, proceed wtih your action;  
400: Credentials checked, however the provided password is incorrect, try again; 
409: Internal Server Problems; 
*/
export async function login(req, res) {
    try {
        const customer = await getCustomerByPhone(req.body.phone);
        if (customer == null) { res.sendStatus(404); } 
        else if (customer[0]['pwd'] == req.body.pwd) { res.sendStatus(200); } 
        else { res.sendStatus(400); }
    } catch (err) {
        console.error(err);
        res.sendStatus(409);
    }
}

/* 
CODE: DESCRIPTION
______________________________________________________________________
200: Signing up was completed successfully - proceed with your action;  
400: Customer with the same credentials already exists, try again; 
409: Internal Server Problems;
*/
export async function signUp(req, res) {
    const customer = await getCustomerByPhone(req.body.phone);
    if (customer == null) {
        try {
            await ConnectRunClose(`insert into customers (name, phone, pwd) 
                values ("${req.body.name}", ${req.body.phone}, "${req.body.pwd}")`);
            res.sendStatus(200);
        } catch (err) {
            console.error(err);
            res.sendStatus(409);
        }
    } else { res.sendStatus(400) };
} 

/* 
CODE: DESCRIPTION
______________________________________________________________________
200: OK. OTC is generated and sent via the bot;
409: Internal Server Problems;
*/
export async function genOTC(req, res) {
    const oneTimeCode = Math.floor(Math.random() * (999999 - 100000) + 100000);
    try {
        await ConnectRunClose(`update customers set OTC=${oneTimeCode} where phone=${req.body.phone}`);
        const customer = await getCustomerByPhone(req.body.phone);
        await sendOTC(customer[0]['telegram'], oneTimeCode);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(409);
    }
}


/* 
CODE: DESCRIPTION
______________________________________________________________________
200: OK, the provided customer has been modified;
401: Unathorized, check your password and try again;
404: The provided customer hasn't been found in the database;
409: Internal Server Problems;
*/
export async function modifyCustomer(req, res) {
    const customer = await getCustomerByPhone(req.body.phone);
    if (customer != null && customer[0]['pwd'] == req.body.pwd) {
        var allowed = ['name', 'phone', 'love', 'orders'];
        var sql_query = 'update customers set ';
        var changes_keys = Object.keys(req.body.changes);
        for (var i = 0; i < changes_keys.length; i++) {
            if (!allowed.includes(changes_keys[i])) {
                continue;
            } else {
                if (typeof(req.body.changes[changes_keys[i]]) == 'string') {
                    sql_query += `${changes_keys[i]}="${req.body.changes[changes_keys[i]]}",`;
                } if (typeof(req.body.changes[changes_keys[i]]) == 'number') {
                    sql_query += `${changes_keys[i]}=${req.body.changes[changes_keys[i]]},`;
                }
            }
        }
        var finite = `where phone=${req.body.phone}`;
        sql_query += finite;
        var fin_sql = sql_query.replaceAt(sql_query.search(finite)-1, ' ');
        try {
            await ConnectRunClose(fin_sql);
            res.sendStatus(200);
        } catch (err) {
            console.error(err);
            res.sendStatus(409);
        }
    } else { res.sendStatus(401); }
}

/*
CODE: DESCRIPTION
______________________________________________________________________
200: OK. Password was changed. Notification was sent via the bot;
409: Internal Server Problems;
400: Bad Request. Try again and check your JSON;
*/
export async function changePwd(req, res) {
    const customer = await getCustomerByPhone(req.body.phone);
    if (customer[0]['OTC'] == req.body.OTC) {
        try {
            await ConnectRunClose(`update customers set pwd="${req.body.newPwd}", OTC=NULL where phone=${req.body.phone}`);
            await notify('pwd', customer[0]['telegram']);
            res.sendStatus(200);
        } catch (err) {
            console.error(err);
            res.sendStatus(409);
        }
    } else { res.sendStatus(400); }
}

export async function assignTelegram(telegram_id, phone) {  
    if (await getCustomerByPhone(phone).telegram != telegram_id) {
        try {
            await ConnectRunClose(`update customers set telegram=${telegram_id} where phone=${phone}`);
            return 200;
        } catch (err) {
            console.error(err);
            return 0;
        }
    }
}
