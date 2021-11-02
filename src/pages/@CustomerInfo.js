import React from "react";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import StatusBar2 from "../components/StatusBar2";
import s from "../scss/pages/ListPage.module.scss";
import p from "../scss/components/Popup.module.scss";
import DatePicker2 from '../components/DatePicker2';
import { formatDateWithTime } from "../helper/date";
import { getFetch, postFetch, putFetch } from "../util/api";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import RequestRedisManager from "../util/requestRedisManager";
import config from '../util/config';
import * as formModel from '../util/formModel'

const {
  statusCodeModel,
  optionModel,
} = formModel.default;

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;

class CustomerInfo extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedTab: 0,
      stayGuests: [],
      name: null,
      name_kana: null,
      age: '-',
      gender: null,
      stay_date_from: null,
      stay_date_to: null,
      stay_days: null,
      number_of_guests: null,
      number_of_rooms: null,
      reservation_status: null,
      payment_method: 0,
      phone_number: null,
      home_address: null,
      updated: false,
      editingData: [],
      message: null,
      status_code_id: null,
      addingNewRecord: false,
      addingNewStayGuestRecord: false,
      newStayGuestModel: {
        name: '',
        name_kana: '',
        stay_date_from: '',
        stay_date_to: '',
        stay_days: '',
        number_of_guests: '',
        number_of_rooms: '',
        status_code: 1
      },
      addingNewGuestRecord: false,
      newGuestModel: {
        name: '',
        name_kana: '',
        age: 0,
        gender: 1,
        phone_number: '',
        home_address: ''
      },
      new_name: "",
      new_name_kana: "",
      new_age: "",
      new_gender: "",
      new_stay_date_from: "",
      new_stay_date_to: "",
      new_stay_days: "",
      new_number_of_guests: "",
      new_number_of_rooms: "",
      new_reservation_status: "",
      new_guest_status: 0,
      rooms: [],
      guest: [],
      searchBar: {
        stayGuests: [],
        assignedRooms: [],
        guest: []
      },
      copyGuestInfo: {},
      copyStayGuestInfo: {},
      editFlag: {
        editing: false,
        recordNumber: 1
      },
      popupStatus: {
        show: false,
        showDuplicateModal: false,
        data: {}
      },
      validation: {
        nameError: false,
        nameKanaError: false,
        stayDateFromError: false,
        stayDaysError: false,
        numberOfGuestsError: false,
        numberOfRoomsError: false,
      }
    };
    this.SearchBarRef = React.createRef();
    this.requestRedisManager = null;
  }

  async componentWillMount() {
    // 宿泊情報を取得する
    // await this.getStayGuestsInfo();
    // 客室割当を取得する
    await this.getStayGuestsRooms();

    await this.createRequestRedisManager();
  }

  async createRequestRedisManager() {
    if (!this.requestRedisManager) {
      this.requestRedisManager = new RequestRedisManager(RequestRedisManagerAPIURL);

      this.requestRedisManager.io.on('getStayGuests', async (stayGuests) => {
        this.setState({
          stayGuests
        });

        // 検索バーのリストを初期化
        this.SearchBarRef.current.onResetInputSearch();
      });

      this.requestRedisManager.io.emit('getStayGuests');

      this.requestRedisManager.io.on('getGuests', async (guest) => {
        this.setState({
          guest
        });

        // 検索バーのリストを初期化
        this.SearchBarRef.current.onResetInputSearch();
      });

      this.requestRedisManager.io.emit('getGuests');
    }
  }

  async componentWillUnmount() {
    if (this.requestRedisManager) {
      this.requestRedisManager.io.close();
    }
  }

  saveGuestInfo = async (data) => {
    const sendValue = () => {
      // 検索バーに文言がセットされていれば
      // 検索バーの文言は別タブを押した時、空白になる
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        if (this.state.selectedTab === 0) {
          return this.state.searchBar.stayGuests[data.listIndex][data.field]
        }

        if (this.state.selectedTab === 1) {
          return this.state.searchBar.assignedRooms[data.listIndex][data.field]
        }

        if (this.state.selectedTab === 2) {
          return this.state.searchBar.guest[data.listIndex][data.field]
        }
      } else {
        if (this.state.selectedTab === 0) {
          return this.state.stayGuests[data.listIndex][data.field];
        }

        if (this.state.selectedTab === 1) {
          return this.state.stayGuests[data.listIndex][data.field];
        }

        if (this.state.selectedTab === 2) {
          return this.state.guest[data.listIndex][data.field];
        }
      }
    }

    const sendGuestId = () => {
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        if (this.state.selectedTab === 0) {
          return this.state.searchBar.stayGuests[data.listIndex]['stay_guests_id']
        }

        if (this.state.selectedTab === 1) {
          return this.state.searchBar.assignedRooms[data.listIndex]['stay_guests_id']
        }

        if (this.state.selectedTab === 2) {
          return this.state.searchBar.guest[data.listIndex]['guest_id']
        }
      } else {
        if (this.state.selectedTab === 0) {
          return this.state.stayGuests[data.listIndex]['stay_guests_id'];
        }

        if (this.state.selectedTab === 1) {
          return this.state.stayGuests[data.listIndex]['stay_guests_id'];
        }

        if (this.state.selectedTab === 2) {
          return this.state.guest[data.listIndex]['guest_id'];
        }
      }
    }

    if (
      this.state.selectedTab === 0 ||
      this.state.selectedTab === 1
    ) {
      this.requestRedisManager.io.emit('editStayGuestDetail', JSON.stringify({
        ...data,
        value: sendValue(),
        stay_guests_id: sendGuestId()
      }));

      this.requestRedisManager.io.emit('getStayGuests');
    } else {
      // その他のお客様情報の保存
      this.requestRedisManager.io.emit('editGuestDetail', JSON.stringify({
        ...data,
        value: sendValue(),
        guest_id: sendGuestId()
      }));

      this.requestRedisManager.io.emit('getGuests');
    }
  }

  getStayGuestsRooms = async () => {
    try {
      const result = await getFetch.getStayGuestsRooms();
      this.setState({ rooms: result });
    } catch (e) {
      console.error("Error:", e);
    }
  };

  handleOnChange = (e, idx) => {
    this.setState({
      [e.target.name]: e.target.value,
      editing: idx,
    });
  };

  editName = (e, idx) => {
    if (idx) {
      const val = e.target.value.split(",");
      this.setState({
        name: val[0],
        name_kana: val[1],
        editing: idx,
      });
    }
    if (!idx) {
      const val = e.target.value.split(",");
      this.setState({
        new_name: val[0],
        new_name_kana: val[1],
      });
    }
  };

  // 宿泊情報にあるお客さんの編集
  editStayGuests = async (stayGuestID) => {
    try {
      let stayGuestModel = [];

      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        if (this.state.searchBar.stayGuests && this.state.searchBar.stayGuests.length > 0) {
          stayGuestModel = this.state.searchBar.stayGuests;
        }
      } else {
        stayGuestModel = this.state.stayGuests;
      }

      const getResultModel = (stayGuestID) => {
        return stayGuestModel.filter((data) => {
          if (data.stay_guests_id === stayGuestID) {
            return true;
          }
        });
      }

      await putFetch.updateStayGuest({
        ...getResultModel(stayGuestID)[0]
      }, stayGuestID);
    } catch (e) {
      alert("エラー：" + e)
    }
  };

  // その他のお客様情報の編集
  editGuests = async (guestID) => {
    try {
      let guestModel = [];

      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        if (this.state.searchBar.guest && this.state.searchBar.guest.length > 0) {
          guestModel = this.state.searchBar.guest;
        }
      } else {
        guestModel = this.state.guest;
      }

      const getResultModel = (guestID) => {
        return guestModel.filter((data) => {
          if (data.guest_id === guestID) {
            return true;
          }
        });
      }

      await putFetch.updateGuest({
        ...getResultModel(guestID)[0]
      }, guestID);
    } catch (e) {
      alert("エラー：" + e)
    }
  };

  // 宿泊情報にあるお客さんの削除
  deleteStayGuests = async (data) => {
    this.requestRedisManager.io.emit('deleteStayGuest', JSON.stringify({
      ...data,
    }));
  }

  // その他のお客様情報の削除
  deleteGuests = async (data) => {
    this.requestRedisManager.io.emit('deleteGuest', JSON.stringify({
      ...data,
    }));
  }

  // 宿泊情報にあるお客さんの追加
  addStayGuests = async (option = {}) => {
    try {
      try {
        // あとで共通化
        const setStatePromise = (setData) => {
          return new Promise((resolve) => {
            this.setState(setData, () => {
              return resolve();
            })
          });
        }

        const validationCheck = async (newStayGuestModel) => {
          const {
            name,
            name_kana,
            stay_date_from,
            stay_days,
            number_of_guests,
            number_of_rooms
          } = newStayGuestModel;

          // 顧客名
          await setStatePromise({
            validation: {
              ...this.state.validation,
              nameError: name.length <= 0
            }
          });

          // 顧客名のふりがな
          await setStatePromise({
            validation: {
              ...this.state.validation,
              nameKanaError: name_kana.length <= 0
            }
          });

          // 宿泊日
          await setStatePromise({
            validation: {
              ...this.state.validation,
              stayDateFromError: stay_date_from === ''
            }
          });

          // 宿泊数
          await setStatePromise({
            validation: {
              ...this.state.validation,
              stayDaysError: stay_days === ''
            }
          });

          // 人数
          await setStatePromise({
            validation: {
              ...this.state.validation,
              numberOfGuestsError: number_of_guests === ''
            }
          });

          // 部屋数
          await setStatePromise({
            validation: {
              ...this.state.validation,
              numberOfRoomsError: number_of_rooms === ''
            }
          });
        }

        await validationCheck(this.state.newStayGuestModel);

        // どれか一つでもエラーがあればtrue
        const validationErrors = Object.keys(this.state.validation).filter((validationKey) => {
          return this.state.validation[validationKey] === true;
        });

        if (validationErrors.length > 0) {
          this.setState({
            popupStatus: {
              ...this.state.popupStatus,
              showValidationModal: true,
              data: validationErrors
            }
          });

          return;
        } else {
          this.setState({
            popupStatus: {
              ...this.state.popupStatus,
              showValidationModal: false,
              data: {}
            }
          });
        }

        const newStayGuestModel = {
          name: this.state.newStayGuestModel.name,
          name_kana: this.state.newStayGuestModel.name_kana,
          stay_date_from: this.state.newStayGuestModel.stay_date_from,
          stay_date_to: this.state.newStayGuestModel.stay_date_to,
          stay_days: this.state.newStayGuestModel.stay_days,
          number_of_guests: this.state.newStayGuestModel.number_of_guests,
          number_of_rooms: this.state.newStayGuestModel.number_of_rooms,
          status_code_id: this.state.newStayGuestModel.status_code,
          number_of_guests_male: 0,
          number_of_guests_female: 0,
          has_child: 0
        };

        if (option.force) {
          newStayGuestModel.force = true;
        }

        // 新規登録フォームを閉じる
        this.setState({
          addingNewStayGuestRecord: false,
          editFlag: {
            ...this.state.editFlag,
            editing: false
          }
        })

        await postFetch.registerStayGuestsForMysql(newStayGuestModel);

        this.requestRedisManager.io.emit('getStayGuests');
      } catch (e) {
        if (e.error) {
          if (e.error.errorType === 'BAD_REQUEST') {
            this.setState({
              popupStatus: {
                ...this.state.popupStatus,
                showDuplicateModal: true
              }
            });
          }
        }
      }

      // ブラウザに新地登録した情報が表示されるようにリロード
      window.location.reload();
    } catch (e) {
      alert("エラー：" + e)
    }
  }

  // その他のお客様情報の追加
  addGuests = async (option = {}) => {
    try {
      try {
        const validationCheck = (newStayGuestModel) => {
          // 顧客名
          if (newStayGuestModel.name.length <= 0) {
            this.setState({
              validation: {
                ...this.state.validation,
                nameError: true
              }
            });
          }
        }

        validationCheck(this.state.newGuestModel);

        const newGuestModel = {
          name: this.state.newGuestModel.name,
          name_kana: this.state.newGuestModel.name_kana,
          age: this.state.newGuestModel.age,
          gender: this.state.newGuestModel.gender,
          phone_number: this.state.newGuestModel.phone_number,
          home_address: this.state.newGuestModel.home_address,
          new_guest_status: 1
        };

        if (option.force) {
          newGuestModel.force = true;
        }

        await postFetch.registerNewGuest(newGuestModel);

        this.requestRedisManager.io.emit('getGuests');
      } catch (e) {
        if (e.error) {
          if (e.error.errorType === 'BAD_REQUEST') {
            this.setState({
              popupStatus: {
                ...this.state.popupStatus,
                showDuplicateModal: true
              }
            });
          }
        }
      }
    } catch (e) {
      alert("エラー：" + e)
    }
  }

  nextDate = (date) => {
    date.setDate(date.getDate() + 1);
    let month = "" + (date.getMonth() + 1)
    let day = "" + date.getDate();
    let year = date.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  getDate = (date) => {
    date.setDate(date.getDate());
    let month = "" + (date.getMonth() + 1);
    let day = "" + date.getDate();
    let year = date.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  checkRecordEditing = (selectedTabIndex, recordNumber) => {
    return this.state.selectedTab === selectedTabIndex &&
      this.state.editFlag.recordNumber === recordNumber &&
      this.state.editFlag.editing;
  }

  render() {
    const {
      stayGuests,
      age,
      updated,
      message,
      selectedTab,
      guest,
      searchBar
    } = this.state;

    const guestRender = () => {
      if (!this.SearchBarRef.current) {
        return [];
      }

      if (this.state.selectedTab === 0) {
        if (this.SearchBarRef && this.SearchBarRef.current.state.stringValue.length > 0) {
          if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
            return searchBar.stayGuests
          } else {
            return []
          }
        }

        return stayGuests;
      }

      if (this.state.selectedTab === 1) {
        if (this.SearchBarRef.current.state.stringValue.length > 0) {
          if (searchBar.assignedRooms && searchBar.assignedRooms.length > 0) {
            return searchBar.assignedRooms
          } else {
            return []
          }
        }

        return stayGuests;
      }

      if (this.state.selectedTab === 2) {
        if (this.SearchBarRef.current.state.stringValue.length > 0) {
          if (searchBar.guest && searchBar.guest.length > 0) {
            return searchBar.guest
          } else {
            // 検索バーに文字が入力してあって一件もマッチしてなければ
            return []
          }
        }

        return guest;
      }

      return stayGuests;
    }

    return (
      <Layout navType='customers'>
        <StatusBar2 icon='hands' text='顧客の情報を管理しています。'
          right={
            <SearchBar
              ref={this.SearchBarRef}
              placeholder="検索文字を入力してください"
              selectedTab={this.state.selectedTab}
              result={this.state.stayGuests}
              guest={this.state.guest}
              onChangeInputSearchBar={(e) => {
                this.setState({
                  editFlag: {
                    ...this.state.editFlag,
                    editing: false
                  }
                })

                const SearchBarSelectTabNumber = this.state.selectedTab === 0 ? 'stayGuests'
                  : this.state.selectedTab === 1 ? 'assignedRooms' : 'guest';

                this.setState({
                  searchBar: {
                    ...this.state.searchBar,
                    [SearchBarSelectTabNumber]: e
                  }
                })
              }}
            />
          }
        />

        <div className={s.listTypes}>
          <div
            className={selectedTab === 0 ? `${s.listTypeActive}` : `${s.listType}`}
            onClick={async () => {
              this.setState({ selectedTab: 0 })
              this.SearchBarRef.current.clearString();
              this.setState({
                editFlag: {
                  ...this.state.editFlag,
                  editing: false
                }
              })
            }}
          >
            宿泊情報
              </div>
          <div
            className={selectedTab === 1 ? `${s.listTypeActive}` : `${s.listType}`}
            onClick={async () => {
              this.setState({ selectedTab: 1 })
              this.SearchBarRef.current.clearString();
              this.setState({
                editFlag: {
                  ...this.state.editFlag,
                  editing: false
                }
              })
            }}
          >
            客室割当
              </div>
          <div
            className={selectedTab === 2 ? `${s.listTypeActive}` : `${s.listType}`}
            onClick={async () => {
              this.setState({ selectedTab: 2 })
              this.SearchBarRef.current.clearString();
              this.setState({
                editFlag: {
                  ...this.state.editFlag,
                  editing: false
                }
              })
            }}
          >
            その他のお客様情報
              </div>
        </div>

        {/* memo: ファイルを分割する */}
        {/* タブ1 宿泊情報 */}
        <div className={s.listTableContainer}>
          <table className={selectedTab === 0 ? 'fadeIn' : 'd-none'}>
            <thead>
              <tr>
                <td style={{ width: 400 }}>顧客名</td>
                <td>宿泊日(from)</td>
                <td>宿泊日(to)</td>
                <td style={{ width: 150 }}>泊数/人数</td>
                <td style={{ width: 110 }}>部屋数</td>
                <td style={{ width: 220 }}>宿泊ステータス</td>
                <td style={{ width: 120 }}></td>
                {/* <td style={{ width: 60 }}></td> */}
              </tr>
            </thead>

            <tbody>
              {/* 顧客情報未登録 */}
              <tr className={`${this.state.stayGuests.length > 0 ? 'd-none' : 'fadeIn'}`}>
                <td colspan="7" className={s.noInfo}>
                  宿泊状況を表示しています。
                    </td>
              </tr>

              {guestRender().map((customerRecord, index) => (
                <>
                  {/* 宿泊情報 一覧 */}
                  <tr className={`${this.checkRecordEditing(0, index) ? 'd-none' : 'fadeIn'}`}>
                    {/* 顧客名 */}
                    <td
                      className={s.name}
                      onClick={() => {
                        this.props.history.push(`/customer-info/detail/${customerRecord.stay_guests_id}`)
                      }}
                    >
                      {customerRecord.name}, {customerRecord.name_kana}
                      {customerRecord.face_id_azure && <label className={s.faceLabel}>Face</label>}
                    </td>

                    {/* 宿泊日(from) */}
                    <td>{formatDateWithTime(customerRecord.stay_date_from)}</td>

                    {/* 宿泊日(to) */}
                    <td>{formatDateWithTime(customerRecord.stay_date_to)}</td>

                    {/* 泊数/人数 */}
                    <td>{customerRecord.stay_days || "-"}&nbsp;/&nbsp;{customerRecord.number_of_guests || "-"}</td>

                    {/* 部屋数 */}
                    <td>{customerRecord.number_of_rooms || '-'}</td>

                    {/* 宿泊 ステータス */}
                    <td>
                      {(() => {
                        const statusCode = statusCodeModel.filter((option) => {
                          return option.value === customerRecord.status_code;
                        });

                        return statusCode.length > 0 && statusCode[0].label
                      })()}
                    </td>

                    {/* コピーボタン */}
                    {/* <td className={s.icon}>
                          <FontAwesomeIcon
                            onClick={async () => {
                              this.setState({
                                copyStayGuestInfo: {
                                  ...customerRecord
                                }
                              });
                            }}
                            icon={faCopy}
                          />
                        </td> */}

                    {/* 編集ボタン */}
                    <td className={s.editButton}>
                      <button
                        onClick={() => {
                          this.setState({
                            addingNewStayGuestRecord: false,
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: true
                            }
                          })
                        }}
                      >
                        編集
                          </button>
                    </td>
                  </tr>

                  {/* 宿泊情報 編集 */}
                  <tr className={`${this.checkRecordEditing(0, index) ? `${s.active} fadeIn` : 'd-none'}`}>
                    {/* 顧客名 */}
                    <td className={s.name}>
                      <input
                        className={s.kanji}
                        name="name"
                        value={
                          `${customerRecord.name || ''}`
                        }
                        onChange={async (event) => {
                          let stayGuests = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
                              stayGuests = [
                                ...this.state.searchBar.stayGuests.name
                              ];

                              stayGuests[index].name = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  stayGuests: stayGuests
                                }
                              })
                            }
                          } else {
                            stayGuests = [
                              ...this.state.stayGuests
                            ];

                            stayGuests[index].name = event.target.value;
                            this.setState(stayGuests);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'name',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              page: this.state.currentPagination,
                              recordNumber: index,
                              editing: false

                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'name',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      />
                      <input
                        className={s.kana}
                        name="name_kana"
                        value={
                          `${customerRecord.name_kana || ''}`
                        }
                        onChange={async (event) => {
                          let stayGuests = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
                              stayGuests = [
                                ...this.state.searchBar.name_kana
                              ];

                              stayGuests[index].name_kana = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  stayGuests: stayGuests
                                }
                              })
                            }
                          } else {
                            stayGuests = [
                              ...this.state.stayGuests
                            ];

                            stayGuests[index].name_kana = event.target.value;
                            this.setState(stayGuests);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'name_kana',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              page: this.state.currentPagination,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'number_of_rooms',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      />
                    </td>

                    {/* 宿泊日(from) */}
                    <td>
                      <DatePicker2
                        name="stay_date_from"
                        value={
                          (() => {
                            const value = customerRecord.stay_date_from || "-";
                            return value
                          })()
                        }
                        onChange={async (date) => {
                          let result = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
                              result = [
                                ...this.state.searchBar.stayGuests
                              ];

                              result[index].stay_date_from = date;
                              this.setState(result);
                            }
                          } else {
                            result = [
                              ...this.state.stayGuests
                            ];

                            result[index].stay_date_from = date;
                            this.setState(result);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'stay_date_from',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'stay_date_from',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                        onCalendarClose={async () => {
                          await this.saveGuestInfo({
                            field: 'stay_date_from',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              page: this.state.currentPagination,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                      />
                    </td>

                    {/* 宿泊日(to) */}
                    <td>
                      {/* stay_date_toは泊数に依存するため編集できないようにする */}
                      {formatDateWithTime(customerRecord.stay_date_to)}
                      {/*<input*/}
                      {/*  className={'reservationListTable_td_input'}*/}
                      {/*  name="stay_date_from"*/}
                      {/*  value={*/}
                      {/*    (() => {*/}
                      {/*      const value = customerRecord.stay_date_to || "-";*/}
                      {/*      return value*/}
                      {/*    })()*/}
                      {/*  }*/}
                      {/*  onChange={(event) => {*/}
                      {/*    let result = [];*/}

                      {/*    if (this.SearchBarRef.current.state.stringValue.length > 0) {*/}
                      {/*      if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {*/}
                      {/*        result = [*/}
                      {/*          ...this.state.searchBar.stayGuests*/}
                      {/*        ];*/}

                      {/*        result[index].stay_date_to = event.target.value;*/}
                      {/*        this.setState(result);*/}
                      {/*      }*/}
                      {/*    } else {*/}
                      {/*      const result = [*/}
                      {/*        ...this.state.stayGuests*/}
                      {/*      ];*/}

                      {/*      result[index].stay_date_to = event.target.value;*/}
                      {/*      this.setState(result);*/}
                      {/*    }*/}
                      {/*  }}*/}
                      {/*/>*/}
                    </td>

                    {/* 泊数/人数 */}
                    <td className={s.twins}>
                      <select
                        name="stay_days"
                        value={customerRecord.stay_days || ''}
                        onChange={(event) => {
                          let result = [];

                          if (Number(event.target.value) > -1) {
                            if (this.SearchBarRef.current.state.stringValue.length > 0) {
                              if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
                                result = [
                                  ...this.state.searchBar.stayGuests
                                ];

                                result[index].stay_days = Number(event.target.value);
                                this.setState(result);
                              }
                            } else {
                              result = [
                                ...this.state.stayGuests
                              ];

                              result[index].stay_days = Number(event.target.value);
                              this.setState(result);
                            }
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'stay_days',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'stay_days',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      >
                        {
                          (() => {
                            const selectStayDays = [];

                            selectStayDays.push({
                              value: '',
                              label: ''
                            });

                            for (let i = 1; i < 101; i++) {
                              selectStayDays.push({
                                value: i.toString(),
                                label: i.toString()
                              });
                            }

                            return selectStayDays.map((stay_days) => (
                              <option
                                value={stay_days.value}
                                selected={
                                  stay_days.value === customerRecord.stay_days
                                }
                              >
                                {stay_days.label}
                              </option>
                            ))
                          })()
                        }
                      </select>
                      <select
                        name="number_of_guests"
                        value={customerRecord.number_of_guests || ''}
                        onChange={(event) => {
                          let result = [];

                          if (Number(event.target.value) > -1) {
                            if (this.SearchBarRef.current.state.stringValue.length > 0) {
                              if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
                                result = [
                                  ...this.state.searchBar.stayGuests
                                ];

                                result[index].number_of_guests = Number(event.target.value);
                                this.setState(result);
                              }
                            } else {
                              result = [
                                ...this.state.stayGuests
                              ];

                              result[index].number_of_guests = Number(event.target.value);
                              this.setState(result);
                            }
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'number_of_guests',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'number_of_guests',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      >
                        {
                          (() => {
                            const selectNumberOfGuests = [];

                            selectNumberOfGuests.push({
                              value: '',
                              label: ''
                            });

                            for (let i = 1; i < 101; i++) {
                              selectNumberOfGuests.push({
                                value: i.toString(),
                                label: i.toString()
                              });
                            }

                            return selectNumberOfGuests.map((number_of_guests) => (
                              <option
                                value={number_of_guests.value}
                                selected={
                                  number_of_guests.value === customerRecord.number_of_guests
                                }
                              >
                                {number_of_guests.label}
                              </option>
                            ))
                          })()
                        }
                      </select>
                    </td>

                    {/* 部屋数 */}
                    <td>
                      <select
                        name="number_of_rooms"
                        value={customerRecord.number_of_rooms || ''}
                        onChange={(event) => {
                          let result = [];

                          if (Number(event.target.value) > -1) {
                            if (this.SearchBarRef.current.state.stringValue.length > 0) {
                              if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
                                result = [
                                  ...this.state.searchBar.stayGuests
                                ];

                                result[index].number_of_rooms = Number(event.target.value);
                                this.setState(result);
                              }
                            } else {
                              result = [
                                ...this.state.stayGuests
                              ];

                              result[index].number_of_rooms = Number(event.target.value);
                              this.setState(result);
                            }
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'number_of_rooms',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'number_of_rooms',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      >
                        {
                          (() => {
                            const selectNumberOfRooms = [];

                            selectNumberOfRooms.push({
                              value: '',
                              label: ''
                            });

                            for (let i = 1; i < 101; i++) {
                              selectNumberOfRooms.push({
                                value: i.toString(),
                                label: i.toString()
                              });
                            }

                            return selectNumberOfRooms.map((number_of_rooms) => (
                              <option
                                value={number_of_rooms.value}
                                selected={
                                  number_of_rooms.value === customerRecord.number_of_rooms
                                }
                              >
                                {number_of_rooms.label}
                              </option>
                            ))
                          })()
                        }
                      </select>
                    </td>

                    {/* 宿泊 ステータス */}
                    <td>
                      <select
                        name="status_code"
                        value={customerRecord.status_code}
                        onChange={async (event) => {
                          let result = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
                              result = [
                                ...this.state.searchBar.stayGuests
                              ];

                              result[index].status_code = parseInt(event.target.value);
                              this.setState(result);

                              await this.saveGuestInfo({
                                field: 'status_code',
                                listIndex: index,
                              });

                              this.setState({
                                editFlag: {
                                  ...this.state.editFlag,
                                  recordNumber: index,
                                  editing: false
                                }
                              })
                            }
                          } else {
                            result = [
                              ...this.state.stayGuests
                            ];

                            result[index].status_code = parseInt(event.target.value);
                            this.setState(result);

                            await this.saveGuestInfo({
                              field: 'status_code',
                              listIndex: index,
                            });

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      >
                        {
                          (() => {
                            return statusCodeModel.map((option, index) => (
                              <option
                                value={option.value}
                                selected={
                                  customerRecord.status_code === option.value
                                }
                              >
                                { option.label}
                              </option>
                            ))
                          })()
                        }
                      </select>
                    </td>

                    {/* コピーボタン */}
                    {/* <td className={s.icon}>
                          <FontAwesomeIcon
                            onClick={async () => {
                              this.setState({
                                copyStayGuestInfo: {
                                  ...customerRecord
                                }
                              });

                            }}
                            icon={faCopy}
                          />
                        </td> */}

                    {/* <div className={`${this.checkRecordEditing(0, index) ? 'fadeIn' : 'd-none'}`}> */}
                    {/* 保存ボタン */}
                    {/*<FontAwesomeIcon*/}
                    {/*  onClick={async () => {*/}
                    {/*    this.setState({*/}
                    {/*      editFlag: {*/}
                    {/*        ...this.state.editFlag,*/}
                    {/*        recordNumber: index,*/}
                    {/*        editing: false*/}
                    {/*      }*/}
                    {/*    })*/}

                    {/*    await this.editStayGuests(customerRecord.stay_guests_id);*/}
                    {/*  }}*/}
                    {/*  icon={faSave}*/}
                    {/*/>*/}
                    {/* </div> */}

                    {/* 削除ボタン */}
                    <td className={s.deleteButton}>
                      <button
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: false
                            }
                          })

                          this.setState({
                            popupStatus: {
                              show: true,
                              data: {
                                deleteType: 'stayGuest',
                                stay_guests_id: customerRecord.stay_guests_id,
                                reservation_id: customerRecord.reservation_id
                              }
                            }
                          })
                        }}
                      >
                        削除
                          </button>
                    </td>
                  </tr>
                </>
              ))}

              {/* タブ1 新規登録 */}
              <tr className={`${this.state.addingNewStayGuestRecord ? `${s.active} fadeIn` : 'd-none'}`}>
                {/* 顧客名 */}
                <td className={s.name}>
                  <input
                    className={`${s.kanji} ${this.state.validation.nameError ? `${s.error}` : ''}`}
                    name="name"
                    placeholder='顧客名'
                    value={
                      (() => {
                        return this.state.newStayGuestModel.name;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newStayGuestModel: {
                          ...this.state.newStayGuestModel,
                          name: event.target.value
                        }
                      });
                    }}
                  />
                  <input
                    className={`${s.kana} ${this.state.validation.nameKanaError ? `${s.error}` : ''}`}
                    name="name_kana"
                    placeholder='顧客名(かな)'
                    value={
                      (() => {
                        return this.state.newStayGuestModel.name_kana;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newStayGuestModel: {
                          ...this.state.newStayGuestModel,
                          name_kana: event.target.value
                        }
                      });
                    }}
                  />
                </td>

                {/* 宿泊日 from */}
                <td className={`${this.state.validation.stayDateFromError ? `${s.errorForDatePicker}` : ''}`}>
                  <DatePicker2
                    name="stay_date_from"
                    value={this.state.newStayGuestModel.stay_date_from}
                    onChange={(date) => {
                      this.setState({
                        newStayGuestModel: {
                          ...this.state.newStayGuestModel,
                          stay_date_from: date
                        }
                      });
                    }}
                    onBlur={() => {
                    }}
                    onKeyDown={() => {
                    }}
                    onCalendarClose={() => {
                    }}
                  />
                </td>

                {/* 宿泊日 to */}
                <td>
                  -
                      {/*<input*/}
                  {/*  className={'reservationListTable_td_input'}*/}
                  {/*  name="stay_date_to"*/}
                  {/*  value={this.state.newStayGuestModel.stay_date_to}*/}
                  {/*  onChange={(event) => {*/}
                  {/*    this.setState({*/}
                  {/*      newStayGuestModel: {*/}
                  {/*        ...this.state.newStayGuestModel,*/}
                  {/*        stay_date_to: event.target.value*/}
                  {/*      }*/}
                  {/*    });*/}
                  {/*  }}*/}
                  {/*/>*/}
                </td>

                {/* 泊数/人数 */}
                <td className={s.twins}>
                  <select
                    className={`${this.state.validation.stayDateFromError ? `${s.error}` : ''}`}
                    name="stay_days"
                    value={this.state.newStayGuestModel.stay_days || ''}
                    onChange={(event) => {
                      if (Number(event.target.value) > -1) {
                        this.setState({
                          newStayGuestModel: {
                            ...this.state.newStayGuestModel,
                            stay_days: Number(event.target.value)
                          }
                        });
                      }
                    }}
                  >
                    {
                      (() => {
                        const selectStayDays = [];

                        selectStayDays.push({
                          value: '',
                          label: ''
                        });

                        for (let i = 1; i < 101; i++) {
                          selectStayDays.push({
                            value: i.toString(),
                            label: i.toString()
                          });
                        }

                        return selectStayDays.map((stay_days) => (
                          <option
                            value={stay_days.value}
                            selected={
                              stay_days.value === '-'
                            }
                          >
                            { stay_days.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                  <select
                    className={`${this.state.validation.numberOfGuestsError ? `${s.error}` : ''}`}
                    name="number_of_guests"
                    value={this.state.newStayGuestModel.number_of_guests || ''}
                    onChange={(event) => {
                      if (Number(event.target.value) > -1) {
                        this.setState({
                          newStayGuestModel: {
                            ...this.state.newStayGuestModel,
                            number_of_guests: Number(event.target.value)
                          }
                        });
                      }
                    }}
                  >
                    {
                      (() => {
                        const selectNumberOfGuests = [];

                        selectNumberOfGuests.push({
                          value: '',
                          label: ''
                        });

                        for (let i = 1; i < 101; i++) {
                          selectNumberOfGuests.push({
                            value: i.toString(),
                            label: i.toString()
                          });
                        }

                        return selectNumberOfGuests.map((number_of_guests) => (
                          <option
                            value={number_of_guests.value}
                            selected={
                              number_of_guests.value === '-'
                            }
                          >
                            { number_of_guests.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </td>

                {/* 部屋数 */}
                <td >
                  <select
                    className={`${this.state.validation.numberOfRoomsError ? `${s.error}` : ''}`}
                    name="number_of_rooms"
                    value={this.state.newStayGuestModel.number_of_rooms || ''}
                    onChange={(event) => {
                      if (Number(event.target.value) > -1) {
                        this.setState({
                          newStayGuestModel: {
                            ...this.state.newStayGuestModel,
                            number_of_rooms: parseInt(event.target.value)
                          }
                        });
                      }
                    }}
                  >
                    {
                      (() => {
                        const selectNumberOfRooms = [];

                        selectNumberOfRooms.push({
                          value: '',
                          label: ''
                        });

                        for (let i = 1; i < 101; i++) {
                          selectNumberOfRooms.push({
                            value: i.toString(),
                            label: i.toString()
                          });
                        }

                        return selectNumberOfRooms.map((number_of_rooms) => (
                          <option
                            value={number_of_rooms.value}
                            selected={
                              number_of_rooms.value === '-'
                            }
                          >
                            { number_of_rooms.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </td>

                {/* 宿泊ステータス */}
                <td>
                  <select
                    name="gender"
                    value={this.state.newStayGuestModel.status_code}
                    onChange={(event) => {
                      this.setState({
                        newStayGuestModel: {
                          ...this.state.newStayGuestModel,
                          status_code: parseInt(event.target.value)
                        }
                      });
                    }}
                  >
                    {
                      (() => {
                        return statusCodeModel.map((option, index) => (
                          <option
                            value={option.value}
                          >
                            { option.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </td>

                {/* ペーストボタン */}
                {/* <td className={s.icon}>
                      <FontAwesomeIcon
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              editing: false
                            }
                          })

                          this.setState({
                            newStayGuestModel: {
                              ...this.state.newStayGuestModel,
                              ...this.state.copyStayGuestInfo
                            }
                          });
                        }}
                        icon={faPaste}
                      />
                    </td> */}

                {/* 新規保存ボタン */}
                <td className={s.saveButton}>
                  <button
                    onClick={async () => {
                      // this.setState({
                      //   addingNewStayGuestRecord: false,
                      //   editFlag: {
                      //     ...this.state.editFlag,
                      //     editing: false
                      //   }
                      // })

                      await this.addStayGuests();
                    }}
                  >
                    保存
                      </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* タブ2 客室割当 */}
          <table className={`${selectedTab === 1 ? 'fadeIn' : 'd-none'}`}>
            <thead>
              <tr>
                <td style={{ width: 400 }}>顧客名</td>
                <td>泊数/人数/部屋数</td>
                <td>宿泊日１/客室１</td>
                <td>宿泊日２/客室２</td>
                <td>ステータス</td>
              </tr>
            </thead>

            <tbody>
              {guestRender().map((customerRecord, index) => (
                <tr>
                  {/* 顧客名 */}
                  <td
                    className={s.name}
                    onClick={() => {
                      this.props.history.push(`/customer-info/detail/${customerRecord.stay_guests_id}`)
                    }}
                  >
                    {customerRecord.name} ,{customerRecord.name_kana}
                  </td>

                  {/* 泊数/人数/部屋数 */}
                  <td>{customerRecord.stay_days}/{customerRecord.number_of_guests}/{customerRecord.number_of_rooms}</td>

                  {/* 宿泊日１/客室１ */}
                  <td
                    className='cursor-pointer'
                    onClick={() => {
                      this.props.history.push(`/customer-info/room/assignment/${customerRecord.stay_guests_id}`)
                      // this.props.history.push(`/room-assignment/${customerRecord.stay_guests_id}/${customerRecord.stay_date_from}/${customerRecord.stay_date_to}`)
                    }}
                  >
                    {
                      (() => {
                        if (customerRecord.stay_days > 0) {
                          const firstDate = this.getDate(new Date(customerRecord.stay_date_from));

                          if (customerRecord.assigned_rooms && customerRecord.assigned_rooms.length === 0) {
                            return [
                              <div className='cursor-pointer'>
                                {firstDate}<br />
                                <span className='text-blue'>未割当</span>
                              </div>
                            ]
                          }

                          const assignedRoomData = customerRecord.assigned_rooms.filter(
                            assignedRoom => firstDate === assignedRoom.stay_date
                          )[0]

                          if (assignedRoomData) {
                            if (assignedRoomData.room_name) {
                              return [
                                <>{firstDate}<br /></>,
                                <span
                                  className='text-blue'
                                  onClick={() => {
                                    this.props.history.push(`/room-assignment/${customerRecord.stay_guests_id}/${customerRecord.stay_date_from}/${customerRecord.stay_date_to}`)
                                  }}
                                >{assignedRoomData.room_name}</span>
                              ]
                            } else {
                              return [
                                <div className='cursor-pointer'>
                                  {firstDate}<br />
                                  <span className='text-blue'>未割当</span>
                                </div>
                              ]
                            }
                          }
                        } else {
                          // 宿泊日初日にstay_daysがないレコードは未入力
                          return ('-')
                        }
                      })()
                    }
                  </td>

                  {/* 宿泊日２/客室２ */}
                  <td

                    onClick={() => {
                      this.props.history.push(`/customer-info/room/assignment/${customerRecord.stay_guests_id}`)
                      // this.props.history.push(`/room-assignment/${customerRecord.stay_guests_id}/${customerRecord.stay_date_from}/${customerRecord.stay_date_to}`)
                    }}
                  >
                    {
                      (() => {
                        if (customerRecord.stay_days > 1) {
                          const nextDate = this.nextDate(new Date(customerRecord.stay_date_from));

                          if (customerRecord.assigned_rooms && customerRecord.assigned_rooms.length === 0) {
                            return [
                              <div className='cursor-pointer'>
                                {nextDate}<br />
                                <span className='text-blue'>未割当</span>
                              </div>
                            ]
                          }

                          if (customerRecord.assigned_rooms && customerRecord.assigned_rooms.length > 0) {
                            const assignedRoomData = customerRecord.assigned_rooms.filter(
                              assignedRoom => assignedRoom.stay_date === this.nextDate(new Date(customerRecord.stay_date_from))
                            )[0]

                            if (assignedRoomData) {
                              if (assignedRoomData.room_name) {
                                return [
                                  <>{nextDate}<br /></>,
                                  <span className='text-blue'>{assignedRoomData.room_name}</span>
                                ]
                              } else {
                                // 宿泊日2のデータがあってもルームネームがない場合は部屋が未割り当ての状態とみなす
                                return [
                                  <div className='cursor-pointer'>
                                    {nextDate}<br />
                                    <span className='text-blue'>未割当</span>
                                  </div>
                                ]
                              }
                            }
                          }
                        } else {
                          return ('-')
                        }
                      })()
                    }
                  </td>
                  {/* ステータス */}
                  <td>
                    {(() => {
                      const statusCode = statusCodeModel.filter((option) => {
                        return option.value === customerRecord.status_code;
                      });

                      return statusCode.length > 0 && statusCode[0].label
                    })()}
                  </td>
                </tr >
              ))
              }
            </tbody >
          </table >

          {/* タブ3 その他のお客様情報 */}
          <table className={`${selectedTab === 2 ? 'fadeIn' : 'd-none'}`}>
            <thead>
              <tr>
                <td style={{ width: 400 }}>顧客名</td>
                <td style={{ width: 120 }}>年齢</td>
                <td style={{ width: 120 }}>性別</td>
                <td style={{ width: 250 }}>連絡先</td>
                <td>住所</td>
                <td style={{ width: 120 }}></td>
                {/* <td style={{ width: 60 }}></td> */}
              </tr>
            </thead>

            <tbody>
              {/* 顧客情報未登録 */}
              <tr className={`${this.state.guest.length > 0 ? 'd-none' : 'fadeIn'}`}>
                <td colspan="6" className={s.noInfo}>
                  現在は宿泊者がいません
                    </td>
              </tr>

              {guestRender().map((customerRecord, index) => (
                <>
                  {/* その他のお客様情報 一覧 */}
                  <tr className={`${this.checkRecordEditing(2, index) ? 'd-none' : 'fadeIn'}`}>
                    {/* 顧客名 */}
                    <td
                      className={s.name}
                      onClick={() => {
                        this.props.history.push(`/guest/detail/${customerRecord.guest_id}`)
                      }}
                    >
                      {customerRecord.name}, {customerRecord.name_kana}
                      {customerRecord.face_id_azure && <label className={s.faceLabel}>Face</label>}
                    </td>

                    {/* 年齢 */}
                    <td>{customerRecord.age || "-"}</td>

                    {/* 性別 */}
                    <td>
                      {(() => {
                        const gender = optionModel.filter((option) => {
                          return option.value === customerRecord.gender;
                        });

                        return gender && gender.length > 0 ? gender[0].label : '-'
                      })()}
                    </td>

                    {/* 連絡先 */}
                    <td className='text-left'>{customerRecord.phone_number || '-'}</td>

                    {/* 住所 */}
                    <td className='text-left'>{customerRecord.home_address || '-'}</td>

                    {/* コピーボタン */}
                    {/* <td className={s.icon}>
                          <FontAwesomeIcon
                            onClick={async () => {
                              this.setState({
                                copyGuestInfo: {
                                  ...customerRecord
                                }
                              });
                            }}
                            icon={faCopy}
                          />
                        </td> */}

                    {/* 編集ボタン */}
                    <td className={s.editButton}>
                      <button
                        onClick={() => {
                          this.setState({
                            addingNewStayGuestRecord: false,
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: true
                            }
                          })
                        }}
                      >
                        編集
                          </button>
                    </td>
                  </tr>

                  {/* その他のお客様情報 編集 */}
                  <tr className={`${this.checkRecordEditing(2, index) ? `${s.active} fadeIn` : 'd-none'}`}>
                    {/* 顧客名 */}
                    <td className={s.name}>
                      <input
                        className={s.kanji}
                        name="name"
                        placeholder='顧客名'
                        value={
                          `${customerRecord.name || ''}`
                        }
                        onChange={async (event) => {
                          let guest = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
                              guest = [
                                ...this.state.searchBar.guest
                              ];

                              guest[index].name = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  guest: guest
                                }
                              })
                            }
                          } else {
                            guest = [
                              ...this.state.guest
                            ];

                            guest[index].name = event.target.value;
                            this.setState(guest);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'name',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              page: this.state.currentPagination,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'name',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                page: this.state.currentPagination,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      />
                      <input
                        className={s.kana}
                        name="name_kana"
                        placeholder='顧客名(かな)'
                        value={
                          `${customerRecord.name_kana || ''}`
                        }
                        onChange={async (event) => {
                          let guest = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.guest && searchBar.guest.length > 0) {
                              guest = [
                                ...this.state.searchBar.guest
                              ];

                              guest[index].name_kana = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  guest: guest
                                }
                              })
                            }
                          } else {
                            guest = [
                              ...this.state.guest
                            ];

                            guest[index].name_kana = event.target.value;
                            this.setState(guest);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'name_kana',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'name_kana',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      />
                    </td>

                    {/* 年齢 */}
                    <td>
                      <select
                        name="age"
                        value={customerRecord.age}
                        onChange={async (event) => {
                          let guest = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.age && searchBar.age.length > 0) {
                              guest = [
                                ...this.state.searchBar.age
                              ];

                              guest[index].age = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  age: age
                                }
                              })

                              await this.saveGuestInfo({
                                field: 'age',
                                listIndex: index,
                              });

                              this.setState({
                                editFlag: {
                                  ...this.state.editFlag,
                                  recordNumber: index,
                                  editing: false
                                }
                              })
                            }
                          } else {
                            guest = [
                              ...this.state.guest
                            ];

                            guest[index].age = parseInt(event.target.value);
                            this.setState(guest);

                            await this.saveGuestInfo({
                              field: 'age',
                              listIndex: index,
                            });

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      >
                        {
                          (() => {
                            const selectAge = [];

                            selectAge.push({
                              value: '',
                              label: ''
                            });

                            for (let i = 1; i < 101; i++) {
                              selectAge.push({
                                value: i.toString(),
                                label: i.toString()
                              });
                            }

                            return selectAge.map((age) => (
                              <option
                                value={age.value}
                                selected={
                                  age.value === customerRecord.age
                                }
                              >
                                { age.label}
                              </option>
                            ))
                          })()
                        }
                      </select>
                    </td>
                    {/* 性別 */}
                    <td>
                      <select
                        name="gender"
                        value={customerRecord.gender}
                        onChange={async (event) => {
                          let guest = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.guest && searchBar.guest.length > 0) {
                              guest = [
                                ...this.state.searchBar.guest
                              ];

                              guest[index].gender = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  guest: guest
                                }
                              })

                              await this.saveGuestInfo({
                                field: 'gender',
                                listIndex: index,
                              });

                              this.setState({
                                editFlag: {
                                  ...this.state.editFlag,
                                  recordNumber: index,
                                  editing: false
                                }
                              })
                            }
                          } else {
                            guest = [
                              ...this.state.guest
                            ];

                            guest[index].gender = parseInt(event.target.value);
                            this.setState(guest);

                            await this.saveGuestInfo({
                              field: 'gender',
                              listIndex: index,
                            });

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      >
                        {
                          (() => {
                            return optionModel.map((option, index) => (
                              <option
                                value={option.value}
                                selected={
                                  customerRecord.gender === option.value
                                }
                              >
                                { option.label}
                              </option>
                            ))
                          })()
                        }
                      </select>
                    </td>
                    {/* 連絡先 */}
                    <td>
                      <input
                        className='text-left'
                        name="phone_number"
                        placeholder='連絡先'
                        value={customerRecord.phone_number || ''}
                        onChange={(event) => {
                          let guest = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.guest && searchBar.guest.length > 0) {
                              guest = [
                                ...this.state.searchBar.guest
                              ];

                              guest[index].phone_number = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  guest: guest
                                }
                              })
                            }
                          } else {
                            const guest = [
                              ...this.state.guest
                            ];

                            guest[index].phone_number = event.target.value;
                            this.setState(guest);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'phone_number',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'phone_number',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      />
                    </td>
                    {/* 住所 */}
                    <td>
                      <input
                        className='text-left'
                        name="home_address"
                        placeholder='住所'
                        value={customerRecord.home_address || ''}
                        onChange={(event) => {
                          let guest = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.guest && searchBar.guest.length > 0) {
                              guest = [
                                ...this.state.searchBar.guest
                              ];

                              guest[index].home_address = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  guest: guest
                                }
                              })
                            }
                          } else {
                            guest = [
                              ...this.state.guest
                            ];

                            guest[index].home_address = event.target.value;
                            this.setState(guest);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveGuestInfo({
                            field: 'home_address',
                            listIndex: index,
                          })

                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: false
                            }
                          })
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveGuestInfo({
                              field: 'home_address',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                recordNumber: index,
                                editing: false
                              }
                            })
                          }
                        }}
                      />
                    </td>

                    {/* コピーボタン */}
                    {/* < td className={s.icon} >
                          <FontAwesomeIcon
                            onClick={async () => {
                              this.setState({
                                copyGuestInfo: {
                                  ...customerRecord
                                }
                              });
                            }}
                            icon={faCopy}
                          />
                        </td> */}

                    {/* 保存ボタン */}
                    {/*<FontAwesomeIcon*/}
                    {/*  onClick={async () => {*/}
                    {/*    this.setState({*/}
                    {/*      editFlag: {*/}
                    {/*        ...this.state.editFlag,*/}
                    {/*        recordNumber: index,*/}
                    {/*        editing: false*/}
                    {/*      }*/}
                    {/*    })*/}
                    {/*    await this.editGuests(customerRecord.guest_id);*/}
                    {/*  }}*/}
                    {/*  icon={faSave}*/}
                    {/*/>*/}

                    {/* 削除ボタン */}
                    <td className={s.deleteButton}>
                      <button
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              recordNumber: index,
                              editing: false
                            }
                          })

                          this.setState({
                            popupStatus: {
                              show: true,
                              data: {
                                deleteType: 'guest',
                                guest_id: customerRecord.guest_id
                              }
                            }
                          })
                        }}
                      >
                        削除
                          </button>
                    </td>
                  </tr>
                </>
              ))
              }

              {/* タブ3 new その他のお客様情報 */}
              <tr className={`${this.state.addingNewGuestRecord ? `${s.active} fadeIn` : 'd-none'}`}>
                {/* 顧客名 */}
                <td className={s.name}>
                  <input
                    className={s.kanji}
                    name="name"
                    placeholder='顧客名'
                    value={
                      (() => {
                        return this.state.newGuestModel.name;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newGuestModel: {
                          ...this.state.newGuestModel,
                          name: event.target.value
                        }
                      });
                    }}
                  />
                  <input
                    className={s.kana}
                    name="name_kana"
                    placeholder='顧客名(かな)'
                    value={
                      (() => {
                        return this.state.newGuestModel.name_kana;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newGuestModel: {
                          ...this.state.newGuestModel,
                          name_kana: event.target.value
                        }
                      });
                    }}
                  />
                </td>

                {/* 年齢 */}
                <td>
                  <select
                    name="age"
                    value={this.state.newGuestModel.age}
                    onChange={(event) => {
                      this.setState({
                        newGuestModel: {
                          ...this.state.newGuestModel,
                          age: event.target.value
                        }
                      });
                    }}
                  >
                    {
                      (() => {
                        const selectAge = [];

                        selectAge.push({
                          value: '',
                          label: ''
                        });

                        for (let i = 1; i < 101; i++) {
                          selectAge.push({
                            value: i.toString(),
                            label: i.toString()
                          });
                        }

                        return selectAge.map((age) => (
                          <option
                            value={age.value}
                            selected={
                              age.value === '-'
                            }
                          >
                            { age.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </td>

                {/* 性別 */}
                <td>
                  <select
                    name="gender"
                    value={this.state.newGuestModel.gender}
                    onChange={(event) => {
                      this.setState({
                        newGuestModel: {
                          ...this.state.newGuestModel,
                          gender: event.target.value
                        }
                      });
                    }}
                  >
                    {
                      (() => {
                        return optionModel.map((option, index) => (
                          <option
                            value={option.value}
                          >
                            { option.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </td>

                {/* 連絡先 */}
                <td>
                  <input
                    className='text-left'
                    name="number_of_rooms"
                    placeholder='連絡先'
                    value={this.state.newGuestModel.phone_number}
                    onChange={(event) => {
                      this.setState({
                        newGuestModel: {
                          ...this.state.newGuestModel,
                          phone_number: event.target.value
                        }
                      });
                    }}
                  />
                </td>

                {/* 住所 */}
                <td>
                  <input
                    className='text-left'
                    name="home_address"
                    placeholder='住所'
                    value={this.state.newGuestModel.home_address}
                    onChange={(event) => {
                      this.setState({
                        newGuestModel: {
                          ...this.state.newGuestModel,
                          home_address: event.target.value
                        }
                      });
                    }}
                  />
                </td>

                {/* ペーストボタン */}
                {/* <td className={s.icon}>
                      <FontAwesomeIcon
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              editing: false
                            }
                          })

                          this.setState({
                            newGuestModel: {
                              ...this.state.newGuestModel,
                              ...this.state.copyGuestInfo
                            }
                          });
                        }}
                        icon={faPaste}
                      />
                    </td> */}

                {/* 新規保存ボタン */}
                <td className={s.saveButton}>
                  <button
                    onClick={async () => {
                      this.setState({
                        addingNewGuestRecord: false,
                        editFlag: {
                          ...this.state.editFlag,
                          editing: false
                        }
                      })

                      await this.addGuests();
                    }}
                  >
                    保存
                      </button>
                </td>
              </tr>
            </tbody >
          </table >
        </div >

        {/* タブ1 登録ボタン */}
        < div
          className={`${s.addButton} ${this.state.selectedTab === 0 && this.state.addingNewStayGuestRecord ? 'd-none' : 'fadeIn'} ${this.state.selectedTab !== 0 ? 'd-none' : 'fadeIn'}`
          }
          onClick={() => {
            this.setState({
              addingNewStayGuestRecord: true,
              editFlag: {
                ...this.state.editFlag,
                editing: false
              }
            })

            // バリデーションエラー初期化
            this.setState({
              validation: {
                ...this.state.validation,
                nameError: false,
                nameKanaError: false,
                stayDateFromError: false,
                stayDaysError: false,
                numberOfGuestsError: false,
                numberOfRoomsError: false,
              }
            });
          }}
        >
          <AiOutlinePlus />登録
            </div >

        {/* タブ1 閉じるボタン */}
        < div
          className={`${s.closeButton} ${this.state.addingNewStayGuestRecord ? 'fadeIn' : 'd-none'} ${this.state.selectedTab !== 0 ? 'd-none' : 'fadeIn'}`}
          onClick={() => {
            this.setState({
              addingNewStayGuestRecord: false,
              editFlag: {
                ...this.state.editFlag,
                editing: false
              }
            })
          }}
        >
          <AiOutlineClose />閉じる
            </div >

        {/* タブ3 登録ボタン */}
        < div
          className={`${s.addButton} ${this.state.addingNewGuestRecord ? 'd-none' : 'fadeIn'} ${this.state.selectedTab !== 2 ? 'd-none' : 'fadeIn'}`}
          onClick={() => {
            this.setState({
              addingNewGuestRecord: true,
              editFlag: {
                ...this.state.editFlag,
                editing: false
              }
            })

            // バリデーションエラー初期化
            this.setState({
              validation: {
                ...this.state.validation,
                nameError: false,
                nameKanaError: false,
                stayDateFromError: false,
                stayDaysError: false,
                numberOfGuestsError: false,
                numberOfRoomsError: false,
              }
            });
          }}
        >
          <AiOutlinePlus />登録
            </div >

        {/* タブ3 閉じるボタン */}
        < div
          className={`${s.closeButton} ${this.state.addingNewGuestRecord ? 'fadeIn' : 'd-none'} ${this.state.selectedTab !== 2 ? 'd-none' : 'fadeIn'}`}
          onClick={() => {
            this.setState({
              addingNewGuestRecord: false,
              editFlag: {
                ...this.state.editFlag,
                editing: false
              }
            })
          }}
        >
          <AiOutlineClose />閉じる
            </div >

        <div className={s.footerName}>{updated && message}</div>

        {/* バリデーションエラーのポップアップ */}

        <div
          className={`${!this.state.popupStatus.showValidationModal ? 'd-none' : p.popupOverlay}`}
          onClick={async () => {
          }}
        >
          <div className={p.popup}>
            <div className={p.title}>
              バリデーションエラー
                </div>
            <div className={p.container}>
              <div className={p.errorText}>
                下記の項目にエラーがあります
                  </div>
              <ul className={p.errorList}>
                {
                  (() => {
                    const errorList = [];

                    if (this.state.validation.nameError) {
                      errorList.push(
                        `顧客名`
                      )
                    }

                    if (this.state.validation.nameKanaError) {
                      errorList.push(
                        `顧客名のふりがな`
                      )
                    }

                    if (this.state.validation.stayDateFromError) {
                      errorList.push(
                        `宿泊日`
                      )
                    }

                    if (this.state.validation.stayDaysError) {
                      errorList.push(
                        `宿泊数`
                      )
                    }

                    if (this.state.validation.numberOfGuestsError) {
                      errorList.push(
                        `人数`
                      )
                    }

                    if (this.state.validation.numberOfRoomsError) {
                      errorList.push(
                        `部屋数`
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
                  閉じる
                    </button>
              </div>
            </div>
          </div>
        </div>

        {/* レコード削除ポップアップ */}
        <div
          className={`${!this.state.popupStatus.show ? 'd-none' : p.popupOverlay}`}
          onClick={() => {
            this.setState({
              popupStatus: {
                ...this.state.popupStatus,
                show: false
              }
            });
          }}
        >
          <div className={p.popup}>
            <div className={p.title}>
              レコードを削除しますか？
                </div>
            <div className={p.container}>
              <div className={p.buttonContainer}>
                <button
                  onClick={async () => {
                    if (this.state.popupStatus.data.deleteType === 'stayGuest') {
                      await this.deleteStayGuests({
                        stay_guests_id: this.state.popupStatus.data.stay_guests_id,
                        reservation_id: this.state.popupStatus.data.reservation_id
                      });
                    }

                    if (this.state.popupStatus.data.deleteType === 'guest') {
                      await this.deleteGuests({
                        guest_id: this.state.popupStatus.data.guest_id,
                      });
                    }
                  }}
                >
                  はい
                    </button>
                <button className={p.red}>
                  いいえ
                    </button>
              </div>
            </div>
          </div>
        </div>

        {/* レコード重複ポップアップ */}
        <div
          className={`${!this.state.popupStatus.showDuplicateModal ? 'd-none' : p.popupOverlay}`}
        >
          <div className={p.popup}>
            <div className={p.title}>
              レコードを追加します
                </div>
            <div className={p.container}>
              <div className={p.errorText}>
                下記の項目に重複したレコードがありますが追加しますか？
                  </div>
              <ul className={p.errorList}>
                <li className={p.listItem}>顧客名:&nbsp;
                      <span>
                    {
                      (() => {
                        if (this.state.selectedTab === 0) {
                          return [
                            this.state.newStayGuestModel.name,
                            this.state.newStayGuestModel.name_kana
                          ]
                        }

                        if (this.state.selectedTab === 2) {
                          return [
                            this.state.newGuestModel.name,
                            this.state.newGuestModel.name_kana
                          ]
                        }
                      })()
                    }
                  </span>
                </li>
                <li
                  className={`${this.state.selectedTab === 0 ? p.listItem : 'd-none'}`}
                >
                  宿泊開始日:&nbsp;
                      <span>
                    {
                      (() => {
                        if (this.state.selectedTab === 0) {
                          return [
                            this.state.newStayGuestModel.stay_date_from
                          ]
                        }
                      })()
                    }
                  </span>
                </li>
                <li className={`
                    ${p.listItem}
                    ${this.state.selectedTab === 0 ? 'fadeIn' : 'd-none'}
                    ${this.state.newStayGuestModel.reservation_date ? 'fadeIn' : 'd-none'}`}>予約日:&nbsp;
                      <span>
                    {
                      (() => {
                        if (this.state.selectedTab === 0) {
                          return [
                            this.state.newStayGuestModel.reservation_date
                          ]
                        }
                      })()
                    }
                  </span>
                </li>
              </ul>

              <div className={p.buttonContainer}>
                <button
                  onClick={async () => {
                    if (this.state.selectedTab === 0) {
                      await this.addStayGuests({
                        force: true
                      });
                    }

                    if (this.state.selectedTab === 2) {
                      await this.addGuests({
                        force: true
                      });
                    }

                    this.setState({
                      popupStatus: {
                        ...this.state.popupStatus,
                        showDuplicateModal: false
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
                        showDuplicateModal: false
                      }
                    });
                  }}
                >
                  いいえ
                    </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

export default CustomerInfo;
