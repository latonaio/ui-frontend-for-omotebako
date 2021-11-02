import React from "react";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import StatusBar from "../../components/StatusBar";
import { Container, Contents } from "../../components/Common";
import s from "../../scss/pages/checkin/GuestListMessage.module.scss"
import { connect } from "react-redux";
import { setCheckin, resetCheckin } from "../../redux/actions/checkin";
import { store } from "../../redux/store";

class ExistingGuest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkin: this.props.checkin,
    };
  }

  async componentWillMount() {
    const checkinData = store.getState().checkin;

    this.setState({
      ...this.state.guestInfo,
      guestInfo: checkinData.guestInfo
    });
  }

  render() {
    let {
      phase,
      hasMatch,
      guestInfo,
    } = this.state;

    let { location } = this.props;

    return (
      <>
        <Header />
        <Container className="checkin-container">
          <Navbar navType='checkin' />
          <Contents>
            <div className="checkin_statusRow">
              <StatusBar phase={phase} hasMatch={hasMatch} location={location} />
            </div>

            <div className="Checkin_elementsContainer checkin_elementsContainerColumn">
              <div className={s.message}>
                お客さまのチェックインを行っています。<br />このお客様は既にFace情報が登録されているお客さまです。<br />Customer Info. に進んでください。
              </div>
              <button
                className={s.button}
                onClick={() => {
                  this.props.history.push(`/checkin/guest/info/${guestInfo.guest_id}`)
                  // this.setState({ phase: "DISPLAY_EXISTING_GUEST_INFO" })
                }}
              >
                {`Customer-\nInfo.へ`}
              </button>
              <div className="checkin_customerName" style={{ top: '55%' }}>
                {`<お客さまの\nSnapshot情報>\n${guestInfo && guestInfo.name
                  }\n${guestInfo && guestInfo.name_kana} 様`}
              </div>
            </div>
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
  setCheckin: setCheckin,
  resetCheckin: resetCheckin
}

export default connect(mapStateToProps, mapActionsToProps)(ExistingGuest);
