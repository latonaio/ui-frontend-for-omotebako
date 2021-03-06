import React from "react";
import Layout from "../../components/Layout";
import SearchBar from "../../components/SearchBar";
import StatusBar2 from "../../components/StatusBar2";
import SelectHundred from "../../components/Select";
import s from "../../scss/pages/ListPage.module.scss";
import p from "../../scss/components/Popup.module.scss";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import DatePicker2 from '../../components/DatePicker2';
import { formatDateWithTime } from "../../helper/date";
import { getFetch, postFetch } from "../../util/api";
import RequestRedisManager from "../../util/requestRedisManager";
import config from '../../util/config';
import * as formModel from '../../util/formModel'

const {
  statusCodeModel,
} = formModel.default;

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;

class CustomersReservations extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      stayGuests: [],
      name: null,
      name_kana: null,
      stay_date_from: null,
      stay_date_to: null,
      stay_days: null,
      number_of_guests: null,
      number_of_rooms: null,
      reservation_status: null,
      payment_method: 0,
      phone_number: null,
      home_address: null,
      editingData: [],
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
        showRegistered: false,
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
    // ???????????????????????????
    // await this.getStayGuestsInfo();
    // ???????????????????????????
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

        // ????????????????????????????????????
        this.SearchBarRef.current.onResetInputSearch();
      });

      this.requestRedisManager.io.emit('getStayGuests');

      this.requestRedisManager.io.on('getGuests', async (guest) => {
        this.setState({
          guest
        });

        // ????????????????????????????????????
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
      // ???????????????????????????????????????????????????
      // ??????????????????????????????????????????????????????????????????
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        return this.state.searchBar.stayGuests[data.listIndex][data.field]
      } else {
        return this.state.stayGuests[data.listIndex][data.field];
      }
    }

    const sendGuestId = () => {
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        return this.state.searchBar.stayGuests[data.listIndex]['stay_guests_id']
      } else {
        return this.state.stayGuests[data.listIndex]['stay_guests_id'];
      }
    }

    this.requestRedisManager.io.emit('editStayGuestDetail', JSON.stringify({
      ...data,
      value: sendValue(),
      stay_guests_id: sendGuestId()
    }));

    this.requestRedisManager.io.emit('getStayGuests');
    this.requestRedisManager.io.emit('getGuests');
  }

  getStayGuestsRooms = async () => {
    try {
      const result = await getFetch.getStayGuestsRooms();
      this.setState({ rooms: result });
    } catch (e) {
      console.error("Error:", e);
    }
  };

  // ??????????????????????????????????????????
  deleteStayGuests = async (data) => {
    this.requestRedisManager.io.emit('deleteStayGuest', JSON.stringify({
      ...data,
    }));
  }

  // ??????????????????????????????????????????
  addStayGuests = async (option = {}) => {
    try {
      try {
        // ??????????????????
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

          // ?????????
          await setStatePromise({
            validation: {
              ...this.state.validation,
              nameError: name.length <= 0
            }
          });

          // ????????????????????????
          await setStatePromise({
            validation: {
              ...this.state.validation,
              nameKanaError: name_kana.length <= 0
            }
          });

          // ?????????
          await setStatePromise({
            validation: {
              ...this.state.validation,
              stayDateFromError: stay_date_from === ''
            }
          });

          // ?????????
          await setStatePromise({
            validation: {
              ...this.state.validation,
              stayDaysError: stay_days === ''
            }
          });

          // ??????
          await setStatePromise({
            validation: {
              ...this.state.validation,
              numberOfGuestsError: number_of_guests === ''
            }
          });

          // ?????????
          await setStatePromise({
            validation: {
              ...this.state.validation,
              numberOfRoomsError: number_of_rooms === ''
            }
          });
        }

        await validationCheck(this.state.newStayGuestModel);

        // ??????????????????????????????????????????true
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

        // ????????????????????????????????????
        this.setState({
          addingNewStayGuestRecord: false,
          editFlag: {
            ...this.state.editFlag,
            editing: false
          },
        })

        await postFetch.registerStayGuestsForMysql(newStayGuestModel);

        this.requestRedisManager.io.emit('getStayGuests');

        // ???????????????????????????????????????
        this.setState({
          popupStatus: {
            ...this.state.popupStatus,
            showRegistered: true,
          }
        })

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
      alert("????????????" + e)
    }
  }

  checkRecordEditing = (recordNumber) => {
    return this.state.editFlag.recordNumber === recordNumber &&
      this.state.editFlag.editing;
  }
  render() {
    const {
      stayGuests,
      searchBar
    } = this.state;

    const guestRender = () => {
      if (!this.SearchBarRef.current) {
        return [];
      }

      if (this.SearchBarRef && this.SearchBarRef.current.state.stringValue.length > 0) {
        if (searchBar.stayGuests && searchBar.stayGuests.length > 0) {
          return searchBar.stayGuests
        } else {
          return []
        }
      }

      return stayGuests;
    }

    return (
      <Layout navType='customers'>
        <StatusBar2 icon='hands' text='??????????????????????????????????????????'
          right={
            <SearchBar
              ref={this.SearchBarRef}
              placeholder="???????????????????????????????????????"
              result={this.state.stayGuests}
              guest={this.state.guest}
              onChangeInputSearchBar={(e) => {
                this.setState({
                  editFlag: {
                    ...this.state.editFlag,
                    editing: false
                  }
                })

                const SearchBarSelectTabNumber = 'stayGuests';

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
          <div className={s.listTypeActive}>
            ????????????
          </div>
          <div className={s.listType}
            onClick={() => { this.props.history.push(`/customers/rooms`); }}
          >
            ????????????
          </div>
          <div className={s.listType}
            onClick={() => { this.props.history.push(`/customers/others`); }}
          >
            ???????????????????????????
          </div>
        </div>

        {/* ???????????? */}
        <div className={s.listTableContainer}>
          <table>
            <thead>
              <tr>
                <td style={{ width: 440 }}>?????????</td>
                <td style={{ width: 250 }}>?????????(from)</td>
                <td style={{ width: 250 }}>?????????(to)</td>
                <td>??????/??????</td>
                <td style={{ width: 120 }}>?????????</td>
                <td style={{ width: 200 }}>?????????????????????</td>
                <td style={{ width: 120 }}></td>
              </tr>
            </thead>

            <tbody>
              {/* ????????????????????? */}
              <tr className={`${this.state.stayGuests.length > 0 ? 'd-none' : 'fadeIn'}`}>
                <td colspan="7" className={s.noInfo}>
                  ???????????????????????????????????????
                </td>
              </tr>

              {guestRender().map((customerRecord, index) => (
                <>
                  {/* ?????? */}
                  <tr className={`${this.checkRecordEditing(index) ? 'd-none' : 'fadeIn'}`}>
                    {/* ????????? */}
                    <td
                      className={s.name}
                      onClick={() => {
                        this.props.history.push(`/customers/detail/${customerRecord.stay_guests_id}`)
                      }}
                    >
                      {customerRecord.name}, {customerRecord.name_kana}
                      {customerRecord.face_id_azure && <label className={s.faceLabel}>Face</label>}
                    </td>

                    {/* ?????????(from) */}
                    <td>{formatDateWithTime(customerRecord.stay_date_from)}</td>

                    {/* ?????????(to) */}
                    <td>{formatDateWithTime(customerRecord.stay_date_to)}</td>

                    {/* ??????/?????? */}
                    <td>{customerRecord.stay_days || "-"}&nbsp;/&nbsp;{customerRecord.number_of_guests || "-"}</td>

                    {/* ????????? */}
                    <td>{customerRecord.number_of_rooms || '-'}</td>

                    {/* ?????? ??????????????? */}
                    <td>
                      {(() => {
                        const statusCode = statusCodeModel.filter((option) => {
                          return option.value === customerRecord.status_code;
                        });

                        return statusCode.length > 0 && statusCode[0].label
                      })()}
                    </td>

                    {/* ??????????????? */}
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
                        ??????
                      </button>
                    </td>
                  </tr>

                  {/* ???????????? ?????? */}
                  <tr className={`${this.checkRecordEditing(index) ? `${s.active} fadeIn` : 'd-none'}`}>
                    {/* ????????? */}
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
                        onBlur={async () => {
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

                    {/* ?????????(from) */}
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

                    {/* ?????????(to) */}
                    <td>{formatDateWithTime(customerRecord.stay_date_to)}</td>

                    {/* ??????/?????? */}
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
                        onBlur={async () => {
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
                        <SelectHundred />
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
                        <SelectHundred />
                      </select>
                    </td>

                    {/* ????????? */}
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
                        <SelectHundred />
                      </select>
                    </td>

                    {/* ?????? ??????????????? */}
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

                    {/* ??????????????? */}
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
                        ??????
                          </button>
                    </td>
                  </tr>
                </>
              ))}

              {/* ??????????????? ?????? */}
              <tr className={`${this.state.addingNewStayGuestRecord ? `${s.active} fadeIn` : 'd-none'}`}>
                {/* ????????? */}
                <td className={s.name}>
                  <input
                    className={`${s.kanji} ${this.state.validation.nameError ? `${s.error}` : ''}`}
                    name="name"
                    placeholder='?????????'
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
                    placeholder='?????????(??????)'
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

                {/* ????????? from */}
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

                {/* ????????? to */}
                <td>-</td>

                {/* ??????/?????? */}
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
                    <SelectHundred />
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
                    <SelectHundred />
                  </select>
                </td>

                {/* ????????? */}
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
                    <SelectHundred />
                  </select>
                </td>

                {/* ????????????????????? */}
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

                {/* ????????????????????? */}
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
                    ??????
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ??????????????????????????????????????????????????? */}

        <div
          className={`${!this.state.popupStatus.showValidationModal ? 'd-none' : p.popupOverlay}`}
          onClick={async () => {
          }}
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

                    if (this.state.validation.nameError) {
                      errorList.push(
                        `?????????`
                      )
                    }

                    if (this.state.validation.nameKanaError) {
                      errorList.push(
                        `????????????????????????`
                      )
                    }

                    if (this.state.validation.stayDateFromError) {
                      errorList.push(
                        `?????????`
                      )
                    }

                    if (this.state.validation.stayDaysError) {
                      errorList.push(
                        `?????????`
                      )
                    }

                    if (this.state.validation.numberOfGuestsError) {
                      errorList.push(
                        `??????`
                      )
                    }

                    if (this.state.validation.numberOfRoomsError) {
                      errorList.push(
                        `?????????`
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

        {/* ??????1 ??????????????? */}
        < div
          className={`${s.addButton} ${this.state.addingNewStayGuestRecord ? 'd-none' : 'fadeIn'}`}
          onClick={() => {
            this.setState({
              addingNewStayGuestRecord: true,
              editFlag: {
                ...this.state.editFlag,
                editing: false
              }
            })

            // ???????????????????????????????????????
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
          <AiOutlinePlus />??????
        </div >

        {/* ??????1 ?????????????????? */}
        < div
          className={`${s.closeButton} ${this.state.addingNewStayGuestRecord ? 'fadeIn' : 'd-none'}`}
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
          <AiOutlineClose />?????????
        </div >

        {/* ?????????????????????????????? */}
        <div
          className={`${!this.state.popupStatus.showRegistered ? 'd-none' : p.popupOverlay}`}
          onClick={() => {
            this.setState({
              popupStatus: {
                ...this.state.popupStatus,
                showRegistered: false
              }
            });
          }}
        >
          <div className={p.popup}>
            <div className={p.registered}>
              ??????????????????????????????
            </div>
          </div>
        </div>

        {/* ???????????????????????????????????? */}
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
              ????????????????????????????????????
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
                  ??????
                </button>
                <button className={p.red}>
                  ?????????
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ???????????????????????????????????? */}
        <div
          className={`${!this.state.popupStatus.showDuplicateModal ? 'd-none' : p.popupOverlay}`}
        >
          <div className={p.popup}>
            <div className={p.title}>
              ??????????????????????????????
                </div>
            <div className={p.container}>
              <div className={p.errorText}>
                ?????????????????????????????????????????????????????????????????????????????????
                  </div>
              <ul className={p.errorList}>
                <li className={p.listItem}>?????????:&nbsp;
                      <span>
                    {this.state.newStayGuestModel.name,
                      this.state.newStayGuestModel.name_kana}
                  </span>
                </li>
                <li className={p.listItem}>
                  ???????????????:&nbsp;
                      <span>
                    {this.state.newStayGuestModel.stay_date_from}
                  </span>
                </li>
                <li className={`
                    ${p.listItem}
                    ${this.state.newStayGuestModel.reservation_date ? 'fadeIn' : 'd-none'}`}>?????????:&nbsp;
                      <span>
                    {this.state.newStayGuestModel.reservation_date}
                  </span>
                </li>
              </ul>

              <div className={p.buttonContainer}>
                <button
                  onClick={async () => {
                    await this.addStayGuests({
                      force: true
                    });

                    this.setState({
                      popupStatus: {
                        ...this.state.popupStatus,
                        showDuplicateModal: false,
                        showRegistered: true,
                      }
                    });
                  }}
                >
                  ??????
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
                  ?????????
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

export default CustomersReservations;