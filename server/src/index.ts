
import { login, modifyCustomer, signUp } from './functions/customer.ts';
import { Alogin, genAdminToken } from './functions/admin.ts';
import { modifyDish, newDishEntry, removeDish } from './functions/dish.ts';

import { initBot } from './bot.ts';
initBot();

import express, { Request, Response, json } from "express";
const app = express();
app.use(json());   

// Unserious things XD :3
app.get('/halloWelt', (req: Request, res: Response) => { res.send('Hallo Welt!'); });
app.get('/iluvcoffee', (req: Request, res: Response) => { res.sendStatus(418); });

// Customer-connected requests (See docs/lang/server.md#Customer)
app.post('/customer/login', login);
app.post('/customer/signUp', signUp);
app.patch('/customer/modifyCustomer', modifyCustomer);

// Admin-connected requests (See docs/lang/server.md#Admin)
app.patch('/admin/genToken', genAdminToken);
app.post('/admin/Alogin', Alogin);

// Dish-connected requests (See docs/lang/server.md#Dish)
app.post('/dish/newDishEntry', newDishEntry);
app.delete('/dish/removeDish', removeDish);
app.patch('/dish/modifyDish', modifyDish);

// Running server
const port = 6996;
app.listen(port, () => { 
    console.log(`Server is running! Listening to ${port};`);
})
