import React from "react";
import styled from "styled-components";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import StatusBar from "../components/StatusBar";
import { Container, Message, Contents, Button } from "../components/Common";
import { Link } from "react-router-dom";
import paypay from "../../src/assets/images/payments/paypay.png";
import au from "../../src/assets/images/payments/au.png";
import line from "../../src/assets/images/payments/line.png";
import cash from "../../src/assets/images/payments/cash.png";
import rakuten from "../../src/assets/images/payments/rakuten.png";
import docomo from "../../src/assets/images/payments/docomo.png";
import credit from "../../src/assets/images/payments/credit.png";
import config from '../util/config';
const API_URL = config.ReactAppAPIURL;

const message = {
  chooseMethod: "会計処理を行います。\n支払方法を選択してください。",
};

const payment_methods = [
  {
    key: 0,
    src: XXXXXXX,
  },
  {
    key: 1,
    src: XXXXXXX,
  },
  {
    key: 2,
    src: XXXXXXX,
  },
  {
    key: 4,
    src: XXXXXXX,
  {
    key: 5
    src: XXXXXXX,
  },
  {
    key: 3,
    src: cash,
  
  {
    key: 6,
    src: credit,
  },
];

class Payments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: "CHOOSE_PAYMENT_METHOD", //CHOOSE_PAYMENT_METHOD, CONFIRM_PAYMENT, VIEW_PAYMENT_DETAIL
      paymentInfo: {
        name: "",
        name_kana: "",
        total_without_tax: 0,
      },
    };
  }

  componentWillMount() {
    this.getPaymentInfo(this.props.match.params.reservationID);
  }

  getPaymentInfo = (reservationID) => {
    fetch(`${API_URL}payment/${reservationID}`, {})
      .then((response) => response.json())
      .then((result) => {
        this.setState({ paymentInfo: result[0] });
      })
      .catch((e) => {
        console.error("=== GET PAYMENT INFO ERROR ===", e);
        throw e;
      });
  };

  handleOnClickPaymentMethod = () => {
    this.setState({ phase: "CONFIRM_PAYMENT" });
  };

  handleOnClickFinishCheckout = () => {
    // registerTransaction(6, guestID);
    this.setState({ phase: "CHOOSE_PAYMENT_METHOD" });
  };

  render() {
    const { phase, paymentInfo } = this.state;
    const {
      location,
      match: {
        params: { reservationID },
      },
    } = this.props;
    return (
      <>
        <Header />
        <Container>
          <Navbar />
          <Contents>
            <StatusBar phase={phase} location={location} />

            {phase === "CHOOSE_PAYMENT_METHOD" && (
              <ElementsContainerColumn>
                <GuestInfo className="GuestInfo">
                  <Text className="Text">
                    {`<お客さまのSnapshot 情報>\n${paymentInfo && paymentInfo.name
                      } ${paymentInfo && paymentInfo.name_kana}様\nお会計金額: ${paymentInfo && paymentInfo.total
                      } 円(税込)`}
                  </Text>
                  <Link to={`/payments/${reservationID}/detail`}>
                    <PaymentDetailButton>{`会計明細を\n確認する`}</PaymentDetailButton>
                  </Link>
                </GuestInfo>
                <StyledMessage className="StyledMessage">
                  {message.chooseMethod}
                </StyledMessage>
                <GridContainer className="grid">
                  {payment_methods.map((i) => (
                    <Grid>
                      <Image
                        onClick={() => this.handleOnClickPaymentMethod()}
                        key={i.key}
                        src={i.src}
                      />
                    </Grid>
                  ))}
                </GridContainer>
              </ElementsContainerColumn>
            )}
            {phase === "CONFIRM_PAYMENT" && (
              <ElementsContainer>
                <ImageContainer>
                  <Image src={paypay} />
                </ImageContainer>
                <StyledMessage className="StyledMessage">{`XXXXXXにて支払います。金額は36,800円です。\n決済処理をしてください。\n※XXXXXXの場合、お客さまのスマートフォン等で\n決済処理が完了します。\n(NFC Reader は使用されません)`}</StyledMessage>
                <Link
                  to={{
                    pathname: "/checkout",
                    state: { completed: true, guestID: paymentInfo.guest_id },
                  }}
                >
                  <CheckoutButton
                    onClick={() => this.handleOnClickFinishCheckout()}
                  >
                    {`チェックアウトを完了する`}
                  </CheckoutButton>
                </Link>
              </ElementsContainer>
            )}
          </Contents>
        </Container>
      </>
    );
  }
}

export default Payments;

const StyledMessage = styled(Message)`
  position: fixed;
  top: 38%;
`;

const ElementsContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: start;
  align-items: center;
`;

const ElementsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  justify-content: space-evenly;
  align-items: start;
  padding-top: 150px;
`;

const Image = styled.img`
  width: 200px;
`;

const ImageContainer = styled.div`
  position: fixed;
  top: 35%;
  left: 23%;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 200px 200px 200px 200px;
`;

const Grid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const GuestInfo = styled.div`
  margin-top: 4em;
  margin-right: 20px;
  margin-left: auto;
`;

const Text = styled.div`
  font-size: 3.2rem;
  white-space: pre;
  line-height: 1.5;
  text-align: end;
`;

const PaymentDetailButton = styled(Button)`
  height: 100px;
  width: 250px;
  font-size: 3rem;
  background-color: #001662;
`;

export const CheckoutButton = styled(Button)`
  position: fixed;
  top: 68%;
  left: 36%;
  width: 750px;
`;
