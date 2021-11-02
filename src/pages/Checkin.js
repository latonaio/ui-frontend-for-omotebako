import React from "react";
import Layout from "../components/Layout";
import MjpegPlayer from "../components/MjpegPlayer";
import CheckStatus from "../components/CheckStatus";
import Loader from "../components/Loader";
import s from "../scss/pages/CheckPage.module.scss";
import { getFetch, getFetchForGif, postFetchForImg, deleteFetch } from "../util/api";
import { convertToBlob } from "../util/imageConvert";
import { sleep } from "../util/common";
import { startStreaming, } from "../helper/api";
import { playStreamingAudio, StreamingAudioManager } from "../util/streamingAudioManager";
import config from '../util/config';
import { connect } from "react-redux";
import { setCheckin, resetCheckin } from "../redux/actions/checkin";

const RequestStaticAPIURL = config.RequestStaticAPIURL;
const IMAGE_PATH = config.ReactImagePath;
let MAX_RETRY_COUNT = 10;

const message = {
  startCheckin:
    'お客様をチェックインします。\n現在のモードは”非対面モード”です。\nお客様にカメラの前に立ってもらい、\n良いタイミングで"撮影"ボタンを押してください。',
  displayingFromGuestList:
    "予約システムの顧客リストから情報が参照されています。",
};


class Checkin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: "SETUP_CAMERA",
      file: null,
      hasMatch: true,
      guestInfo: {
        name: "",
        nameKana: "",
        image: "",
        plan: "",
        stay_days: 0,
        number_of_guests: 0,
        age_by_Face: 20,
      },
      reservationList: {},
      selectedGuestInfo: {},
      loading: false,
      imagePath: "",
      reservations: [],
      page: 1,
      roomAssigned: true,
      roomCount: 0,
      selectedReservationID: null,
      assignComplete: false,
      checkin: this.props.checkin,
    };

    this.WebsocketConn = new StreamingAudioManager();
  }

  async componentWillMount() {
    // redisのキャッシュを削除
    await deleteFetch.deleteStayGuests(`redis/stay-guests`);

    // store情報の初期化
    this.props.resetCheckin();
    await this.WebsocketConn.connectStreamingAudio(true, config.KeepListeningSocketUrl)

    this.play();
  }

  async componentWillUnmount() {
    this.WebsocketConn.closeConn()
  }

  async play() {
    const imagePath = await getFetchForGif.getCheckinGirl();
    this.setState({
      img: `${RequestStaticAPIURL}/${imagePath.file_name}`
    });
    playStreamingAudio(['checkin', 'camera-attention']);
  };

  // ゲストID、トランザクションコードが5または6の最新のレコードを取得。
  getCheckinRecord = async (guestID) => {
    try {
      const result = await getFetch.getCheckinRecord(guestID);

      if (result.length === 0 || result[0].transaction_code === 6) {
        this.setState({
          phase: "CHECKIN_EXISTING_GUEST"
        });

        return true;
      } else if (result.length > 0 && result[0].transaction_code === 5) {
        alert(
          "このお客様はチェックインできません。顧客情報を確認してください。"
        );
        this.setState({
          loading: false
        });

        return false;
      }
    } catch (e) {
      console.error("===GET CHECKIN RECORD ERROR===", e);
      this.setState({
        loading: false
      });
      throw e;
    }
  };

  getGuestInfo = async (id) => {
    try {
      const result = await getFetch.getGuestInfo(id);

      let imagePath = '';
      let returnData = {};

      if (this.state.imagePath !== '') {
        // 新規のお客様
        imagePath = this.state.imagePath;

        returnData = {
          guestInfo: result[0],
          imagePath: `${imagePath}`,
        };

        this.setState({
          guestInfo: result[0],
          imagePath: `${imagePath}`,
        });
      } else {
        // 予約ありのお客様
        imagePath = result[0].face_image_path.split("1/");

        returnData = {
          guestInfo: result[0],
          imagePath: `${IMAGE_PATH}${imagePath[1]}`,
        };

        this.setState({
          guestInfo: result[0],
          imagePath: `${IMAGE_PATH}${imagePath[1]}`,
        });
      }

      return returnData;
    } catch (e) {
      console.error("=== GET GUEST INFO ERROR ===", e);
      throw e;
    }
  };

  setPlayer = (player) => {
    this.setState({ player: player });
  };

  // 撮影ボタンを押した時
  handleCaptureButton = async () => {
    this.setState({
      loading: true
    });

    const base64 = this.state.player.els.canvas.toDataURL("image/jpeg", 1.0);
    const result = await this.registerImage(convertToBlob(base64));

    if (result.key) {
      const checkFaceAuthStatusResult = await this.checkFaceAuthStatus(result.key);

      if (checkFaceAuthStatusResult === 'new') {
        this.props.history.push(`/checkin/guest-list-message`)
      }

      if (checkFaceAuthStatusResult === 'existing') {
        this.props.history.push(`/checkin/existing-guest`)
      }
    }
  };

  registerImage = async (jpegFile) => {
    try {
      return await postFetchForImg.image(jpegFile);
    } catch (e) {
      alert("エラーが発生しました。時間を置いて再度撮影してください。");
      console.error("=== IMAGE REGISTER ERROR ===", e);
    }
  };

  checkFaceAuthStatus = async (key) => {
    let isCompleted = false;

    return new Promise(async (resolve, reject) => {
      let maxRetryCount = MAX_RETRY_COUNT
      try {
        for (let task of Array.from(Array(MAX_RETRY_COUNT).keys())) {
          maxRetryCount = (maxRetryCount - 1);

          await sleep();
          const result = await getFetch.getFaceAuthState(key);

          if (result.status === "failed") {
            alert("失敗しました。もう一度試して下さい。");

            this.setState({
              loading: false
            });

            return resolve();
          }

          // 新規のお客様
          if (result.customer === 'new') {
            const path = result.image_path;
            const fileName = path.split("1/");

            // 顧客リストへの画面を表示させる
            this.setState({
              imagePath: `${IMAGE_PATH}${fileName[1]}`,
              faceInfo: result,
              newGuest: true,
            });

            this.props.resetCheckin();

            // storeのcheckinに格納
            this.props.setCheckin({
              imagePath: `${IMAGE_PATH}${fileName[1]}`,
              faceInfo: result,
              newGuest: true,
            });

            return resolve('new');
          }

          // 以前訪れたことのあるお客様
          if (result.customer === 'existing') {
            const getGuestInfoResult = await this.getGuestInfo(result.guest_id);
            const getCheckinRecordResult = await this.getCheckinRecord(result.guest_id);

            // すでにチェックイン済の場合はfalse
            if (!getCheckinRecordResult) {
              return;
            }

            this.props.resetCheckin();

            // storeのcheckinに格納
            this.props.setCheckin({
              imagePath: getGuestInfoResult.imagePath,
              guestInfo: getGuestInfoResult
            });

            isCompleted = true;
            return resolve('existing');
          }

          if ((MAX_RETRY_COUNT - (task + 1)) === 0) {
            alert("認証できませんでした、もう1度お願いします。");
            this.setState({
              loading: false
            });
            maxRetryCount = MAX_RETRY_COUNT;
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

  render() {
    let {
      loading,
      img,
    } = this.state;

    return (
      <Layout navType='checkin' >
        <MjpegPlayer setPlayer={(player) => this.setState({ player })} />

        <div className={s.contents}>
          <div className={s.statusBar}>
            <button className={s.button} onClick={startStreaming}>
              カメラ接続
            </button>
            <CheckStatus status='checkin1' />
          </div>

          <div className={s.elementsSection}>
            <div className={s.container}>
              <div className={s.message}>{message.startCheckin}</div>
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

const mapStateToProps = (state) => {
  return {
    checkin: state.checkin
  };
};

const mapActionsToProps = {
  setCheckin: setCheckin,
  resetCheckin: resetCheckin
}

export default connect(mapStateToProps, mapActionsToProps)(Checkin);
