import React from "react";
import Layout from "../components/Layout";
import StatusBar2 from "../components/StatusBar2";
import Select from "react-select";
import { formatDate } from "../helper/date";
import { getFetch } from "../util/api";
import s from '../scss/pages/DetailPage.module.scss';
import p from '../scss/components/Popup.module.scss';
import config from '../util/config';
import RequestRedisManager from "../util/requestRedisManager";
import RoomAssignmentCheckin from "../components/RoomAssignmentCheckin";
import * as formModel from "../util/formModel";
import DatePicker2 from '../components/DatePicker2';
import { formatDateWithHyphen, formatDateWithTime } from "../helper/date";

const {
  reservationModel,
  couponModel,
  paymentStatusModel,
  paymentMethodModel,
  hasChildModel,
} = formModel.default;

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;
const IMAGE_PATH = config.ReactImagePath;

class ReservationsGuestDetail extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      phase: 'RESERVATION_GUEST', // ROOM_ASSIGNMENT
      reservationId: null,
      reservationDetail: {
        name: "",
        name_kana: "",
        plan: "",
        face_image_path: "",
        reservation_method_name: "",
        home_address: "",
        phone_number: "",
        stay_date_from: "",
        create_date: "",
        assigned_rooms: [],
      },
      roomAssigned: false,
      name: "",
      image: "",
      customerEnterInfo: {
        isPushedName: false,
        isPushedKanaName: false,
        isPushedLodging: false,
        isPushedGuests: false,
        isPushedStayDays: false,
        isPushedRoomNumber: false,
        isPushedReservationDate: false,
        isPushedReservationMethod: false,
        isPushedPhoneNumber: false,
        isPushedHomeAddress: false,
        isPushedCheckinDatetime: false,
        isPushedNumberOfRooms: false,
        isPushedNumberOfGuests: false,
        isPushedNumberOfGuestsMale: false,
        isPushedHasChild: false,
        isPushedNumberOfGuestsFemale: false,
        isPushedRoomName: false,
        isPushedCoupon: false,
        isPushedPaymentStatus: false,
        isPushedPaymentMethod: false,
        isPushedReservationHolder: false,
        name: '',
        kanaName: '',
        room_name: '',
        lodging: '',
        guests: '',
        stay_days: '',
        roomNumber: '',
        assign_complete: false,
        assigned_rooms: [],
        reservation_date: '',
        reservation_method: '',
        phone_number: '',
        home_address: '',
        stay_date_from: '',
        number_of_rooms: '',
        number_of_guests: '',
        number_of_guests_male: 0,
        number_of_guests_female: 0,
        has_child: 0,
        roomName: '',
        coupon: '',
        paymentStatus: 0,
        paymentMethod: 0,
        stay_count: 0,
        diff_year: 0,
        diff_month: 0,
        diff_day: 0,
      },
      popupStatus: {
        showValidationModal: false,
      },
      validation: {
        emptyRoomError: false,
        emptyRoomNumberError: false,
        numberOfGuestsTotalError: false,
      },
      vacancyRooms: [],
      guestInfo: {
        assigned_rooms: null,
      }, // ?????????
      availableEditing: true, // ????????????????????????true?????????
      rooms: [],
    };
    this.requestRedisManager = null;
  }

  async createRequestRedisManager() {
    if (!this.requestRedisManager) {
      this.requestRedisManager = new RequestRedisManager(RequestRedisManagerAPIURL);

      this.requestRedisManager.io.on('getReservationDetail', async (data) => {
        await this.setReservationDetail(data);

        await this.getGuestInfo(data.guest_id);

        if (data.stay_days) {
          await this.getRoomVacancy(data.stay_days);
        }
      });

      this.requestRedisManager.io.emit('getReservationDetail', JSON.stringify({
        reservation_id: this.props.match.params.id
      }));
    }
  }

  async componentWillMount() {
    // ?????????????????????????????????????????????????????????????????????
    await this.getRooms();

    const reservationData = await this.getReservationDetail(this.props.match.params.id);

    this.setState({
      reservationId: this.props.match.params.id
    })

    if (reservationData) {
      await this.getRoomVacancy(reservationData.stay_days);
    }

    await this.createRequestRedisManager();
  }

  async componentWillUnmount() {
    if (this.requestRedisManager) {
      this.requestRedisManager.io.close();
    }
  }

  getGuestInfo = async (id) => {
    try {
      const result = await getFetch.getGuestInfo(id);

      this.setState({
        guestInfo: result[0],
      });
    } catch (e) {
      console.error("=== GET GUEST INFO ERROR ===", e);
      throw e;
    }
  };

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

  setReservationDetail = async (result) => {
    try {
      this.setState({
        reservationDetail: result,
        customerEnterInfo: {
          ...this.state.customerEnterInfo,
          ...result,
          lodging: result.assigned_rooms &&
            result.assigned_rooms.length > 0 ?
            result.assigned_rooms[0].room_id : '',
        },
        roomAssigned:
          result.assigned_rooms && result.assigned_rooms.length >= result.stay_days * result.number_of_rooms,
      });
      // this.setState({
      //   reservationDetail: result,
      //   customerEnterInfo: {
      //     ...this.state.customerEnterInfo,
      //     guests: result.number_of_guests,
      //     stay_days: result.stay_days,
      //     roomNumber: result.number_of_rooms,
      //     assign_complete: result.assign_complete,
      //     lodging: result.assigned_rooms &&
      //     result.assigned_rooms.length > 0 ?
      //       result.assigned_rooms[0].room_id : '',
      //     reservation_date: result.reservation_date,
      //     assigned_rooms: result.assigned_rooms,
      //     stay_date_from: result.stay_date_from,
      //     reservation_method: result.reservation_method,
      //     phone_number: result.phone_number,
      //     home_address: result.home_address,
      //     number_of_rooms: result.number_of_rooms,
      //     number_of_guests: result.number_of_guests,
      //     coupon: result.coupon,
      //     payment_status: result.payment_status,
      //     payment_method: result.payment_method,
      //     stay_count: result.stay_count,
      //     diff_year: result.diff_year,
      //     diff_month: result.diff_month,
      //     diff_day: result.diff_day,
      //   },
      //   roomAssigned:
      //     result.assigned_rooms && result.assigned_rooms.length >= result.stay_days * result.number_of_rooms,
      // });

      return result;
    } catch (e) {
      console.error("=== GET RESERVATION GUEST ERROR ===", e);
      throw e;
    }
  }

  getReservationDetail = async (reservationID) => {
    try {
      const result = await getFetch.getReservationDetail(reservationID);

      // websocket???????????????????????????????????????????????????
      // if(result.length > 0){
      //   this.setState({
      //     reservationDetail: result[0],
      //     customerEnterInfo: {
      //       ...this.state.customerEnterInfo,
      //       guests: result[0].number_of_guests,
      //       stay_days: result[0].stay_days,
      //       roomNumber: result[0].number_of_rooms,
      //       assign_complete: result[0].assign_complete,
      //       lodging: result[0].assigned_rooms &&
      //       result[0].assigned_rooms.length > 0 ?
      //         result[0].assigned_rooms[0].room_id : '',
      //       reservation_date: result[0].reservation_date,
      //       assigned_rooms: result[0].assigned_rooms,
      //       stay_date_from: result[0].stay_date_from,
      //       reservation_method: result[0].reservation_method,
      //       phone_number: result[0].phone_number,
      //       home_address: result[0].home_address,
      //       number_of_rooms: result[0].number_of_rooms,
      //       number_of_guests: result[0].number_of_guests,
      //       coupon: result[0].coupon,
      //       payment_status: result[0].payment_status,
      //       payment_method: result[0].payment_method,
      //     },
      //     roomAssigned:
      //       result[0].assigned_rooms.length >= result[0].stay_days * result[0].number_of_rooms,
      //   });
      // }

      return result[0];
    } catch (e) {
      console.error("=== GET RESERVATION GUEST ERROR ===", e);
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
        this.setState({ vacancyRooms: result.data });
      }
    } catch (e) {
      console.error("===GET ROOMS ERROR===", e);
      throw e;
    }
  };

  saveReservationInfo = async (data) => {
    this.requestRedisManager.io.emit('editReservationDetail', JSON.stringify({
      ...data,
      reservation_id: this.state.reservationId
    }));
  }

  render() {
    const { location } = this.props;
    const {
      reservationDetail: {
        name,
        name_kana,
        plan,
        face_image_path,
        reservation_method_name,
        home_address,
        phone_number,
        stay_date_from,
        create_date,
        room_id,
        number_of_guests,
        number_of_guests_male,
        number_of_guests_female,
        number_of_rooms,
        assigned_rooms,
      },
      customerEnterInfo,
      phase,
      guestInfo,
      roomAssigned,
      reservationId,
    } = this.state;

    const imagePath = face_image_path && face_image_path.split("1/");

    return (
      <Layout navType='reservations'>

        {phase === "RESERVATION_GUEST" && (
          <>
            <StatusBar2 icon='calendar' text='????????????????????????????????????????????????????????????????????????????????????' />
            <div className={s.detailPage}>
              <div className={s.left}>
                {imagePath ? (
                  <img src={`${IMAGE_PATH}${imagePath && imagePath[1]}`} />
                ) : (
                  <div className={s.noFaceImage}>No Face Image</div>
                )}
                <div className={s.faceLabel}>
                  {imagePath
                    ? "Face?????????????????????????????????"
                    : "Face????????????????????????????????????"}
                </div>
                {customerEnterInfo.assign_complete ? (
                  <div
                    className={s.roomLabel}
                    onClick={() => {
                      // this.setState({
                      //   phase: 'ROOM_ASSIGNMENT'
                      // });

                      this.props.history.push(`/reservation/room/assignment/${reservationId}`)
                    }}>??????????????????????????????????????????</div>
                ) : (
                  <div
                    className={s.roomLabelRed}
                    onClick={() => {
                      this.props.history.push(`/reservation/room/assignment/${reservationId}`)
                    }}
                  >
                    ?????????????????????????????????????????????
                  </div>
                )}
                <div className={s.back}>
                  <button className={s.backButton} onClick={() => this.props.history.goBack()}>??????</button>
                </div>
              </div>

              <div className={s.right}>
                <div className={s.name}>
                  <div
                    className={`${!this.state.customerEnterInfo.isPushedName ? '' : 'd-none'}`}
                    onClick={() => {
                      if (this.state.availableEditing) {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedName: !this.state.customerEnterInfo.isPushedName
                          }
                        });
                      }
                    }
                    }
                  >
                    {customerEnterInfo.name} {customerEnterInfo.name_kana} ???
                    </div>
                  <div className={`${!this.state.customerEnterInfo.isPushedName ? 'd-none' : ''}`}>
                    <input
                      className={s.input}
                      name="name"
                      value={
                        `${this.state.customerEnterInfo.name || ''}`
                      }
                      onChange={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            name: event.target.value
                          }
                        }, async () => {
                        });
                      }}
                      onBlur={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedName: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'name',
                            value: this.state.customerEnterInfo.name
                          });
                        });
                      }}
                      onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                          if (event.nativeEvent.isComposing) {
                            return;
                          }

                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedName: false
                            }
                          }, async () => {
                            await this.saveReservationInfo({
                              field: 'name',
                              value: this.state.customerEnterInfo.name
                            });
                          });
                        }
                      }}
                    />,
                      <input
                      className={s.input}
                      name="name_kana"
                      value={
                        `${this.state.customerEnterInfo.name_kana || ''}`
                      }
                      onChange={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            name_kana: event.target.value
                          }
                        }, async () => {
                        });
                      }}
                      onBlur={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedName: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'name_kana',
                            value: this.state.customerEnterInfo.name_kana
                          });
                        });
                      }}
                      onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                          if (event.nativeEvent.isComposing) {
                            return;
                          }

                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedName: false
                            }
                          }, async () => {
                            await this.saveReservationInfo({
                              field: 'name_kana',
                              value: this.state.customerEnterInfo.name_kana
                            });
                          });
                        }
                      }}
                    />
                  </div>
                </div>
                {/*<div>???????????????: 1?????????(10??????)</div>*/}
                <div>
                  ????????????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedReservationHolder ? '' : 'd-none'}`}
                    onClick={() => {
                      if (this.state.availableEditing) {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedReservationHolder: !this.state.customerEnterInfo.isPushedReservationHolder
                          }
                        });
                      }
                    }
                    }
                  >{customerEnterInfo.reservation_holder} {customerEnterInfo.reservation_holder_kana} ???</span>
                  <span className={`${!this.state.customerEnterInfo.isPushedReservationHolder ? 'd-none' : ''}`}>
                    <input
                      className={s.input}
                      name="reservation_holder"
                      value={
                        `${this.state.customerEnterInfo.reservation_holder || ''}`
                      }
                      onChange={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            reservation_holder: event.target.value
                          }
                        }, async () => {
                        });
                      }}
                      onBlur={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedReservationHolder: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'reservation_holder',
                            value: this.state.customerEnterInfo.reservation_holder
                          });
                        });
                      }}
                      onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                          if (event.nativeEvent.isComposing) {
                            return;
                          }

                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedReservationHolder: false
                            }
                          }, async () => {
                            await this.saveReservationInfo({
                              field: 'reservation_holder',
                              value: this.state.customerEnterInfo.reservation_holder
                            });
                          });
                        }
                      }}
                    />,
                      <input
                      className={s.input}
                      name="reservation_holder_kana"
                      value={
                        `${this.state.customerEnterInfo.reservation_holder_kana || ''}`
                      }
                      onChange={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            reservation_holder_kana: event.target.value
                          }
                        }, async () => {
                        });
                      }}
                      onBlur={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedReservationHolder: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'reservation_holder_kana',
                            value: this.state.customerEnterInfo.reservation_holder_kana
                          });
                        });
                      }}
                      onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                          if (event.nativeEvent.isComposing) {
                            return;
                          }

                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedReservationHolder: false
                            }
                          }, async () => {
                            await this.saveReservationInfo({
                              field: 'reservation_holder_kana',
                              value: this.state.customerEnterInfo.reservation_holder_kana
                            });
                          });
                        }
                      }}
                    />
                  </span>
                </div>

                <div className={s.numbersSection}>
                  <div className={s.infoItem}>
                    ??????:&nbsp;
                      <span
                      className={`${!this.state.customerEnterInfo.isPushedNumberOfGuests ? '' : 'd-none'}`}
                      onClick={() => {
                        if (this.state.availableEditing) {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedNumberOfGuests: !this.state.customerEnterInfo.isPushedNumberOfGuests
                            }
                          });
                        }
                      }
                      }>
                      {customerEnterInfo.number_of_guests}
                    </span>
                    <span className={`${!this.state.customerEnterInfo.isPushedNumberOfGuests ? 'd-none' : ''}`}>
                      <Select
                        className={s.selectShort}
                        options={(() => {
                          const selectGuests = [];

                          for (let i = 1; i < 101; i++) {
                            selectGuests.push({
                              value: i.toString(),
                              label: i.toString()
                            });
                          }

                          return selectGuests;
                        })()}
                        onChange={async (event) => {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              number_of_guests: Number(event.value),
                              isPushedNumberOfGuests: false
                            }
                          }, async () => {
                            // ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                            if (this.state.customerEnterInfo.gender === 2) {
                              this.setState({
                                customerEnterInfo: {
                                  number_of_guests_male: Number(event.value),
                                  number_of_guests_female: 0
                                }
                              });

                            } else {
                              this.setState({
                                customerEnterInfo: {
                                  number_of_guests_female: Number(event.value),
                                  number_of_guests_male: 0
                                }
                              });
                            }

                            await this.saveReservationInfo({
                              field: 'number_of_guests',
                              value: Number(event.value)
                            });

                            // ??????????????????????????????????????????
                            await this.saveReservationInfo({
                              field: 'number_of_guests_male',
                              value: Number(this.state.customerEnterInfo.number_of_guests_male)
                            });

                            await this.saveReservationInfo({
                              field: 'number_of_guests_female',
                              value: Number(this.state.customerEnterInfo.number_of_guests_female)
                            });
                          });
                        }}
                      />
                    </span>
                  </div>

                  <div className={s.infoItem}>
                    ??????:&nbsp;
                      <span
                      className={`${!this.state.customerEnterInfo.isPushedNumberOfGuestsMale ? '' : 'd-none'}`}
                      onClick={() => {
                        if (this.state.availableEditing) {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedNumberOfGuestsMale: !this.state.customerEnterInfo.isPushedNumberOfGuestsMale
                            }
                          });
                        }
                      }
                      }>
                      {customerEnterInfo.number_of_guests_male}
                    </span>
                    <span className={`${!this.state.customerEnterInfo.isPushedNumberOfGuestsMale ? 'd-none' : ''}`}>
                      <Select
                        className={s.selectShort}
                        options={(() => {
                          const selectGuests = [];

                          for (let i = 0; i < 101; i++) {
                            selectGuests.push({
                              value: i.toString(),
                              label: i.toString()
                            });
                          }

                          return selectGuests;
                        })()}
                        onChange={async (event) => {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              number_of_guests_male: Number(event.value),
                              isPushedNumberOfGuestsMale: false
                            }
                          }, async () => {
                            if (Number(this.state.customerEnterInfo.number_of_guests)
                              !== (
                                Number(this.state.customerEnterInfo.number_of_guests_male) +
                                Number(this.state.customerEnterInfo.number_of_guests_female)
                              )) {
                              this.setState({
                                validation: {
                                  numberOfGuestsTotalError: true,
                                },
                                popupStatus: {
                                  showValidationModal: true,
                                }
                              })
                            } else {
                              this.setState({
                                validation: {
                                  numberOfGuestsTotalError: false,
                                },
                                popupStatus: {
                                  showValidationModal: false,
                                }
                              })
                              await this.saveReservationInfo({
                                field: 'number_of_guests_male',
                                value: event.value,
                              });
                              await this.saveReservationInfo({
                                field: 'number_of_guests_female',
                                value: customerEnterInfo.number_of_guests_female,
                              });
                            }
                          });
                        }}
                      />
                    </span>
                  </div>

                  <div className={s.infoItem}>
                    ??????:&nbsp;
                      <span
                      className={`${!this.state.customerEnterInfo.isPushedNumberOfGuestsFemale ? '' : 'd-none'}`}
                      onClick={() => {
                        if (this.state.availableEditing) {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedNumberOfGuestsFemale: !this.state.customerEnterInfo.isPushedNumberOfGuestsFemale
                            }
                          });
                        }
                      }
                      }>
                      {customerEnterInfo.number_of_guests_female}
                    </span>
                    <span className={`${!this.state.customerEnterInfo.isPushedNumberOfGuestsFemale ? 'd-none' : ''}`}>
                      <Select
                        className={s.selectShort}
                        options={(() => {
                          const selectGuests = [];

                          for (let i = 0; i < 101; i++) {
                            selectGuests.push({
                              value: i.toString(),
                              label: i.toString()
                            });
                          }

                          return selectGuests;
                        })()}
                        onChange={async (event) => {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              number_of_guests_female: Number(event.value),
                              isPushedNumberOfGuestsFemale: false
                            }
                          }, async () => {
                            if (Number(this.state.customerEnterInfo.number_of_guests)
                              !== (
                                Number(this.state.customerEnterInfo.number_of_guests_male) +
                                Number(this.state.customerEnterInfo.number_of_guests_female)
                              )) {
                              this.setState({
                                validation: {
                                  numberOfGuestsTotalError: true,
                                },
                                popupStatus: {
                                  showValidationModal: true,
                                }
                              })
                            } else {
                              this.setState({
                                validation: {
                                  numberOfGuestsTotalError: false,
                                },
                                popupStatus: {
                                  showValidationModal: false,
                                }
                              })
                              await this.saveReservationInfo({
                                field: 'number_of_guests_male',
                                value: customerEnterInfo.number_of_guests_male,
                              });
                              await this.saveReservationInfo({
                                field: 'number_of_guests_female',
                                value: event.value,
                              });
                            }
                          });
                        }}
                      />
                    </span>
                  </div>

                  <div className={s.infoItem}>
                    ??????:&nbsp;
                      <span
                      className={`${!this.state.customerEnterInfo.isPushedHasChild ? '' : 'd-none'}`}
                      onClick={() => {
                        if (this.state.availableEditing) {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedHasChild: !this.state.customerEnterInfo.isPushedHasChild
                            }
                          });
                        }
                      }
                      }>
                      {
                        (() => {
                          const result = hasChildModel.filter((hasChildStatus) => {
                            return hasChildStatus.value === customerEnterInfo.has_child;
                          });

                          return result.length > 0 && result[0].label;
                        })()
                      }
                    </span>
                    <span className={`${!this.state.customerEnterInfo.isPushedHasChild ? 'd-none' : ''}`}>
                      <Select
                        options={hasChildModel}
                        className={s.selectShort}
                        onChange={async (event) => {
                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              has_child: event.value,
                              isPushedHasChild: false
                            }
                          }, async () => {
                            await this.saveReservationInfo({
                              field: 'has_child',
                              value: event.value
                            });
                          });
                        }}
                      />
                    </span>
                  </div>
                </div>

                <div className={s.infoItem}>
                  ??????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedStayDays ? '' : 'd-none'}`}
                    onClick={() => {
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
                    {customerEnterInfo.stay_days}
                  </span>
                  <span className={`${!this.state.customerEnterInfo.isPushedStayDays ? 'd-none' : ''}`}>
                    <Select
                      className={s.select}
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
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            stay_days: event.value,
                            isPushedStayDays: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'stay_days',
                            value: event.value
                          });
                        });
                      }}
                    />
                  </span>
                </div>

                <div className={s.infoItem}>
                  ?????????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedNumberOfRooms ? '' : 'd-none'}`}
                    onClick={() => {
                      if (this.state.availableEditing) {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedNumberOfRooms: !this.state.customerEnterInfo.isPushedNumberOfRooms
                          }
                        });
                      }
                    }
                    }>
                    {customerEnterInfo.number_of_rooms}
                  </span>
                  <span className={`${!this.state.customerEnterInfo.isPushedNumberOfRooms ? 'd-none' : ''}`}>
                    <Select
                      className={s.select}
                      options={(() => {
                        const selectRoomNumber = [];

                        for (let i = 1; i < this.state.vacancyRooms.length; i++) {
                          selectRoomNumber.push({
                            value: i.toString(),
                            label: i.toString()
                          });
                        }

                        return selectRoomNumber;
                      })()}
                      onChange={async (event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            number_of_rooms: event.value,
                            isPushedNumberOfRooms: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'number_of_rooms',
                            value: event.value
                          });
                        });
                      }}
                    />
                  </span>
                </div>

                <div>
                  ??????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedLodging ? '' : 'd-none'}`}
                    onClick={() => {
                      this.props.history.push(`/reservation/room/assignment/${reservationId}`)
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

                        return <span className="text-gray">?????????</span>
                      })()
                    }
                  </span>
                  <span className={`${!this.state.customerEnterInfo.isPushedLodging ? 'd-none' : ''}`}>
                    <Select
                      className={s.select}
                      options={(() => {
                        return this.state.vacancyRooms.reduce((collection, data) => {
                          collection.push({
                            value: data.room_id,
                            label: `${data.room_id} ${data.room_name}`
                          });

                          return collection;
                        }, []);
                      })()}
                      onChange={async (event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            lodging: event.value,
                            isPushedLodging: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'room_id',
                            value: event.value
                          });

                          // await this.saveRedisGuestStayInfo({
                          //   changeType: 'roomName'
                          // });
                        });
                      }}
                    />
                  </span>
                </div>

                <div className={s.infoItem}>???????????????:&nbsp;
                    {
                    !this.state.customerEnterInfo.isPushedCheckinDatetime && (
                      <span
                        className={`${!this.state.customerEnterInfo.isPushedCheckinDatetime ? '' : 'd-none'}`}
                        onClick={() => {
                          if (this.state.availableEditing) {
                            this.setState({
                              customerEnterInfo: {
                                ...this.state.customerEnterInfo,
                                isPushedCheckinDatetime: !this.state.customerEnterInfo.isPushedCheckinDatetime
                              }
                            });
                          }
                        }
                        }>
                        {
                          (() => {
                            if (customerEnterInfo.stay_date_from === '0') {
                              return 0
                            }
                            if (!customerEnterInfo.stay_date_from) {
                              return <span className="text-gray">?????????</span>
                            }
                            if (customerEnterInfo.stay_date_from.substr) {
                              customerEnterInfo.stay_date_from.substr(0, 10)
                            }
                            return formatDateWithTime(customerEnterInfo.stay_date_from)
                          })()
                        }
                      </span>
                    )
                  }
                  {
                    this.state.customerEnterInfo.isPushedCheckinDatetime && (
                      <span className={`${!this.state.customerEnterInfo.isPushedCheckinDatetime ? 'd-none' : ''}`}>
                        <DatePicker2
                          className={s.input}
                          name="checkinDatetime"
                          reservationDate={this.state.customerEnterInfo.stay_date_from}
                          onChange={(date) => {
                            this.setState({
                              customerEnterInfo: {
                                ...this.state.customerEnterInfo,
                                stay_date_from: date
                              }
                            }, async () => {
                            });
                          }}
                          onBlur={(event) => {
                            this.setState({
                              customerEnterInfo: {
                                ...this.state.customerEnterInfo,
                                isPushedCheckinDatetime: false
                              }
                            }, async () => {
                              await this.saveReservationInfo({
                                field: 'stay_date_from',
                                value: this.state.customerEnterInfo.stay_date_from
                              });
                            });
                          }}
                          onKeyDown={async (event) => {
                            if (event.key === 'Enter') {
                              if (event.nativeEvent.isComposing) {
                                return;
                              }

                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  isPushedCheckinDatetime: false
                                }
                              }, async () => {
                                await this.saveReservationInfo({
                                  field: 'stay_date_from',
                                  value: this.state.customerEnterInfo.stay_date_from
                                });
                              });
                            }
                          }}
                          onCalendarClose={async () => {
                            this.setState({
                              customerEnterInfo: {
                                ...this.state.customerEnterInfo,
                                isPushedCheckinDatetime: false
                              }
                            }, async () => {
                              await this.saveReservationInfo({
                                field: 'stay_date_from',
                                value: this.state.customerEnterInfo.stay_date_from
                              });
                            });
                          }}
                        />
                      </span>
                    )
                  }
                </div>

                <div className={s.infoItem}>
                  ????????????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedReservationMethod ? '' : 'd-none'}`}
                    onClick={() => {
                      if (this.state.availableEditing) {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedReservationMethod: !this.state.customerEnterInfo.isPushedReservationMethod
                          }
                        });
                      }
                    }
                    }>
                    {
                      (() => {
                        const reservation = reservationModel.filter((reservation) => {
                          return reservation.value === customerEnterInfo.reservation_method;
                        });

                        return reservation.length > 0 && reservation[0].label;
                      })()
                    }
                  </span>
                  <span className={`${!this.state.customerEnterInfo.isPushedReservationMethod ? 'd-none' : ''}`}>
                    <Select
                      options={reservationModel}
                      className={s.select}
                      onChange={async (event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            reservation_method: event.value,
                            isPushedReservationMethod: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'reservation_method',
                            value: event.value
                          });
                        });
                      }}
                    />
                  </span>
                </div>

                <div className={s.infoItem}>?????????:&nbsp;
                    {
                    !this.state.customerEnterInfo.isPushedReservationDate && (
                      <span
                        className={`${!this.state.customerEnterInfo.isPushedReservationDate ? '' : 'd-none'}`}
                        onClick={() => {
                          if (this.state.availableEditing) {
                            this.setState({
                              customerEnterInfo: {
                                ...this.state.customerEnterInfo,
                                isPushedReservationDate: !this.state.customerEnterInfo.isPushedReservationDate
                              }
                            });
                          }
                        }
                        }
                      >
                        {
                          (() => {
                            if (customerEnterInfo.reservation_date === '0') {
                              return 0
                            }
                            if (!customerEnterInfo.reservation_date) {
                              return <span className="text-gray">?????????</span>
                            }
                            if (customerEnterInfo.reservation_date.substr) {
                              customerEnterInfo.reservation_date.substr(0, 10)
                            }
                            return customerEnterInfo.reservation_date
                          })()
                        }
                      </span>
                    )
                  }
                  {
                    this.state.customerEnterInfo.isPushedReservationDate && (
                      <span>
                        <span className={`${!this.state.customerEnterInfo.isPushedReservationDate ? 'd-none' : ''}`}>
                          <DatePicker2
                            className={s.input}
                            name="reservationDate"
                            reservationDate={this.state.customerEnterInfo.reservation_date}
                            withoutTime={true}
                            onChange={(date) => {
                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  reservation_date: date
                                }
                              }, async () => {
                              });
                            }}
                            onBlur={(event) => {
                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  isPushedReservationDate: false
                                }
                              }, async () => {
                                await this.saveReservationInfo({
                                  field: 'reservation_date',
                                  value: formatDateWithHyphen(this.state.customerEnterInfo.reservation_date)
                                });
                              });
                            }}
                            onKeyDown={async (event) => {
                              if (event.key === 'Enter') {
                                if (event.nativeEvent.isComposing) {
                                  return;
                                }

                                this.setState({
                                  customerEnterInfo: {
                                    ...this.state.customerEnterInfo,
                                    isPushedReservationDate: false
                                  }
                                }, async () => {
                                  await this.saveReservationInfo({
                                    field: 'reservation_date',
                                    value: formatDateWithHyphen(this.state.customerEnterInfo.reservation_date)
                                  });
                                });
                              }
                            }}
                            onCalendarClose={async () => {
                              this.setState({
                                customerEnterInfo: {
                                  ...this.state.customerEnterInfo,
                                  isPushedReservationDate: false
                                }
                              }, async () => {
                                await this.saveReservationInfo({
                                  field: 'reservation_date',
                                  value: formatDateWithHyphen(this.state.customerEnterInfo.reservation_date)
                                });
                              });
                            }}
                          />
                        </span>
                      </span>
                    )
                  }
                </div>

                <div className={s.infoItem}>
                  ????????????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedCoupon ? '' : 'd-none'}`}
                    onClick={() => {
                      if (this.state.availableEditing) {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedCoupon: !this.state.customerEnterInfo.isPushedCoupon
                          }
                        });
                      }
                    }
                    }>
                    {
                      (() => {
                        const result = couponModel.filter((coupon) => {
                          return coupon.value === customerEnterInfo.coupon;
                        });

                        return result.length > 0 && result[0].label;
                      })()
                    }
                  </span>
                  <span className={`${!this.state.customerEnterInfo.isPushedCoupon ? 'd-none' : ''}`}>
                    <Select
                      options={couponModel}
                      className={s.select}
                      onChange={async (event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            coupon: event.value,
                            isPushedCoupon: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'coupon',
                            value: event.value
                          });
                        });
                      }}
                    />
                  </span>
                </div>

                <div className={s.infoItem}>
                  ??????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedPaymentStatus ? '' : 'd-none'}`}
                    onClick={() => {
                      if (this.state.availableEditing) {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedPaymentStatus: !this.state.customerEnterInfo.isPushedPaymentStatus
                          }
                        });
                      }
                    }
                    }>
                    {
                      (() => {
                        const result = paymentStatusModel.filter((paymentStatus) => {
                          return paymentStatus.value === customerEnterInfo.payment_status;
                        });

                        return result.length > 0 && result[0].label;
                      })()
                    }
                  </span>
                  <span className={`${!this.state.customerEnterInfo.isPushedPaymentStatus ? 'd-none' : ''}`}>
                    <Select
                      options={paymentStatusModel}
                      className={s.select}
                      onChange={async (event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            payment_status: event.value,
                            isPushedPaymentStatus: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'payment_status',
                            value: event.value
                          });
                        });
                      }}
                    />
                  </span>
                </div>

                <div className={s.infoItem}>
                  ????????????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedPaymentMethod ? '' : 'd-none'}`}
                    onClick={() => {
                      if (this.state.availableEditing) {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedPaymentMethod: !this.state.customerEnterInfo.isPushedPaymentMethod
                          }
                        });
                      }
                    }
                    }>
                    {
                      (() => {
                        const result = paymentMethodModel.filter((paymentMethod) => {
                          return paymentMethod.value === customerEnterInfo.payment_method;
                        });

                        return result.length > 0 && result[0].label;
                      })()
                    }
                  </span>
                  <span className={`${!this.state.customerEnterInfo.isPushedPaymentMethod ? 'd-none' : ''}`}>
                    <Select
                      options={paymentMethodModel}
                      className={s.select}
                      onChange={async (event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            payment_method: event.value,
                            isPushedPaymentMethod: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'payment_method',
                            value: event.value
                          });
                        });
                      }}
                    />
                  </span>
                </div>
                <div>
                  ?????????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedPhoneNumber ? '' : 'd-none'}`}
                    onClick={() => {
                      if (this.state.availableEditing) {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedPhoneNumber: !this.state.customerEnterInfo.isPushedPhoneNumber
                          }
                        });
                      }
                    }
                    }
                  >{customerEnterInfo.phone_number || <span className="text-gray">?????????</span>}</span>
                  <span className={`${!this.state.customerEnterInfo.isPushedPhoneNumber ? 'd-none' : ''}`}>
                    <input
                      className={s.input}
                      name="phoneNumber"
                      value={
                        `${this.state.customerEnterInfo.phone_number || ''}`
                      }
                      onChange={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            phone_number: event.target.value
                          }
                        }, async () => {
                        });
                      }}
                      onBlur={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedPhoneNumber: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'phone_number',
                            value: this.state.customerEnterInfo.phone_number
                          });
                        });
                      }}
                      onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                          if (event.nativeEvent.isComposing) {
                            return;
                          }

                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedPhoneNumber: false
                            }
                          }, async () => {
                            await this.saveReservationInfo({
                              field: 'phone_number',
                              value: this.state.customerEnterInfo.phone_number
                            });
                          });
                        }
                      }}
                    />
                  </span>
                </div>

                <div>??????:&nbsp;
                    <span
                    className={`${!this.state.customerEnterInfo.isPushedHomeAddress ? '' : 'd-none'}`}
                    onClick={() => {
                      if (this.state.availableEditing) {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedHomeAddress: !this.state.customerEnterInfo.isPushedHomeAddress
                          }
                        });
                      }
                    }
                    }
                  >{customerEnterInfo.home_address || <span className="text-gray">?????????</span>}</span>
                  <span className={`${!this.state.customerEnterInfo.isPushedHomeAddress ? 'd-none' : ''}`}>
                    <input
                      className={s.inputAddress}
                      name="homeAddress"
                      value={
                        `${this.state.customerEnterInfo.home_address || ''}`
                      }
                      onChange={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            home_address: event.target.value
                          }
                        }, async () => {
                        });
                      }}
                      onBlur={(event) => {
                        this.setState({
                          customerEnterInfo: {
                            ...this.state.customerEnterInfo,
                            isPushedHomeAddress: false
                          }
                        }, async () => {
                          await this.saveReservationInfo({
                            field: 'home_address',
                            value: this.state.customerEnterInfo.home_address
                          });
                        });
                      }}
                      onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                          if (event.nativeEvent.isComposing) {
                            return;
                          }

                          this.setState({
                            customerEnterInfo: {
                              ...this.state.customerEnterInfo,
                              isPushedHomeAddress: false
                            }
                          }, async () => {
                            await this.saveReservationInfo({
                              field: 'home_address',
                              value: this.state.customerEnterInfo.home_address
                            });
                          });
                        }
                      }}
                    />
                  </span>
                </div>
                <div>?????????:&nbsp;{plan}</div>
              </div>
            </div>
          </>
        )}

        {phase === "ROOM_ASSIGNMENT" && (
          <div>
            <StatusBar2 />
            <RoomAssignmentCheckin
              isExistImage={`${(!!imagePath)}`}
              imagePath={`${IMAGE_PATH}${imagePath && imagePath[1]}`}
              roomAssigned={roomAssigned}
              guestInfo={guestInfo}
              customerEnterInfo={customerEnterInfo}
              layoutType={'reservationGuestDetail'}
              reservationId={reservationId}
              onClickBack={() => {
                this.setState({
                  phase: 'RESERVATION_GUEST'
                });
              }}
            />
          </div>
        )}

        {/* ??????????????????????????????????????????????????? */}
        <div
          className={`${!this.state.popupStatus.showValidationModal ? 'd-none' : p.popupOverlay}`}
        >
          <div className={p.popup}>
            <div className={p.title}>
              ??????????????????????????????
              </div>
            <div className={p.container}>
              <div className={p.errorText}>
                ??????????????????????????????????????????
                </div>
              <ul className={p.errorList}>
                {
                  (() => {
                    const errorList = [];

                    if (this.state.validation.numberOfGuestsTotalError) {
                      errorList.push(
                        `?????????????????????`
                      )
                    }

                    return errorList.map((element) => {
                      return <li className={p.listItem}>{element}</li>
                    })
                  })()
                }
              </ul>
              <div className={p.buttonContainer}>
                <button
                  onClick={() => {
                    this.setState({
                      popupStatus: {
                        ...this.state.popupStatus,
                        showValidationModal: false
                      }
                    });
                  }}
                >
                  ?????????
                  </button>
              </div>
            </div>
          </div>
        </div>
      </Layout >
    );
  }
}

export default ReservationsGuestDetail;
