import { changePwd, genOTC, login, modifyCustomer, signUp } from './functions/customer.js';
import { Alogin, genAdminToken } from './functions/admin.js';
import { modifyDish, newDishEntry, removeDish } from './functions/dish.js';

import { initBot } from './bot.js';
initBot();

import express, { json } from "express";
const app = express();
app.use(json());   

// Unserious things XD :3
app.get('/halloWelt', (req, res) => { res.send('Hallo Welt!'); });
app.get('/iluvcoffee', (req, res) => { res.sendStatus(418); }); // I'm a Teapot!

// ________________________________________
// ./functions/customer.js: START

/*
BODY (json): {
    "phone": int,
    "pwd": string
} 
*/
app.get('/customer/login', login);

/* 
BODY (json): {
    "name": string,
    "phone": int,
    "pwd": string
} 
*/
app.post('/customer/signUp', signUp);

/* 
BODY (json): {
    "phone": int
} 
*/
app.patch('/customer/genOTC', genOTC);

/*
BODY (json): {
    "phone": int,
    "pwd": string,
    "changes": {“change”: newVal} 
}
*/
app.patch('/customer/modifyCustomer', modifyCustomer);

/* 
BODY (json): {
    "phone": string,
    "otc": int,
    "newPwd": string
}
*/
app.patch('/customer/changePwd', changePwd);

// ./functions/customer.js: END
// ________________________________________
// ./functions/admin.js: START

/*
BODY (json) {
    "headtoken": string
}
*/
app.patch('/admin/genToken', genAdminToken);

/* 
BODY (json) {
    "token": string
}
*/
app.get('/admin/Alogin', Alogin);

// ./functions/admin.js: END
// ________________________________________
// ./functions/dish.js: START

/* 
BODY (json): {
    "token": string,
    "name": string,
    "price": int,
    "description": string,
    "images": [string],
    "recommended": bool
}
*/
app.post('/dish/newDishEntry', newDishEntry);

/*
BODY (json): {
    "token": string,
    "id": int
}
*/
app.delete('/dish/removeDish', removeDish);

/*
BODY (json): {
    "token": string,
    "id": int,
    "changes": {“change”: newVal} 
}
*/
app.post('/dish/modifyDish', modifyDish);

// ./functions/dish.js: END
// ________________________________________

// Running server
const port = 6996;
app.listen(port, () => { 
    console.log(`Server is running! Listening to ${port};`);
})
