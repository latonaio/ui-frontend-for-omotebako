import React from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import CheckStatus from "../../components/CheckStatus";
import s from '../../scss/pages/DetailPage.module.scss';
import { getFetch, postFetch } from "../../util/api";
import { resetCheckin, setCheckin } from '../../redux/actions/checkin';
import { connect } from "react-redux";
import config from '../../util/config'
import { formatDate, formatDateWithHyphen } from "../../helper/date";
import Select from "react-select";
import { playStreamingAudio } from "../../util/streamingAudioManager";
import { store } from '../../redux/store';

const IMAGE_PATH = config.ReactImagePath;

class GuestInfo extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      reservations: [],
      customerEnterInfo: {
        isPushedName: false,
        isPushedKanaName: false,
        isPushedLodging: false,
        isPushedGuests: false,
        isPushedStayDays: false,
        isPushedRoomNumber: false,
        name: '',
        kanaName: '',
        lodging: '',
        number_of_guests: '',
        number_of_guests_male: '',
        number_of_guests_female: '',
        stay_days: '',
        number_of_rooms: '',
        assign_complete: false,
        assigned_rooms: []
      },
      validation: {
        emptyRoomError: false,
        emptyRoomNumberError: false
      },
      vacancyRooms: [],
      guestInfo: {
        assigned_rooms: null,
      }, // 客情報
      stayGuestInfo: null,
      imagePath: null,
      rooms: [],
      availableEditing: true, // 編集可能であればtrueを設定
      checkin: this.props.checkin,
      layoutType: ''
    };
  }

  async componentWillMount() {
    this.setState({
      layoutType: this.props.location.pathname.match(/^\/.+?\//)[0].replaceAll('/', '')
    });

    const guestId = parseInt(this.props.match.params.guestId);

    const guestInfo = await this.getGuestInfo(guestId);

    this.setState({
      customerEnterInfo: {
        ...this.state.customerEnterInfo,
        name: guestInfo.name,
        kanaName: guestInfo.name_kana,
      }
    });

    this.setState({
      guestInfo: {
        ...this.state.guestInfo,
        ...guestInfo
      }
    });

    // 部屋を選択するために全ての部屋の情報を取得する
    await this.getRooms();

    console.log(this.state.layoutType);

    // チェックインのみRedisもしくは予約情報を取得する
    if (this.state.layoutType !== 'checkout') {
      const redisGuestInfo = await this.getRedisGuestInfo(guestInfo.guest_id);

      // redisデータがある場合
      if (redisGuestInfo) {
        await this.getRoomVacancy(redisGuestInfo.stay_days);
      } else {
        // redisにデータがなくて予約があれば
        const reservations = await this.getGuestReservations(guestInfo.guest_id);

        if (reservations && reservations.length > 0) {
          await this.getRoomVacancy(reservations[0].stay_days);
        }
      }
    } else {
      // チェックアウトのときは編集を不可能にする
      this.setState({
        availableEditing: false
      });
    }

    await this.getGuestInfo(guestInfo.guest_id);
    const stayGuestInfo = await this.getStayGuestInfo(guestInfo.guest_id);

    // チェックアウトであれば
    if (this.state.layoutType === 'checkout') {
      this.setState({
        customerEnterInfo: {
          ...this.state.customerEnterInfo,
          number_of_guests: stayGuestInfo[0].number_of_guests,
          stay_days: stayGuestInfo[0].stay_days,
          number_of_rooms: stayGuestInfo[0].number_of_rooms,
          assign_complete: stayGuestInfo[0].assign_complete,
          lodging: stayGuestInfo[0].assigned_rooms &&
            stayGuestInfo[0].assigned_rooms.length > 0 ?
            stayGuestInfo[0].assigned_rooms[0].room_id : '',
          assigned_rooms: stayGuestInfo[0].assigned_rooms
        }
      });
    }

    // チェックインのみRedisに保存する
    if (this.state.layoutType !== 'checkout') {
      const checkinData = store.getState().checkin;

      if (checkinData.allocationRoomGuestInfo) {
        const asyncSetState = (data) => {
          return new Promise((resolve, reject) => {
            this.setState({
              ...data
            }, () => {
              return resolve();
            });
          });
        }

        await asyncSetState({
          customerEnterInfo: {
            ...this.state.customerEnterInfo,
            ...checkinData.allocationRoomGuestInfo,
            lodging: checkinData.allocationRoomGuestInfo.assigned_rooms &&
              checkinData.allocationRoomGuestInfo.assigned_rooms.length > 0 ?
              checkinData.allocationRoomGuestInfo.assigned_rooms[0].room_id : '',
          }
        })

        // this.setState({
        //   customerEnterInfo: {
        //     ...this.state.customerEnterInfo,
        //     ...this.state.checkin.allocationRoomGuestInfo,
        //     lodging: this.state.checkin.allocationRoomGuestInfo.assigned_rooms &&
        //     this.state.checkin.allocationRoomGuestInfo.assigned_rooms.length > 0 ?
        //       this.state.checkin.allocationRoomGuestInfo.assigned_rooms[0].room_id : '',
        //   }
        // });

        await this.saveRedisGuestStayInfo();
      } else {
        await this.saveRedisGuestStayInfo();
      }
    }
  }

  getRooms = async () => {
    try {
      const result = await getFetch.getRooms();

      this.setState({
        rooms: result
      });
    } catch (e) {
      console.error("=== GET ROOMS ERROR ===", e);
      throw e;
    }
  }

  getGuestReservations = async (guestID) => {
    try {
      const reservations = await getFetch.getGuestReservations(guestID);

      const setStateGuestInfo = () => {
        return new Promise((resolve, reject) => {
          if (reservations && reservations.length > 0) {
            this.setState({
              customerEnterInfo: {
                ...this.state.customerEnterInfo,
                number_of_guests: reservations[0].number_of_guests,
                stay_days: reservations[0].stay_days,
                number_of_rooms: reservations[0].number_of_rooms,
                assign_complete: reservations[0].assign_complete,
                lodging: reservations[0].assigned_rooms &&
                  reservations[0].assigned_rooms.length > 0 ?
                  reservations[0].assigned_rooms[0].room_id : '',
                assigned_rooms: reservations[0].assigned_rooms
              }
            }, () => {
              return resolve();
            });
          }

          return resolve();
        });
      };

      const setStateReservations = () => {
        return new Promise((resolve, reject) => {
          if (reservations && reservations.length > 0) {
            this.setState({ reservations: reservations }, () => {
              return resolve();
            });
          }

          return resolve();
        });
      }

      await setStateGuestInfo();

      await setStateReservations();

      return reservations;
    } catch (e) {
      console.error("=== GET GUEST RESERVATIONS ERROR ===", e);
      throw e;
    }
  };

  getStayGuestInfo = async (id) => {
    try {
      const result = await getFetch.getStayGuestInfo(id);

      this.setState({
        stayGuestInfo: result[0],
      });

      return result;
    } catch (e) {
      console.error("=== GET STAY GUEST INFO ERROR ===", e);
      throw e;
    }
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
        result.data.unshift({
          room_id: '',
          room_name: `未入力`
        });

        this.setState({
          vacancyRooms: result.data
        });
      }
    } catch (e) {
      console.error("===GET ROOMS ERROR===", e);
      throw e;
    }
  };

  getRedisGuestInfo = async () => {
    try {
      const { guestInfo } = this.props;

      const redisGuestInfo = await getFetch.getRedisGuestInfo(guestInfo.guest_id);

      const setStateGuestInfo = () => {
        return new Promise((resolve, reject) => {
          this.setState({
            customerEnterInfo: {
              ...this.state.customerEnterInfo,
              number_of_guests: redisGuestInfo.number_of_guests,
              stay_days: redisGuestInfo.stay_days,
              number_of_rooms: redisGuestInfo.number_of_rooms,
              assign_complete: redisGuestInfo.assign_complete,
              lodging: redisGuestInfo.assigned_rooms &&
                redisGuestInfo.assigned_rooms.length > 0 ?
                redisGuestInfo.assigned_rooms[0].room_id : '',
              assigned_rooms: redisGuestInfo.assigned_rooms
            }
          }, () => {
            return resolve();
          });

          return resolve();
        });

      }

      await setStateGuestInfo();

      const setStateReservations = () => {
        return new Promise((resolve, reject) => {
          if (reservations && reservations.length > 0) {
            this.setState({
              reservations: reservations
            }, () => {
              return resolve();
            });
          }

          return resolve();
        });
      }

      // 部屋割当ページで割当が完了して戻ってきたときもreservation_idが必要なため
      const reservations = await getFetch.getGuestReservations(guestInfo.guest_id);

      await setStateReservations();

      return redisGuestInfo;
    } catch (e) {
      console.error("Error:", e.message);
    }
  }

  saveRedisGuestStayInfo = async (changeInfo = {}) => {
    const { guestInfo } = this.props;

    try {
      // 予約がなければ現在時刻をstay_date_fromに設定
      const stayDateFrom = this.state.reservations.length > 0 ?
        formatDateWithHyphen(new Date(this.state.reservations[0].stay_date_from)) : (() => {
          const nowTime = new Date(Date.now());
          return formatDateWithHyphen(nowTime);
        })();

      const guestStayInfo = {
        guest_id: this.state.guestInfo.guest_id || guestInfo.guest_id,
        stay_date_from: stayDateFrom,
        stay_days: this.state.customerEnterInfo.stay_days,
        number_of_guests: this.state.customerEnterInfo.number_of_guests,
        number_of_rooms: this.state.customerEnterInfo.number_of_rooms,
        assigned_rooms: this.state.customerEnterInfo.assigned_rooms,
        reservation_id: this.state.reservations.length > 0 ?
          this.state.reservations[0].reservation_id : null
      }

      if (this.state.customerEnterInfo.lodging !== '') {
        // const getTargetRoom = this.state.rooms.filter((room) => {
        //   if (room.room_id === this.state.customerEnterInfo.lodging) {
        //     return true;
        //   }
        // });

        // 全部屋リストから情報を取得
        const getTargetRoom = this.state.rooms.filter((room) => {
          if (room.room_id === this.state.customerEnterInfo.lodging) {
            return true;
          }
        });

        const getTargetRoomAssignedKey = guestStayInfo.assigned_rooms.reduce((collection, assignedRoom) => {
          if (assignedRoom.room_id === this.state.customerEnterInfo.lodging) {
            collection = {
              assigned_room_key: assignedRoom.assigned_room_key
            };

            return collection;
          }

          return collection;
        }, {});

        // 選択した部屋に該当があれば
        if (getTargetRoom.length > 0) {
          // assignedされた部屋がすでにあれば
          if (guestStayInfo.assigned_rooms.length > 0) {
            if (changeInfo.changeType === 'roomName') {
              // assigned_roomsを選択した部屋のみに上書いて送る
              guestStayInfo.assigned_rooms = [{
                room_name: getTargetRoom[0].room_name,
                room_id: getTargetRoom[0].room_id,
                stay_date: stayDateFrom,
                assigned_room_key: getTargetRoomAssignedKey.assigned_room_key || guestStayInfo.assigned_rooms[0].assigned_room_key
              }];
            }
          } else {
            // 選択した部屋情報を送る
            guestStayInfo.assigned_rooms.push({
              room_name: getTargetRoom[0].room_name,
              room_id: getTargetRoom[0].room_id,
              stay_date: stayDateFrom,
              assigned_room_key: getTargetRoomAssignedKey.assigned_room_key
            })
          }
        }

        // guestStayInfo.assigned_rooms.push({
        //   room: {
        //     room_name: getTargetRoom[0].room_name,
        //     room_id: getTargetRoom[0].room_id,
        //     stay_date: stayDateFrom
        //   }
        // })
      } else {
        // 部屋が未入力状態でされていたらassigned_roomsを配列の空で送る
        guestStayInfo.assigned_rooms = [];
      }

      const result = await postFetch.registerStayGuests(guestStayInfo);

      this.setState({
        customerEnterInfo: {
          ...this.state.customerEnterInfo,
          assign_complete: result.assign_complete
        }
      });

      this.props.setCheckin({
        ...this.state.checkin,
        allocationRoomGuestInfo: {
          ...guestStayInfo,
          ...result,
        }
      });
    } catch (e) {
      console.error("===SAVE REDIS GUEST STAY INFO ERROR===", e);
    }
  };

  registerFaceInfo = async (id) => {
    try {
      const { faceInfo } = this.state.checkin;

      await postFetch.registerFaceInfo({
        guest_id: id,
        image_path: faceInfo.image_path,
        gender_by_face: faceInfo.gender_by_face,
        age_by_face: faceInfo.age_by_face,
      });

      return true;
    } catch (e) {
      console.error("=== REGISTER FACE INFO ===", e);
      throw e;
    }
  };

  // チェックインするAPI
  execCheckinStayGuest = async (guestID) => {
    try {
      return await postFetch.registerStayGuest(guestID);
    } catch (e) {
      console.error("=== REGISTER STAY GUEST INFO RESERVATION ERROR ===", e);
      throw e;
    }
  };

  handleOnClickCheckinNew = async (guestID) => {
    const result = await this.registerFaceInfo(guestID);

    if (result) {
      await this.getGuestInfo(guestID);
      await this.getGuestReservations(guestID);
      const execCheckinStayGuestResult = await this.execCheckinStayGuest(guestID);

      this.setState({
        assignComplete: execCheckinStayGuestResult.assign_complete
      })

      this.setState({ phase: "AFTER_CHECKIN", newGuest: true });

      this.props.history.push(`/checkin/guest/complete/${guestID}`)
    }

    await playStreamingAudio(['greeting', 'welcome']);
  };

  handleOnClickCheckinExisting = async (guestID, sendParams) => {
    await this.getGuestInfo(guestID);

    // 予約情報があるとき
    if (!sendParams) {
      await this.getGuestReservations(guestID);
    }

    const result = await this.execCheckinStayGuest(guestID);

    this.setState({
      assignComplete: result.assign_complete
    })

    this.setState({ phase: "AFTER_CHECKIN", newGuest: false });

    this.props.history.push(`/checkin/guest/complete/${guestID}`)

    await playStreamingAudio(['greeting', 'welcome']);
  };

  render() {
    const {
      location,
      isNewGuest,
      handleOnClickCheckinNew,
      onClickCheckout,
      onClickCheckinExisting,
      onClickCheckReservation,
      onClickCheckReservations,
      onClickRedoCheckin,
      onClickRoomLabel,
    } = this.props;

    const checkin = store.getState().checkin;

    const layoutType = this.state.layoutType;

    let guest_id,
      name,
      name_kana,
      face_id_azure,
      number_of_guests,
      stay_days,
      room_name,
      plan,
      reservation_id;

    if (layoutType === 'checkout') {
      if (this.state.stayGuestInfo) {
        name = this.state.stayGuestInfo.name;
        name_kana = this.state.stayGuestInfo.name_kana;
        number_of_guests = this.state.stayGuestInfo.number_of_guests;
        stay_days = this.state.stayGuestInfo.stay_days;
        face_id_azure = this.state.stayGuestInfo.face_id_azure;

        if (this.state.stayGuestInfo.reservation_id) {
          reservation_id = this.state.stayGuestInfo.reservation_id;
        }

        if (this.state.guestInfo && this.state.guestInfo.assigned_rooms.length > 0) {
          room_name = this.state.guestInfo.assigned_rooms[0].room_name;
          guest_id = this.state.guestInfo.guest_id;
        }
      }
    } else {
      // 予約情報があれば予約情報から名前などの値をセットする
      if (this.state.reservations.length > 0) {
        const reservation = this.state.reservations[0];
        guest_id = reservation.guest_id;
        name = reservation.name;
        name_kana = reservation.name_kana;
        face_id_azure = reservation.face_id_azure;
        number_of_guests = reservation.number_of_guests;
        stay_days = reservation.stay_days;

        // 部屋割りされていればassigned_roomsにデータが帰ってくる
        // なければ空配列が帰ってくる
        if (reservation.assigned_rooms.length > 0) {
          room_name = reservation.assigned_rooms[0].room_name;
        }

        plan = reservation.plan;
        reservation_id = reservation.reservation_id;
      } else {
        // 顧客（顔認証情報から紐づく顧客の情報があれば）
        if (this.state.guestInfo) {
          guest_id = this.state.guestInfo.guest_id;
          name = this.state.guestInfo.name;
          name_kana = this.state.guestInfo.name_kana;
          face_id_azure = this.state.guestInfo.face_id_azure;
        }
      }
    }

    const nowDate = new Date();

    let sendParamsForCreateStayGuests = {};

    // 顔があって予約がない場合
    if (this.state.reservations.length === 0) {
      sendParamsForCreateStayGuests = {
        stayDateFrom: formatDate(nowDate),
        stayDateTo: formatDate(nowDate.setDate(nowDate.getDate() + parseInt(this.state.customerEnterInfo.days))),
        stayDays: parseInt(this.state.customerEnterInfo.stay_days),
        numberOfGuests: parseInt(this.state.customerEnterInfo.number_of_guests),
        numberOfRooms: [
          this.state.customerEnterInfo.lodging
        ]
      }
    }


    return (
      <Layout navType='checkin'>
        <StatusBar2
          icon='checkin'
          text='お客さま情報を表示しています、チェックインを完了させてください。'
          right={<CheckStatus status='checkin2' />}
        />

        <div className={s.detailPage}>
          <div className={s.left}>
            {checkin.imagePath ? (
              <img src={checkin.imagePath} />
            ) : (
              <div className={s.noFaceImage}>No Face Image</div>
            )}
            <div className={s.faceLabel}>
              {checkin.faceInfo && checkin.faceInfo.status === 'success'
                ? "Face情報が登録されています"
                : "Face情報が登録されていません"}
            </div>
            {this.state.customerEnterInfo.assign_complete ? (
              <div
                className={s.roomLabel}
                onClick={() => {
                  this.props.history.push(`/checkin/guest/room/assignment/${this.state.guestInfo.guest_id}`)
                }}
              >
                客室割り当てが完了しています
              </div>
            ) : (
              <button
                className={s.roomLabelRed}
                onClick={() => {
                  this.props.history.push(`/checkin/guest/room/assignment/${this.state.guestInfo.guest_id}`)
                }}
              >
                客室割り当てが完了していません
              </button>
            )}
            <button
              className={s.toReservations}
              onClick={() => {
                this.props.history.push(`/reservations`)
              }}
            >
              予約情報を確認する
                </button>
            <button
              className={s.toCheckin}
              onClick={() => {
                this.props.history.push(`/checkin`)
              }}
            >
              チェックインをやり直す
                </button>
          </div>

          <div className={s.right}>
            <div
              className={`${this.state.checkin.newGuest ? '' : 'dis-n'}`}
              style={{ 'margin-bottom': '20px' }}
            >
              {`新規登録のお客さまに関する情報です`}
            </div>
            <div
              className={s.name}
              key={'name'}
            >
              お名前:
                    {
                (() => {
                  if (name) {
                    if (!this.state.customerEnterInfo.isPushedName) {
                      return (
                        <span onClick={() => {
                          // this.setState({
                          //   customerEnterInfo: {
                          //     ...this.state.customerEnterInfo,
                          //     isPushedName: !this.state.customerEnterInfo.isPushedName
                          //   }
                          // });
                        }
                        }>
                          {
                            this.state.customerEnterInfo.name === '' ?
                              <span className="text-gray">未入力</span> :
                              this.state.customerEnterInfo.name + ' 様'
                          }
                        </span>)
                    } else {
                      return (
                        <span>
                          <input
                            type="text"
                            name="name"
                            value={this.state.customerEnterInfo.name}
                            onChange={(event) => {
                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  name: event.target.value
                                }
                              });
                            }}
                            onKeyPress={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                this.setState({
                                  customerEnterInfo: {
                                    ...this.state.customerEnterInfo,
                                    name: this.state.customerEnterInfo.name,
                                    isPushedName: false
                                  }
                                });
                              }
                            }}
                          />様</span>
                      )
                    }
                  } else {
                    return <span>{name} 様</span>
                  }
                })()
              }
            </div>
            <div
              className={s.name}
              key={'kanaName'}
            >
              ふりがな:
                    {
                (() => {
                  if (name_kana) {
                    if (!this.state.customerEnterInfo.isPushedKanaName) {
                      return (
                        <span onClick={() => {
                          // this.setState({
                          //   customerEnterInfo: {
                          //     ...this.state.customerEnterInfo,
                          //     isPushedKanaName: !this.state.customerEnterInfo.isPushedKanaName
                          //   }
                          // });
                        }
                        }>
                          {
                            this.state.customerEnterInfo.kanaName === '' ?
                              <span className="text-gray">未入力</span> :
                              this.state.customerEnterInfo.kanaName + ' 様'
                          }
                        </span>
                      )
                    } else {
                      return (
                        <span>
                          <input
                            type="text"
                            name="name"
                            value={this.state.customerEnterInfo.kanaName}
                            onChange={(event) => {
                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  kanaName: event.target.value
                                }
                              });
                            }}
                            onKeyPress={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                this.setState({
                                  customerEnterInfo: {
                                    ...this.state.customerEnterInfo,
                                    kanaName: this.state.customerEnterInfo.kanaName,
                                    isPushedKanaName: false
                                  }
                                });
                              }
                            }}
                          />様</span>
                      )
                    }
                  } else {
                    return (<span>{name_kana} 様</span>)
                  }
                })()
              }
            </div>
            <div className='d-flex' key={'lodging'}>
              部屋:&nbsp;
                  <div
                onClick={() => {
                  this.props.history.push(`/reservation/room/assignment/${reservation_id}`)
                }}
              >
                {
                  (() => {
                    const getTargetRoom = this.state.rooms.filter((room) => {
                      if (room.room_id === this.state.customerEnterInfo.lodging) {
                        return true;
                      }
                    });

                    if (getTargetRoom.length > 0) {
                      return getTargetRoom[0].room_name;
                    }

                    return <div className="text-gray">未入力</div>
                  })()
                }
              </div>
              {/* {
                    (() => {
                      if (!this.state.customerEnterInfo.isPushedLodging) {
                        return (
                          <span onClick={async () => {
                            if (this.state.availableEditing) {
                              if (this.state.customerEnterInfo.stay_days !== '') {
                                await this.getRoomVacancy(this.state.customerEnterInfo.stay_days);
                              }

                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  isPushedLodging: !this.state.customerEnterInfo.isPushedLodging
                                }
                              });
                            }
                          }
                          }>
                            {
                              (() => {
                                const getTargetRoom = this.state.rooms.filter((room) => {
                                  if (room.room_id === this.state.customerEnterInfo.lodging) {
                                    return true;
                                  }
                                });

                                if (getTargetRoom.length > 0) {
                                  return getTargetRoom[0].room_name;
                                }

                                return <span className="text-gray">未入力</span>;
                              })()
                            }
                          </span>
                        )
                      } else {
                        const reducedRooms = this.state.vacancyRooms.reduce((collection, data) => {
                          collection.push({
                            value: data.room_id,
                            label: `${data.room_id} ${data.room_name}`
                          });

                          return collection;
                        }, []);

                        // 宿泊数が未入力だったら
                        if (!this.state.validation.emptyRoomError) {
                          if (this.state.customerEnterInfo.stay_days === '') {
                            this.setState({
                              validation: {
                                ...this.state.validation,
                                emptyRoomError: true
                              }
                            })
                          }
                        }

                        return <span>
                          <Select
                            className={'nameEnter nameEnter-select select'}
                            options={reducedRooms}
                            onChange={async (event) => {
                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  lodging: event.value,
                                  isPushedLodging: false
                                }
                              }, async () => {
                                await this.saveRedisGuestStayInfo({
                                  changeType: 'roomName'
                                });
                              });
                            }}
                          />
                        </span>
                      }
                    })()
                  } */}
            </div>
            <div key={'guestAndDays'} className={s.numbersSection}>
              <div className={s.infoItem}>
                人数:
                      {
                  (() => {
                    if (!this.state.customerEnterInfo.isPushedGuests) {
                      return <span onClick={() => {
                        if (this.state.availableEditing) {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedGuests: !this.state.customerEnterInfo.isPushedGuests
                            }
                          });
                        }
                      }
                      }>
                        {
                          (() => {
                            if (this.state.customerEnterInfo.number_of_guests === 0) {
                              return <span className="text-gray">未入力</span>
                            }

                            if (this.state.customerEnterInfo.number_of_guests !== '') {
                              return this.state.customerEnterInfo.number_of_guests
                            }

                            return <span className="text-gray">未入力</span>
                          })()
                        }
                      </span>
                    }

                    const selectGuests = [];

                    for (let i = 1; i < 101; i++) {
                      selectGuests.push({
                        value: i.toString(),
                        label: i.toString()
                      });
                    }

                    return <span>
                      <Select
                        className={s.selectShort}
                        options={selectGuests}
                        onChange={async (event) => {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              number_of_guests: parseInt(event.value),
                              isPushedGuests: false
                            }
                          }, async () => {
                            await this.saveRedisGuestStayInfo();
                          });
                        }}
                        onKeyPress={async (event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            this.setState({
                              customerEnterInfo: {
                                ...this.state.customerEnterInfo,
                                number_of_guests: this.state.customerEnterInfo.number_of_guests,
                                isPushedGuests: false
                              }
                            });
                          }
                        }}
                      />
                    </span>
                  })()
                }
              </div>
              <div className={s.infoItem}>
                宿泊数:
                      {
                  (() => {
                    if (!this.state.customerEnterInfo.isPushedStayDays) {
                      return <span onClick={() => {
                        if (this.state.availableEditing) {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedStayDays: !this.state.customerEnterInfo.isPushedStayDays
                            }
                          });
                        }
                      }
                      }>
                        {
                          (() => {
                            if (this.state.customerEnterInfo.stay_days === 0) {
                              return <span className="text-gray">未入力</span>;
                            }

                            if (this.state.customerEnterInfo.stay_days !== '') {
                              return this.state.customerEnterInfo.stay_days + '泊'
                            }

                            return <span className="text-gray">未入力</span>;
                          })()
                        }
                      </span>
                    } else {
                      const selectDays = [];

                      for (let i = 1; i < 101; i++) {
                        selectDays.push({
                          value: i.toString(),
                          label: i.toString()
                        });
                      }

                      return <span>
                        <Select
                          className={s.selectShort}
                          options={selectDays}
                          onChange={async (event) => {
                            // 空室リストを取得してからセットする
                            await this.getRoomVacancy(event.value);

                            this.setState({
                              customerEnterInfo: {
                                ...this.state.customerEnterInfo,
                                stay_days: event.value,
                                isPushedStayDays: false
                              }
                            }, async () => {
                              await this.saveRedisGuestStayInfo();
                            });

                            // バリデートエラーを解除
                            this.setState({
                              validation: {
                                ...this.state.validation,
                                emptyRoomError: false,
                                emptyRoomNumberError: false
                              }
                            })
                          }}
                          onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  stay_days: this.state.customerEnterInfo.stay_days,
                                  isPushedStayDays: false
                                }
                              });

                              this.setState({
                                validation: {
                                  ...this.state.validation,
                                  emptyRoomError: false,
                                  emptyRoomNumberError: false,
                                }
                              })
                            }
                          }}
                        />
                      </span>
                    }
                  })()
                }
              </div>
              <div className={s.infoItem}>
                部屋数:
                      {
                  (() => {
                    if (!this.state.customerEnterInfo.isPushedRoomNumber) {
                      return <span onClick={() => {
                        if (this.state.availableEditing) {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedRoomNumber: !this.state.customerEnterInfo.isPushedRoomNumber
                            }
                          });
                        }
                      }
                      }>
                        {
                          (() => {
                            if (this.state.customerEnterInfo.number_of_rooms === 0) {
                              return <span className="text-gray">未入力</span>;
                            }

                            if (this.state.customerEnterInfo.number_of_rooms !== '') {
                              return this.state.customerEnterInfo.number_of_rooms + '部屋'
                            }

                            return <span className="text-gray">未入力</span>;
                          })()
                        }
                      </span>
                    } else {
                      const selectDays = [];

                      for (let i = 1; i < 101; i++) {
                        selectDays.push({
                          value: i.toString(),
                          label: i.toString()
                        });
                      }

                      return <span>
                        <Select
                          className={s.selectShort}
                          options={selectDays}
                          onChange={async (event) => {
                            // 空室リストを取得してからセットする
                            await this.getRoomVacancy(event.value);

                            this.setState({
                              customerEnterInfo: {
                                ...this.state.customerEnterInfo,
                                number_of_rooms: parseInt(event.value),
                                isPushedRoomNumber: false
                              }
                            }, async () => {
                              await this.saveRedisGuestStayInfo();
                            });

                            // バリデートエラーを解除
                            this.setState({
                              validation: {
                                ...this.state.validation,
                                emptyRoomError: false,
                                emptyRoomNumberError: false
                              }
                            })
                          }}
                          onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  number_of_rooms: this.state.customerEnterInfo.number_of_rooms,
                                  isPushedRoomNumber: false
                                }
                              });

                              this.setState({
                                validation: {
                                  ...this.state.validation,
                                  emptyRoomError: false,
                                  emptyRoomNumberError: false,
                                }
                              })
                            }
                          }}
                        />
                      </span>
                    }
                  })()
                }
              </div>
            </div>
            <div>
              プラン: プラン<br />
                    早チェックイン, 遅チェックアウト, ベッドメイク◎,<br />
                    アメニティセット, ロビー利用, ビール, 禁煙
                  </div>
            <div className={s.checkinCompleteButton}>
              {layoutType === 'checkout' ?
                <div
                  className={'button'}
                  onClick={() => onClickCheckout(guest_id)}
                >チェックアウトを<br />完了する</div> :
                <div
                  className="button checkin"
                  onClick={async () => {
                    if (this.state.checkin.newGuest) {
                      await this.handleOnClickCheckinNew(this.state.guestInfo.guest_id)
                    } else {
                      await this.handleOnClickCheckinExisting(
                        guest_id ? guest_id : this.state.guestInfo.guest_id,
                        this.state.reservations.length === 0 ?
                          sendParamsForCreateStayGuests :
                          null
                      )
                    }
                  }}
                >チェックインを<br />完了する</div>
              }
            </div>
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
  setCheckin: setCheckin,
  resetCheckin: resetCheckin
}

export default connect(mapStateToProps, mapActionsToProps)(GuestInfo);

