import React from "react";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import { getFetch } from "../../util/api";
import '../../scss/pages/checkout/FinishAuth.scss';
import StatusBar from "../../components/StatusBar";
import { connect } from "react-redux";

class FinishAuth extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      checkin: this.props.checkin,
      guestInfo: {
        name: "",
        name_kana: "",
        imagePath: "",
        reservationID: 0,
      },
    };
  }

  async componentWillMount() {
    await this.getGuestInfo(this.props.match.params.guestId);
  }

  getGuestInfo = async (id) => {
    try {
      const result = await getFetch.getGuestInfo(id);

      this.setState({
        guestInfo: result[0],
      });
    } catch (e) {
      console.error("Error:", e);
    }
  };

  render() {
    const {
      location,
      checkin
    } = this.props;

    const {
      guestInfo,
    } = this.state;

    return (
      <div className="checkoutFinishAuth">
        <Header />
        <div className="checkoutFinishAuth_container">
          <Navbar navType='checkout' />

          <div className="checkoutFinishAuth_contents">
            <div className="checkinStatusRow">
              <StatusBar phase="FINISH_AUTH" location={location} />
            </div>

            <div className='checkoutFinishAuth_messages'>
              <div>お客さまのチェックアウト処理を行っています。<br />
                顔認識により、Face情報からお客さま情報が紐づけされました。<br />
                会計処理が終わったら、チェックアウトを完了させてください。
              </div>
            </div>

            <div className="checkoutFinishAuth_buttonSection">
              <div
                className='checkoutFinishAuth_customerInfoButton'
                onClick={() => {
                  this.props.history.push(`/checkout/guest/info/${this.props.match.params.guestId}`)
                }}
              >
                Customer
                <br />
                Info.へ
              </div>

              <div
                className='checkoutFinishAuth_paymentButton'
                onClick={() => {
                  this.props.history.push(`/payments/${guestInfo.reservation_id}`)
                }}
              >
                会計処理に進む
              </div>
              <div className='checkoutFinishAuth_customerName'>
                {guestInfo.name && (
                  <div>
                    &lt;お客さまの<br />Snapshot情報&gt;<br />{guestInfo.name}<br />{guestInfo.name_kana} 様
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
  };
};

const mapActionsToProps = {

}

export default connect(mapStateToProps, mapActionsToProps)(FinishAuth);

