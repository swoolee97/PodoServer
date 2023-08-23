let fetch;
const multer = require('multer');
const FormData = require('form-data');
const storage = multer.memoryStorage(); // 메모리 스토리지를 사용하여 파일을 메모리에 임시 저장
const upload = multer({ storage: storage });
const initializeFetch = async () => {
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
};

initializeFetch();

const GifticonFetcher = async (req, res, next) => {
    try {
        // multer로 파일 파싱
        upload.single('files')(req, res, async (err) => {
            if (err) {
                return res.status(500).send('뭔가 에러');
            }
            console.log('보내기 전 GifticonFetcher req.file : 아무것도 없어야함....',req.file)
            // 파일이 클라이언트에서 제대로 전송되었는지 확인
            if (!req.file) {
                return res.status(400).send('파일 전송 실패');
            }
            const formData = new FormData();
            formData.append('files', req.files.buffer, {
                contentType: req.files.mimetype,
                filename: req.files.originalname
            });

            // 글자 추출 요청
            const response = await fetch('http://3.34.123.111:8000/upload', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });
            const data = await response.json()
            
            req.product_name = JSON.stringify(data.product_name)
            req.exchange_place = data.exchange_place;
            req.expiration_date = data.expiration_date;
            
            next();
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

module.exports = GifticonFetcher;