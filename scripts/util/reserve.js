const path = require('path');

const registerReservationRecord = require(path.resolve(__dirname, `../registerReservationRecord`));

const moment = require('moment');

module.exports = async (customerInfoJson) => {
  try {
    // 予め予約情報を入れておく
    // guestIdを取得する
    console.log('execute registerReservationRecord');

    // 宿泊日時を現在時刻に変更
    const currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm');

    const customerRecordInfo = {
      "guest_id": null,
      "stay_date_from": currentDate,
      "stay_days": customerInfoJson.stay_days ? customerInfoJson.stay_days : "1",
      "number_of_guests": customerInfoJson.number_of_guests ? customerInfoJson.number_of_guests : "1",
      "number_of_guests_male": customerInfoJson.number_of_guests_male || customerInfoJson.number_of_guests_male === 0 ? customerInfoJson.number_of_guests_male : "1",
      "number_of_guests_female": customerInfoJson.number_of_guests_female || customerInfoJson.number_of_guests_female === 0 ? customerInfoJson.number_of_guests_female : "0",
      "has_child": customerInfoJson.has_child ? customerInfoJson.has_child : 0,
      "number_of_rooms": customerInfoJson.number_of_rooms ? customerInfoJson.number_of_rooms : "1",
      "gender": customerInfoJson.gender ? customerInfoJson.gender : "2",
      "age": customerInfoJson.age ? customerInfoJson.age : "-",
      "reservation_method": customerInfoJson.reservation_method ? customerInfoJson.reservation_method : 1,
      "is_checkin": customerInfoJson.is_checkin ? customerInfoJson.is_checkin : 0,
      "coupon": customerInfoJson.coupon ? customerInfoJson.coupon : 0,
      "payment_status": customerInfoJson.payment_status ? customerInfoJson.payment_status : 0,
      "payment_method": customerInfoJson.payment_method ? customerInfoJson.payment_method : 0,
      "force": true,
      // 訪れたことのある人かそうでないか
      // 1は訪れたことのある人
      "new_guest_flag": customerInfoJson.new_guest_flag ? customerInfoJson.new_guest_flag : 0
    };

    // 固有の情報をセット
    customerRecordInfo.reservation_holder = customerInfoJson.reservation_holder;
    customerRecordInfo.reservation_holder_kana = customerInfoJson.reservation_holder_kana;
    customerRecordInfo.name = customerInfoJson.name;
    customerRecordInfo.name_kana = customerInfoJson.name_kana;
    customerRecordInfo.phone_number = customerInfoJson.phone_number;
    customerRecordInfo.home_address = customerInfoJson.home_address;

    const registerReservationRecordResult = await registerReservationRecord({
      ...customerRecordInfo
    });

    console.log('registerReservationRecordResult');
    console.log(registerReservationRecordResult);

    console.log("success add reservation");

    return registerReservationRecordResult;
  } catch (e) {
    console.error('reservation error');
    console.error(e);
    if (e.error && e.error.errorDetail && e.error.errorDetail.errors) {
      console.error(JSON.stringify(e.error.errorDetail.errors));
    }
  }
};

