import React from "react";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import StatusBar from "../../components/StatusBar";
import { Container } from "../../components/Common";
import { getFetch } from "../../util/api";
import checkIcon from "../../assets/images/check.png";
import "../../scss/pages/checkout/CheckoutComplete.scss";
import { connect } from "react-redux";
import config from "../../util/config";
import { store } from "../../redux/store";

const IMAGE_PATH = config.ReactImagePath;

class CheckoutComplete extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      guestInfo: {}
    };
  }

  async componentWillMount() {
    const guestId = parseInt(this.props.match.params.guestId);

    const guestInfo = await this.getGuestInfo(guestId);

    this.setState({
      guestInfo: {
        ...this.state.guestInfo,
        ...guestInfo
      }
    });
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

  render() {
    const {
      location
    } = this.props;

    const checkout = store.getState().checkout;

    console.log(checkout);

    const {
      guestInfo
    } = this.state;

    return (
      <div className="checkoutComplete">
        <Header />
        <Container>
          <Navbar navType='checkout' />
          <div>
            <div className="checkinStatusRow">
              <StatusBar phase="FINISH_CHECKOUT" location={location} />
            </div>
            <div className="checkoutComplete_container">
              <div className="checkoutComplete_elementsContainer">
                <img
                  className='checkoutComplete_image'
                  src={checkout.imagePath}
                />
                <div className="checkoutComplete_infoSection">
                  {`お客さま`}
                  <br />
                  <h2>
                    {guestInfo.name || ""} {guestInfo.name_kana || ""}様
                  </h2>
                  {`のチェックアウトが完了しました。`}
                  <br />
                </div>
              </div>
              <div className="checkoutComplete_buttonSection">
                <div className="checkoutComplete_styledButton" disabled={true}>{`チェックアウトを\n完了する`}</div>
                <img src={checkIcon} />
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    checkout: state.checkout
  };
};

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(CheckoutComplete);

