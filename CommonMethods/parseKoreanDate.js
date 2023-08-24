const parseKoreanDateString = (koreanDateString) => {
    const yearRegex = /(\d{4})년/;
    const monthRegex = /(\d{1,2})월/;
    const dayRegex = /(\d{1,2})일/;

    const yearMatch = koreanDateString.match(yearRegex);
    const monthMatch = koreanDateString.match(monthRegex);
    const dayMatch = koreanDateString.match(dayRegex);

    if (yearMatch && monthMatch && dayMatch) {
        const year = parseInt(yearMatch[1], 10);
        const month = parseInt(monthMatch[1], 10) - 1;  // JavaScript의 month는 0-11 사이입니다
        const day = parseInt(dayMatch[1], 10);

        return new Date(year, month, day);
    } else {
        return null;  // 또는 적절한 에러 처리
    }
}
module.exports = parseKoreanDateString