import React from "react";
import styled from "styled-components";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import LoaderOverlay from '../components/LoaderOverlay'
import { Container } from "../components/Common";
import { connect } from 'react-redux';
import { setLoading, closeLoading } from '../redux/actions/common';
import { submitValue } from '../redux/actions/submittedValueActions';
import { setReservation, removeReservation } from '../redux/actions/reservation';

class Test extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      defaultInput: this.props.defaultInput,
      inputValue: this.props.defaultInput,
      reservation: this.props.reservation,
      common: this.props.common,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      defaultInput: event.target.value
    });
  }

  render() {
    const {
    } = this.props;

    const {
      reservation,
      common,
    } = this.state;

    return (
      <>
        <Header />
        <Container>
          {/*<div>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    value={this.state.defaultInput}*/}
          {/*    onChange={this.handleChange}*/}
          {/*  />*/}
          {/*</div>*/}
          <div>
            <button onClick={() => {
              this.props.setReservation({
                test1: '1',
                test2: '2'
              });
            }}>set reservation</button>
          </div>
          <div>
            <button onClick={() => {
              removeReservation()
              // this.props.removeReservation();
            }}>remove reservation</button>
          </div>
          <div>reservation value</div>
          <div>{JSON.stringify(reservation)}</div>
          {/*<div>default input value</div>*/}
          {/*<div>{JSON.stringify(this.state.defaultInput)}</div>*/}
          <button onClick={() => {
            this.props.history.push(`/test1`)
          }}>Click link to test1</button>
        </Container>
        
        {/* Loader */}
        <div className="d-flex mt-10px">
          <h1
            style={{ background: "blue", color: "white", padding: 20, borderRadius: 20, marginLeft: 100, cursor: "pointer" }}
            onClick={()=>{
              common.loading.isShow = true
            }}>
            Show me Loader
          </h1>
          <div>
            {common.loading.isShow ?
              <div onClick={()=>{
                common.loading.isShow = false
              }}>
                <LoaderOverlay/>
              </div>
            : ""}
          </div>
        </div>

      </>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    defaultInput: state.submittedValue,
    reservation: state.reservation,
    common: state.common,
  };
};

const mapActionsToProps = {
  onSubmitValue: submitValue,
  setReservation: setReservation,
  removeReservation: removeReservation,
  setLoading: setLoading,
  closeLoading: closeLoading,
}

export default connect(mapStateToProps, mapActionsToProps)(Test);
