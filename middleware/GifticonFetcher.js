let fetch;
const multer = require('multer');
const FormData = require('form-data');
const storage = multer.memoryStorage(); // 메모리 스토리지를 사용하여 파일을 메모리에 임시 저장
const upload = multer({ storage: storage });
const initializeFetch = async () => {
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
};
const aws = require('aws-sdk');
const parseKoreanDateString = require('../CommonMethods/parseKoreanDate');

aws.config.update({
    region: 'ap-northeast-2',
})

var s3 = new aws.S3();
initializeFetch();

const GifticonFetcher = async (req, res, next) => {
    try {
        console.log(req.body)
        // multer로 파일 파싱
        upload.array('files',2)(req, res, async (err) => {

            // 파일이 클라이언트에서 제대로 전송되었는지 확인
            if (!req.files || req.files.length != 2) {
                return res.status(400).send({message : '기프티콘 이미지는 두 장이어야 합니다'});
            }
            req.tempFiles = req.files.map(file => ({
                buffer: file.buffer,
                mimetype: file.mimetype,
                originalname: file.originalname
            }));
            
            const formData = new FormData();

            req.tempFiles.forEach(tempFile => {
                formData.append('files', tempFile.buffer, {
                    contentType: tempFile.mimetype,
                    filename: tempFile.originalname
                });
            });
            console.log('req.tempFiles : ', req.tempFiles)
            // 글자 추출 요청
            const response = await fetch('http://3.34.123.111:8000/upload', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });
            
            const data = await response.json()
            const date = parseKoreanDateString(data[0].expiration_date)
            req.product_name = data[0].product_name;
            req.exchange_place = data[0].exchange_place;
            req.expiration_date = data[0].expiration_date;
            
            const params = {
                Bucket: 'parantestbucket2',
                Key: `${Date.now()}_${req.tempFiles.originalname}`,
                Body: req.tempFiles.buffer,
                ContentType: req.tempFiles.mimetype,
                ACL: 'public-read'
            };
            console.log('params : ',params)
            req.key = params.Key;
            s3.upload(params, function (err, data) {
                if (err) {
                    console.error(err)
                    return res.status(500).send({message :'S3 업로드 실패'});
                }
                req.location = data.Location;
                next();
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

module.exports = GifticonFetcher;