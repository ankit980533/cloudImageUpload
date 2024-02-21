
const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const upload = multer();
const imageSchema = new mongoose.Schema({
    key: String
});

const Image = mongoose.model('Image', imageSchema);
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

router.post('/upload', upload.single('image'),async(req, res) => {
    const file = req.file;
    const extension = path.extname(file.originalname);
    console.log(extension);
    const key = uuidv4() +extension;
    console.log(key);
    const params = {
        Bucket: process.env.BUCKET,
        Key: key,
        Body: file.buffer,
    };
    try {
        const image = new Image({ Key: key });
        await image.save();
        console.log('Image URL saved to database');
        // res.status(200).send('Image uploaded successfully');
      } catch (error) {
        console.error('Error saving image URL to database:', error);
        res.status(500).send('Error saving image URL to database');
      }
     s3.upload(params,  (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to upload image' });
        }
        // const image = new Image({ Key:key });
        //           await image.save()
                //    .then(console.log("image added to mongodb"));
               
       
        const signedUrl = s3.getSignedUrl('getObject', {
            Bucket: process.env.BUCKET,
            Key: key,
            Expires: 3600,
        });
        res.json({ imageUrl: signedUrl });
    });
   // res.json("done");
});


router.get('/:imageName', (req, res) => {
    const imageName = req.params.imageName;

   
    const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.BUCKET,
        Key: imageName,
        Expires: 3600, // URL expiration time in seconds (e.g., 1 hour)
    });

    res.redirect(signedUrl); // Redirect the user to the signed URL
});

module.exports = router;
