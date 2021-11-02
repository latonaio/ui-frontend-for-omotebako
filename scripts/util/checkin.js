const path = require('path');

const requestManager = require(path.resolve(__dirname, '../util/requestManager'));

const registerReservationRecord = require(path.resolve(__dirname, '../registerReservationRecord'));
const postFaceImage = require(path.resolve(__dirname, '../postFaceImage'));

const moment = require('moment');

const fs = require('fs');

let customerEnterInfo = {
  name: '',
  kanaName: '',
  lodging: '',
  number_of_guests: '',
  stay_days: '',
  number_of_rooms: '',
  assign_complete: false,
  assigned_rooms: []
};

module.exports = async ({ visitedCustomerGuestId, registerReservationRecordResult, customerInfoJson }) => {
  try {
    // 予め予約情報を入れておく
    // guestIdを取得する
    // console.log('execute registerReservationRecord');
    //
    // // 宿泊日時を現在時刻に変更
    // const currentDate = moment(new Date()).format('YYYY-MM-DD HH:mm');
    //
    // const customerInfoJson = json[targetIndex];
    //
    // const customerRecordInfo = {
    //   "guest_id": null,
    //   "stay_date_from": currentDate,
    //   "stay_days": customerInfoJson.stay_days ? customerInfoJson.stay_days : "1",
    //   "number_of_guests": customerInfoJson.number_of_guests ? customerInfoJson.number_of_guests : "1",
    //   "number_of_guests_male": customerInfoJson.number_of_guests_male ? customerInfoJson.number_of_guests_male : "1",
    //   "number_of_guests_female": customerInfoJson.number_of_guests_female ? customerInfoJson.number_of_guests_female : "0",
    //   "has_child": customerInfoJson.has_child ? customerInfoJson.has_child : 0,
    //   "number_of_rooms": customerInfoJson.number_of_rooms ? customerInfoJson.number_of_rooms : "1",
    //   "gender": customerInfoJson.gender ? customerInfoJson.gender : "2",
    //   "age": customerInfoJson.age ? customerInfoJson.age : "-",
    //   "reservation_method": customerInfoJson.reservation_method ? customerInfoJson.reservation_method : 1,
    //   "is_checkin": customerInfoJson.is_checkin ? customerInfoJson.is_checkin : 0,
    //   "coupon": customerInfoJson.coupon ? customerInfoJson.coupon : 0,
    //   "payment_status": customerInfoJson.payment_status ? customerInfoJson.payment_status : 0,
    //   "payment_method": customerInfoJson.payment_method ? customerInfoJson.payment_method : 0,
    //   "force": true
    // };
    //
    // const visitedCustomerGuestId = process.argv[2] ? process.argv[2] : null;
    //
    // // 固有の情報をセット
    // customerRecordInfo.reservation_holder = customerInfoJson.reservation_holder;
    // customerRecordInfo.reservation_holder_kana = customerInfoJson.reservation_holder_kana;
    // customerRecordInfo.name = customerInfoJson.name;
    // customerRecordInfo.name_kana = customerInfoJson.name_kana;
    // customerRecordInfo.phone_number = customerInfoJson.phone_number;
    // customerRecordInfo.home_address = customerInfoJson.home_address;
    // // 訪れたことのある人かそうでないか
    // // 1は訪れたことのある人
    // customerRecordInfo.new_guest_flag = visitedCustomerGuestId ? 1 : 0;
    //
    // const registerReservationRecordResult = await registerReservationRecord({
    //   ...customerRecordInfo
    // });

    await requestManager.sleep(5000);

    const guestId = visitedCustomerGuestId ? visitedCustomerGuestId : registerReservationRecordResult[0].guest_id;

    console.log('registerReservationRecordResult');
    console.log(registerReservationRecordResult);

    console.log('execute postFaceImage');

    // 画像を登録してfaceInfo情報を取得
    const postFaceImageResult = await postFaceImage(`./dummyFaceImages/${customerInfoJson.image_name}`);

    await requestManager.sleep(8000);

    console.log('success postFaceImage');
    console.log(JSON.stringify(postFaceImageResult));

    // 新規のお客さんであれば
    if (postFaceImageResult.newGuest) {
      console.log(guestId)
      // register-face-image-kubeを動かすためのカンバン
      await requestManager.postFetch('guest/', {
        guest_id: guestId,
        image_path: postFaceImageResult.faceInfo.image_path,
        gender_by_face: postFaceImageResult.faceInfo.gender_by_face,
        age_by_face: postFaceImageResult.faceInfo.age_by_face,
      });
    }

    const executeCheckin = async (guestId) => {
      console.log(`new customer checkin`);

      console.log(`execute requestManager.getFetch guest/${guestId}/reservations`);
      const reservations = await requestManager.getFetch(`guest/${guestId}/reservations`);

      console.log(`success requestManager.getFetch guest/${guestId}/reservations`);
      console.log(`${JSON.stringify(reservations)}`);

      console.log(`execute requestManager.getFetch guest/${guestId}`);

      const guestInfo = await requestManager.getFetch(`guest/${guestId}`);

      console.log(`${JSON.stringify(guestInfo)}`);

      console.log(`success requestManager.getFetch guest/${guestId}`);

      customerEnterInfo = {
        ...customerEnterInfo,
        guest_id: guestId,
        name: guestInfo[0].name,
        kanaName: guestInfo[0].name_kana,
        number_of_guests: reservations[0].number_of_guests,
        stay_days: reservations[0].stay_days,
        number_of_rooms: reservations[0].number_of_rooms,
        assign_complete: reservations[0].assign_complete,
        lodging: reservations[0].assigned_rooms &&
        reservations[0].assigned_rooms.length > 0 ?
          reservations[0].assigned_rooms[0].room_id : '',
        assigned_rooms: reservations[0].assigned_rooms,
        stay_date_from: reservations[0].stay_date_from,
        reservation_id: reservations[0].reservation_id,
      }

      console.log(`execute requestManager.postFetch redis/stay-guests`);
      console.log(JSON.stringify(customerEnterInfo));

      const result = await requestManager.postFetch(`redis/stay-guests`, {
        ...customerEnterInfo
      });

      console.log(`success requestManager.getFetch redis/stay-guests`);
      console.log(`${JSON.stringify(customerEnterInfo)}`);

      // チェックインをする
      await requestManager.postFetch(`redis/stay-guests/${guestId}`)

      console.log(`success checkin redis/stay-guests/${guestId}`);
      console.log(result);
    }

    if (postFaceImageResult.key) {
      // チェックイン
      if (postFaceImageResult.newGuest) {
        await executeCheckin(guestId);

        console.log(`new customer checkin is success`);
      } else {
        await executeCheckin(guestId);
        console.log(`visited customer checkin is success`);
      }
    }
  } catch (e) {
    console.error('checkin error');
    console.error(e);
    if (e.error && e.error.errorDetail && e.error.errorDetail.errors) {
      console.error(JSON.stringify(e.error.errorDetail.errors));
    }
  }
}

