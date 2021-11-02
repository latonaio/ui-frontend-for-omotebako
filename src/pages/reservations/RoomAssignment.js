import React from "react";
import { getFetch } from "../../util/api";
import config from '../../util/config';
import {
  formatDate
} from "../../helper/date";
import RequestRedisManager from "../../util/requestRedisManager";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import Select from "react-select";
import DatePicker2 from '../../components/DatePicker2';
import s from '../../scss/pages/DetailPage.module.scss';
import p from '../../scss/components/Popup.module.scss';

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;
const IMAGE_PATH = config.ReactImagePath;

class RoomAssignmentCheckin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayVacancy: false,
      roomAllocationList: [],
      vacantRooms: [
        {
          room_id: "",
          room_name: ""
        }
      ],
      roomAssigned: false,
      result: {
        name: "",
        name_kana: "",
        plan: "",
        face_image_path: "",
        reservation_method_name: "",
        home_address: "",
        phone_number: "",
        stay_date_from: "",
        create_date: "",
        number_of_rooms: "",
        number_of_guests: "",
        stay_days: "",
        assigned_rooms: [],
      },
      reservations: [],
      isHasReservation: false,
      // 割当られる宿泊者の情報
      allocationRoomGuestInfo: {
        isPushedCheckinDatetime: null,
        isPushedStayDays: false,
        isPushedNumberOfRooms: false,
        stay_date_from: '',
        stay_days: '',
        number_of_guests: '',
        number_of_rooms: '',
        assigned_rooms: [], // 割り当てられた部屋のリスト
        assign_complete: false,
        stay_count: 0,
        diff_year: 0,
        diff_month: 0,
        diff_day: 0,
      },
      assignedRoomKey: null,
      roomAssignmentId: null,
      availableEditing: true, // 編集可能であればtrueを設定
    };
    this.requestRedisManager = null;
  }

  async componentWillMount() {
    this.requestRedisManager = new RequestRedisManager(RequestRedisManagerAPIURL);

    if (this.props.match.params.reservationId) {
      this.requestRedisManager.io.on('getReservationDetail', async (data) => {
        this.setState({
          allocationRoomGuestInfo: {
            ...this.state.allocationRoomGuestInfo,
            ...data,
          }
        });

        if (data.stay_days) {
          await this.getRoomVacancy(data.stay_days);
        }
      });

      this.requestRedisManager.io.emit('getReservationDetail', JSON.stringify({
        reservation_id: this.props.match.params.reservationId
      }));
    }

    if (this.props.match.params.stayGuestID) {
      this.requestRedisManager.io.on('getStayGuestDetail', async (data) => {
        this.setState({
          allocationRoomGuestInfo: {
            ...this.state.allocationRoomGuestInfo,
            ...data,
          }
        });

        if (data.stay_days) {
          await this.getRoomVacancy(data.stay_days);
        }
      });

      this.requestRedisManager.io.emit('getStayGuestDetail', JSON.stringify({
        stay_guests_id: this.props.match.params.stayGuestID
      }));
    }
  }

  async componentWillUnmount() {
    if (this.requestRedisManager) {
      this.requestRedisManager.io.close();
    }
  }

  getRoomVacancy = async (stayDays) => {
    try {
      const nowTime = new Date(Date.now());
      const checkinTime = formatDate(nowTime);
      const checkoutTime = formatDate(nowTime.setDate(nowTime.getDate() + parseInt(stayDays)))

      const result = await getFetch.getRoomVacancy({
        checkinTime,
        checkoutTime
      });

      if (result.data.length > 0) {
        this.setState({ vacantRooms: result.data });
      }
    } catch (e) {
      console.error("===GET ROOMS ERROR===", e);
      throw e;
    }
  };

  // 空き部屋を取得してポップアップリストを出す
  getVacantRooms = async (date, assignedRoomKey, roomAssignmentId) => {
    try {
      const reserveDate = new Date(date);
      const reserveDateTime = formatDate(reserveDate);

      const vacantRooms = await getFetch.getRoomVacancy({
        checkinTime: reserveDateTime,
        checkoutTime: reserveDateTime
      });

      this.setState({
        vacantRooms: vacantRooms.data,
        selectedDate: date,
        displayVacancy: true,
        assignedRoomKey,
        roomAssignmentId
      });

    } catch (e) {
      console.error("Error:", e.message);
    }
  };

  // 予約情報を取得する
  getGuestReservations = async (guestID) => {
    try {
      const reservations = await getFetch.getGuestReservations(guestID);
      return reservations ? reservations : []
    } catch (e) {
      console.error("=== GET GUEST RESERVATIONS ERROR ===", e);
      throw e;
    }
  };

  saveStayGuestInfo = async (data) => {
    if (this.props.match.params.reservationId) {
      this.requestRedisManager.io.emit('editReservationDetail', JSON.stringify({
        ...data,
        reservation_id: this.props.match.params.reservationId
      }));
    }

    if (this.props.match.params.stayGuestID) {
      this.requestRedisManager.io.emit('editStayGuestDetail', JSON.stringify({
        ...data,
        stay_guests_id: this.props.match.params.stayGuestID
      }));
    }
  }

  render() {
    const {
      location,
    } = this.props;

    const {
      displayVacancy,
      vacantRooms,
      result: {
        plan,
      },
      allocationRoomGuestInfo,
      assignedRoomKey,
      roomAssignmentId,
    } = this.state;

    return (
      <Layout navType='reservations'>
        <StatusBar2 icon='calendar' text='お客様に部屋を割り当てます。' />

        <div className={s.detailPage}>
          <div className={s.left}>
            {allocationRoomGuestInfo.face_id_azure ? (
              <img src={(() => {
                const imagePath = allocationRoomGuestInfo.face_image_path.match(/\/(?!.*\/).*/g);
                const matchedPath = imagePath[0].replace(/^\//, '')

                return `${IMAGE_PATH}${matchedPath && matchedPath}`
              })()} />
            ) : (
              <div className={s.noFaceImage}>No Face Image</div>
            )}
            <div className={s.faceLabel}>
              {allocationRoomGuestInfo.face_id_azure
                ? "Face情報が登録されています"
                : "Face情報が登録されていません"}
            </div>
            {this.state.allocationRoomGuestInfo.assign_complete
              ? <div className={s.roomLabel}>客室割り当てが完了しています</div>
              : <div className={s.roomLabelRed}>客室割り当てが完了していません</div>}
            <div className={s.back}>
              <button
                class={s.backButton}
                onClick={() => this.props.history.goBack()}
              >
                戻る
                </button>
            </div>
          </div>

          <div class={s.right}>
            <div class={s.name}>
              {allocationRoomGuestInfo.name} {allocationRoomGuestInfo.name_kana} 様
                  </div>
            {
              (() => {
                if (allocationRoomGuestInfo.stay_count > 0) {
                  return (
                    <div>前回宿泊日:&nbsp;
                      <span className={`${allocationRoomGuestInfo.diff_year > 0 ? '' : 'dis-n'}`}>{allocationRoomGuestInfo.diff_year}年</span>
                      <span className={`${allocationRoomGuestInfo.diff_month > 0 ? '' : 'dis-n'}`}>{allocationRoomGuestInfo.diff_month}ヶ月</span>
                      <span className={`${allocationRoomGuestInfo.diff_day > 0 ? '' : 'dis-n'}`}>{allocationRoomGuestInfo.diff_day}日</span>
                      <span>前</span>
                      <span>({allocationRoomGuestInfo.stay_count + 1}回目)</span>
                    </div>
                  )
                }
              })()
            }
            {/*<div>宿泊:{this.state.allocationRoomGuestInfo.assigned_rooms && this.state.allocationRoomGuestInfo.assigned_rooms.length > 0 ? allocationRoomGuestInfo.assigned_rooms[0].room_name : "未割当" }</div>*/}
            <div className={s.infoItem}>宿泊開始日:&nbsp;
                    <span
                className={`${!this.state.allocationRoomGuestInfo.isPushedCheckinDatetime ? '' : 'dis-n'}`}
                onClick={() => {
                  if (this.state.availableEditing) {
                    this.setState({
                      allocationRoomGuestInfo: {
                        ...this.state.allocationRoomGuestInfo,
                        isPushedCheckinDatetime: !this.state.allocationRoomGuestInfo.isPushedCheckinDatetime
                      }
                    });
                  }
                }
                }>
                {
                  (() => {
                    if (allocationRoomGuestInfo.stay_date_from === '0') {
                      return 0
                    }
                    if (!allocationRoomGuestInfo.stay_date_from) {
                      return <span className="text-gray">未入力</span>
                    }
                    if (allocationRoomGuestInfo.stay_date_from.substr) {
                      allocationRoomGuestInfo.stay_date_from.substr(0, 10)
                    }
                    return allocationRoomGuestInfo.stay_date_from
                  })()
                }
              </span>
              <span className={`${!this.state.allocationRoomGuestInfo.isPushedCheckinDatetime ? 'dis-n' : ''}`}>
                <DatePicker2
                  name="checkinDatetime"
                  value={
                    `${this.state.allocationRoomGuestInfo.stay_date_from}`
                  }
                  onChange={async (event) => {
                    this.setState({
                      allocationRoomGuestInfo: {
                        ...this.state.allocationRoomGuestInfo,
                        stay_date_from: event.value
                      }
                    }, async () => {
                    });
                  }}
                  onBlur={(event) => {
                    this.setState({
                      allocationRoomGuestInfo: {
                        ...this.state.allocationRoomGuestInfo,
                        isPushedCheckinDatetime: false
                      }
                    }, async () => {
                      await this.saveStayGuestInfo({
                        field: 'stay_date_from',
                        value: this.state.allocationRoomGuestInfo.stay_date_from
                      });
                    });
                  }}
                  onKeyDown={async (event) => {
                    if (event.key === 'Enter') {
                      if (event.nativeEvent.isComposing) {
                        return;
                      }

                      this.setState({
                        allocationRoomGuestInfo: {
                          ...this.state.allocationRoomGuestInfo,
                          isPushedCheckinDatetime: false
                        }
                      }, async () => {
                        await this.saveStayGuestInfo({
                          field: 'stay_date_from',
                          value: this.state.allocationRoomGuestInfo.stay_date_from
                        });
                      });
                    }
                  }}
                  onCalendarClose={async () => {
                    await this.saveStayGuestInfo({
                      field: 'stay_date_from',
                      listIndex: this.state.allocationRoomGuestInfo.stay_date_from,
                    })

                    this.setState({
                      editFlag: {
                        ...this.state.editFlag,
                        page: this.state.currentPagination,
                        recordNumber: this.state.allocationRoomGuestInfo.stay_date_from,
                        editing: false
                      }
                    })
                  }}
                />
              </span>
            </div>
            <div className={s.infoItem}>
              泊数:&nbsp;
                    <span
                className={`${!this.state.allocationRoomGuestInfo.isPushedStayDays ? '' : 'dis-n'}`}
                onClick={() => {
                  if (this.state.availableEditing) {
                    this.setState({
                      allocationRoomGuestInfo: {
                        ...this.state.allocationRoomGuestInfo,
                        isPushedStayDays: !this.state.allocationRoomGuestInfo.isPushedStayDays
                      }
                    });
                  }
                }
                }>
                {(() => {
                  if (allocationRoomGuestInfo.stay_days === 0 || allocationRoomGuestInfo.stay_days === '') {
                    return <span className="text-gray">未入力</span>
                  }

                  return allocationRoomGuestInfo.stay_days;
                })()}
              </span>
              <span className={`${!this.state.allocationRoomGuestInfo.isPushedStayDays ? 'dis-n' : ''}`}>
                <Select
                  className={s.selectShort}
                  options={(() => {
                    const selectDays = [];

                    for (let i = 1; i < 101; i++) {
                      selectDays.push({
                        value: i.toString(),
                        label: i.toString()
                      });
                    }

                    return selectDays;
                  })()}
                  onChange={async (event) => {
                    this.setState({
                      allocationRoomGuestInfo: {
                        ...this.state.allocationRoomGuestInfo,
                        stay_days: event.value,
                        isPushedStayDays: false
                      }
                    }, async () => {
                      await this.saveStayGuestInfo({
                        field: 'stay_days',
                        value: event.value
                      });
                    });
                  }}
                />
              </span>
            </div>
            <div className={s.infoItem}>
              部屋数:&nbsp;
                    <span
                className={`${!this.state.allocationRoomGuestInfo.isPushedNumberOfRooms ? '' : 'dis-n'}`}
                onClick={() => {
                  if (this.state.availableEditing) {
                    this.setState({
                      allocationRoomGuestInfo: {
                        ...this.state.allocationRoomGuestInfo,
                        isPushedNumberOfRooms: !this.state.allocationRoomGuestInfo.isPushedNumberOfRooms
                      }
                    });
                  }
                }
                }>
                {(() => {
                  if (allocationRoomGuestInfo.number_of_rooms === 0 || allocationRoomGuestInfo.number_of_rooms === '') {
                    return <span className="text-gray">未入力</span>
                  }

                  return allocationRoomGuestInfo.number_of_rooms;
                })()}
              </span>
              <span className={`${!this.state.allocationRoomGuestInfo.isPushedNumberOfRooms ? 'dis-n' : ''}`}>
                <Select
                  className={s.selectShort}
                  options={(() => {
                    const selectRoomNumber = [];

                    for (let i = 1; i < this.state.vacantRooms.length; i++) {
                      selectRoomNumber.push({
                        value: i.toString(),
                        label: i.toString()
                      });
                    }

                    return selectRoomNumber;
                  })()}
                  onChange={async (event) => {
                    this.setState({
                      allocationRoomGuestInfo: {
                        ...this.state.allocationRoomGuestInfo,
                        number_of_rooms: event.value,
                        isPushedNumberOfRooms: false
                      }
                    }, async () => {
                      await this.saveStayGuestInfo({
                        field: 'number_of_rooms',
                        value: event.value
                      });
                    });
                  }}
                />
              </span>
            </div>
            <div>プラン:&nbsp;{plan}</div>

            <div className={s.roomInfo}>
              <div className={s.roomListHeader}>
                <div>宿泊日</div>
                <div>部屋ーカウント</div>
                <div>部屋割当</div>
                <div>人数割当</div>
              </div>
              {/* 部屋割当リスト */}
              <div className={s.roomList}>
                {this.state.allocationRoomGuestInfo.assigned_rooms &&
                  this.state.allocationRoomGuestInfo.assigned_rooms.length > 0 &&
                  this.state.allocationRoomGuestInfo.assigned_rooms.map((assignedRoom, idx) => (
                    <div className={s.listItem} key={idx}>
                      <div>{assignedRoom.stay_date}</div>
                      <div>{assignedRoom.room_count}</div>
                      <div
                        className='cursor-pointer'
                        onClick={async () => {
                          await this.getVacantRooms(assignedRoom.stay_date, assignedRoom.assigned_room_key, assignedRoom.room_assignment_id)
                        }}>
                        {assignedRoom.room_name || <div className='text-red'>未割当</div>}
                      </div>
                      <div>{allocationRoomGuestInfo.number_of_guests}</div>
                    </div>
                  ))}
                {/* {this.state.allocationRoomGuestInfo.assigned_rooms.length === 0 &&
                  <div className={s.listItem}>
                    <div>-</div>
                    <div>-</div>
                    <div
                      className='text-red cursor-pointer'
                      onClick={() => {
                        this.setState({
                          displayVacancy: true
                        });
                      }}>
                      未割当
                    </div>
                    <div>-</div>
                  </div>
                } */}
              </div>
            </div>

            {displayVacancy && (
              <div
                className={p.popupOverlay}
                onClick={() => {
                  this.setState({
                    displayVacancy: false
                  });
                }}
              >
                <div className={p.popup}>
                  <div className={p.title}>
                    部屋割当
                      </div>
                  <div className={p.popupListContainer}>
                    {vacantRooms.map((vacantRoom, idx) => (
                      <div
                        className={p.popupList}
                        key={idx}
                        onClick={async () => {
                          if (this.props.match.params.reservationId) {
                            this.requestRedisManager.io.emit('editAssignedRoomFromReservation', JSON.stringify({
                              room_id: vacantRoom.room_id,
                              reservation_id: parseInt(this.props.match.params.reservationId),
                              assigned_room_key: assignedRoomKey,
                              room_assignment_id: roomAssignmentId,
                              stay_days: allocationRoomGuestInfo.stay_days,
                              number_of_rooms: allocationRoomGuestInfo.number_of_rooms,
                            }));
                          }

                          if (this.props.match.params.stayGuestID) {
                            this.requestRedisManager.io.emit('editAssignedRoomFromStayGuest', JSON.stringify({
                              room_id: vacantRoom.room_id,
                              stay_guests_id: parseInt(this.props.match.params.stayGuestID),
                              assigned_room_key: assignedRoomKey,
                              room_assignment_id: roomAssignmentId,
                              stay_days: allocationRoomGuestInfo.stay_days,
                              number_of_rooms: allocationRoomGuestInfo.number_of_rooms,
                            }));
                          }

                          this.setState({
                            displayVacancy: false,
                          });
                        }}
                      >
                        <div style={{ 'text-align': 'left' }}>{vacantRoom.room_id}:{vacantRoom.room_name}</div>
                      </div>
                    ))}
                  </div>
                  <div className={p.buttonContainer}>
                    <button
                      onClick={() => {
                        this.setState({
                          displayVacancy: false
                        });
                      }}
                    >
                      閉じる
                        </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }
}

export default RoomAssignmentCheckin;