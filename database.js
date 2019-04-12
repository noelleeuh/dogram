//Require SPICED PG//
var spicedPg = require('spiced-pg');
var db = spicedPg(process.env.DATABASE_URL ||'postgres:postgres:postgres@localhost:5432/my-images');
//---//

//Add row to signers DB table//
module.exports.selectAllImages = function selectAllImages() {
    return db.query(`SELECT * FROM images
        ORDER BY created_at DESC
        LIMIT 5`);
};
//---//

//Get next (up to) five images//
module.exports.selectNextImages = function selectNextImages(last_id) {
    return db.query(`SELECT * FROM images
        WHERE id < $1
        ORDER BY created_at DESC
        LIMIT 5`, [last_id]);
};
//---//

//Add images from uploads to DB//
module.exports.insertNewImages = function insertNewImages(title, description, username, amazonURL) {
    return db.query(`INSERT INTO images (title, description, username, url)
        VALUES ($1, $2, $3, $4) RETURNING *`, [title, description, username, amazonURL]);
};
//---//

//Select info from a pic//
module.exports.selectImgInfo = function selectImgInfo(id) {
    return db.query(`SELECT * FROM images WHERE id = $1`, [id]);
};
//---//

//Add comments of picture to DB//
module.exports.insertNewComment = function insertNewComment(comment, username, img_id) {
    return db.query(`INSERT INTO comments (comment, username, img_id)
        VALUES ($1, $2, $3) RETURNING *`, [comment, username, img_id]);
};
//---//

//Select comments of picture to DB//
module.exports.selectImgComments = function selectImgComments(img_id) {
    return db.query(`SELECT * FROM comments
        WHERE img_id = $1`, [img_id]);
};
//---//
