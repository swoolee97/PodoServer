const uploadToS3 = async (req, res, next) => {
    try {
        const params = {
            Bucket: 'parantestbucket2', // your bucket name,
            Key: `${Date.now()}_${req.tempFile.originalname}`, // 파일을 저장할 경로와 파일 이름
            Body: req.tempFile.buffer, // 파일 객체
            ACL: 'public-read', // 권한 설정
            ContentType: req.tempFile.mimetype // 파일 형식
        };
        
        // S3에 업로드
        s3.upload(params, (s3Err, data) => {
            if (s3Err) {
                console.error(s3Err);
                return res.status(500).send('S3 업로드 실패');
            }
            // 성공적으로 업로드되면, data 객체에서 파일의 URL을 얻을 수 있습니다.
            console.log(`File uploaded successfully at ${data.Location}`);
            next();
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('S3 업로드 실패');
    }
};