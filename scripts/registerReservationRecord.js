const requestManager = require('./util/requestManager');

module.exports = async (reservationRecordData) => {
  // 予約情報を登録
  return await requestManager.postFetch('reservations', {
    ...reservationRecordData
  })
}
