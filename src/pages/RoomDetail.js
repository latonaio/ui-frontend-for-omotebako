import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import StatusBar from "../components/StatusBar";
import { formatDate } from "../helper/date";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import config from '../util/config';
import { RoomDetailImageManager } from "../components/RoomDetailImageManager";
import s from '../scss/pages/RoomDetail.module.scss'
import { ROOM_CLEANING_STATUS, AMENITIES } from "../constraints/room"
import { getFetch, putFetch } from "../util/api";
import { formatDateWithTime, formatDateWithTimeJP } from "../helper/date";

const API_URL = config.ReactAppAPIURL;
const IMAGE_BASE_PATH = config.ReactImagePath;

class RoomDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      status: false,
      room_status_code: null,
      clean_staff_id: null,
      room_cleaning_status: null,
      start_cleaning_time: '',
      end_cleaning_time: '',
      result: {
        room_no: null,
        name: null,
        face_image_path: "1/",
      },
      staffs: [],
      cleaning_status: null
    };
  }

  async getCleaningStatus() {
    try {
      const res = await getFetch.getCleaningStatus(this.props.match.params.roomID)
      if (res.data) {
        if (res.data.start_cleaning_detail) {
          const startCleaningDetail = res.data.start_cleaning_detail;
          this.setState({
            start_cleaning_time: startCleaningDetail.create_date,
            room_cleaning_last_staff: startCleaningDetail.staff_name,
            clean_staff_id: startCleaningDetail.staff_id,
            room_cleaning_status: ROOM_CLEANING_STATUS.CLEANING,
          })
        }

        if (res.data.end_cleaning_detail) {
          const endCleaningDetail = res.data.end_cleaning_detail;
          this.setState({
            end_cleaning_time: endCleaningDetail.create_date,
            room_cleaning_status: ROOM_CLEANING_STATUS.CLEANED,
          })
        }
      } else {
        this.setState({
          room_cleaning_status: ROOM_CLEANING_STATUS.CLEANED,
          clean_staff_id: this.state.staffs[0].staff_id
        })
      }
    } catch (error) {
      console.error("=== GET CLEANING STATUS ERROR ===", error);
      throw error;
    }

  }

  async componentDidMount() {
    try {
      await this.getRoomInfo(this.props.match.params.roomID);
      const res = await getFetch.getStaffs()
      this.setState({ staffs: res.data })
      await this.getCleaningStatus()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  getRoomInfo = async (roomID) => {
    const date = new Date();
    const today = formatDate(date);
    try {
      const res = await getFetch.getRoomInfo(roomID, today)
      this.setState({ result: res[0] });
    } catch (error) {
      console.error("=== GET ROOM INFO ERROR ===", error);
      throw error;
    }
  };

  updateCleaningStatus = async (cleaning_status_code, staff_id) => {
    await putFetch.updateCleaningStatus(this.props.match.params.roomID, cleaning_status_code, staff_id)
  }

  handleOnChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  cleaningStatusButton = (room_status_code, clean_staff_id) => {
    const msg = room_status_code === ROOM_CLEANING_STATUS.CLEANED ?
      '?????????????????????' :
      '?????????????????????';

    if (clean_staff_id === null) {
      return (
        <>
          <div>????????????????????????????????????</div>
          <button disabled>{msg}</button>
        </>
      )
    }
    return (
      <button
        className={`${room_status_code === ROOM_CLEANING_STATUS.CLEANED
          ? `${s.statusCleaning}`
          : s.statusCleaned}`}
        onClick={async () => {
          const cleaning_status = room_status_code === ROOM_CLEANING_STATUS.CLEANED ?
            ROOM_CLEANING_STATUS.CLEANING :
            ROOM_CLEANING_STATUS.CLEANED
          await this.updateCleaningStatus(cleaning_status, clean_staff_id)
          await this.getCleaningStatus()
        }}>
        {msg}
      </button>
    )
  }

  render() {
    const { location } = this.props;
    const {
      result,
      clean_staff_id,
      room_cleaning_status,
      end_cleaning_time,
      start_cleaning_time,
      room_cleaning_last_staff,
      staffs
    } = this.state;

    const dateMsgByStatus = room_cleaning_status === ROOM_CLEANING_STATUS.CLEANED ?
      "??????????????????" :
      "??????????????????"
    return (
      <>
        <Header />
        <div className={s.roomDetail}>
          <Navbar navType='room-management' />
          <div className={s.contents}>
            <div className={s.statusBar}>
              <StatusBar location={location} phase="VIEWING_ROOM" />
            </div>
            <div className={s.container}>
              <div className={s.imageSection}>
                <div className={s.title}>
                  {result && (result.room_id || "")}???
                  {result && (result.room_name || "")}
                  <FontAwesomeIcon icon={faCalendarCheck} className={s.calendar} />
                </div>
                <RoomDetailImageManager latestSrc={result.image_path} roomId={result.room_id} />
              </div>
              <div className={s.info}>
                <div
                  className={result && result.guest_id
                    ? `${s.guestInfo}`
                    : `${s.guestInfoNoReaservation}`}
                  onClick={() => {
                    if (result && result.guest_id) {
                      if (result.status_code === 1) {
                        this.props.history.push(`/customer-info/detail/${result.stay_guests_id}`)
                      }
                    }
                  }}
                >
                  <div className={s.title}>???????????????</div>
                  <div className={s.guestInfoContainer}>
                    <div className={s.texts}>
                      <div className={`${!result.name && !result.name_kana ? 'dis-n' : ''}`}>
                        {`${result && (result.name || "")}  ${result && (result.name_kana || "")
                          } ???`}
                      </div>
                      {/*<div>*/}
                      {/*  {`??????????????????????????????(????????????)`}*/}
                      {/*</div>*/}
                      {/* <div>
                            ??????: {result && (result.room_name || "")}
                          </div> */}
                      <div className={s.inline}>
                        <div>?????????{result && (result.stay_days || "-")}</div>
                        <div>?????????{result && (result.number_of_guests || "-")}</div>
                      </div>
                      <div className={s.inline}>
                        <div>???????????????{result && (result.prefecture || "-")}</div>
                        <div>?????????{result && (result.age || "-")}</div>
                      </div>
                      <div>
                        {`????????????${result && (result.plan || "")}\n`}
                      </div>
                      <div>
                        {`?????????????????????????????????${result &&
                          formatDateWithTimeJP(result.stay_date_from)
                          }\n`}
                      </div>
                      {console.log(result)}
                      <div>
                        {`???????????????????????????${result &&
                          result.status_code === 1 ? formatDateWithTimeJP(result.create_date) : ''
                          }\n`}
                      </div>
                      <div className={s.roomDetailLabel}>
                        {/* ??????????????????????????????????????????????????????????????????????????????????????? */}
                        {/* ??????????????????????????????????????? */}
                        {
                          (() => {
                            if (result) {
                              if (
                                result.status_code !== 1 &&
                                result.reservation_date
                              ) {
                                return (
                                  <div className={s.reservation}>
                                    ???????????????
                                  </div>
                                )
                              }
                            }
                          })()
                        }
                        {/* ????????????????????????????????? */}
                        {
                          (() => {
                            if (result) {
                              if (result.status_code === 1) {
                                return (
                                  <div className={s.checkin}>
                                    ????????????????????????
                                  </div>
                                )
                              }
                            }
                          })()
                        }
                      </div>
                    </div>
                    <div className={s.guestImage}>
                      {result && result.face_image_path ? (
                        <img
                          src={`${IMAGE_BASE_PATH}${result.face_image_path.split("1/")[1]
                            }`}
                        />
                      ) : (
                        <div className={s.noFaceImage}>No Face Image</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={s.cleaningInfo}>
                  <div className={s.title}>?????????????????????</div>
                  <div className={s.cleaningInfoContainer}>
                    <div>
                      ?????????:&nbsp;{`${result && (result.floor_num || "")}???`}
                    </div>
                    <div>
                      ?????????????????????
                          <span className={s.datetime}>{start_cleaning_time ? formatDateWithTime(start_cleaning_time) : '--:--'}</span>
                      {room_cleaning_last_staff ? ` (${room_cleaning_last_staff}??????)` : ''}
                    </div>
                    <div>
                      ?????????????????????
                          <span className={s.datetime}>{end_cleaning_time ? formatDateWithTime(end_cleaning_time) : '--:--'}</span>
                      {/*{*/}
                      {/*  (() => {*/}
                      {/*    if (!end_cleaning_time) {*/}
                      {/*      return '';*/}
                      {/*    }*/}

                      {/*    return room_cleaning_last_staff ? ` (${room_cleaning_last_staff}??????)` : ''*/}
                      {/*  })()*/}
                      {/*}*/}
                    </div>
                    <div className={s.staffs}>
                      ?????????:&nbsp;
                          <select
                        className={s.staffSelect}
                        name="clean_staff_id"
                        value={clean_staff_id === null ? result.clean_staff_id : clean_staff_id}
                        onChange={(e) => this.handleOnChange(e)}
                        disabled={room_cleaning_status === ROOM_CLEANING_STATUS.CLEANING}
                      >
                        {
                          staffs.map((v, i) => {
                            return (
                              <option
                                value={v.staff_id}
                                onChange={(e) => this.handleOnChange(e)}
                              >
                                {v.staff_name}
                              </option>
                            )
                          })
                        }
                      </select>
                      {this.cleaningStatusButton(room_cleaning_status, clean_staff_id)}
                    </div>
                    <div className={s.amenities}>
                      {AMENITIES.map((i) => (
                        <label className={s.amenity} for={i.name}>{`${i.name}  `}</label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={s.buttons}>
              <button
                className={s.back}
                key='backButton'
                onClick={() => this.props.history.goBack()}
              >
                ??????
              </button>
              <div className={s.right}>
                <button className={s.red} to="/room-management" >
                  ????????????
                </button>
                <button className={s.green} to="/payment" >
                  ????????????
                </button>
              </div>
            </div>

          </div>
        </div>
      </>
    );
  }
}

export default RoomDetail;
