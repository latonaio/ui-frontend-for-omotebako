import React from "react";
import s from '../scss/components/CheckStatus.module.scss'
import arrow from ".././assets/images/arrow.png";

const Status = ({ phase, location, type = '' }) => {
  const title =
    location.pathname.includes("/checkout")
      ? "＜チェックアウト手続きのステータス＞"
      : "＜チェックイン手続きのステータス＞";

  return (
    <div className={s.container}>
      {(type === '' && location.pathname === "/checkin" ||
        location.pathname.includes("/checkin/guest/info") ||
        location.pathname.includes("/checkin/guest/complete")) && (
          <div>
            <div>{title}</div>
            <div className={s.row}>
              <div className={`${phase === "SETUP_CAMERA" ? `${s.textActive}` : `${s.text}`}`}>
                撮影
            </div>
            →
            <div className={`${phase === "DISPLAY_RESERVATION_LIST" ||
                phase === "DISPLAY_NEW_GUEST_INFO" ||
                phase === "DISPLAY_EXISTING_GUEST_INFO" ||
                phase === "SYNC_GUEST_LIST_MESSAGE" ||
                phase === "ASSIGN_ROOM" ||
                phase === "CHECK_RESERVATIONS" ||
                phase === "CHECKIN_EXISTING_GUEST" ?
                `${s.textActive}` : `${s.text}`}`}
              >
                確認/登録
            </div>
            →
            <div className={`${phase === "AFTER_CHECKIN" ? `${s.textActive}` : `${s.text}`}`}>完了</div>
            </div>
            <img className={s.arrow} src={arrow} />
          </div>
        )}

      {(type === '' && location.pathname === "/checkout" ||
        location.pathname.includes("/payments") ||
        location.pathname.includes("/checkout/finish/auth") ||
        location.pathname.includes("/checkout/guest/info") ||
        location.pathname.includes("/checkout/guest/complete")) && (
          <div>
            <div>{title}</div>
            <div className={s.row}>
              <div className={`${phase === "SETUP_CAMERA" ||
                phase === "DISPLAY_CUSTOMER_INFO" ?
                `${s.textActive}` : `${s.text}`}`}
              >
                撮影
            </div>
            →
            <div className={`${phase === "FINISH_AUTH" ||
                phase === "CONFIRM_CHECKOUT" ||
                phase === "CHOOSE_PAYMENT_METHOD" ||
                phase === "CONFIRM_PAYMENT" ||
                phase === "SHOW_PAYMENT_DETAIL" ?
                `${s.textActive}` : `${s.text}`}`}
              >
                会計
            </div>
            →
            <div className={`${phase === "DISPLAY_EXISTING_GUEST_INFO" ||
                phase === "DISPLAY_EXISTING_GUEST_INFO" ||
                phase === "CHECKIN_EXISTING_GUEST" ||
                phase === "FINISH_CHECKIN_NEW_GUEST" ||
                phase === "FINISH_CHECKOUT" ?
                `${s.textActive}` : `${s.text}`}`}
              >
                完了
            </div>
            </div>
            <img className={s.arrow} src={arrow} />
          </div>
        )}
    </div>
  );
};

export default Status;
