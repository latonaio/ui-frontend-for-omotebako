import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import config from '../util/config';

const API_URL = config.ReactAppAPIURL;

class CheckinReservation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reservations: [{
        stay_date_from: "",
      }],
      page: 1,
      editing: null,
      stay_date_from: null,
      name: null,
      name_kana: null,
      stay_days: null,
      gender: null,
      age: null,
      phone_number: null,
      number_of_guests: null,
      number_of_rooms: 0,
      reservation_method: null,
      payment_method: null,
      payment_status: null,
      coupon: null,
      home_address: null,
      updated: null,
      message: null,
      create_date: null,
      addingNewRecord: false,
      new_days: 0,
      is_checkin: 0,
      new_number_of_guests: 0,
    };
  }

  componentWillMount() {
    const { guestInfo } = this.props;
    this.getGuestReservations(guestInfo.guest_id);
  }

  getGuestReservations = (guestID) => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    return fetch(`${API_URL}guest/${guestID}/reservations`, requestOptions)
      .then((response) => response.json())
      .then((reservations) => {
        this.setState({ reservations });
      })
      .catch((e) => {
        console.error("=== GET GUEST RESERVATIONS ERROR ===", e);
        throw e;
      });
  };

  editReservation = (data, id) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    };

    return fetch(`${API_URL}reservations/edit/${id}`, requestOptions)
      .then((res) => {
        const { guestInfo } = this.props;
        if (res.ok) {
          this.setState({
            updated: true,
            editing: null,
            message: `${this.state.editing + 1}行目が更新されました。`,
          });
          this.getGuestReservations(guestInfo.guest_id);
          return true;
        }
      })
      .catch((e) => {
        console.error("=== EDIT RESERVATION ERROR ===", e);
        throw e;
      });
  };

  handleOnChange = (e, idx) => {
    if (e.target.name === "stay_days") {
      const val = e.target.value.split("/");
      this.setState({
        stay_days: val[0],
        number_of_guests: val[1],
        editing: idx,
      });
    } else if (e.target.name === "name") {
      const val = e.target.value.split(",");
      this.setState({
        name: val[0],
        name_kana: val[1],
        editing: idx,
      });
    } else if (e.target.name === "new_days") {
      const val = e.target.value.split("/");
      this.setState({
        new_days: val[0],
        new_number_of_guests: val[1],
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value,
        editing: idx,
      });
    }
  };


  handleOnKeyDown = (e, id) => {
    let data = {};
    if (e.key === "Enter") {
      if (id) {
        const {
          editing,
          name,
          name_kana,
          gender,
          age,
          phone_number,
          stay_date_from,
          stay_days,
          number_of_guests,
          number_of_rooms,
          reservation_method,
          coupon,
          reservation_id,
          payment_method,
          payment_status,
          reservations,
          home_address,
          is_checkin,
          create_date,
        } = this.state;

        data = {
          name: name || reservations[editing].name,
          name_kana: name_kana || reservations[editing].name_kana,
          gender: gender || reservations[editing].gender,
          age: age || reservations[editing].age,
          stay_date_from:
            stay_date_from || reservations[editing].stay_date_from,
          stay_days: stay_days || reservations[editing].stay_days,
          number_of_guests:
            number_of_guests || reservations[editing].number_of_guests,
          number_of_rooms: number_of_rooms || reservations[editing].number_of_rooms,
          reservation_method:
            reservation_method || reservations[editing].reservation_method,
          payment_method: payment_method || reservations[editing].payment_method,
          payment_status: payment_status || reservations[editing].payment_status,
          coupon: coupon || reservations[editing].coupon,
          is_checkin: is_checkin || reservations[editing].is_checkin,
          phone_number: phone_number || reservations[editing].phone_number,
          home_address: home_address || reservations[editing].home_address,
          reservation_id: reservation_id || reservations[editing].reservation_id,
          change_date: create_date || reservations[editing].create_date,
        };
        // this.validateData(data);
        this.editReservation(data, id);
      }
      if (!id) {
        const {
          new_name,
          new_name_kana,
          new_age,
          new_phone_number,
          new_stay_date_from,
          new_days,
          new_number_of_guests,
          new_number_of_rooms,
          new_reservation_method,
          new_coupon,
          new_payment_method,
          new_payment_status,
          new_home_address,
        } = this.state;

        const new_data = {
          name: new_name,
          name_kana: new_name_kana,
          gender: 1,
          age: new_age,
          phone_number: new_phone_number,
          stay_date_from: new_stay_date_from,
          stay_days: new_days || 1,
          number_of_guests: new_number_of_guests || 1,
          number_of_rooms: new_number_of_rooms || 1,
          reservation_method: new_reservation_method || 1,
          payment_method: new_payment_method || 1,
          payment_status: new_payment_status || 1,
          coupon: new_coupon || 1,
          home_address: new_home_address || "test",
        };
        // this.validateData(data);
        this.addReservation(new_data);
      }
    }
  };

  handleOnClickDelete = (reservationID) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    return fetch(
      `${API_URL}reservations/delete/${reservationID}`,
      requestOptions
    )
      .then((res) => {
        if (res.ok) {
          this.setState({
            updated: true,
            message: `予約をキャンセルしました。`,
          });
          setTimeout(() => window.location.reload(), 3000);
          return true;
        }
      })
      .catch((err) => alert("エラー：" + err));
  };

  render() {
    const { goBack, onSelectCheckinReservation, selectedReservationID } = this.props;
    const {
      reservations,
      stay_date_from,
      stay_days,
      number_of_guests,
      number_of_rooms,
      reservation_method,
      coupon,
      gender,
      age,
      payment_status,
      payment_method,
      phone_number,
      page,
      editing,
      home_address,
      updated,
      message,
    } = this.state;

    return (
      <Container>
        {page === 1 && (
          <div>
            <StyledListHeader>
              <Text>顧客名</Text>
              <Text>{`新規/\n既存`}</Text>
              <Text>宿泊日</Text>
              <Text>{`泊数/\n人数`}</Text>
              <Text>部屋数</Text>
              <Text>性別</Text>
              <Text>年齢</Text>
              <Text>予約経路</Text>
              <Text>{`チェック\nイン`}</Text>
              <Text></Text>
            </StyledListHeader>

            {reservations.map((i,idx) =>
              editing === idx ? (
                <StyledList
                  active={editing === idx ? "true" : "false"}
                  key={idx}

                >
                  <Row>
                    <NameStyle>{`${i.name}  ,${i.name_kana}`}</NameStyle>
                    {i.face_id_azure && <Face>Face</Face>}
                  </Row>
                  <StyledInput
                    active={editing === idx ? "true" : "false"}
                    name="stay_date_from"
                    value={i.new_guest === 0 ? "既存" : "新規"}
                  />
                  <StyledInput
                    name="stay_date_from"
                    value={
                      stay_date_from === null
                        ? i.stay_date_from
                        : stay_date_from
                    }
                    active={editing === idx ? "true" : "false"}
                    onChange={(e) => this.handleOnChange(e, idx)}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  />
                  <StyledInput
                    name="stay_days"
                    active={editing === idx ? "true" : "false"}
                    onChange={(e) => this.handleOnChange(e, idx)}
                    value={`${stay_days === null ? i.stay_days : stay_days}/${
                      number_of_guests === null
                        ? i.number_of_guests
                        : number_of_guests
                    }`}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  />
                  <StyledInput
                    name="number_of_rooms"
                    active={editing === idx ? "true" : "false"}
                    onChange={(e) => this.handleOnChange(e, idx)}
                    value={
                      number_of_rooms === 0
                        ? i.number_of_rooms
                        : number_of_rooms
                    }
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  />
                  <StyledSelect
                    name="gender"
                    value={gender === null ? i.gender : gender}
                    onChange={(e) => this.handleOnChange(e, idx)}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  >
                    <option
                      value={1}
                      selected={idx === editing ? gender === 1 : i.gender === 1}
                    >
                      女性
                    </option>
                    <option
                      value={2}
                      selected={idx === editing ? gender === 2 : i.gender === 2}
                    >
                      男性
                    </option>
                    <option
                      value={3}
                      selected={idx === editing ? gender === 3 : i.gender === 3}
                    >
                      その他
                    </option>
                  </StyledSelect>
                  <StyledInput
                    name="age"
                    active={editing === idx ? "true" : "false"}
                    onChange={(e) => this.handleOnChange(e, idx)}
                    value={age === null ? i.age : age}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  />

                  <StyledSelect
                    name="reservation_method"
                    value={
                      reservation_method === null
                        ? i.reservation_method
                        : reservation_method
                    }
                    onChange={(e) => this.handleOnChange(e, idx)}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  >
                    <option
                      value={1}
                      selected={
                        idx === editing
                          ? reservation_method === 1
                          : i.reservation_method === 1
                      }
                    >
                      自社HP
                    </option>
                    <option
                      value={2}
                      selected={
                        idx === editing
                          ? reservation_method === 2
                          : i.reservation_method === 2
                      }
                    >
                      XXXXXXXXXX
                    </option>
                  </StyledSelect>
                  <CheckBoxSection>
                    <CheckBox
                      name="is_checkin"
                      type="checkbox"
                      value={1}
                      onChange={(e) => onSelectCheckinReservation(i.reservation_id)}
                      onKeyDown={(e) =>
                        this.handleOnKeyDown(e, i.reservation_id)
                      }
                      checked={selectedReservationID === i.reservation_id}
                    />
                  </CheckBoxSection>
                </StyledList>
              ) : (
                <StyledList
                onClick={() => this.setState({editing: idx})}
                >
                  <Row onClick={() => this.setState({editing: idx})}>
                    <NameStyle>
                      {i.name && (i.name || "未登録")} ,
                      {i.name_kana && (i.name_kana || "未登録")}
                    </NameStyle>
                    {i.face_id_azure && <Face>Face</Face>}
                  </Row>
                  <Text>{i.new_guest_flag === 1 ? "新規" : "既存"}</Text>
                  <Text>{i.stay_date_from.substr(0,10) || "-"}</Text>
                  <Text>
                    {i.stay_days || "-"} / {i.number_of_guests || "-"}
                  </Text>
                  <Text>{i.number_of_rooms || "-"}</Text>
                  <Text>
                    {i.gender === 1 && "女性"}
                    {i.gender === 2 && "男性"}
                    {i.gender === 3 && "その他"}
                    {i.gender === 0 && "-"}
                    {i.gender === null && "-"}
                  </Text>
                  <Text>{i.age || "-"}</Text>
                  <Text>{i.reservation_method_name}</Text>
                </StyledList>
              )
            )}
          </div>
        )}

        {page === 2 && (
          <div>
            <StyledListHeader2>
              <Text>顧客名</Text>
              <Text>クーポン</Text>
              <Text>決済</Text>
              <Text>支払方法</Text>
              <Text>連絡先</Text>
              <Text>住所</Text>
              <Text></Text>
            </StyledListHeader2>
            {reservations.map((i, idx) =>
              editing === idx ? (
                <StyledList2 active={"true"} >
                  <Row>
                    <NameStyle>{`${i.name && i.name}  ,${i.name_kana}`}</NameStyle>
                    {i.face_id_azure && <Face>Face</Face>}
                  </Row>
                  <StyledSelect
                    name="coupon"
                    value={coupon === null ? i.coupon : coupon}
                    onChange={(e) => this.handleOnChange(e, idx)}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  >
                    <option
                      value={1}
                      selected={idx === editing ? coupon === 1 : i.coupon === 1}
                    >
                      有
                    </option>
                    <option
                      value={0}
                      selected={idx === editing ? coupon === 0 : i.coupon === 0}
                    >
                      無
                    </option>
                  </StyledSelect>
                  <StyledSelect
                    name="payment_status"
                    value={
                      payment_status === null
                        ? i.payment_status
                        : payment_status
                    }
                    onChange={(e) => this.handleOnChange(e, idx)}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  >
                    <option
                      value={1}
                      selected={
                        idx === editing
                          ? payment_status === 1
                          : i.payment_status === 1
                      }
                    >
                      済
                    </option>
                    <option
                      value={0}
                      selected={
                        idx === editing
                          ? payment_status === 0
                          : i.payment_status === 0
                      }
                    >
                      未
                    </option>
                  </StyledSelect>
                  <StyledSelect
                    name="payment_method"
                    value={
                      payment_method === null
                        ? i.payment_method
                        : payment_method
                    }
                    onChange={(e) => this.handleOnChange(e, idx)}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  >
                    <option
                      value={1}
                      selected={
                        idx === editing
                          ? payment_method === 1
                          : i.payment_method === 1
                      }
                    >
                      現金
                    </option>
                    <option
                      value={2}
                      selected={
                        idx === editing
                          ? payment_method === 0
                          : i.payment_method === 0
                      }
                    >
                      クレジット
                    </option>
                    <option
                      value={3}
                      selected={
                        idx === editing
                          ? payment_method === 0
                          : i.payment_method === 0
                      }
                    >
                      振り込み
                    </option>
                    <option
                      value={4}
                      selected={
                        idx === editing
                          ? payment_method === 0
                          : i.payment_method === 0
                      }
                    >
                      コンビニ
                    </option>
                  </StyledSelect>
                  <StyledInput
                    name="phone_number"
                    value={
                      phone_number === null ? i.phone_number : phone_number
                    }
                    onChange={(e) => this.handleOnChange(e)}
                    active={"true"}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  />
                  <StyledInput
                    name="home_address"
                    value={
                      home_address === null ? i.home_address : home_address
                    }
                    onChange={(e) => this.handleOnChange(e, idx)}
                    active={editing === idx ? "true" : "false"}
                    onKeyDown={(e) => this.handleOnKeyDown(e, i.reservation_id)}
                  />
                  <Center>
                    <FontAwesomeIcon
                      onClick={() => this.handleOnClickDelete(i.reservation_id)}
                      icon={faTrashAlt}
                      style={{color: "red"}}
                    />
                  </Center>
                </StyledList2>
              ) : (
                <StyledList2  onClick={()=>this.setState({editing: idx})}>
                  <Row>
                    <NameStyle>
                      {i.name && (i.name || "未登録")} ,
                      {i.name_kana && (i.name_kana || "未登録")}
                    </NameStyle>
                    {i.face_id_azure && <Face>Face</Face>}
                  </Row>
                  <Text>{i.coupon === 0 ? "無" : "有"}</Text>
                  <Text>{i.payment_status === 2 ? "済" : "未"}</Text>
                  <Text>{i.payment_method_name || "ー"}</Text>
                  <Text>{i.phone_number}</Text>
                  <Text>{i.home_address}</Text>
                </StyledList2>
              )
            )}

          </div>

        )}

        {page === 2 && (
          <ArrowButtonRight onClick={() => this.setState({ page: 1 })} />
        )}
        {page === 1 && (
          <ArrowButtonLeft onClick={() => this.setState({ page: 2 })} />
        )}
        <FooterMessage>{updated && message}</FooterMessage>
        <BackButton onClick={goBack}>戻る</BackButton>
      </Container>
    );
  }
}

export default CheckinReservation;

const FooterMessage = styled.div`
  text-align: right;
  margin-top: 20px;
`;


const CheckBox = styled.input`
  width: 20px;
  height: 20px;
`;


const CheckBoxSection = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 2.6rem;
`;

const BackButton = styled.div`
  color: white;
  background: #2f5597;
  border-radius: 10px;
  height: 80px;
  width: 230px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 350px 20px 20px;
  text-decoration: none;
  position: fixed;
  bottom: 50px;
`;

const Container = styled.div`
  height: 80%;
`;

const Row = styled(Link)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  text-decoration: none;
  color: #3968bf;
`;

const Face = styled.div`
  width: 100px;
  height: 30px;
  background-color: #001662;
  border-radius: 5px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px;
  margin: 0 20px;
  font-size: 2.4rem;
  font-family: "Segoe";
`;

const ArrowButtonLeft = styled.div`
  width: 0;
  height: 0;
  border-top: 40px solid transparent;
  border-bottom: 40px solid transparent;
  border-left: 40px solid #dceffa;
  margin-top: auto;
  margin-bottom: auto;
  position: fixed;
  right: 0;
  top: 50%;
`;

const ArrowButtonRight = styled.div`
  width: 0;
  height: 0;
  border-top: 40px solid transparent;
  border-bottom: 40px solid transparent;
  border-right: 40px solid #dceffa;
  margin-top: auto;
  margin-bottom: auto;
  margin-right: auto;
  position: fixed;
  left: 13vw;
  top: 50%;
`;

const StyledListHeader = styled.div`
  display: grid;
  grid-template-rows: 1em;
  font-size: 3rem;
  align-items: center;
  text-align: left;
  background: ${(props) => props.theme.primary};
  color: white;
  align-content: center;
  grid-template-columns: 500px 100px 180px 100px 120px 100px 100px 150px 130px 50px;
  height: 100px;
  text-align: center;
  padding: 15px;
`;

const StyledList = styled(Link)`
  display: grid;
  grid-template-columns: 500px 100px 180px 100px 120px 100px 100px 150px 130px 50px;
  padding: 15px;
  align-items: center;
  color: #3968bf;
  font-family: "Segoe UI";
  cursor: pointer;
  border-bottom: 1px solid #c7c7c7;
  text-align: center;
  text-decoration: none;
  background-color: ${(props) =>
    props.active === "true" ? `#aed6c3` : `#FFF`};
  &:hover {
    background-color: #aed6c3;
  }
`;

const StyledListHeader2 = styled(StyledListHeader)`
  grid-template-columns: 500px 150px 100px 140px 230px 400px 50px;
`;

const StyledList2 = styled(StyledList)`
  grid-template-columns: 500px 150px 100px 140px 230px 400px 50px;
`;

const Text = styled.div`
  text-decoration: none;
  font-size: 2.4rem;
  text-overflow: clip;
  line-height: 1.5;
  white-space: pre;
`;

const NameStyle = styled(Text)`
  margin: 0 20px;
  text-decoration: none;
  font-size: 2.4rem;
  text-overflow: clip;
  line-height: 1.5;
  color: #3968bf;
`;

const StyledSelect = styled.select`
  width: 100px;
  height: 40px;
  font-size: 2rem;
  margin-left: auto;
  margin-right: auto;
  border-radius: 5px;
  background: white;
  text-align-last: center;
`;

const StyledInput = styled.input`
  text-align: center;
  border: none;
  font-size: 2.4rem;
  outline: none;
  color: #3968bf;
  background-color: ${(props) => props.active === "true" && "#aed6c3"};
  font-family: "Segoe UI";
  width: fill-available;
`;

const Center = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
