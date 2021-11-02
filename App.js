import React, { Fragment } from "react";
import { Switch, BrowserRouter as Router, Route, useLocation } from "react-router-dom";

import Header from './src/components/Header';


import { createGlobalStyle } from 'styled-components';

const GlobalCSS = createGlobalStyle`
  @font-face {
    font-family: 'Segoe UI';
    src: local('Segoe UI'), url('/src/assets/fonts/seguibl.ttf') format('ttf');
  }

  @font-face {
    font-family: 'UD';
    src: local('UD'), url('/src/assets/fonts/UD.ttc') format('truetype');
  }

  html, body {
    font-family: 'UD';
  }
`;
class App extends React.Component() {


  render(){
    return (
      <Fragment>
        <GlobalCSS />
        <Header />
        <Router>
          <Switch>
            <Route exact path="/" />
            <Route exact path="/checkin" />
            <Route exact path="/checkout"/>
            <Route exact path="/room-management" />
            <Route exact path="/customer-info"  />
            <Route exact path="/customer-info/detail/:stayGuestID"  />
            <Route exact path="/reservations"/>
            <Route exact path="/reservation/detail/:id" />
            <Route path="/payments/:reservationID" />
            <Route path="/payments/:reservationID/detail"  />
            <Route exact path="/maintain-masters" />
            <Route exact path="/maintain-masters/product"  />
            <Route exact path="/maintain-masters/room"  />
            <Route exact path="/maintain-masters/facility" />
            <Route exact path="/maintain-masters/price" />
            <Route exact path="/room-detail/:roomID" />
            <Route exact path="/room-assignment/:guestID/:reservationDate/:checkoutDate"/>
            <Route exact path="/calendar" />
            <Route exact path="/accounting"/>
            <Route exact path="/sales-slip"/>
          </Switch>
        </Router>
      </Fragment>
    );
  }

};

export default App;

