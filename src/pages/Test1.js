import React from "react";
import styled from "styled-components";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { Container } from "../components/Common";
import { connect } from 'react-redux';
import { submitValue } from '../redux/actions/submittedValueActions';
import { setReservation, removeReservation, getReservation } from '../redux/actions/reservation';

import { store } from '../redux/store';

class Test extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      defaultInput: this.props.defaultInput,
      reservation: this.props.reservation
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    this.props.removeReservation();

    console.log('this.state.reservation: 1');
    console.log(this.state.reservation);

    console.log('this.props.reservation: 1');
    console.log(this.props.reservation);

    console.log('store.getState().checkin: 1');
    console.log(store.getState().checkin);
  }

  componentDidMount() {
    this.props.removeReservation();

    console.log('this.state.reservation: 2');
    console.log(this.state.reservation);

    // console.log(store.getState);
    // console.log('this.props: ');
    // console.log(this.props);
    // console.log('this.state.defaultInput: ');
    // console.log(this.state.defaultInput);
  }

  handleChange(event) {
    this.setState({
      defaultInput: event.target.value
    });
  }

  render() {
    const {
      reservation
    } = this.props;

    const {

    } = this.state;

    return (
      <>
        <Header />
        <Container>
          {/*<div>*/}
          {/*  <input type="text" value={this.state.defaultInput} onChange={this.handleChange} />*/}
          {/*</div>*/}
          {/*<div>*/}
          {/*  <button onClick={() => {*/}
          {/*    this.setState({*/}
          {/*      reservation: [*/}
          {/*        {*/}
          {/*          test: 'super'*/}
          {/*        }*/}
          {/*      ]*/}
          {/*    });*/}
          {/*  }}>set reservation</button>*/}
          {/*</div>*/}
          <div>
            <button onClick={() => {
              this.props.setReservation({
                test1: '3',
                test2: '4'
              });
            }}>set reservation</button>
          </div>
          <button
            onClick={() => {
              console.log('this.state.reservation: 1')
              console.log(this.state.reservation)
              console.log(reservation)

              console.log('this.props.reservation: 1')
              console.log(this.props.reservation)

              console.log('getReservation(): 1');
              console.log(this.props.getReservation());
            }}
          >reservation log</button>

          <div>
            <button onClick={() => {
              removeReservation()
              // this.props.removeReservation();
            }}>remove reservation</button>
          </div>

          <div>reservation detail</div>
          <div>{JSON.stringify(reservation)}</div>
          <button onClick={() => {
            this.props.history.push(`/test`)
          }}>Click link to test</button>
        </Container>
      </>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    defaultInput: state.submittedValue,
    reservation: state.reservation
  };
};

const mapActionsToProps = {
  onSubmitValue: submitValue,
  setReservation: setReservation,
  removeReservation,
  getReservation
}

export default connect(mapStateToProps, mapActionsToProps)(Test);
