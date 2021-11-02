import React from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import s from "../../scss/pages/checkin/GuestListMessage.module.scss"
import { connect } from "react-redux";
import { setCheckin, resetCheckin } from "../../redux/actions/checkin";

class GuestListMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: "SYNC_GUEST_LIST_MESSAGE",
      hasMatch: true,
    };
  }

  // 顧客リストへ遷移
  handleOnClickGuestList = async () => {
    this.props.history.push(`/checkin/reservation/list`)
  };

  render() {
    let {
      phase,
      hasMatch,
    } = this.state;

    let { location } = this.props;

    return (
      <Layout navType='checkin'>
        <StatusBar2 icon='checkin' text='お客さまのチェックインを行っています。' />

        <div className={s.container}>
          <div className={s.message}>
            お客さまのチェックイン登録を行っています。<br />Face情報がなく、初めてのお客さまです。<br />顧客リストと同期してください。
          </div>
          <button className={s.button} onClick={() => this.handleOnClickGuestList()}>
            顧客リストへ
          </button>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    checkin: state.checkin
  };
};

const mapActionsToProps = {
  setCheckin: setCheckin,
  resetCheckin: resetCheckin
}

export default connect(mapStateToProps, mapActionsToProps)(GuestListMessage);