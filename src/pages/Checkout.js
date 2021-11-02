import React from "react";
import Layout from "../components/Layout";
import CheckStatus from "../components/CheckStatus";
import MjpegPlayer from "../components/MjpegPlayer";
import Loader from "../components/Loader";
import s from "../scss/pages/CheckPage.module.scss"
import { convertToBlob } from "../util/imageConvert";
import { getFetch, getFetchForGif, postFetch, postFetchForImg } from "../util/api";
import { playStreamingAudio, StreamingAudioManager } from "../util/streamingAudioManager";
import { startStreaming } from "../helper/api";
import config from '../util/config'
import { sleep } from "../util/common";
import { connect } from "react-redux";
import { setCheckout, resetCheckout } from "../redux/actions/checkout";

const IMAGE_PATH = config.ReactImagePath;
const RequestStaticAPIURL = config.RequestStaticAPIURL;

const MAX_RETRY_COUNT = 60;

const message = {
  checkoutIntro:
    "お客さまをチェックアウト\nします。現在のモードは、“非対面”モードです。\nお客さまにカメラの前に立ってもらい、良い\nタイミングで、“撮影”ボタンを押してください。",
  checkoutDone:
    "お客さまのチェックアウト処理を行っています。\n顔認識により、Face情報からお客さま情報が紐づけされました。\n会計処理が終わったら、チェックアウトを完了させてください。",
  displayingFromGuestList:
    "予約システムの顧客リストから情報が参照されています。",
};

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      phase: "SETUP_CAMERA",
      player: {},
      completed: false,
      imagePath: "",
      guestInfo: {
        name: "",
        name_kana: "",
        imagePath: "",
        reservationID: 0,
      },
    };
    this.WebsocketConn = new StreamingAudioManager();
  }

  async play() {
    const imagePath = await getFetchForGif.getCheckinGirl();
    this.setState({
      img: `${RequestStaticAPIURL}/${imagePath.file_name}`
    });
    playStreamingAudio(['checkout', 'camera-attention']);
  };

  // 撮影ボタンを押した時
  handleCaptureButton = async () => {
    this.setState({
      loading: true
    });

    const base64 = this.state.player.els.canvas.toDataURL("image/jpeg", 1.0);

    const result = await this.registerImage(convertToBlob(base64));

    if (result.key) {
      await this.checkFaceAuthStatus(result.key);
    }
  };

  async componentWillMount() {
    const { location } = this.props;
    await this.WebsocketConn.connectStreamingAudio(true, config.KeepListeningSocketUr)

    if (
      location &&
      location.state &&
      location.state.completed !== this.state.completed
    ) {
      this.setState({
        completed: location.state.completed,
        phase: "FINISH_CHECKOUT",
      });

      const stayGuest = await getFetch.getStayGuestInfo(location.state.guestID);

      if (!stayGuest.length > 0) {
        console.error("チェックインしていないお客様です。")
        return;
      }

      await postFetch.checkout("checkout", stayGuest[0].guest_id)
      await this.getGuestInfo(location.state.guestID);
      await playStreamingAudio(['complete-checkout', 'be-careful']);
    } else {
      this.play();
    }
  }

  async componentWillUnmount() {
    this.WebsocketConn.closeConn("checkin")
  }

  getCheckinRecord = async (guestID) => {
    try {
      //ゲストID、トランザクションコードが5または6の最新のレコードを取得。
      const result = await getFetch.getCheckinRecord(guestID);

      if (result.length > 0 && result[0].transaction_code === 5) {
        const guestInfo = await this.getGuestInfo(guestID);
        this.props.resetCheckout();

        this.props.setCheckout({
          ...guestInfo
        });

        this.props.history.push(`/checkout/finish/auth/${guestID}`);
      } else if (result.length > 0 && result[0].transaction_code === 6) {
        alert(
          "このお客様はチェックアウトできません。顧客情報を確認してください。"
        );
        this.setState({ loading: false });
      } else if (result.length === 0) {
        alert(
          "このお客様はチェックアウトできません。顧客情報を確認してください。"
        );
      }
    } catch (e) {
      console.error("===GET CHECKIN RECORD ERROR===", e);
      alert("チェックアウト API エラー");
      this.setState({ loading: false });
    }
  };

  checkFaceAuthStatus = async (key) => {
    let isCompleted = false;

    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < MAX_RETRY_COUNT; i++) {
          await sleep();
          const result = await getFetch.getFaceAuthState(key);

          if (result.status === 'failed') {
            alert("失敗しました。もう一度試して下さい。");

            this.setState({
              loading: false
            });

            return resolve();
          }

          if (result.customer === undefined) {
            throw Error('timeout');
          }

          if (result.customer === 'new') {
            alert(
              "このお客様はチェックアウトできません。顧客情報を確認してください。"
            );

            this.setState({
              loading: false
            });

            return resolve();
          }

          if (result.customer === 'existing') {
            await this.getCheckinRecord(result.guest_id);
            isCompleted = true;
            return resolve();
          }

          if (i >= MAX_RETRY_COUNT) {
            alert("失敗しました。もう一度試して下さい。");
            this.setState({
              loading: false
            });
            return resolve();
          }
        }
      } catch (e) {
        alert(e);

        this.setState({
          loading: false
        });

        return reject(e);
      }
    });
  };

  getGuestInfo = async (id) => {
    try {
      const result = await getFetch.getGuestInfo(id);

      let imagePath = result[0].face_image_path.split("1/");

      this.setState({
        guestInfo: result[0],
        imagePath: `${IMAGE_PATH}${imagePath[1]}`,
      });

      return {
        guestInfo: result[0],
        imagePath: `${IMAGE_PATH}${imagePath[1]}`,
      };
    } catch (e) {
      console.error("Error:", e);
    }
  };

  handleOnClickCustomerInfo = () => {
    this.setState({ phase: "DISPLAY_CUSTOMER_INFO" });
  };

  setPlayer = (player) => {
    this.setState({ player: player });
  };

  registerImage = async (jpegFile) => {
    try {
      return await postFetchForImg.image(jpegFile);
    } catch (e) {
      alert("エラーが発生しました。時間を置いて再度撮影してください。");
      console.error("=== IMAGE REGISTER ERROR ===", e);
    }
  };

  render() {
    const {
      phase,
      loading,
      completed,
      img,
    } = this.state;

    return (
      <Layout navType='checkout' >
        <MjpegPlayer setPlayer={(player) => this.setState({ player })} />

        <div className={s.contents}>
          <div className={s.statusBar}>
            <button className={s.button} onClick={startStreaming}>
              カメラ接続
              </button>
            <CheckStatus status='checkout1' />
          </div>

          <div className={s.elementsSection}>
            <div className={s.container}>
              <div className={s.message}>{message.checkoutIntro}</div>
              <button
                className={s.button}
                onClick={this.handleCaptureButton.bind(this)}
                disabled={loading}
              >
                {loading ? <Loader /> : `撮影`}
              </button>
            </div>
            <div className={s.girlIcon}>
              <img src={img} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    checkout: state.checkout
  };
};

const mapActionsToProps = {
  setCheckout: setCheckout,
  resetCheckout: resetCheckout
}

export default connect(mapStateToProps, mapActionsToProps)(Checkout);
