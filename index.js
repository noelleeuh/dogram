//Set server//
const express = require('express');
const app = express();
//---//

//Import Body Parser//
const bodyParser = require('body-parser');
app.use(bodyParser.json());
//---//

//Import database.js//
const db = require('./database');
//---//

//Import Amazon S3//
const s3 = require('./S3');
//---//

//Access folder 'public'//
app.use(express.static('./public'));
//---//

//Store uploaded images with randomly generated unique name//
var multer = require('multer');
var uidSafe = require('uid-safe');
var path = require('path');

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});
//---//

//Upload pictures (local & Amazon)//
app.post('/upload', uploader.single('file'), s3.upload, function(req, res) {
    /*s3.upload invokes the upload function in S3*/
    let picTit = req.body.title;
    let picDesc = req.body.description;
    let picUsern = req.body.username;
    let amazonURL = 'https://s3.amazonaws.com/my-imageboard/' + req.file.filename;
    db.insertNewImages(picTit,picDesc,picUsern,amazonURL).then(data => {
        var images = data.rows;
        res.json(images);
    });
});
//---//

//Retrieve images from database//
app.get('/get-images', (req, res) => {
    db.selectAllImages().then(data => {
        var images = data.rows;
        res.json(images);
    });
});
//---//

//Retrieve data from chosen picture//
app.get('/zoom-picture/:id', (req, res) => {
    db.selectImgInfo(req.params.id).then(data => {
        var currentImg = data.rows[0];
        res.json(currentImg);
    });
});
//---//

//Retrieve next 5 images//
app.get('/next-images/:id', (req, res) => {
    let lastOfChunk = req.params.id;
    db.selectNextImages(lastOfChunk).then(data => {
        res.json(data.rows);
    });
});
//---//

//Send comments to a particular picture//
app.post('/send-comments', function(req, res, next) {
    let picCom = req.body.comment;
    let picUsern = req.body.username;
    let picID = req.body.img_id;
    db.insertNewComment(picCom, picUsern, picID).then(data => {
        var sentComment = data.rows[0];
        res.json(sentComment);
    });
});
//---//

//Retrieve comments from chosen picture//
app.get('/get-comments/:id', (req, res) => {
    db.selectImgComments(req.params.id).then(data => {
        var imgComments = data.rows;
        res.json(imgComments);
    });
});
//---//


//Listen server//
app.listen(8080, () =>  {
    console.log('Listening!');
});
//---//
