import React from "react";
import Layout from "../../components/Layout";
import SearchBar from "../../components/SearchBar";
import StatusBar2 from "../../components/StatusBar2";
import SelectHundred from "../../components/Select";
import s from "../../scss/pages/ListPage.module.scss";
import p from "../../scss/components/Popup.module.scss";
import { postFetch } from "../../util/api";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import RequestRedisManager from "../../util/requestRedisManager";
import config from '../../util/config';
import * as formModel from '../../util/formModel'

const {
  optionModel,
} = formModel.default;

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;

class CustomersOthers extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
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
      }
    };
    this.SearchBarRef = React.createRef();
    this.requestRedisManager = null;
  }

  async componentWillMount() {
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
        return this.state.searchBar.guest[data.listIndex][data.field]
      } else {
        return this.state.guest[data.listIndex][data.field];
      }
    }

    const sendGuestId = () => {
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        return this.state.searchBar.guest[data.listIndex]['guest_id']
      } else {
        return this.state.guest[data.listIndex]['guest_id'];
      }
    }

    this.requestRedisManager.io.emit('editGuestDetail', JSON.stringify({
      ...data,
      value: sendValue(),
      guest_id: sendGuestId()
    }));

    this.requestRedisManager.io.emit('getGuests');
  }

  // ????????????????????????????????????
  deleteGuests = async (data) => {
    this.requestRedisManager.io.emit('deleteGuest', JSON.stringify({
      ...data,
    }));
  }

  // ????????????????????????????????????
  addGuests = async (option = {}) => {
    try {
      try {
        const setStatePromise = (setData) => {
          return new Promise((resolve) => {
            this.setState(setData, () => {
              return resolve();
            })
          });
        }

        const validationCheck = async (newGuestModel) => {
          const {
            name,
          } = newGuestModel;

          // ?????????
          await setStatePromise({
            validation: {
              ...this.state.validation,
              nameError: name.length <= 0
            }
          });
        }

        await validationCheck(this.state.newGuestModel);

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
                showDuplicateModal: true,
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
      age,
      guest,
      searchBar
    } = this.state;

    const guestRender = () => {
      if (!this.SearchBarRef.current) {
        return [];
      }

      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        if (searchBar.guest && searchBar.guest.length > 0) {
          return searchBar.guest
        } else {
          // ?????????????????????????????????????????????????????????????????????????????????
          return []
        }
      }
      return guest;
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

                const SearchBarSelectTabNumber = 'guest';

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
          <div className={s.listType}
            onClick={() => { this.props.history.push(`/customers/reservations`); }}
          >
            ????????????
          </div>
          <div className={s.listType}
            onClick={() => { this.props.history.push(`/customers/rooms`); }}
          >
            ????????????
          </div>
          <div className={s.listTypeActive}>
            ???????????????????????????
          </div>
        </div>

        {/* ??????????????????????????? */}
        <div className={s.listTableContainer}>
          <table>
            <thead>
              <tr>
                <td style={{ width: 440 }}>?????????</td>
                <td style={{ width: 120 }}>??????</td>
                <td style={{ width: 120 }}>??????</td>
                <td style={{ width: 250 }}>?????????</td>
                <td>??????</td>
                <td style={{ width: 120 }}></td>
              </tr>
            </thead>

            <tbody>
              {/* ????????????????????? */}
              <tr className={`${this.state.guest.length > 0 ? 'd-none' : 'fadeIn'}`}>
                <td colspan="6" className={s.noInfo}>
                  ?????????????????????????????????
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
                        this.props.history.push(`/guest/detail/${customerRecord.guest_id}`)
                      }}
                    >
                      {customerRecord.name}, {customerRecord.name_kana}
                      {customerRecord.face_id_azure && <label className={s.faceLabel}>Face</label>}
                    </td>

                    {/* ?????? */}
                    <td>{customerRecord.age || "-"}</td>

                    {/* ?????? */}
                    <td>
                      {(() => {
                        const gender = optionModel.filter((option) => {
                          return option.value === customerRecord.gender;
                        });

                        return gender && gender.length > 0 ? gender[0].label : '-'
                      })()}
                    </td>

                    {/* ????????? */}
                    {customerRecord.phone_number ?
                      <td className='text-left'>{customerRecord.phone_number}</td> :
                      <td className='text-center'>-</td>
                    }

                    {/* ?????? */}
                    {customerRecord.home_address ?
                      <td className='text-left'>{customerRecord.home_address}</td> :
                      <td className='text-center'>-</td>
                    }

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

                  {/* ??????????????????????????? ?????? */}
                  <tr className={`${this.checkRecordEditing(index) ? `${s.active} fadeIn` : 'd-none'}`}>
                    {/* ????????? */}
                    <td className={s.name}>
                      <input
                        className={s.kanji}
                        name="name"
                        placeholder='?????????'
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
                        placeholder='?????????(??????)'
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

                    {/* ?????? */}
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
                        <SelectHundred />
                      </select>
                    </td>

                    {/* ?????? */}
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

                    {/* ????????? */}
                    <td>
                      <input
                        className='text-left'
                        name="phone_number"
                        placeholder='?????????'
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

                    {/* ?????? */}
                    <td>
                      <input
                        className='text-left'
                        name="home_address"
                        placeholder='??????'
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
                                deleteType: 'guest',
                                guest_id: customerRecord.guest_id
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
              ))
              }

              {/* ??????????????????????????? ?????? */}
              <tr className={`${this.state.addingNewGuestRecord ? `${s.active} fadeIn` : 'd-none'}`}>
                {/* ????????? */}
                <td className={s.name}>
                  <input
                    className={s.kanji}
                    name="name"
                    placeholder='?????????'
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
                    placeholder='?????????(??????)'
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

                {/* ?????? */}
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
                    <SelectHundred />
                  </select>
                </td>

                {/* ?????? */}
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

                {/* ????????? */}
                <td>
                  <input
                    className='text-left'
                    name="number_of_rooms"
                    placeholder='?????????'
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

                {/* ?????? */}
                <td>
                  <input
                    className='text-left'
                    name="home_address"
                    placeholder='??????'
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

                {/* ????????????????????? */}
                <td className={s.saveButton}>
                  <button onClick={async () => { await this.addGuests() }}>
                    ??????
                  </button>
                </td>
              </tr>
            </tbody >
          </table >
        </div >

        {/* ??????????????? */}
        < div
          className={`${s.addButton} ${this.state.addingNewGuestRecord ? 'd-none' : 'fadeIn'}`}
          onClick={() => {
            this.setState({
              addingNewGuestRecord: true,
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
              }
            });
          }}
        >
          <AiOutlinePlus />??????
        </div >

        {/* ?????????????????? */}
        < div
          className={`${s.closeButton} ${this.state.addingNewGuestRecord ? 'fadeIn' : 'd-none'}`}
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
                    {this.state.newGuestModel.name,
                      this.state.newGuestModel.name_kana}
                  </span>
                </li>
              </ul>

              <div className={p.buttonContainer}>
                <button
                  onClick={async () => {
                    await this.addGuests({
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

export default CustomersOthers;
