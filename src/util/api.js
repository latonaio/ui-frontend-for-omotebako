import {
  getFetch as getFetchFromRequestManager,
  putFetch as putFetchFromRequestManager,
  postFetch as postFetchFromRequestManager,
  deleteFetch as deleteFetchFromRequestManager,
  getFetchForGif as getFetchForGifFromRequestManager,
  postFetchForImg as postFetchForImgFromRequestManager,
} from "../util/requestManager";

const FetchMixin = {
  getFetch: {
    getGuestInfo: async (id) => {
      return await getFetchFromRequestManager(`guest/${id}`);
    },
    getRedisGuestInfo: async (guestId) => {
      return await getFetchFromRequestManager(`redis/stay-guests/${guestId}`);
    },
    getRooms: async () => {
      return await getFetchFromRequestManager(`rooms`);
    },
    getGuestReservations: async (guestId) => {
      return await getFetchFromRequestManager(`guest/${guestId}/reservations`);
    },
    getReservationList: async (checkin) => {
      return await getFetchFromRequestManager(`reservations?checkin=${checkin}`);
    },
    getReservationDetail: async (reservationId) => {
      return await getFetchFromRequestManager(`reservations/${reservationId}`);
    },
    getRoomVacancy: async ({checkinTime, checkoutTime }) => {
      return await getFetchFromRequestManager(`room-vacancy?` + new URLSearchParams({
        checkin: checkinTime,
        checkout: checkoutTime
      }));
    },
    getCheckinRecord: async (guestId) => {
      return await getFetchFromRequestManager(`transaction/checkin/${guestId}`);
    },
    getFaceAuthState: async (key) => {
      return await getFetchFromRequestManager(`auth/${key}`);
    },
    getStayGuestInfo: async (guestId) => {
      return await getFetchFromRequestManager(`stay-guests/guest/${guestId}`);
    },
    getStayGuestsRooms: async () => {
      return await getFetchFromRequestManager(`stay-guests-room/`);
    },
    getCleaningStatus: async (roomId) => {
      return await getFetchFromRequestManager(`rooms/${roomId}/cleaning_status`);
    },
    getStaffs: async () => {
      return await getFetchFromRequestManager(`staffs`);
    },
    getRoomInfo: async (roomId, today) => {
      return await getFetchFromRequestManager(`rooms/${roomId}?date=${today}`);
    },
  },
  putFetch: {
    registerRoom: async ({
                           room_name,
                           room_id,
                           assigned_room_key
                         }, guestId) => {
      return await putFetchFromRequestManager(`redis/stay-guests/${guestId}`, {
        room_name,
        room_id,
        assigned_room_key,
      });
    },
    updateStayGuest: async (stayGuest, stayGuestId) => {
      return await putFetchFromRequestManager(`stay-guests/${stayGuestId}`, {
        ...stayGuest
      });
    },
    // todo web socketのみにすると思うの後で確認
    // 保存ボタンを押した時
    updateReservation: async (reservationID) => {
      return await putFetchFromRequestManager(`reservations/${reservationID}`);
    },
    updateGuest: async (guest, guestId) => {
      return await putFetchFromRequestManager(`guest/${guestId}`, {
        ...guest
      });
    },
    updateCleaningStatus: async (roomId, cleaning_status_code, staff_id) => {
      return await putFetchFromRequestManager(`rooms/${roomId}/cleaning_status`, {
        cleaning: {
          cleaningStatusCode: cleaning_status_code,
          staffID: staff_id
        }
      });
    },
  },
  postFetch: {
    checkout: async (guestID) => {
      return await postFetchFromRequestManager(`checkout`, {
        guestID: guestID
      });
    },
    registerStayGuests: async (guestStayInfo) => {
      return await postFetchFromRequestManager(`redis/stay-guests`, {
        ...guestStayInfo
      });
    },
    registerStayGuest: async (guestId) => {
      return await postFetchFromRequestManager(`redis/stay-guests/${guestId}`);
    },
    registerNewGuest: async (newGuestModel) => {
      return await postFetchFromRequestManager(`new-guest`, {
        ...newGuestModel
      });
    },
    registerFaceInfo: async ({
                               guest_id,
                               image_path,
                               gender_by_face,
                               age_by_face,
                             }) => {
      return await postFetchFromRequestManager(`guest/`, {
        guest_id,
        image_path,
        gender_by_face,
        age_by_face,
      });
    },
    registerNewReservation: async (newGuestInfoToAdditionalRecord) => {
      return await postFetchFromRequestManager(`reservations`, {
        ...newGuestInfoToAdditionalRecord
      });
    },
    registerStayGuestsForMysql: async (newStayGuestModel) => {
      return await postFetchFromRequestManager(`stay-guests`, {
        ...newStayGuestModel
      });
    },
  },
  deleteFetch: {
    deleteStayGuests: async () => {
      return await deleteFetchFromRequestManager(`redis/stay-guests`);
    },
  },
  postFetchForImg: {
    image: async (jpegFile) => {
      return await postFetchForImgFromRequestManager(`image`, jpegFile);
    },
    uploadImage: async (roomId, jpegFile) => {
      return await postFetchForImgFromRequestManager(`uploader/room/${roomId}`, jpegFile);
    },
  },
  getFetchForGif: {
    getHomeGirl: async () => {
      return await getFetchForGifFromRequestManager(`homeGirl`);
    },
    getCheckinGirl: async () => {
      return await getFetchForGifFromRequestManager(`checkinGirl`);
    },
  },
}

export const getFetch = FetchMixin.getFetch;
export const putFetch = FetchMixin.putFetch;
export const postFetch = FetchMixin.postFetch;
export const deleteFetch = FetchMixin.deleteFetch;
export const getFetchForGif = FetchMixin.getFetchForGif;
export const postFetchForImg = FetchMixin.postFetchForImg;

