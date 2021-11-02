import React from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import s from '../../scss/pages/DetailPage.module.scss';
import { getFetch, postFetch } from "../../util/api";
import { resetCheckout, setCheckout } from '../../redux/actions/checkout';
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
      checkout: this.props.checkout,
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

    // チェックアウトのときは編集を不可能にする
    this.setState({
      availableEditing: false
    });

    await this.getGuestInfo(guestInfo.guest_id);
    const stayGuestInfo = await this.getStayGuestInfo(guestInfo.guest_id);

    // チェックアウトであれば
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

  handleOnClickCompleteCheckout = async (guestID) => {
    const stayGuest = await getFetch.getStayGuestInfo(guestID)

    if (!stayGuest.length > 0) {
      console.error("チェックインしていないお客様です。")
      return;
    }

    await postFetch.checkout(stayGuest[0].guest_id);

    // this.setState({ phase: "FINISH_CHECKOUT" });

    this.props.history.push(`/checkout/guest/complete/${guestID}`)

    await playStreamingAudio(['complete-checkout', 'be-careful']);
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

    const checkout = store.getState().checkout;

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
      <Layout navType='checkout'>
        <StatusBar2 icon='checkoutIcon' text='お客さまのチェックアウトを行っています。' />

        <div className={s.detailPage}>
          <div className={s.left}>
            {checkout.imagePath ? (
              <img src={checkout.imagePath} />
            ) : (
              <div className={s.noFaceImage}>No Face Image</div>
            )}
            <div className={s.faceLabel}>
              {checkout.faceInfo && checkout.faceInfo.status === 'success'
                ? "Face情報が登録されています"
                : "Face情報が登録されていません"}
            </div>
            <button
              className={s.toCheckin}
              onClick={() => {
                this.props.history.push(`/checkout`)
              }}
            >
              チェックアウトをやり直す
                </button>
          </div>
          <div className={s.right}>
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
                            className={"nameEnter"}
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
                        <span><input
                          className={"nameEnter"}
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
            <div key={'lodging'}>
              部屋:
                    {
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
                        className={'nameEnter nameEnter-select'}
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
              }
            </div>
            <div key={'guestAndDays'} className={'guestAndDays displayFlex'}>
              <div className={'guestAndDays_guests'}>
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
                        className={'nameEnter nameEnter-select nameEnter-guests'}
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
              <div className={'guestAndDays_days'}>
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
                          className={'nameEnter nameEnter-select nameEnter-guests'}
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
              <div className={'guestAndDays_roomNumber'}>
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
                          className={'nameEnter nameEnter-select nameEnter-guests'}
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
              <div
                className='checkoutGuestInfo_checkoutButton'
                onClick={() => this.handleOnClickCompleteCheckout(this.props.match.params.guestId)}
              >チェックアウトを<br />完了する</div>
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

export default connect(mapStateToProps, mapActionsToProps)(GuestInfo);

