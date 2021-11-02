import React from "react";
import Layout from "../components/Layout";
import StatusBar2 from "../components/StatusBar2";
import CheckStatus from "../components/CheckStatus";
import { getFetch } from "../util/api";
import checkIcon from ".././assets/images/check.png";
import s from "../scss/pages/CheckinComplete.module.scss"
import { connect } from "react-redux";
import config from "../util/config";

const IMAGE_PATH = config.ReactImagePath;

class CheckinComplete extends React.Component {
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
      location,
      checkin
    } = this.props;

    const {
      guestInfo
    } = this.state;

    return (
      <Layout navType='checkin'>
        <StatusBar2 icon='checkin' text='チェックインが完了しました。'
          right={<CheckStatus status='checkin3' />}
        />

        <div className={s.elementsContainer}>
          <div className={s.column}>
            <img src={checkin.imagePath} />
            <div className='faceInfoLabel'>
              Face情報が登録されていません
                  {/*{checkin.face_id_azure*/}
              {/*  ? "Face情報が登録されています"*/}
              {/*  : "Face情報が登録されていません"}*/}
            </div>
            <div
              className={s.roomLabel}
              onClick={() => {

              }}
            >
              客室割当が完了しています
                </div>
            {/*<div*/}
            {/*  className={'reservationLabel'}*/}
            {/*  onClick={() => {*/}
            {/*    this.props.history.push(`/reservations?guestId=${this.state.guestInfo.guest_id}&from=checkinComplete`)*/}
            {/*  }}*/}
            {/*>*/}
            {/*  予約情報を<br />確認する*/}
            {/*</div>*/}
          </div>
          <div className={s.infoSection}>
            <div className={s.text}>
              {`${checkin.newGuest ? `新規のお客さま` : `登録済のお客さま`}`}
              <br />
              <h2>
                {guestInfo.name || ""} {guestInfo.name_kana || ""}様
                  </h2>
              {`のチェックインが完了しました。`}
              <br />
            </div>
            <img className={s.checkIcon} src={checkIcon} />
            <div className={s.checkinButton} disabled={true}>{`チェックインを\n完了する`}</div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    checkin: state.checkin
  };
};

const mapActionsToProps = {
}

export default connect(mapStateToProps, mapActionsToProps)(CheckinComplete);

