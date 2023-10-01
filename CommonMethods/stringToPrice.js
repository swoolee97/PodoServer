const stringToPrice = (s) => {
    return parseInt(s.replace(/,/g, '').replace('원', ''), 10);
}

module.exports = stringToPrice;
