import React from "react";
import styled from "styled-components";
import { Button } from "../Common";
import { Link } from "react-router-dom";
import Select from 'react-select';
import { formatDate, formatDateWithHyphen } from "../../helper/date";
import { getFetch, postFetch } from "../../util/api";
import config from '../../util/config';
const IMAGE_PATH = config.ReactImagePath;

class CustomerInfo extends React.Component {
  state = {
    // reservations: [{ guest_id: "" }],
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
      guests: '',
      stay_days: '',
      roomNumber: '',
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
    availableEditing: true // 編集可能であればtrueを設定
  };

  async componentWillMount() {
    const { guestInfo, layoutType } = this.props;

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

    // チェックインのみRedisもしくは予約情報を取得する
    if (layoutType !== 'checkout') {
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
    if (layoutType === 'checkout') {
      this.setState({
        customerEnterInfo: {
          ...this.state.customerEnterInfo,
          guests: stayGuestInfo[0].number_of_guests,
          stay_days: stayGuestInfo[0].stay_days,
          roomNumber: stayGuestInfo[0].number_of_rooms,
          assign_complete: stayGuestInfo[0].assign_complete,
          lodging: stayGuestInfo[0].assigned_rooms &&
            stayGuestInfo[0].assigned_rooms.length > 0 ?
            stayGuestInfo[0].assigned_rooms[0].room_id : '',
          assigned_rooms: stayGuestInfo[0].assigned_rooms
        }
      });
    }

    // チェックインのみRedisに保存する
    if (layoutType !== 'checkout') {
      await this.saveRedisGuestStayInfo();
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

      if (this.props.imagePath) {
        imagePath = this.props.imagePath;
      } else {
        imagePath = result.length > 0 ? result[0].face_image_path.split("1/") : '';
      }

      this.setState({
        guestInfo: result[0],
        imagePath: `${IMAGE_PATH}${imagePath[1]}`,
      });
    } catch (e) {
      console.error("=== GET GUEST INFO ERROR ===", e);
      throw e;
    }
  };

  getGuestReservations = async (guestID) => {
    try {
      const reservations = await getFetch.getGuestReservations(guestID);

      const setStateGuestInfo = () => {
        return new Promise((resolve, reject) => {
          if (reservations && reservations.length > 0) {
            this.setState({
              customerEnterInfo: {
                ...this.state.customerEnterInfo,
                guests: reservations[0].number_of_guests,
                stay_days: reservations[0].stay_days,
                roomNumber: reservations[0].number_of_rooms,
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
          room_name: <span className="text-gray">未入力</span>
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
              guests: redisGuestInfo.number_of_guests,
              stay_days: redisGuestInfo.stay_days,
              roomNumber: redisGuestInfo.number_of_rooms,
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
        number_of_guests: this.state.customerEnterInfo.guests,
        number_of_rooms: this.state.customerEnterInfo.roomNumber,
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
                assigned_room_key: getTargetRoomAssignedKey.assigned_room_key
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
    } catch (e) {
      console.error("===SAVE REDIS GUEST STAY INFO ERROR===", e);
    }
  };

  render() {
    const {
      getAgeTag,
      imagePath,
      isNewGuest,
      handleOnClickCheckinNew,
      onClickCheckout,
      onClickCheckinExisting,
      onClickCheckReservation,
      onClickCheckReservations,
      onClickRedoCheckin,
      onClickRedoCheckout,
      onClickRoomLabel,
    } = this.props;

    const layoutType = this.props.layoutType;

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

    const renderReservationInfo = (data, type) => {
      // 名前
      if (type === 'name') {
        if (!data) {
          const inputRender = <span><input
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
          />様</span>;

          if (!this.state.customerEnterInfo.isPushedName) {
            return <span onClick={() => {
              this.setState({
                customerEnterInfo: {
                  ...this.state.customerEnterInfo,
                  isPushedName: !this.state.customerEnterInfo.isPushedName
                }
              });
            }
            }>
              {
                this.state.customerEnterInfo.name === '' ?
                  <span className="text-gray">未入力</span> :
                  this.state.customerEnterInfo.name + ' 様'
              }
            </span>
          } else {
            return inputRender
          }
        } else {
          return <span>{data} 様</span>
        }
      }

      // ふりがな
      if (type === 'kanaName') {
        if (!data) {
          if (!this.state.customerEnterInfo.isPushedKanaName) {
            return <span onClick={() => {
              this.setState({
                customerEnterInfo: {
                  ...this.state.customerEnterInfo,
                  isPushedKanaName: !this.state.customerEnterInfo.isPushedKanaName
                }
              });
            }
            }>
              {
                this.state.customerEnterInfo.kanaName === '' ?
                  <span className="text-gray">未入力</span> :
                  this.state.customerEnterInfo.kanaName + ' 様'
              }
            </span>
          } else {
            return <span><input
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
          }
        } else {
          return <span>{data} 様</span>
        }
      }

      // 部屋
      if (type === 'lodging') {
        if (!this.state.customerEnterInfo.isPushedLodging) {
          return <span onClick={async () => {
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
        }

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

      // 人数
      if (type === 'guests') {
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
                if (this.state.customerEnterInfo.guests === 0) {
                  return <span className="text-gray">未入力</span>
                }

                if (this.state.customerEnterInfo.guests !== '') {
                  return this.state.customerEnterInfo.guests
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
                  guests: event.value,
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
                    guests: this.state.customerEnterInfo.guests,
                    isPushedGuests: false
                  }
                });
              }
            }}
          />
        </span>
      }

      // 宿泊数
      if (type === 'stay_days') {
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
      }

      // 部屋数
      if (type === 'roomNumber') {
        if (!this.state.customerEnterInfo.isPushedRoomNumber) {
          return <span onClick={async () => {
            if (this.state.availableEditing) {
              if (this.state.customerEnterInfo.stay_days !== '') {
                await this.getRoomVacancy(this.state.customerEnterInfo.stay_days);
              }

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
                if (this.state.customerEnterInfo.roomNumber === 0) {
                  return <span className="text-gray">未入力</span>
                }

                if (this.state.customerEnterInfo.roomNumber !== '') {
                  return this.state.customerEnterInfo.roomNumber
                }

                if (data) {
                  return data;
                }

                return <span className="text-gray">未入力</span>
              })()
            }
          </span>
        } else {
          // 宿泊数が未入力だったら
          if (!this.state.validation.emptyRoomNumberError) {
            if (this.state.customerEnterInfo.stay_days === '') {
              this.setState({
                validation: {
                  ...this.state.validation,
                  emptyRoomNumberError: true
                }
              })
            }
          }

          const selectRoomNumber = [];

          for (let i = 1; i < this.state.vacancyRooms.length; i++) {
            selectRoomNumber.push({
              value: i.toString(),
              label: i.toString()
            });
          }

          return <span>
            <Select
              className={'nameEnter nameEnter-select nameEnter-guests'}
              options={selectRoomNumber}
              onChange={async (event) => {
                this.setState({
                  customerEnterInfo: {
                    ...this.state.customerEnterInfo,
                    roomNumber: event.value,
                    isPushedRoomNumber: false
                  }
                }, async () => {
                  await this.saveRedisGuestStayInfo();
                });

                this.setState({
                  validation: {
                    ...this.state.validation,
                    emptyRoomNumberError: false
                  }
                })

                await this.saveRedisGuestStayInfo();
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  this.setState({
                    customerEnterInfo: {
                      ...this.state.customerEnterInfo,
                      roomNumber: this.state.customerEnterInfo.roomNumber,
                      isPushedRoomNumber: false
                    }
                  });

                  this.setState({
                    validation: {
                      ...this.state.validation,
                      emptyRoomNumberError: false
                    }
                  })
                }
              }}
            />
          </span>
        }
      }
    }

    const guestAndDays = () => {
      return <div key={'guestAndDays'} className={'guestAndDays displayFlex'}>
        <div className={'guestAndDays_guests'}>
          人数:
          {renderReservationInfo(number_of_guests, 'guests')}
        </div>
        <div className={'guestAndDays_days'}>
          宿泊数:
          {renderReservationInfo(stay_days, 'stay_days')}
        </div>
        <div className={'guestAndDays_roomNumber'}>
          部屋数:
          {renderReservationInfo(stay_days, 'roomNumber')}
        </div>
      </div>
    }

    const nowDate = new Date();

    let sendParamsForCreateStayGuests = {};

    // 顔があって予約がない場合
    if (this.state.reservations.length === 0) {
      sendParamsForCreateStayGuests = {
        stayDateFrom: formatDate(nowDate),
        stayDateTo: formatDate(nowDate.setDate(nowDate.getDate() + parseInt(this.state.customerEnterInfo.days))),
        stayDays: parseInt(this.state.customerEnterInfo.stay_days),
        numberOfGuests: parseInt(this.state.customerEnterInfo.guests),
        numberOfRooms: [
          this.state.customerEnterInfo.lodging
        ]
      }
    }

    return (
      <div className="customerInfoComponent">
        <div className="customerInfoComponent_column">
          <img className="customerInfoComponent_image" src={imagePath} />
          <div className="customerInfoComponent_faceLabel">
            {face_id_azure
              ? "Face情報が登録されています"
              : "Face情報が登録されていません"}
          </div>
          {layoutType !== 'checkout' &&
            <RoomLabel
              onClick={() => onClickRoomLabel(reservation_id)}
              color={!this.state.customerEnterInfo.assign_complete ? 'red' : ''}
            >
              {!this.state.customerEnterInfo.assign_complete
                ? "客室割当が完了していません"
                : "客室割当が完了しています"}
            </RoomLabel>
          }
          <ReservationLabel
            className={`${layoutType === 'checkout' ? 'dis-n' : ''}`}
            onClick={() => onClickCheckReservations(guest_id)}
          >{`予約情報を\n確認する`}</ReservationLabel>
          {layoutType === 'checkout'
            ? <CheckinLabel onClick={() => onClickRedoCheckout()} >
              {`チェックアウト\nをやり直す`}
            </CheckinLabel>
            : <CheckinLabel onClick={() => onClickRedoCheckin()} >
              {`チェックイン\nをやり直す`}
            </CheckinLabel>
          }
        </div>
        <Info>
          {
            (() => {
              return [
                (<div key={'name'}>
                  お名前:
                  {renderReservationInfo(name, 'name')}
                </div>),
                (<div key={'kanaName'}>
                  ふりがな:
                  {renderReservationInfo(name_kana, 'kanaName')}
                </div>),
                (guestAndDays()),
                (<div
                  className={`errorMessage ${(this.state.validation.emptyRoomNumberError ? '' : 'dis-n')}`}
                  key={'emptyRoomNumberError'}
                >
                  <span>宿泊数を入力してから部屋数をご指定してください</span>
                </div>),
                (<div key={'lodging'}>
                  部屋:
                  {renderReservationInfo(room_name, 'lodging')}
                </div>),
                (<div
                  className={`errorMessage ${(this.state.validation.emptyRoomError ? '' : 'dis-n')}`}
                  key={'emptyRoomError'}
                >
                  <span>宿泊数を入力してから部屋をご指定してください</span>
                </div>)
              ];
            })()
          }
          {`プラン:${plan}`} <br />
          {`特徴:お連れ様あり, タクシー, 朝食付き, ビジネス,`}
          <br />
          {`早チェックイン, 遅チェックアウト, ベッドメイク◎,`}
          <br />
          {`アメニティセット, ロビー利用, ビール, 禁煙 `}
          {/*{`年齢タグ:${getAgeTag(age_by_face)}`}*/}
          {layoutType === 'checkout' ?
            <StyledButton
              onClick={() => onClickCheckout(this.state.guestInfo.guest_id)}
            >チェックアウトを<br />完了する</StyledButton> :
            <StyledButton
              onClick={() => {
                if (isNewGuest) {
                  handleOnClickCheckinNew(this.props.guestInfo.guest_id)
                } else {
                  onClickCheckinExisting(
                    guest_id ? guest_id : this.props.guestInfo.guest_id,
                    this.state.reservations.length === 0 ?
                      sendParamsForCreateStayGuests :
                      null
                  )
                }
              }}
            >チェックインを<br />完了する</StyledButton>
          }
        </Info>
      </div>
    );
  }
}

export default CustomerInfo;

const StyledButton = styled(Button)`
  margin-top: auto;
`;

const RoomLabel = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;

  border: 2px solid
    ${(props) => (props.color ? props.color : props.theme.primary)};
  border-radius: 5px;
  margin: 5px;
  width: 100%;
  font-size: 2.6rem;
  text-align: center;
  color: white;
  height: 70px;

  background: ${(props) => (props.color ? props.color : props.theme.primary)};
  white-space: pre;
`;

const ReservationLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  border: 2px solid #2f5597;
  border-radius: 10px;
  margin: 10px 5px 5px;
  width: 60%;
  font-size: 2.6rem;
  text-align: center;
  color: white;
  height: 80px;

  background: #2f5597;
  white-space: pre;

  cursor: pointer;
`;

const CheckinLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  border: 2px solid #7f5f01;
  border-radius: 10px;
  margin: 5px;
  width: 60%;
  font-size: 2.6rem;
  text-align: center;
  color: white;
  height: 80px;

  background: #7f5f01;
  white-space: pre;

  cursor: pointer;
`;

const Info = styled.div`
  font-size: 3.2rem;
  margin: 0 40px;
  font-family: "UD";
  line-height: 1.6;
  white-space: pre;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-weight: bold;
`;

const StyledInput = styled.input`
  text-align: center;
  border: none;
  font-size: 2.4rem;
  outline: none;
  color: #3968bf;
  background-color: #aed6c3;
  font-family: "Segoe";
`;

const StyledInputName = styled(StyledInput)`
  text-align: left;
`;
