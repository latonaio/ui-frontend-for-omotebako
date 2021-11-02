import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import StatusBar from "../components/StatusBar";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Container, Contents, Button } from "../components/Common";
import config from '../util/config';
const API_URL = config.ReactAppAPIURL;

class PaymentsDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      paymentInfo: {},
    };
  }

  componentWillMount() {
    this.getPaymentInfo(this.props.match.params.reservationID);
  }

  getPaymentInfo = (id) => {
    fetch(`${API_URL}payment/detail/${id}`, {})
      .then((response) => response.json())
      .then((result) => {
        this.setState({
          paymentInfo: result,
        });
      })
      .catch((e) => {
        console.error("=== GET PAYMENT INFO ERROR ===", e);
        throw e;
      });
  };

  render() {
    const {
      location,
      match: {
        params: { reservationID },
      },
    } = this.props;
    const { paymentInfo } = this.state;
    return (
      <>
        <Header />
        <Container>
          <Navbar />
          <PaymentContents>
            <StatusBar phase="SHOW_PAYMENT_DETAIL" location={location} />
            <ReceiptButton>{`領収書を\n出力する`}</ReceiptButton>
            <Summary className="Text">
              {`<お客さまのSnapshot 情報>\n${paymentInfo.length > 0 && paymentInfo[0].name
                } ${paymentInfo.length > 0 && paymentInfo[0].name_kana
                }様\nお会計金額: ${paymentInfo.length > 0 && paymentInfo[0].total
                }円(税込)`}
            </Summary>
            <ReservationMethod>予約方法：自社サイト</ReservationMethod>
            <ListContainer>
              <ListHeader>
                <Center>日付</Center>
                <Center>品目 </Center>
                <Center>数量</Center>
                <Center>金額 </Center>
                <Center>プラン</Center>
                <Center>客室</Center>
              </ListHeader>
              <ListContents>
                {paymentInfo.length > 0 &&
                  paymentInfo.map((i) => (
                    <List>
                      <Center>
                        {i.create_date.substring(6, 10).replace("-", "/")}
                      </Center>
                      <Center>{i.product_name}</Center>
                      <Center>{i.count}</Center>
                      <Center>{i.price}</Center>
                      <Center>{i.plan}</Center>
                      <Center>{i.assigned_rooms[0] && i.assigned_rooms[0].room_name || <div className='text-red'>未割当</div>}</Center>
                    </List>
                  ))}
                <List backgroundColor="#d3efff" bold>
                  <Center></Center>
                  <Center>合計(税込)</Center>
                  <Center></Center>
                  <Center>
                    {paymentInfo.length > 0 && paymentInfo[0].total}
                  </Center>
                  <Center></Center>
                  <Center></Center>
                </List>
                <List backgroundColor="#d3efff" bold>
                  <Center></Center>
                  <Center>うち消費税</Center>
                  <Center></Center>
                  <Center>
                    {paymentInfo.length > 0 && paymentInfo[0].total * 0.1}
                  </Center>
                  <Center></Center>
                  <Center></Center>
                </List>
              </ListContents>
            </ListContainer>
            <StyledLink to={`/payments/${reservationID}`}>
              <BackButton>戻る</BackButton>
            </StyledLink>
          </PaymentContents>
        </Container>
      </>
    );
  }
}

export default PaymentsDetail;

const PaymentContents = styled(Contents)`
  padding: 20px;
`;

const ReceiptButton = styled(Button)`
  width: 200px;
  height: 100px;
  background-color: green;
  font-size: 2.5rem;
  position: fixed;
  top: 300px;
`;

const StyledLink = styled(Link)`
  width: fill-available;
  text-decoration: none;
`;

const BackButton = styled(Button)`
  width: 200px;
  height: 80px;
  background-color: #1264a3;
  margin: 10px;
  margin-right: auto;
  font-size: 2.5rem;
`;

const ListContents = styled.div`
  overflow-y: scroll;
  max-height: 320px;
`;

const ListContainer = styled.div`
  max-width: 80vw;
  margin-bottom: 20px;
`;

const ReservationMethod = styled.div`
  font-size: 3.2rem;
  white-space: pre;
  line-height: 1.5;
  text-align: end;
  margin-right: auto;
  margin-left: 10px;
`;

const Summary = styled.div`
  font-size: 3.2rem;
  white-space: pre;
  line-height: 1.5;
  margin-left: auto;
  text-align: end;
  margin-right: 20px;
`;

const Text = styled.div`
  font-size: 3.2rem;
  white-space: pre;
  line-height: 1.5;
  text-align: end;
`;

const Center = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-rows: 1em;
  grid-template-columns: 100px 400px 80px 180px 600px 200px;
  height: 80px;
  font-size: 1.6rem;
  align-items: center;
  text-align: center;
  background: ${(props) => props.theme.primary};
  padding: 10px;
  color: white;
  align-content: center;
  margin-top: 10px;
`;

const List = styled.div`
  padding: 15px 15px;
  display: grid;
  grid-template-columns: 100px 400px 80px 180px 600px 200px;
  font-size: 1.6rem;
  height: 30px;
  align-items: center;
  text-align: center;
  color: #3968bf;
  font-weight: ${(props) => (props.bold ? "bold" : "0")};
  font-family: "Segoe UI";
  align-items: baseline;
  cursor: pointer;
  border-top: 1px solid #c7c7c7;
  border-bottom: 1px solid #c7c7c7;
  overflow: hidden;
  &:hover {
    background-color: #aed6c3;
  }
  background-color: ${(props) => props.backgroundColor};
`;
