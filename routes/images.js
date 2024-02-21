// routes/images.js
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

// Upload image
router.post('/upload', upload.single('image'), (req, res) => {
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

    s3.upload(params, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to upload image' });
        }
        const image = new Image({ key });
        //     await image.save();
        // Generate a signed URL for the uploaded object
        const signedUrl = s3.getSignedUrl('getObject', {
            Bucket: process.env.BUCKET,
            Key: key,
            Expires: 3600,
        });
        res.json({ imageUrl: signedUrl });
    });
   // res.json("done");
});

// Get image
router.get('/:imageName', (req, res) => {
    const imageName = req.params.imageName;

    // Generate a signed URL for the requested object
    const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.BUCKET,
        Key: imageName,
        Expires: 3600, // URL expiration time in seconds (e.g., 1 hour)
    });

    res.redirect(signedUrl); // Redirect the user to the signed URL
});

module.exports = router;
