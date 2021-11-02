import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { List, ListHeader } from "../components/Common";
import { getFetch, putFetch } from "../util/api";
import config from '../util/config';
import {
  formatDate, formatDateWithHyphen
} from "../helper/date";
import RequestRedisManager from "../util/requestRedisManager";

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;
const API_URL = process.env.ReactAppAPIURL;

class RoomAssignmentCheckin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayVacancy: false,
      roomAllocationList: [],
      vacantRooms: [{ room_id: "", room_name: "" }],
      roomAssigned: false,
      result: {
        name: "",
        name_kana: "",
        plan: "",
        face_image_path: "",
        reservation_method_name: "",
        home_address: "",
        phone_number: "",
        stay_date_from: "",
        create_date: "",
        number_of_rooms: "",
        number_of_guests: "",
        stay_days: "",
        assigned_rooms: [],
      },
      reservations: [],
      isHasReservation: false,
      // 割当られる宿泊者の情報
      allocationRoomGuestInfo: {
        stay_date_from: '',
        stay_days: '',
        number_of_guests: '',
        number_of_rooms: '',
        assigned_rooms: [], // 割り当てられた部屋のリスト
        assign_complete: false,
        stay_count: 0,
        diff_year: 0,
        diff_month: 0,
        diff_day: 0,
      },
      assignedRoomKey: null,
      roomAssignmentId: null,
    };
    this.requestRedisManager = null;
  }

  async componentWillMount() {
    const {
      guestInfo,
      layoutType,
      customerEnterInfo
    } = this.props;

    const reservations = await this.getGuestReservations(guestInfo.reservation_id);

    const redisGuestInfo = await this.getRedisGuestInfo(guestInfo.guest_id);

    // 予約詳細ページから呼んでいる場合
    if (layoutType === 'reservationGuestDetail') {
      this.setState({
        allocationRoomGuestInfo: {
          ...this.state.allocationRoomGuestInfo,
          ...customerEnterInfo,
          stay_date_from: customerEnterInfo.stay_date_from,
          stay_days: customerEnterInfo.stay_days,
          number_of_guests: customerEnterInfo.number_of_guests,
          number_of_rooms: customerEnterInfo.number_of_rooms,
          assigned_rooms: customerEnterInfo.assigned_rooms,
          assign_complete: customerEnterInfo.assign_complete,
          stay_count: customerEnterInfo.stay_count,
          diff_year: customerEnterInfo.diff_year,
          diff_month: customerEnterInfo.diff_month,
          diff_day: customerEnterInfo.diff_day,
        }
      });

      this.requestRedisManager = new RequestRedisManager(RequestRedisManagerAPIURL);

      this.requestRedisManager.io.on('getReservationDetail', async (data) => {
        this.setState({
          allocationRoomGuestInfo: {
            ...this.state.allocationRoomGuestInfo,
            ...data,
            stay_date_from: data.stay_date_from,
            stay_days: data.stay_days,
            number_of_guests: data.number_of_guests,
            number_of_rooms: data.number_of_rooms,
            assigned_rooms: data.assigned_rooms,
            assign_complete: data.assign_complete,
          }
        });
      });
    } else {
      // 仮登録したデータがあれば
      if (redisGuestInfo) {
        console.log('redisGuestInfo: ');
        console.log(redisGuestInfo);

        this.setState({
          allocationRoomGuestInfo: {
            ...this.state.allocationRoomGuestInfo,
            stay_date_from: redisGuestInfo.stay_date_from,
            stay_days: redisGuestInfo.stay_days,
            number_of_guests: redisGuestInfo.number_of_guests,
            number_of_rooms: redisGuestInfo.number_of_rooms,
            assigned_rooms: redisGuestInfo.assigned_rooms,
            assign_complete: redisGuestInfo.assign_complete,
            stay_count: redisGuestInfo.stay_count,
            diff_year: redisGuestInfo.diff_year,
            diff_month: redisGuestInfo.diff_month,
            diff_day: redisGuestInfo.diff_day,
          }
        });
      } else {
        // 予約情報があれば
        if (reservations.length > 0) {
          this.setState({
            allocationRoomGuestInfo: {
              ...this.state.allocationRoomGuestInfo,
              stay_date_from: reservations[0].stay_date_from,
              stay_days: reservations[0].stay_days,
              number_of_guests: reservations[0].number_of_guests,
              number_of_rooms: reservations[0].number_of_rooms,
              assigned_rooms: reservations[0].assigned_rooms,
              assign_complete: reservations[0].assign_complete,
            }
          });
        }
      }
    }
  }

  async componentWillUnmount() {
    if (this.requestRedisManager) {
      this.requestRedisManager.io.close();
    }
  }

  // 空き部屋を取得してポップアップリストを出す
  getVacantRooms = async (date, assignedRoomKey, roomAssignmentId) => {
    try {
      const reserveDate = new Date(date);
      const reserveDateTime = formatDate(reserveDate);

      const vacantRooms = await getFetch.getRoomVacancy({
        checkinTime: reserveDateTime,
        checkoutTime: reserveDateTime
      });

      this.setState({
        vacantRooms: vacantRooms.data,
        selectedDate: date,
        displayVacancy: true,
        assignedRoomKey,
        roomAssignmentId
      });

    } catch (e) {
      console.error("Error:", e.message);
    }
  };

  // 割り当てる部屋（1部屋）を登録する
  registerRoom = async (date, room_no) => {
    try {
      const { guestInfo } = this.props;

      const registerRoomResult = await putFetch.registerRoom({
        room_name: date.room_name,
        room_id: date.room_id,
        assigned_room_key: this.state.assignedRoomKey,
      }, guestInfo.guest_id);

      this.setState({
        displayVacancy: false
      });

      this.setState({
        allocationRoomGuestInfo: {
          ...this.state.allocationRoomGuestInfo,
          assigned_rooms: registerRoomResult.assigned_rooms,
          assign_complete: registerRoomResult.assign_complete
        }
      });
    } catch (e) {
      console.error("Error:", e.message);
    }
  };

  // Redisに仮登録されたデータを取得
  getRedisGuestInfo = async (guestId) => {
    try {
      const result = await getFetch.getRedisGuestInfo(guestId);

      this.setState({
        allocationRoomGuestInfo: {
          ...this.state.allocationRoomGuestInfo,
          stay_date_from: result.stay_date_from,
          stay_days: result.stay_days,
          number_of_guests: result.number_of_guests,
          number_of_rooms: result.number_of_rooms,
          assigned_rooms: result.assigned_rooms
        }
      })

      return result;
    } catch (e) {
      console.error("Error:", e.message);
    }
  };

  // getRoomCount = (guestID, dateFrom, dateTo) => {
  //   return fetch(
  //     `${API_URL}room-count?guestID=${guestID}&dateFrom=${dateFrom}&dateTo=${dateTo}`
  //   )
  //     .then((response) => response.json())
  //     .then((res) => {
  //       return res.data[0].count;
  //     })
  //     .catch((error) => {
  //       console.error("===GET ROOM COUNT ERROR===", error);
  //     });
  // };

  // 予約情報を取得する
  getGuestReservations = async (guestID) => {
    try {
      const reservations = await getFetch.getGuestReservations(guestID);
      return reservations ? reservations : []
    } catch (e) {
      console.error("=== GET GUEST RESERVATIONS ERROR ===", e);
      throw e;
    }
  };

  render() {
    const {
      imagePath,
      onClickBack,
      guestInfo,
      location,
      layoutType,
      customerEnterInfo,
      reservationId,
      isExistImage
    } = this.props;

    const {
      displayVacancy,
      vacantRooms,
      result: {
        plan,
      },
      allocationRoomGuestInfo,
      assignedRoomKey,
      roomAssignmentId,
    } = this.state;

    const face_id_azure = guestInfo.face_id_azure;

    return (
      <Contents>
        <Row>
          <Column>
            {/* layoutTypeがreservationGuestDetailの場合はhttp://localhost:30080/nullでくるため */}
            <span className={`${layoutType === 'reservationGuestDetail' ? '' : 'dis-n'}`}>
              {isExistImage === 'true' ? (
                <Image src={imagePath} />
              ) : (
                <ImageSection>No Face Image</ImageSection>
              )}
            </span>
            <span className={`${layoutType !== 'reservationGuestDetail' ? '' : 'dis-n'}`}>
              {imagePath ? (
                <Image src={imagePath} />
              ) : (
                <ImageSection>No Face Image</ImageSection>
              )}
            </span>
            <div className='faceInfoLabel'>
              {face_id_azure
                ? "Face情報が登録されています"
                : "Face情報が登録されていません"}
            </div>
            <RoomLabel color={!this.state.allocationRoomGuestInfo.assign_complete && "red"}>
              {this.state.allocationRoomGuestInfo.assign_complete
                ? "客室割当が完了しています"
                : "客室割当が完了していません"}
            </RoomLabel>
            {
              layoutType === 'reservationGuestDetail' && (
                <BackButton
                  className={'mt-10px'}
                  onClick={() => onClickBack()}
                >戻る</BackButton>
              )
            }
            {
              layoutType !== 'reservationGuestDetail' && (
                <BackButton
                  onClick={() => onClickBack()}
                >戻る</BackButton>
              )
            }
          </Column>
          <Right>
            <GuestInfoSection>
              <Name>
                {guestInfo.name} {guestInfo.name_kana} 様
              </Name>
              {
                (() => {
                  if (allocationRoomGuestInfo.stay_count > 0) {
                    return (
                      <div>前回宿泊日:&nbsp;
                        <span className={`${allocationRoomGuestInfo.diff_year > 0 ? '' : 'dis-n'}`}>{allocationRoomGuestInfo.diff_year}年</span>
                        <span className={`${allocationRoomGuestInfo.diff_month > 0 ? '' : 'dis-n'}`}>{allocationRoomGuestInfo.diff_month}ヶ月</span>
                        <span className={`${allocationRoomGuestInfo.diff_day > 0 ? '' : 'dis-n'}`}>{allocationRoomGuestInfo.diff_day}日</span>
                        <span>前</span>
                        <span>({allocationRoomGuestInfo.stay_count + 1}回目)</span>
                      </div>
                    )
                  }
                })()
              }
              {/*<div>宿泊:{this.state.allocationRoomGuestInfo.assigned_rooms && this.state.allocationRoomGuestInfo.assigned_rooms.length > 0 ? allocationRoomGuestInfo.assigned_rooms[0].room_name : "未割当" }</div>*/}
              <div>宿泊開始日:&nbsp;{allocationRoomGuestInfo.stay_date_from}</div>
              <div>泊数:&nbsp;{allocationRoomGuestInfo.stay_days}</div>
              <div>部屋数:&nbsp;{allocationRoomGuestInfo.number_of_rooms}</div>
              <div>プラン:&nbsp;{plan}</div>
            </GuestInfoSection>

            <StyledListHeader>
              <Center>宿泊日</Center>
              <Center>部屋ーカウント</Center>
              <Center>部屋割当</Center>
              <Center>人数割当</Center>
            </StyledListHeader>
            {/* 部屋割当リスト */}
            <ListContainer>
              {this.state.allocationRoomGuestInfo.assigned_rooms &&
                this.state.allocationRoomGuestInfo.assigned_rooms.length > 0 &&
                this.state.allocationRoomGuestInfo.assigned_rooms.map((assignedRoom, idx) => (
                  <StyledList key={idx}>
                    <Center>{assignedRoom.stay_date}</Center>
                    <Center>{assignedRoom.room_count}</Center>
                    <Center onClick={async () => {
                      await this.getVacantRooms(assignedRoom.stay_date, assignedRoom.assigned_room_key, assignedRoom.room_assignment_id)
                    }}>
                      {assignedRoom.room_name || <div className='text-red'>未割当</div>}
                    </Center>
                    <Center>{allocationRoomGuestInfo.number_of_guests}</Center>
                  </StyledList>
                ))}
            </ListContainer>
            {displayVacancy && (
              <Popup>
                {vacantRooms.map((vacantRoom, idx) => (
                  <StyledList
                    key={idx}
                    onClick={async () => {
                      if (layoutType === 'reservationGuestDetail') {
                        this.requestRedisManager.io.emit('editAssignedRoomFromReservation', JSON.stringify({
                          room_id: vacantRoom.room_id,
                          reservation_id: parseInt(reservationId),
                          assigned_room_key: assignedRoomKey,
                          room_assignment_id: roomAssignmentId,
                          stay_days: allocationRoomGuestInfo.stay_days,
                          number_of_rooms: allocationRoomGuestInfo.number_of_rooms,
                        }));

                        window.location.reload();
                      } else {
                        // チェックインからRoomAssignmentCheckinコンポーネントを呼んでる場合
                        await this.registerRoom({
                          room_name: vacantRoom.room_name,
                          room_id: vacantRoom.room_id
                        })
                      }
                    }}
                  >
                    <div style={{ 'text-align': 'left' }}>{vacantRoom.room_id}:{vacantRoom.room_name}</div>
                  </StyledList>
                ))}
              </Popup>
            )}
          </Right>
        </Row>
      </Contents>
    );
  }
}

export default RoomAssignmentCheckin;

const ListContainer = styled.div`
  max-height: 300px;
  overflow-y: scroll;
`;

const ImageSection = styled.div`
  width: 700px;
  height: 388.883px;
  background: #c4c4c4;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0 30px;
`;

const Popup = styled.div`
  width: 400px;
  position: fixed;
  z-index: 99;
  top: 33%;
  left: 1330px;
  background: white;
  border: 1px solid black;
`;

const Center = styled.div`
  text-align: center;
`;

const BackButton = styled(Link)`
  color: white;
  background: #2f5597;
  border-radius: 10px;
  height: 70px;
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 200px 0;
  text-decoration: none;
`;

const Right = styled.div`
  font-family: "UD";
`;

const StyledListHeader = styled(ListHeader)`
  grid-template-columns: 150px 250px 250px 150px;
`;

const StyledList = styled(List)`
  grid-template-columns: 150px 250px 250px 150px;
`;

const Contents = styled.div`
  width: 1670px;
  font-size: 3rem;
  display: flex;
  justify-content: start;
  align-items: start;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  width: 90%;
  align-items: flex-start;
  justify-content: flex-start;
  height: 100%;
`;

const Name = styled.div`
  font-size: 4rem;
  margin: 10px 0;
`;

const GuestInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px;
  font-size: 3rem;
  line-height: 1.5;
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

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  padding: 30px;
  height: 100%;
`;

const Image = styled.img`
  width: 500px;
  height: 275px;
  margin-bottom: 20px;
`;
