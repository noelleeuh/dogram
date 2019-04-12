//Require libraries//
const knox = require('knox');
const fs = require('fs');
//---//

//Give access to client//
let secrets;

if (process.env.NODE_ENV == 'production') {
    secrets = process.env;
} else {
    secrets = require('./secrets');
}

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'my-imageboard'
});
//---//

//Store images that the user uploads in AWS//
exports.upload = function(req, res, next) {
    if (!req.file) {
        res.sendStatus(500);
    }

    //Configure the request we're gonna make to Amazon
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });
    //

    //Make the request
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);
    //

    //Wait for a response
    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        if (wasSuccessful) {
            next();
        } else {
            res.statusCode(500);
        }
    });
    //
};
//---//
