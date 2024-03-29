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
        // multer로 파일 파싱
        upload.array('files',2)(req, res, async (err) => {
            // 파일이 클라이언트에서 제대로 전송되었는지 확인
            console.log(req.body)
            if (!req.files || req.files.length != 1) {
                return res.status(400).send({message : '기프티콘 이미지는 한 장이어야 합니다'});
            }
            req.tempFiles = req.files.map(files => ({
                buffer: files.buffer,
                mimetype: files.mimetype,
                originalname: files.originalname
            }));
            const formData = new FormData();
            req.tempFiles.forEach(tempFile => {
                formData.append('files', tempFile.buffer, {
                    type: tempFile.mimetype,
                    filename: tempFile.originalname
                });
            });
            // 진짜 코드임 @@@@@@@@@@@@@
            // if(!data.is_matching_barcodes){
            //     return res.status(501).json({message : '동일한 기프티콘을 등록해주세요'})
            // }
            
            // 진짜 코드임 @@@@@@@@@@@@@
            // req.product_name = data.results[0].product_name;
            // req.exchange_place = data.results[0].exchange_place;
            // req.expiration_date = data.results[0].expiration_date;
            // req.barcode_number = data.results[0].barcode_number
            req.product_name = data.result.name;
            req.price = data.result.price;
            req.image_url = data.result.image_url;
            req.exchange_place = data.result.exchange_place;
            req.expiration_date = data.result.expiration_date;
            // req.barcode_number = "1234567890"
            
            // s3업로드
            const params = {
                Bucket: 'parantestbucket2',
                Key: `${Date.now()}_${req.tempFiles[0].originalname}`,
                Body: req.tempFiles[0].buffer,
                ContentType: req.tempFiles[0].mimetype,
                ACL: 'public-read'
            };

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