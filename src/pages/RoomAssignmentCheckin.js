import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { Container, Contents, List, ListHeader } from "../components/Common";
import { getFetch, putFetch } from "../util/api";
import p from '../scss/components/Popup.module.scss';
import { setCheckin } from '../redux/actions/checkin';
import { connect } from "react-redux";
import config from "../util/config";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { formatDate } from "../helper/date";

const IMAGE_PATH = config.ReactImagePath;

class RoomAssignmentCheckin extends React.Component {
  constructor(props, context) {
    super(props, context);
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
      guestInfo: {},
      checkin: this.props.checkin
    };
    this.requestRedisManager = null;
  }

  async componentWillMount() {
    const guestId = parseInt(this.props.match.params.guestId);

    const guestInfo = await this.getGuestInfo(guestId);

    const reservations = await this.getGuestReservations(guestInfo.reservation_id);

    const redisGuestInfo = await this.getRedisGuestInfo(guestInfo.guest_id);

    if (this.state.checkin.allocationRoomGuestInfo) {
      this.setState({
        allocationRoomGuestInfo: {
          ...this.state.checkin.allocationRoomGuestInfo,
          stay_date_from: this.state.checkin.allocationRoomGuestInfo.stay_date_from,
          stay_days: this.state.checkin.allocationRoomGuestInfo.stay_days,
          number_of_guests: this.state.checkin.allocationRoomGuestInfo.number_of_guests,
          number_of_rooms: this.state.checkin.allocationRoomGuestInfo.number_of_rooms,
          assigned_rooms: this.state.checkin.allocationRoomGuestInfo.assigned_rooms,
          assign_complete: this.state.checkin.allocationRoomGuestInfo.assign_complete,
          stay_count: this.state.checkin.allocationRoomGuestInfo.stay_count,
          diff_year: this.state.checkin.allocationRoomGuestInfo.diff_year,
          diff_month: this.state.checkin.allocationRoomGuestInfo.diff_month,
          diff_day: this.state.checkin.allocationRoomGuestInfo.diff_day,
        }
      });
    } else {
      // 仮登録したデータがあれば
      if (redisGuestInfo) {
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

  getGuestInfo = async (id) => {
    try {
      const result = await getFetch.getGuestInfo(id);

      let imagePath = '';

      if (this.state.imagePath !== '') {
        // 新規のお客様
        imagePath = this.state.imagePath;

        this.setState({
          guestInfo: result[0],
          imagePath: `${imagePath}`,
        });
      } else {
        // 予約ありのお客様
        imagePath = result[0].face_image_path.split("1/");

        this.setState({
          guestInfo: result[0],
          imagePath: `${IMAGE_PATH}${imagePath[1]}`,
        });
      }

      return result[0];
    } catch (e) {
      console.error("=== GET GUEST INFO ERROR ===", e);
      throw e;
    }
  };

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
      const { guestInfo } = this.state;

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

      this.props.setCheckin({
        ...this.state.checkin,
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

  render() {
    const {
      location,
    } = this.props;

    const {
      guestInfo,
      allocationRoomGuestInfo,
      displayVacancy,
      vacantRooms
    } = this.state;

    return (
      <>
        <Header />
        <Container className="Checkin-Container">
          <Navbar />

          <Contents>
            <Row>
              <Column>
                <span>
                  {this.state.checkin.imagePath ? (
                    <Image src={this.state.checkin.imagePath} />
                  ) : (
                    <ImageSection>No Face Image</ImageSection>
                  )}
                </span>
                <div className='faceInfoLabel'>
                  {guestInfo.face_id_azure
                    ? "Face情報が登録されています"
                    : "Face情報が登録されていません"}
                </div>
                <RoomLabel color={!this.state.allocationRoomGuestInfo.assign_complete && "red"}>
                  {this.state.allocationRoomGuestInfo.assign_complete
                    ? "客室割当が完了しています"
                    : "客室割当が完了していません"}
                </RoomLabel>
                <BackButton
                  onClick={() => {
                    this.props.history.push(`/checkin/guest/info/${this.props.match.params.guestId}`)
                  }}
                >戻る</BackButton>
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
                  <div>宿泊開始日:&nbsp;{allocationRoomGuestInfo.stay_date_from}</div>
                  <div>泊数:&nbsp;{allocationRoomGuestInfo.stay_days}</div>
                  <div>部屋数:&nbsp;{allocationRoomGuestInfo.number_of_rooms}</div>
                  <div>プラン:&nbsp;{'プランテスト'}</div>
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
                  <div
                    className={p.popupOverlay}
                    onClick={() => {
                      this.setState({
                        displayVacancy: false
                      });
                    }}
                  >
                    <div className={p.popup}>
                      <div className={p.title}>
                        部屋割当
                      </div>
                      <div className={p.container}>
                        {vacantRooms.map((vacantRoom, idx) => (
                          <div
                            className={p.listItem}
                            key={idx}
                            onClick={async () => {
                              // チェックインからRoomAssignmentCheckinコンポーネントを呼んでる場合
                              await this.registerRoom({
                                room_name: vacantRoom.room_name,
                                room_id: vacantRoom.room_id
                              })

                              this.setState({
                                displayVacancy: false,
                              });
                            }}
                          >
                            <div style={{ 'text-align': 'left' }}>{vacantRoom.room_id}:{vacantRoom.room_name}</div>
                          </div>
                        ))}
                      </div>
                      <div className={p.buttonCOntainer}>
                        <button
                          onClick={() => {
                            this.setState({
                              displayVacancy: false
                            });
                          }}
                        >
                          閉じる
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Right>
            </Row>
          </Contents>
        </Container>
      </>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    checkin: state.checkin
  };
};

const mapActionsToProps = {
  setCheckin: setCheckin
}

export default connect(mapStateToProps, mapActionsToProps)(RoomAssignmentCheckin);

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
  margin-top: 10px;
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
  margin: 10px 0;
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
  width: 700px;
  height: 388.883px;
  margin-bottom: 20px;
`;

