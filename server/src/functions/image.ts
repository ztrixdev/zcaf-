import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { getAdminByToken } from './admin';
import { glob } from 'glob';
import { getDishByID } from './dish';
import { QueryResult } from 'mysql2';
import { ConnectRunClose } from './misc';

const imageDir: string = path.join(path.resolve(path.dirname('')), '../public/img');
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
}

function genImageFilename(id: Number, order: Number, token: string): string {
    try {
        return `${id}_${order}_${token.substring(0, 5)}`;
    } catch (err: any) {
        return ``;
    }
}

function getOrder(id: Number): Number {
    try {
        const dishImages: Array<string> = glob.sync(`${imageDir}/${id}_*.*`);
        return dishImages.length;
    } catch (err) {
        console.error('Error listing images:', err);
        return 0;
    }
}

async function appendImageToDB(id: Number, newFile: string): Promise<Boolean> {
    const currentObject: QueryResult | null = await ConnectRunClose(`select * from images where id=?`, [id]);

    // exctracting the image's number from the filename
    let num = newFile.substring(newFile.search('_')+1);
    num = num.substring(0, num.search('_'));

    if (currentObject == null) {
        const image_json: Object = [{'num': Number(num), 'files': newFile}];
        try {
            await ConnectRunClose(`insert into images values (?, ?)`, [id, JSON.stringify(image_json)]);
            return true;
        } catch (err: any) {
            console.error(err);
            return false;
        }
    } else {
        let currentFileList: Array<Object> = JSON.parse(currentObject[0]['files']);
        currentFileList.push({'num': currentFileList[currentFileList.length-1]['num']+1, 'file': newFile});
        try {
            await ConnectRunClose(`update images set files=? where id=?`, [JSON.stringify(currentFileList), id]);
            return true;
        } catch (err: any) {
            console.error(err);
            return false;
        }
    }
} 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${genImageFilename(req.body.id, getOrder(req.body.id), req.body.token)}.${path.extname(file.originalname)}`);
    }
});

const uploadMiddleware = multer({ storage: storage, fileFilter: (req, file, cb) => {
    let ext: string = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
} }).single('img');

export async function upload(req: Request, res: Response): Promise<void> {
    uploadMiddleware(req, res, async (err: any) => {
        if (err) {
            return res.status(500).json({ error: 'File upload failed', details: err.message });
        } if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        } if (!req.body.token) {
            return res.status(400).json({ error: 'Token is required' });
        } if (!req.body.id) {
            return res.status(400).json({ error: 'Dish ID is required' });
        }

        const dish: QueryResult | null = await getDishByID(req.body.id);
        if (dish == null) {
            fs.unlink(`${imageDir}/${req.file?.filename}`, (err: any) => {
                if (err) {
                    console.error(`File failed to remove after an invalid request! error: ${err}, filename: ${req.file?.filename}`);
                }     
            } );
            return res.status(404).json({error: 'Dish not found!'});
        }

        const admin: QueryResult | null = await getAdminByToken(req.body.token);
        if (admin == null) {
            fs.unlink(`${imageDir}/${req.file?.filename}`, (err: any) => {
                if (err) {
                    console.error(`File failed to remove after an invalid request! error: ${err}, filename: ${req.file?.filename}`);
                }     
            } );
            return res.status(401).json({error: 'Check your token and try again.'});
        }
        
        const update_db: Boolean = await appendImageToDB(req.body.id, req.file.filename);
        if (!update_db) {
            fs.unlink(`${imageDir}/${req.file?.filename}`, (err: any) => {
                if (err) {
                    console.error(`File failed to remove after an invalid request! error: ${err}, filename: ${req.file?.filename}`);
                }     
            } );
            return res.status(409).json({error: 'Internal server problems. Try again.'});
        }

        res.json({ success: true, filename: req.file.filename });
    });
}

export async function load(req: Request, res: Response): Promise<void> {
    try {
        const image_object: QueryResult | null = await ConnectRunClose(`select * from images where id=?`, [req.body.id]);
        if (image_object) {
            res.send(image_object[0]['files']);
        } else { res.sendStatus(404); }
    } catch (err: any) {
        console.error(err);
        res.sendStatus(404);
    }
}
