import { login, modifyCustomer, signUp } from './functions/customer.ts';
import { Alogin, genAdminToken } from './functions/admin.ts';
import { loadDishes, modifyDish, newDishEntry, removeDish } from './functions/dish.ts';
import { loadImg, uploadImg, removeImg   } from './functions/image.ts';
import { initBot } from './bot.ts';
initBot();

import express, { Request, Response, json, urlencoded, static as static_} from 'express';

const app = express();
app.use(json());
app.use(urlencoded({extended: true}));
app.use(static_('../public/'));

// Unserious things XD :3
app.get('/halloWelt', (req: Request, res: Response) => { res.send('Hallo Welt!'); });
app.get('/iluvcoffee', (req: Request, res: Response) => { res.sendStatus(418); });

// Customer-connected requests (See docs/lang/server.md#Customer)
app.get('/customer/login', login);
app.put('/customer/signUp', signUp);
app.patch('/customer/modify', modifyCustomer);

// Admin-connected requests (See docs/lang/server.md#Admin)
app.put('/admin/genToken', genAdminToken);
app.get('/admin/Alogin', Alogin);

// Dish-connected requests (See docs/lang/server.md#Dish)
app.put('/dish/newEntry', newDishEntry);
app.delete('/dish/remove', removeDish);
app.patch('/dish/modify', modifyDish);
app.get('/dish/load', loadDishes);

// Image-connected requests (See docs/lang/server.md#Images)
app.post('/images/upload', uploadImg);
app.delete('/images/remove', removeImg);
app.get('/images/load', loadImg);

// Running server
const port = 6996;
app.listen(port, () => { 
    console.log(`Server is running! Listening to ${port};`);
})
        
