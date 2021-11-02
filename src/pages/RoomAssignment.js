import React from "react";
import styled from "styled-components";
import { Container, List, ListHeader } from "../components/Common";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import StatusBar from "../components/StatusBar";
import { Link } from "react-router-dom";
import config from '../util/config';
const API_URL = config.ReactAppAPIURL;
const IMAGE_PATH = config.ReactImagePath;

class RoomAssignment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayVacancy: false,
      list: [],
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
        stay_date_to: "",
        create_date: "",
        stay_date: "",
        assigned_rooms: [],
        assign_complete: false
      },
    };
  }

  componentDidMount() {
    const { stayGuestID, reservationDate, checkoutDate } = this.props.match.params;
    this.getStayGuestById(stayGuestID);
  }

  getVacantRooms = (date) => {
    fetch(`${API_URL}room-vacancy?date=${date}`, {})
      .then((response) => response.json())
      .then((result) => {
        if (result && result.data && result.data.length === 0) {
          alert("空いてる部屋がありません。");
        }
        this.setState({
          vacantRooms: result.data,
          selectedDate: date,
          displayVacancy: true,
        });
      })
      .catch((e) => {
        console.error("=== GET VACANT ROOMS ERROR ===", e);
        throw e;
      });
  };

  formatDate = (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  getStayGuestById = (stayGuestID) => {
    fetch(`${API_URL}stay-guests/${stayGuestID}`, {})
      .then((response) => response.json())
      .then((result) => {
        if (result && result.length > 0) {
          this.setState({
            roomAssigned:
              result[0].assigned_rooms.length >= result[0].stay_days * result[0].number_of_rooms,
          });
        }
        let list = [];
        if (result && result.length > 0) {
          list = this.returnList(result);
          this.setState({
            result: result[0],
            list,
          });
        }
      })
      .catch((e) => {
        console.error("=== GET ROOM ASSIGNMENT ERROR ===", e);
        throw e;
      });
  };

  registerRoom = (date, room_id, numOfGuests) => {
    const { stayGuestID } = this.props.match.params;

    let guestID = this.state.result.guest_id;
    let reservationID = this.state.result.reservation_id;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stayGuestID, reservationID, numOfGuests, guestID }),
    };

    return fetch(`${API_URL}rooms/${room_id}/assignment/${date}`, requestOptions)
      .then((res) => {
        if (res.ok) {
          setTimeout(() => window.location.reload(), 3000);
          return true;
        }
      })
      .catch((e) => {
        console.error("=== REGISTER ROOM ERROR ===", e);
        throw e;
      });
  };

  returnList(result) {
    let items = [];

    let stay_days = result[0].stay_days;
    let stay_date_from = result[0].stay_date_from;
    let number_of_rooms = result[0].number_of_rooms;

    let count = 0;
    for (let d = 0; d < stay_days; d++) {
      let date = new Date(stay_date_from);
      date.setDate(date.getDate() + d);
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      if (String(day).length === 1) {
        day = "0" + day;
      }

      let newDate = [year, month, day].join("-");
      let rooms = result[0].assigned_rooms.filter(x => x.stay_date === newDate)
      for (let i = 0; i < number_of_rooms; i++) {
        let rn = "";
        if (rooms[i]) {
          rn = rooms[i].room_name;
        } else {
          rn = <div className='text-red'>未割当</div>;
        }

        items.push({
          date: newDate,
          room_count: i + 1,
          room_name: rn,
        });
        count++;
      }
    }
    return items;
  }

  render() {
    const { location } = this.props;
    const {
      selectedDate,
      displayVacancy,
      vacantRooms,
      list,
      result: {
        reservation_id,
        name,
        name_kana,
        stay_days,
        plan,
        face_image_path,
        number_of_guests,
        stay_date_from,
        number_of_rooms,
        assigned_rooms,
      },
      roomAssigned,
    } = this.state;

    const imagePath = face_image_path && face_image_path.split("1/");

    return (
      <>
        <Header />
        <Container>
          <Navbar />
          <Contents>
            <div className="row">
              <StatusBar location={location} />
            </div>
            <Row>
              <Column>
                {imagePath ? (
                  <Image src={`${IMAGE_PATH}${imagePath && imagePath[1]}`} />
                ) : (
                  <ImageSection>No Face Image</ImageSection>
                )}

                <div className='faceInfoLabel'>
                  {imagePath
                    ? "Face情報が登録されています"
                    : "Face情報が登録されていません"}
                </div>
                <RoomLabel
                  style={{
                    textDecoration: 'none',
                    margin: '5px 0'
                  }}
                  color={!!!this.state.result.assign_complete && "red"}
                >
                  {!!this.state.result.assign_complete
                    ? "客室割当が完了しています"
                    : "客室割当が完了していません"}
                </RoomLabel>
                <BackButton to={"/customer-info"}>戻る</BackButton>
              </Column>
              <Right>
                <GuestInfoSection>
                  <Name>
                    {name} {name_kana} 様
                  </Name>
                  {/*<div>前回宿泊日: 1週間前(10回目)</div>*/}
                  <div>今回宿泊: {(assigned_rooms[0] && assigned_rooms[0].room_name) || <div className='text-red'>未割当</div>}</div>
                  <div>プラン: {plan}</div>
                  <div>宿泊日: {stay_date_from}</div>
                  <div>泊数: {stay_days}日</div>
                  <div>部屋数: {number_of_rooms}部屋</div>
                </GuestInfoSection>

                <StyledListHeader>
                  <Center>宿泊日</Center>
                  <Center>部屋ーカウント</Center>
                  <Center>部屋割当</Center>
                  <Center>人数割当</Center>
                </StyledListHeader>
                <ListContainer>
                  {list &&
                    list.length > 0 &&
                    list.map((i, idx) => (
                      <StyledList key={idx}>
                        <Center>{i.date}</Center>
                        <Center>{i.room_count}</Center>
                        <Center onClick={() => this.getVacantRooms(i.date)}>
                          {i.room_name || <div className='text-red'>未割当</div>}
                        </Center>
                        <Center>{number_of_guests}</Center>
                      </StyledList>
                    ))}
                </ListContainer>
                {displayVacancy && (
                  <Popup>
                    {vacantRooms.map((i, idx) => (
                      <StyledListRooms
                        key={idx}
                        onClick={() =>
                          this.registerRoom(selectedDate, i.room_id, reservation_id, number_of_guests)
                        }
                      >
                        <Center>{i.room_id}:{i.room_name}</Center>
                      </StyledListRooms>
                    ))}
                  </Popup>
                )}
              </Right>
            </Row>
          </Contents>
        </Container>
      </>
    );
  }
}

export default RoomAssignment;

const ListContainer = styled.div`
  max-height: 400px;
  overflow-y: scroll;
`;

const ImageSection = styled.div`
  width: 500px;
  height: 275px;
  background: #c4c4c4;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0 30px;
`;

const Popup = styled.div`
  width: 300px;
  height: 500px;
  position: fixed;
  z-index: 99;
  bottom: 0;
  right: 0;
  background: white;
  border: 1px solid black;
  overflow-y: scroll;
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

const Right = styled.div``;

const StyledListHeader = styled(ListHeader)`
  grid-template-columns: 150px 250px 250px 150px;
`;

const StyledList = styled(List)`
  grid-template-columns: 150px 250px 250px 150px;
`;

const StyledListRooms = styled(List)`
  grid-template-columns: 250px;
`;

export const Contents = styled.div`
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
  font-family: "UD";
`;

const RoomLabel = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;

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
  padding: 0 30px;
`;

const Image = styled.img`
  width: 500px;
  height: 275px;
  margin-bottom: 20px;
`;
