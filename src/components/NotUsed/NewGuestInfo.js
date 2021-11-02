import React from "react";
import styled from "styled-components";
import { Button } from "../Common";
import { Link } from "react-router-dom";
import "../scss/components/CustomerInfo.scss";
import config from '../../util/config';
const API_URL = config.ReactAppAPIURL;

class NewGuestInfo extends React.Component {
  state = {
    reservations: {
      assigned_rooms: [],
    },
  };

  componentWillMount() {
    const { selectedGuestInfo } = this.props;
    this.getGuestReservations(selectedGuestInfo.guest_id);
  }

  getGuestReservations = (guestID) => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    return fetch(`${API_URL}guest/${guestID}/reservations`, requestOptions)
      .then((response) => response.json())
      .then((reservations) => {
        this.setState({ reservations: reservations });
      })
      .catch((e) => {
        console.error("===GET GUEST RESERVATIONS ERROR===", e);
        throw e;
      });
  };

  render() {
    const {
      imagePath,
      selectedGuestInfo,
      faceInfo,
      message,
      getAgeTag,
      handleOnClickCheckinNew,
      roomAssigned,
      onClickRedoCheckin,
      onClickCheckReservations,
      onClickRoomLabel,
    } = this.props;

    // const { reservations } = this.state;
    const reservations = this.state.reservations[0];

    let number_of_guests,
      name,
      name_kana,
      stay_days,
      face_id_azure,
      room_name;

    if (this.state.reservations.length > 0) {
      const reservation = this.state.reservations[0];
      name = reservation.name;
      name_kana = reservation.name_kana;
      room_name = reservation.assigned_rooms[0] && reservation.assigned_rooms[0].room_name || <div className='text-red'>未割当</div>;
      face_id_azure = reservation.face_id_azure;
      stay_days = reservation.stay_days;
      number_of_guests = reservation.number_of_guests;
    }

    const guestAndDays = () => {
      return <div key={'guestAndDays'} className={'guestAndDays displayFlex'}>
        <div className={'guestAndDays_guests'}>
          人数:
          <span>{number_of_guests}</span>
        </div>
        <div className={'guestAndDays_days'}>
          宿泊数:
          <span>{stay_days}</span>
        </div>
      </div>
    }

    return (
      <NewGuestInfoWrapper>
        <RowStart className="Checkin-ElementsContainerColumn">
          <Column>
            <Image src={imagePath} />
            <div className='faceInfoLabel'>
              {face_id_azure
                ? "Face情報が登録されています"
                : "Face情報が登録されていません"}
            </div>
            <RoomLabel
              onClick={() => onClickRoomLabel(reservations.reservation_id)}
              color={roomAssigned === false && "red"}
            >
              {roomAssigned
                ? "客室割当が完了しています"
                : "客室割当が完了していません"}
            </RoomLabel>
            <ReservationLabel
              onClick={() =>
                onClickCheckReservations(selectedGuestInfo.guest_id)
              }
            >{`予約情報を\n確認する`}</ReservationLabel>
            <CheckinLabel
              onClick={() => onClickRedoCheckin()}
            >{`チェックイン\nをやり直す`}</CheckinLabel>
          </Column>
          <InfoSection>
            <Text>
              <div style={{ 'margin-bottom': '20px' }}>
                {`新規登録のお客さまに関する情報です`}
              </div>
              {/*<LargeText>*/}
              {/*  {(reservations && reservations.name) || ""} {(reservations && reservations.name_kana)||""}*/}
              {/*</LargeText>*/}
              {
                (() => {
                  return [
                    (<div key={'name'}>
                      お名前:
                      <span>{name} 様</span>
                    </div>),
                    (<div key={'kanaName'}>
                      ふりがな:
                      <span>{name_kana} 様</span>
                    </div>),
                    (<div key={'lodging'}>
                      部屋:
                      <span>{room_name}</span>
                    </div>),
                    (guestAndDays())
                  ];
                })()
              }
              <div>
                プラン:テストプラン
              </div>
              <div>
                特徴:{`お連れ様あり, タクシー, 朝食付き, ビジネス,`}
                <br />
                {`早チェックイン, 遅チェックアウト, ベッドメイク◎,`}
                <br />
                {`アメニティセット, ロビー利用, ビール, 禁煙 `}
              </div>
              {/*年齢タグ:{" "}*/}
              {/*{faceInfo &&*/}
              {/*  faceInfo.age_by_face &&*/}
              {/*  getAgeTag(faceInfo.age_by_face)}*/}
            </Text>
          </InfoSection>
        </RowStart>
        <StyledButton
          style={{ 'margin-left': '87px' }}
          onClick={() => handleOnClickCheckinNew(selectedGuestInfo.guest_id)}
        >
          {`チェックインを\n完了する`}
        </StyledButton>
        <FooterMessage>{message.displayingFromGuestList}</FooterMessage>
      </NewGuestInfoWrapper>
    );
  }
}

export default NewGuestInfo;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Text = styled.div`
  font-size: 3.2rem;
  white-space: pre;
  line-height: 1.5;
`;

const LargeText = styled(Text)`
  font-size: 4.8rem;
  // height: 35px;
`;

const InfoSection = styled.div`
  width: 100%;
  height: 100%;
  margin-left: 40px;
  font-family: "UD";
`;

export const Image = styled.img`
  width: 500px;
  height: 275px;
`;

export const NewGuestInfoWrapper = styled.div`
  height: 100%;
  width: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
`;

export const RowStart = styled.div`
  display: flex;
  flex-direction: row;
  width: 90%;
  align-items: flex-start;
  justify-content: flex-start;
  height: 50%;
`;

const FooterMessage = styled(Text)`
  width: 80%;
  position: absolute;
  bottom: 20px;
`;

const StyledButton = styled(Button)`
  position: fixed;
  z-index: 10;
  top: 65%;
`;

const RoomLabel = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;

  border: 2px solid
    ${(props) => (props.color ? props.color : props.theme.primary)};
  border-radius: 5px;
  margin: 5px;
  width: 100%;
  font-size: 2.6rem;
  text-align: center;
  color: white;
  height: 70px;

  background: ${(props) => (props.color ? props.color : props.theme.primary)};
  white-space: pre;
`;

const ReservationLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  border: 2px solid #2f5597;
  border-radius: 10px;
  margin: 10px 5px 5px;
  width: 60%;
  font-size: 2.6rem;
  text-align: center;
  color: white;
  height: 80px;

  background: #2f5597;
  white-space: pre;
`;

const CheckinLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  border: 2px solid #7f5f01;
  border-radius: 10px;
  margin: 5px;
  width: 60%;
  font-size: 2.6rem;
  text-align: center;
  color: white;
  height: 80px;

  background: #7f5f01;
  white-space: pre;
`;
