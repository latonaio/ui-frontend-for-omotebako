import React from "react";
import { connect } from 'react-redux';
import "./App.scss";
import { ThemeProvider } from "styled-components";
import LoaderOverlay from './components/LoaderOverlay'
import {
  Switch,
  BrowserRouter as Router,
  Route,
  Redirect,
} from "react-router-dom";
import Home from "./pages/Home";
import Reservations from "./pages/reservations/index";
import ReservationsRegister from "./pages/reservations/Register";
import Checkin from "./pages/Checkin.js";
import Checkout from "./pages/Checkout.js";
import RoomManagement from "./pages/RoomManagement";
import RoomDetail from "./pages/RoomDetail";
import RoomAssignment from "./pages/RoomAssignment";
import CustomerInfo from "./pages/@CustomerInfo";
import CustomersReservations from "./pages/customers/Reservations";
import CustomersRooms from "./pages/customers/Rooms";
import CustomersOthers from "./pages/customers/Others";
import CustomersDetail from "./pages/customers/Detail";
import SiteController from "./pages/SiteController";
import MaintainMasters from "./pages/maintain_masters/MaintainMasters";
import MaintainMastersProduct from "./pages/maintain_masters/MaintainMastersProduct";
import MaintainMastersFacility from "./pages/maintain_masters/MaintainMastersFacility";
import MaintainMastersRoom from "./pages/maintain_masters/MaintainMastersRoom";
import MaintainMastersPrice from "./pages/maintain_masters/MaintainMastersPrice";
import MaintainMastersBackup from "./pages/maintain_masters/MaintainMastersBackup";
import MaintainMastersDSetting from "./pages/maintain_masters/MaintainMastersSetting";
import Calendar from "./pages/Calendar";
import Payments from "./pages/Payments";
import PaymentsDetail from "./pages/PaymentsDetail";
import Accounting from "./pages/accounting/index";
import AccountingDetail from "./pages/accounting/detail";
import SalesSlip from "./pages/SalesSlip";
import IdleTimer from "react-idle-timer";
import ReservationsGuestDetail from "./pages/ReservationsGuestDetail";
import ReservationList from "./pages/ReservationList";
import GuestDetail from "./pages/customers/GuestDetail";
import GuestInfo from "./pages/checkin/GuestInfo";
import ReservationRoomAssignment from "./pages/reservations/RoomAssignment";
import RoomAssignmentCheckin from "./pages/RoomAssignmentCheckin";
import CheckinComplete from "./pages/CheckinComplete";
import GuestListMessage from "./pages/checkin/GuestListMessage";
import ExistingGuest from "./pages/checkin/ExistingGuest";
import FinishAuth from "./pages/checkout/FinishAuth";
import CheckoutGuestInfo from "./pages/checkout/GuestInfo";
import CheckoutComplete from "./pages/checkout/CheckoutComplete";

import Test from "./pages/Test.js";
import Test1 from "./pages/Test1.js";

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.idleTimer = null;
    this.state = {
      redirect: false,
      common: this.props.common,
    };
  }

  handleOnIdle = () => {
    this.setState({ redirect: true });
  };

  handleOnAction = () => {
    this.setState({ redirect: false });
  };

  render() {
    const { redirect } = this.state;
    const theme = {
      primary: "#00B0F0",
      yellow: "#F7FE72",
      white: "#FFF",
      grey: "#C4C4C4",
    };
    const {
      common,
    } = this.state;

    return (
      <>
        <IdleTimer
          ref={(ref) => {
            this.idleTimer = ref;
          }}
          timeout={1000 * 60 * 3} //3分
          onIdle={() => this.handleOnIdle()}
          debounce={250}
          onAction={() => this.handleOnAction()}
        />
        <ThemeProvider theme={theme}>
          <LoaderOverlay />
          <Router>
            <Switch>
              <Route exact path="/" component={Home} />
              {redirect === true && <Redirect to="/" />}
              <Route exact path="/room-management" component={RoomManagement} />
              <Route exact path="/room-detail/:roomID" component={RoomDetail} />

              {/* 宿泊管理 */}
              <Route exact path="/reservations" component={Reservations} />
              <Route exact path="/reservations/register" component={ReservationsRegister} />

              {/* 顧客管理 */}
              <Route exact path="/customer-info" component={CustomerInfo} />
              <Route exact path="/customers/reservations" component={CustomersReservations} />
              <Route exact path="/customers/rooms" component={CustomersRooms} />
              <Route exact path="/customers/others" component={CustomersOthers} />
              <Route exact path="/customers/detail/:stayGuestID" component={CustomersDetail} />
              <Route exact path="/guest/detail/:guestID" component={GuestDetail} />

              <Route exact path="/checkin" component={Checkin} />
              <Route exact path="/checkin/reservation/list" component={ReservationList} />
              <Route exact path="/checkin/guest/info/:guestId" component={GuestInfo} />
              <Route exact path="/checkin/guest/complete/:guestId" component={CheckinComplete} />
              <Route exact path="/checkin/guest/room/assignment/:guestId" component={RoomAssignmentCheckin} />
              <Route exact path="/checkin/guest-list-message" component={GuestListMessage} />
              <Route exact path="/checkin/existing-guest" component={ExistingGuest} />
              <Route exact path="/checkout" component={Checkout} />
              <Route exact path="/checkout/finish/auth/:guestId" component={FinishAuth} />
              <Route exact path="/checkout/guest/info/:guestId" component={CheckoutGuestInfo} />
              <Route exact path="/checkout/guest/complete/:guestId" component={CheckoutComplete} />
              <Route exact path="/reservation/detail/:id" component={ReservationsGuestDetail} />
              <Route exact path="/reservation/room/assignment/:reservationId" component={ReservationRoomAssignment} />
              <Route exact path="/customer-info/room/assignment/:stayGuestID" component={ReservationRoomAssignment} />
              <Route exact path="/site-controller" component={SiteController} />
              <Route exact path="/maintain-masters" component={MaintainMasters} />
              <Route exact path="/maintain-masters/room" component={MaintainMastersRoom} />
              <Route exact path="/maintain-masters/product" component={MaintainMastersProduct} />
              <Route exact path="/maintain-masters/facility" component={MaintainMastersFacility} />
              <Route exact path="/maintain-masters/price" component={MaintainMastersPrice} />
              <Route exact path="/maintain-masters/backup" component={MaintainMastersBackup} />
              <Route exact path="/maintain-masters/setting" component={MaintainMastersDSetting} />
              <Route exact path="/payments/:reservationID" component={Payments} />
              <Route exact path="/payments/:reservationID/detail" component={PaymentsDetail} />

              {/* 売上管理 */}
              <Route exact path="/accounting" component={Accounting} />
              <Route exact path="/accounting/detail" component={AccountingDetail} />

              <Route exact path="/calendar" component={Calendar} />
              <Route exact path="/sales-slip" component={SalesSlip} />
              <Route exact path="/room-assignment/:stayGuestID/:reservationDate/:checkoutDate" component={RoomAssignment} />
              <Route exact path="/test" component={Test} />
              <Route exact path="/test1" component={Test1} />
            </Switch>
          </Router>
        </ThemeProvider>
      </>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    common: state.common,
  };
};

export default connect(mapStateToProps)(App);
