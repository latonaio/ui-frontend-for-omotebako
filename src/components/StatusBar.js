import React from "react";
import styled from "styled-components";
import checkIcon from ".././assets/images/check.png";
import CheckinStatus from "../components/CheckinStatus";
import nfcReader from "../../src/assets/images/payments/nfc-reader.png";
import paymentIcon from "../../src/assets/images/payment-icon.png";
import roomIcon from "../../src/assets/images/ryokan.png";
import cameraIcon from "../../src/assets/images/checkin.png";
import maintainIcon from "../../src/assets/images/maintain_masters/maintain-icon.png";
import calendar from "../assets/images/calendar-header.png";
import accounting from "../assets/images/calendar-header.png";
import checkoutIcon from ".././assets/images/checkout-icon.png";
import hands from ".././assets/images/hands.png";

const StatusBar = (
  {
    phase,
    location = {
      pathname: ''
    },
    display
  }
) => {
  const message = {
    cameraSet: "カメラを起動しました",
    checkIn: "お客様のチェックインを行っています",
    displayingInfo:
      "お客さま情報を表示しています, チェックインが完了しています",
    checkinDone: "チェックインが完了しました",
    finishCheckin:
      "お客さま情報を表示しています, チェックインを完了させてください",
    nfcReader: "NFC Readerが接続されています。",
    showPayentDetail: "会計明細を確認しています。",
    checkout: "お客さまのチェックアウトを行っています。",
    finishCheckout: "チェックアウトが完了しました。",
    viewingRoom: "客室の情報を照会しています",
    maintainMasters: "マスタ情報を照会・更新します",
    maintainMastersProduct: "商品マスタ の マスタ情報を照会・更新します",
    maintainMastersRoom: "客室マスタ の マスタ情報を照会・更新します",
    maintainMastersPrice: "価格マスタ の マスタ情報を照会・更新します",
    reservationDisplay: "予約状況を照会しています",
    reservationGuestDetail:
      "予約状況を照会しています, お客さま情報を表示しています",
    displayAccounting: "売上情報を紹介しています",
    roomAssignment: "お客様に部屋を割り当てます",
    customerInfoDisplay: "顧客の情報を確認しています。"
  };

  return (
    <Container>
      <Column>
        <Row>
          {
            (
              display === 'customerInfoDisplay' &&
              <span className={'displayFlex'}>
                <Icon src={hands} />
                <Message>
                  {message.customerInfoDisplay}
                </Message>
              </span>
            )
          }
          {(phase === "CHOOSE_PAYMENT_METHOD" ||
            phase === "CONFIRM_PAYMENT" ||
            phase === "SHOW_PAYMENT_DETAIL") && <Icon src={nfcReader} large />}
          {(phase === "SYNC_GUEST_LIST_MESSAGE" ||
            phase === "DISPLAY_RESERVATION_LIST" ||
            phase === "DISPLAY_EXISTING_GUEST_INFO" ||
            phase === "CHECK_RESERVATIONS" ||
            phase === "DISPLAY_NEW_GUEST_INFO" ||
            phase === "CHECKIN_EXISTING_GUEST" ||
            phase === "ASSIGN_ROOM" ||
            phase === "CHOOSE_PAYMENT_METHOD" ||
            phase === "AFTER_CHECKIN" ||
            phase === "DISPLAY_EXISTING_NEW_GUEST" ||
            phase === "CONFIRM_PAYMENT") && <Icon src={cameraIcon} />}
          {(phase === "CHOOSE_PAYMENT_METHOD" ||
            phase === "CONFIRM_PAYMENT") && <Icon src={checkIcon} />}
          {phase === "VIEWING_ROOM" && <Icon src={roomIcon} />}
          {location.pathname.includes("/maintain-masters") && (
            <Icon src={maintainIcon} large />
          )}
          {(phase === "FINISH_AUTH" ||
            phase === "CONFIRM_CHECKOUT" ||
            phase === "DISPLAY_CUSTOMER_INFO" ||
            phase === "FINISH_CHECKOUT") && <Icon src={checkoutIcon} />}
          {(location.pathname.includes("/reservations")) && (
            <Icon src={calendar} />
          )}
          {(location.pathname.includes("/reservation/detail/")) && (
            <Icon src={calendar} />
          )}
          {(location.pathname.includes("/reservation/room/assignment/")) && (
            <span className={'displayFlex'}>
              <Icon src={calendar} />
              <Message>
                {message.roomAssignment}
              </Message>
            </span>
          )}
          {location.pathname.includes("/accounting") && (
            <Icon src={accounting} large />
          )}
          {location.pathname.includes("/sales-slip") && (
            <Icon src={accounting} large />
          )}
          {location.pathname.includes("/customer-info/detail") &&
            <Icon src={hands} />}
          <Message>
            {(phase === "CHOOSE_PAYMENT_METHOD" ||
              phase === "CONFIRM_PAYMENT" ||
              phase === "SHOW_PAYMENT_DETAIL") &&
              message.nfcReader}
            {(phase === "DISPLAY_RESERVATION_LIST" ||
              phase === "ASSIGN_ROOM" ||
              phase === "SYNC_GUEST_LIST_MESSAGE") &&
              message.checkIn}
            {(phase === "CHECKIN_EXISTING_GUEST" ||
              phase === "CHECK_RESERVATIONS") &&
              message.checkIn}
            {phase === "DISPLAY_EXISTING_GUEST_INFO" && message.checkIn}
            {phase === "DISPLAY_NEW_GUEST_INFO" && message.finishCheckin}
            {phase === "AFTER_CHECKIN" && message.checkinDone}
            {phase === "FINISH_CHECKOUT" && message.finishCheckout}
            {phase === "VIEWING_ROOM" && message.viewingRoom}
            {location.pathname === "/maintain-masters" &&
              message.maintainMasters}
            {location.pathname === "/maintain-masters/product" &&
              message.maintainMastersProduct}
            {location.pathname === "/maintain-masters/room" &&
              message.maintainMastersRoom}
            {location.pathname === "/maintain-masters/price" &&
              message.maintainMastersPrice}
            {location.pathname === "/reservations" &&
              message.reservationDisplay}
            {location.pathname.includes("/reservation/detail") &&
              message.reservationGuestDetail}
            {location.pathname.includes("/accounting") &&
              message.displayAccounting}
            {location.pathname.includes("/sales-slip") &&
              message.displayAccounting}
            {location.pathname.includes("/room-assignment") &&
              <span className={'displayFlex'}>
                <Icon src={hands} />
                <Message>
                  {message.customerInfoDisplay}
                </Message>
              </span>
            }
            {(phase === "FINISH_AUTH" || phase === "CONFIRM_CHECKOUT" || phase === "DISPLAY_CUSTOMER_INFO") &&
              message.checkout}
            {location.pathname === "/customer-info" &&
              <span className={'displayFlex'}>
                <Icon src={hands} />
                <Message>
                  {message.customerInfoDisplay}
                </Message>
              </span>
            }
            {(
              location.pathname.includes("/customer-info/detail")
            ) &&
              message.customerInfoDisplay}
            {location.pathname.includes("/customer-info/room/assignment") &&
              <span className={'displayFlex'}>
                <Icon src={hands} />
                <Message>
                  {message.customerInfoDisplay}
                </Message>
              </span>
            }
            {/*<br />*/}
          </Message>
        </Row>
        <Row>
          {phase === "SHOW_PAYMENT_DETAIL" && (
            <>
              <Icon src={paymentIcon} large />
              <Message>{message.viewingRoom}</Message>
            </>
          )}
        </Row>
      </Column>
      <CheckinStatus phase={phase} location={location} />
    </Container>
  );
};

export default StatusBar;

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 9;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin-right: auto;
  align-items: center;
`;

const Message = styled.div`
  font-size: 3.2rem;
  font-family: "Segoe UI Black";
  font-weight: bold;
  display: flex;
  flex-direction: column;
  white-space: pre;
`;

const Icon = styled.img`
  height: ${(props) => (props.large ? "70" : "50")}px;
  width: ${(props) => (props.large ? "70" : "50")}px;
  margin: 8px;
  right: 175px;
`;
