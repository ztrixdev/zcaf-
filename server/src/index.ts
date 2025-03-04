import { login, modifyCustomer, signUp } from './functions/customer.ts';
import { Alogin, genAdminToken } from './functions/admin.ts';
import { loadDishes, modifyDish, newDishEntry, removeDish } from './functions/dish.ts';
import { upload } from './functions/image.ts';
import { initBot } from './bot.ts';
initBot();

import express, { Request, Response, json, urlencoded, static as static_} from 'express';
import exp from 'constants';
const app = express();
app.use(json());
app.use(urlencoded({extended: true}));
app.use(static_('../public/'));

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
app.get('/dish/loadDishes', loadDishes);

app.post('/image/upload', upload);

// Running server
const port = 6996;
app.listen(port, () => { 
    console.log(`Server is running! Listening to ${port};`);
})
        
