const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const path = require('path')

aws.config.update({
    region : 'ap-northeast-2',
})

var s3 = new aws.S3();

const allowedExtensions = ['.png','.jpg','.jpeg','.bmp']
const uploadS3 = multer({
    storage : multerS3({
        s3 : s3,
        bucket : 'parantestbucket2',
        key : (req, file, callback) => {
            console.log('@@@@@@@ : ',req)
            const extension = path.extname(file.originalname)
            if(!allowedExtensions.includes(extension)){
                return callback(new Error('wrong extension'))
            }
            callback(null, `${Date.now()}_${file.originalname}`);
        },
        acl :'public-read'
    })
})

module.exports = uploadS3;
