const updateDates = (type) => { // type이 0일땐 미션. 1일땐 포인트 유효기간
    let today = new Date().getTime() + (9 * 60 * 60 * 1000);
    today = new Date(today)
    // 시작 시각 설정 (00:00:00)
    let startDate = new Date(today);
    startDate.setUTCHours(0, 0, 0, 0);
    // 마지막 시각 설정 (23:59:59)
    let expireDate;
    if (type == 0) {
        expireDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000));
    }else {
        expireDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000 * 180));
    }
    return [today, startDate, expireDate]
}

module.exports = updateDates