let fetch;

const initializeFetch = async () => {
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
};

initializeFetch();

const GifticonFetcher = (req, res, next) => {
    if (!fetch) {
        console.error('Fetch 초기화 안됨.');
        return;
    }
    fetch('http://3.34.123.111:8000/upload')
        .then(response => response.json())
        .then((responseJson) => {
            console.log(responseJson);
        })
        .catch(error => {
            console.error(error);
        });
};

module.exports = GifticonFetcher;