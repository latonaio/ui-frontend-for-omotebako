import React from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import Select from "react-select";
import { getFetch, postFetch } from "../../util/api";
import s from '../../scss/pages/DetailPage.module.scss';
import p from '../../scss/components/Popup.module.scss';
import config from '../../util/config';
import RequestRedisManager from "../../util/requestRedisManager";
import * as formModel from "../../util/formModel";
const {
  optionModel,
} = formModel.default;

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;
const IMAGE_PATH = config.ReactImagePath;

class CustomersGuestDetail extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      reservationId: null,
      guestDetail: {
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
        isPushedAge: false,
        isPushedKanaName: false,
        isPushedGender: false,
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
        roomName: '',
        coupon: '',
        paymentStatus: 0,
        paymentMethod: 0,
        stay_count: 0,
        diff_year: 0,
        diff_month: 0,
        diff_day: 0,
      },
      validation: {
        emptyRoomError: false,
        emptyRoomNumberError: false
      },
      vacancyRooms: [],
      guestInfo: {
        assigned_rooms: null,
      }, // 客情報
      availableEditing: true, // 編集可能であればtrueを設定
      rooms: [],
      popupStatus: {
        forceCheckout: false,
        forceCheckoutComplete: false,
      }
    };
    this.requestRedisManager = null;
  }

  async createRequestRedisManager() {
    if (!this.requestRedisManager) {
      this.requestRedisManager = new RequestRedisManager(RequestRedisManagerAPIURL);

      this.requestRedisManager.io.on('getGuestDetail', async (data) => {
        console.log(data);

        await this.setGuestDetail(data);
      });

      this.requestRedisManager.io.emit('getGuestDetail', JSON.stringify({
        guest_id: this.props.match.params.guestID
      }));
    }
  }

  async componentWillMount() {
    await this.createRequestRedisManager();
  }

  async componentWillUnmount() {
    if (this.requestRedisManager) {
      this.requestRedisManager.io.close();
    }
  }

  handleOnClickCompleteForceCheckout = async (guestID) => {
    console.log("FORCE CHECKOUT START");
    const stayGuest = await getFetch.getStayGuestInfo(guestID)
    if (!stayGuest.length > 0) {
      console.error("チェックインしていないお客様です。")
      return;
    }
    await postFetch.checkout(stayGuest[0].guest_id);
    this.setState({ phase: "FINISH_FORCE_CHECKOUT" });
  };

  setGuestDetail = async (result) => {
    try {
      this.setState({
        guestDetail: result,
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

      return result;
    } catch (e) {
      console.error("=== GET GUEST ERROR ===", e);
      throw e;
    }
  }

  saveGuestInfo = async (data) => {
    this.requestRedisManager.io.emit('editGuestDetail', JSON.stringify({
      ...data,
      guest_id: this.props.match.params.guestID
    }));
  }

  render() {
    const {
      guestDetail: {
        face_image_path,
      },
      customerEnterInfo,
    } = this.state;

    const imagePath = face_image_path && face_image_path.split("1/");

    return (
      <Layout navType='customers'>
        <StatusBar2 icon='hands' text='顧客の情報を確認しています。' />

        <div className={s.detailPage}>
          <div className={s.left}>
            {imagePath ? (
              <img src={`${IMAGE_PATH}${imagePath && imagePath[1]}`} />
            ) : (
              <div className={s.noFaceImage}>No Face Image</div>
            )}
            <div className={s.faceLabel}>
              {imagePath
                ? "Face情報が登録されています"
                : "Face情報が登録されていません"}
            </div>
            <div className={s.back}>
              <button className={s.backButton} onClick={() => this.props.history.goBack()}>戻る</button>
            </div>
          </div>

          <div className={s.right}>
            <div className={s.name}>
              <span
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
              >{customerEnterInfo.name} {customerEnterInfo.name_kana} 様</span>
              <span className={`${!this.state.customerEnterInfo.isPushedName ? 'd-none' : ''}`}>
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
                      await this.saveGuestInfo({
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
                        await this.saveGuestInfo({
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
                        isPushedName: !this.state.customerEnterInfo.isPushedName
                      }
                    }, async () => {
                      await this.saveGuestInfo({
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
                          isPushedName: !this.state.customerEnterInfo.isPushedName
                        }
                      }, async () => {
                        await this.saveGuestInfo({
                          field: 'name_kana',
                          value: this.state.customerEnterInfo.name_kana
                        });
                      });
                    }
                  }}
                />
              </span>
            </div>

            <div>
              年齢:&nbsp;
                  <span
                className={`${!this.state.customerEnterInfo.isPushedAge ? '' : 'd-none'}`}
                onClick={() => {
                  if (this.state.availableEditing) {
                    this.setState({
                      customerEnterInfo: {
                        ...this.state.customerEnterInfo,
                        isPushedAge: !this.state.customerEnterInfo.isPushedAge
                      }
                    });
                  }
                }
                }
              >{customerEnterInfo.age || <span className="text-gray">未入力</span>}</span>
              <span className={`${!this.state.customerEnterInfo.isPushedAge ? 'd-none' : ''}`}>
                <input
                  className={s.input}
                  name="phoneNumber"
                  value={
                    `${this.state.customerEnterInfo.age || ''}`
                  }
                  onChange={(event) => {
                    this.setState({
                      customerEnterInfo: {
                        ...this.state.customerEnterInfo,
                        age: event.target.value
                      }
                    }, async () => {
                    });
                  }}
                  onBlur={(event) => {
                    this.setState({
                      customerEnterInfo: {
                        ...this.state.customerEnterInfo,
                        isPushedAge: false
                      }
                    }, async () => {
                      await this.saveGuestInfo({
                        field: 'age',
                        value: this.state.customerEnterInfo.age
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
                          isPushedAge: false
                        }
                      }, async () => {
                        await this.saveGuestInfo({
                          field: 'age',
                          value: this.state.customerEnterInfo.age
                        });
                      });
                    }
                  }}
                />
              </span>
            </div>

            {
              (() => {
                if (customerEnterInfo.stay_count > 0) {
                  return (
                    <div>前回宿泊日:&nbsp;
                      <span className={`${customerEnterInfo.diff_year > 0 ? '' : 'd-none'}`}>{customerEnterInfo.diff_year}年</span>
                      <span className={`${customerEnterInfo.diff_month > 0 ? '' : 'd-none'}`}>{customerEnterInfo.diff_month}ヶ月</span>
                      <span className={`${customerEnterInfo.diff_day > 0 ? '' : 'd-none'}`}>{customerEnterInfo.diff_day}日</span>
                      <span>前</span>
                      <span>({customerEnterInfo.stay_count + 1}回目)</span>
                    </div>
                  )
                }
              })()
            }

            <div className={s.infoItem}>
              性別:&nbsp;
                  <span
                className={`${!this.state.customerEnterInfo.isPushedGender ? '' : 'd-none'}`}
                onClick={() => {
                  if (this.state.availableEditing) {
                    this.setState({
                      customerEnterInfo: {
                        ...this.state.customerEnterInfo,
                        isPushedGender: !this.state.customerEnterInfo.isPushedGender
                      }
                    });
                  }
                }
                }>
                {
                  (() => {
                    const result = optionModel.filter((gender) => {
                      return gender.value === customerEnterInfo.gender;
                    });

                    if (result.length > 0) {
                      return result.length > 0 && result[0].label;
                    }

                    return <span className="text-gray">未入力</span>;
                  })()
                }
              </span>
              <span className={`${!this.state.customerEnterInfo.isPushedGender ? 'd-none' : ''}`}>
                <Select
                  options={optionModel}
                  className={s.select}
                  onChange={async (event) => {
                    this.setState({
                      customerEnterInfo: {
                        ...this.state.customerEnterInfo,
                        gender: event.value,
                        isPushedGender: false
                      }
                    }, async () => {
                      await this.saveGuestInfo({
                        field: 'gender',
                        value: event.value
                      });
                    });
                  }}
                />
              </span>
            </div>

            <div>
              連絡先:&nbsp;
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
              >{customerEnterInfo.phone_number || <span className="text-gray">未入力</span>}</span>
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
                      await this.saveGuestInfo({
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
                        await this.saveGuestInfo({
                          field: 'phone_number',
                          value: this.state.customerEnterInfo.phone_number
                        });
                      });
                    }
                  }}
                />
              </span>
            </div>

            <div>住所:&nbsp;
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
              >{customerEnterInfo.home_address || <span className="text-gray">未入力</span>}</span>
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
                      await this.saveGuestInfo({
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
                        await this.saveGuestInfo({
                          field: 'home_address',
                          value: this.state.customerEnterInfo.home_address
                        });
                      });
                    }
                  }}
                />
              </span>
            </div>
          </div>
        </div>

        {/* 強制チェックアウトボタン */}
        <div className={s.forceCheckout}>
          <button
            className={s.forceCheckoutButton}
            onClick={() => {
              this.setState({
                popupStatus: {
                  ...this.state.popupStatus,
                  forceCheckout: true
                }
              });
            }}
          >
            強制チェックアウト
            </button>
        </div>


        {/* 強制チェックアウトポップアップ */}
        <div div
          className={`${!this.state.popupStatus.forceCheckout ? 'd-none' : p.popupOverlay}`
          }
          onClick={() => {
            this.setState({
              popupStatus: {
                ...this.state.popupStatus,
                forceCheckout: false
              }
            });
          }}
        >
          <div className={p.popup}>
            <div className={p.title}>
              強制チェックアウトしますか？
            </div>
            <div className={p.container}>
              <div className={p.buttonContainer}>
                <button
                  onClick={async () => {
                    await this.handleOnClickCompleteForceCheckout(this.props.match.params.guestID)
                    this.setState({
                      popupStatus: {
                        ...this.state.popupStatus,
                        forceCheckoutComplete: true
                      }
                    });
                  }}
                >
                  はい
                </button>
                <button
                  className={p.red}
                  onClick={() => {
                    this.setState({
                      popupStatus: {
                        ...this.state.popupStatus,
                        forceCheckout: true
                      }
                    });
                  }}>
                  いいえ
                </button>
              </div>
            </div>
          </div>
        </div >

        {/* 強制チェックアウトの完了ポップアップ */}
        < div
          className={`${!this.state.popupStatus.forceCheckoutComplete ? 'd-none' : p.popupOverlay}`}
          onClick={() => {
            this.setState({
              popupStatus: {
                ...this.state.popupStatus,
                forceCheckoutComplete: false
              }
            });
          }}
        >
          <div className={p.popup}>
            <div className={p.title}>
              強制チェックアウトが完了しました
            </div>
            <div className={p.container}>
              <div className={p.buttonContainer}>
                <button
                  onClick={() => {
                    this.setState({
                      popupStatus: {
                        ...this.state.popupStatus,
                        forceCheckoutComplete: true
                      }
                    });
                  }}>
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div >
      </Layout>
    );
  }
}

export default CustomersGuestDetail;
