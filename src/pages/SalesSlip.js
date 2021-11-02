import React from "react";
import styled from "styled-components";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import StatusBar from "../components/StatusBar";
import { Container, ModeButton } from "../components/Common";
import receiptIcon from ".././assets/images/receipt.png";
import "../scss/pages/SalesSlip.scss"

const SalesSlip = ({ location }) => {
  return (
    <div className="SalesSlip">
      <Header />
      <Container>
        <Navbar />
        <div className="contents">
          <StatusBar location={location} />
          <div className="layout">
            <div className="a">
              <div className="row">
                <div className="label">伝票番号：</div>
                <div className="box">2054</div>
              </div>
              <div className="row">
                <div className="label">伝票タイプ：</div>
                <div className="box">売上伝票（チェックアウト）</div>
              </div>
              <div className="row">
                <div className="label">伝票日付：</div>
                <div className="box">2020/5/21</div>
              </div>
              <div className="row">
                <div className="label">Guest:</div>
                <div className="box">XXXXXXX</div>
              </div>
              <div className="row">
                <div className="label">金額:</div>
                <div className="box">37,100</div>
              </div>
            </div>
            <div className="b">
              <img className="image" src={receiptIcon} />
              {`<お客さまのSnapshot情報>`}
              <div>XXXXXXXX XXXXXXXXXX 様</div>
              <div>お会計金額 : 37,100 円(税込)</div>
              <div> 支払方法 : クレジットカード払(現地)</div>
            </div>
            <div className="c">
              <div className="row">
                <div className="label">仕訳:</div>
                <div className="accountsSection">
                  <div className="label">売掛金</div>
                  <div className="label">37,100 /</div>
                  <div className="label">売上高</div>
                  <div className="label">　33,455</div>
                  <div className="label"></div>
                  <div className="label"></div>
                  <div className="label">仮受入湯税</div>
                  <div className="label">　150</div>
                  <div className="label"></div>
                  <div className="label"></div>
                  <div className="label">仮受消費税</div>
                  <div className="label">　3,345</div>
                </div>
              </div>
            </div>
            <div className="d">
              <div className="row"><StyledModeButton color="green">領収書確認</StyledModeButton>※伝票情報を変更すると、領収書との整合性が取れなくなることがあります</div>
              <div className="row"><StyledModeButton color="gray">赤伝票</StyledModeButton>※赤伝票を登録すると、元の伝票の修正はできなくなります。</div>
            </div>
            <div className="footerSection">
              <ModeButton color="#2f5597">{`非対面\nモード`}</ModeButton>
              <ModeButton color="green">売上管理</ModeButton>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SalesSlip;

const StyledModeButton = styled(ModeButton)`
width: 250px;
`;
