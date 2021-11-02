import React from "react";
import Layout from "../components/Layout";
import img from "../assets/images/home-girl.png";
import HomeImages from "../components/HomeImages";
import { startStreaming } from '../helper/api';
import s from "../scss/pages/Home.module.scss";
import { StreamingAudioManager } from "../util/streamingAudioManager";
import config from "../util/config";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timerIdForDisplayReload: null,
      img: ''
    }
    this.WebsocketConn = new StreamingAudioManager(0);
  }

  async componentWillMount() {
    clearInterval(this.timerIdForDisplayReload);
    await this.WebsocketConn.connectStreamingAudio(true, config.KeepListeningSocketUrl, "home")
  }

  componentWillUnmount() {
    clearInterval(this.timerIdForDisplayReload);
    this.WebsocketConn.closeConn()
  }

  async componentDidMount() {
    startStreaming();
    // 設定時刻おきに画面をリフレッシュロードする（クラッシュする可能性があるため）
    this.setIntervalForDisplayReload();

    // const imagePath = await getFetchForGif.getHomeGirl();

    // this.setState({
    //   img: `http://localhost:30101/static/${imagePath.file_name}`
    // })

    this.setState({
      img: `${img}`
    })
  }

  setIntervalForDisplayReload = () => {
    // 3時間
    // const executeTimer = (((1000 * 60) * 60) * 3);
    // 30分
    const executeTimer = (((1000 * 60) * 30) * 3);
    // テスト用
    // const executeTimer = ((5000));

    this.timerIdForDisplayReload = setInterval(() => {
      window.location.reload();
    }, executeTimer);
  }

  render() {
    const { location } = this.props;
    const {
      img
    } = this.state;

    return (
      <Layout>
        <HomeImages />
        <div className={s.home}>
          <div className={s.message}>
            旅館向けシステム
              <br />
              “おもてばこ”
              <br />
              メニューを選択してください
            </div>
          <div className={s.homeGirl}>
            <img src={img} />
            {/*<audio*/}
            {/*  loop*/}
            {/*  autoPlay*/}
            {/*  src={sound}>*/}
            {/*  <code>audio</code>*/}
            {/*</audio>*/}
          </div>
        </div>
      </Layout>
    );
  }
};

export default Home;