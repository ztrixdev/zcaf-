import { ConnectRunClose } from "./misc.js";

export async function getAdminByToken(token) {
    try {
        const admin = await ConnectRunClose(`select * from admins where token="${token}"`);
        if (admin.length != 0) { return admin; }
        else { return null; }
    } catch (err) {
        console.error(err);
        return 0;
    }

}

/* 
CODE: DESCRIPTION
______________________________________________________________________
200: OK, proceed with your action;
400: Provided token is incorrect - try again;
409: Internal Server Problems;
*/
export async function Alogin(req, res) {
    try {
        const admin = getAdminByToken(req.body.token);
        if (admin != null) { res.sendStatus(200); } 
        else { res.sendStatus(400); }
    } catch (err) {
        console.error(err);
        res.sendStatus(409);
    }
}

/* 
CODE: DESCRIPTION
______________________________________________________________________
200: OK, new admin token is generated and added to the database;
401: Provided token isn't assigned to a head admin;
409: Internal Server Problems;
*/
export async function genAdminToken(req, res) {
    const head = await getAdminByToken(req.body.headtoken); 
    if (head[0]['role'] == 'head') {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-=+?><|;:/[]{}`~';
        var result;
        for (var i = 0; i < 32; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        try {
            await ConnectRunClose(`insert into admins (role, token) values ("generic", "${result}")`);
            res.sendStatus(200);
        } catch (err) {
            console.error(err);
            res.sendStatus(409);
        }
    } else { res.sendStatus(401); }
}
