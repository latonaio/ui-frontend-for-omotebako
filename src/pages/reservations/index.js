import React from "react";
import Layout from "../../components/Layout";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { postFetch, putFetch } from "../../util/api";
import s from "../../scss/pages/ListPage.module.scss";
import p from "../../scss/components/Popup.module.scss";
import StatusBar2 from "../../components/StatusBar2";
import SearchBar from "../../components/SearchBar";
import SelectHundred from "../../components/Select";
import RequestRedisManager from "../../util/requestRedisManager";
import config from '../../util/config'
import * as formModel from '../../util/formModel'
import queryString from '../../util/queryString';
import DatePicker2 from '../../components/DatePicker2';
import { formatDateWithTime } from "../../helper/date";

const {
  newGuestModel,
  reservationModel,
  optionModel,
  checkinModel,
  couponModel,
  paymentStatusModel,
  paymentMethodModel,
  hasChildModel,
} = formModel.default;

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;

class Reservations extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      guestId: null, // ゲスト単体の予約情報取得の場合はguestIdをセット
      reservationRecordModel: [],
      currentPagination: 1,
      editFlag: {
        page: 1,
        recordNumber: 1,
        editing: false
      },
      // エディットページ
      editPager: {
        showFlag: false,
        index: 0,
        reservationType: 'new', // 新規予約かそうでないか
      },
      addingNewRecord: false,
      newReservationModel: {
        reservation_holder: '',
        reservation_holder_kana: '',
        name: '',
        name_kana: '',
        newGuestFlag: 0,
        stay_date_from: '',
        stay_days: 1,
        number_of_guests: 1,
        number_of_guests_male: 0,
        number_of_guests_female: 1,
        has_child: 0,
        number_of_rooms: 1,
        gender: 1,
        age: '-',
        reservationMethodName: 1,
        isCheckin: 0,
        coupon: 0,
        payment_status: 0,
        payment_method: 0,
        phone_number: '',
        home_address: ''
      },
      copyGuestInfo: {
      },
      searchBar: {
        reservationRecordModel: [],
      },
      popupStatus: {
        show: false,
        showDuplicateModal: false,
        showValidationModal: false,
        data: {}
      },
      validation: {
        reservationHolderError: false,
        reservationHolderKanaError: false,
        nameError: false,
        nameKanaError: false,
        stayDateFromError: false,
        stayDaysError: false,
        numberOfGuestsError: false,
        numberOfGuestsTotalError: false,
        numberOfGuestsTotalErrorEdit: false,
        numberOfRoomsError: false,
      },
      queryParams: {
        guestId: null,
        from: null
      },
      availableEditing: false
    };
    this.requestRedisManager = null;
    this.SearchBarRef = React.createRef();
  }

  async componentWillMount() {
    const parsedQuery = queryString.getQueryStrings(this.props.location.search) || {};

    await this.createRequestRedisManager({
      guestId: parsedQuery.guestId
    });

    // 戻るボタンように値をセット
    if (parsedQuery.from) {
      this.setState({
        queryParams: {
          ...this.state.queryParams,
          guestId: parsedQuery.guestId,
          from: parsedQuery.from,
        },
      })

      // チェックインから来た場合は編集機能を無効にする
      this.setState({
        availableEditing: false
      })
    } else {
      this.setState({
        availableEditing: true
      })
    }
  }

  async componentWillUnmount() {
    if (this.requestRedisManager) {
      this.requestRedisManager.io.close();
    }
  }

  async resetInputSearch() {
    // 検索バーのリストを初期化
    if (this.SearchBarRef?.current?.onResetInputSearch) {
      this.SearchBarRef.current.onResetInputSearch();
    }
  }

  async createRequestRedisManager(params = {}) {
    if (!this.requestRedisManager) {
      this.requestRedisManager = new RequestRedisManager(RequestRedisManagerAPIURL);

      // パラメーターでguestIdが渡ってくれば予約単体
      if (params.guestId) {
        this.requestRedisManager.io.on('getReservations', async (data) => {
          await this.setReservation(data);
          await this.resetInputSearch();
        });

        this.requestRedisManager.io.emit('getReservations', JSON.stringify({
          guest_id: parseInt(params.guestId)
        }));
      } else {
        this.requestRedisManager.io.on('getReservations', async (data) => {
          await this.setReservation(data);
          await this.resetInputSearch();
        });

        this.requestRedisManager.io.emit('getReservations');
      }
    }
  }

  setReservation = async (result) => {
    try {
      this.setState({
        reservationRecordModel: [
          ...result
        ]
      });
    } catch (e) {
      console.error("=== SET RESERVATION ERROR ===", e);
    }
  }

  saveReservationInfoCombine = async (data) => {
    // 予約情報をそのまま
    const sendValueData = () => {
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        return this.state.searchBar.reservationRecordModel[data.listIndex]
      } else {
        return this.state.reservationRecordModel[data.listIndex];
      }
    }

    const sendReservationId = () => {
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        return this.state.searchBar.reservationRecordModel[data.listIndex]['reservation_id']
      } else {
        return this.state.reservationRecordModel[data.listIndex]['reservation_id'];
      }
    }

    this.requestRedisManager.io.emit('editReservationDetailCombine', JSON.stringify({
      reservation_Info: sendValueData(),
      reservation_id: sendReservationId()
    }));
  }

  saveReservationInfo = async (data) => {
    const sendValue = () => {
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        return this.state.searchBar.reservationRecordModel[data.listIndex][data.field]
      } else {
        return this.state.reservationRecordModel[data.listIndex][data.field];
      }
    }

    const sendReservationId = () => {
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        return this.state.searchBar.reservationRecordModel[data.listIndex]['reservation_id']
      } else {
        return this.state.reservationRecordModel[data.listIndex]['reservation_id'];
      }
    }

    this.requestRedisManager.io.emit('editReservationDetail', JSON.stringify({
      ...data,
      value: sendValue(),
      reservation_id: sendReservationId()
    }));
  }

  // 予約情報を編集して更新する
  editReservation = async (reservationID) => {
    try {
      await putFetch.updateReservation(reservationID);

      // setTimeout(() => window.location.reload(), 3000);
      return true;
    } catch (e) {
      console.error("=== EDIT RESERVATION ERROR ===", e);
      throw e;
    }
  };

  // 予約情報を削除して更新する
  deleteReservation = async (data) => {
    this.requestRedisManager.io.emit('deleteReservation', JSON.stringify({
      ...data,
    }));
  }

  // 該当のレコードが編集中かどうかをチェック
  checkRecordEditing = (pageIndex, recordNumber) => {
    return this.state.editFlag.page === pageIndex &&
      this.state.editFlag.recordNumber === recordNumber &&
      this.state.editFlag.editing;
  }

  render() {
    const {
      searchBar,
      newReservationModel
    } = this.state;

    const reservationRender = () => {

      if (!this.SearchBarRef.current) {
        return [];
      }

      if (this.SearchBarRef && this.SearchBarRef.current.state.stringValue.length > 0) {
        if (this.state.searchBar.reservationRecordModel.length > 0) {
          return this.state.searchBar.reservationRecordModel;
        } else {
          return [];
        }
      }

      return this.state.reservationRecordModel;
    }

    return (
      <Layout navType='reservations'>
        <StatusBar2 icon='calendar' text='予約情報を照会しています。'
          right={
            <SearchBar
              isDisappear={`${(!!this.state.queryParams.from)}`}
              ref={this.SearchBarRef}
              placeholder="検索文字を入力してください"
              type={'reservation'}
              modelData={this.state.reservationRecordModel}
              onChangeInputSearchBar={(e) => {
                if (this.state.editPager.showFlag) {
                  this.setState({
                    editPager: {
                      ...this.state.editPager,
                      showFlag: false,
                    }
                  })
                }

                this.setState({
                  editFlag: {
                    ...this.state.editFlag,
                    editing: false
                  }
                })

                this.setState({
                  searchBar: {
                    ...this.state.searchBar,
                    reservationRecordModel: e
                  }
                })
              }}
            />
          }
        />

        <div className={`${s.listTableContainer} ${s.reservations}`}>
          {/* 予約リスト 1/3 */}
          <table className={`${this.state.currentPagination === 1 ? 'fadeIn' : 'd-none'}`}>
            <thead>
              <tr>
                <td style={{ width: 440 }}>予約者名</td>
                <td style={{ width: 440 }}>宿泊者名</td>
                <td style={{ width: 110 }}>性別</td>
                <td style={{ width: 200 }}>宿泊予定日</td>
                <td>泊数/<br />人数</td>
                <td>男性/<br />女性</td>
                <td style={{ width: 120 }}></td>
              </tr>
            </thead>

            <tbody>
              {/* 予約情報未登録 */}
              <tr className={`${this.state.reservationRecordModel.length > 0 ? 'd-none' : 'fadeIn'}`}>
                <td colspan="7" className={s.noInfo}>
                  {(() => {
                    if (queryString.getQueryStrings(this.props.location.search)) {
                      return '予約者を表示しています'
                    }
                    return '現在は宿泊者がいません'
                  })()}
                </td>
              </tr>

              {reservationRender().length > 0 && reservationRender().map((reservationRecord, index) => (
                <>
                  {/* 予約リスト 一覧 1/3 */}
                  <tr className={`${this.checkRecordEditing(1, index) ? 'd-none' : 'fadeIn'}`}>
                    {/* 予約者名 */}
                    <td
                      className={s.name}
                      onClick={() => {
                        this.props.history.push(`/reservation/detail/${reservationRecord.reservation_id}`)
                      }}
                    >
                      {reservationRecord.reservation_holder || '-'}, {reservationRecord.reservation_holder_kana}
                    </td>

                    {/* 宿泊者名 */}
                    <td className='text-left'>
                      {reservationRecord.name}, {reservationRecord.name_kana}
                      {reservationRecord.face_id_azure && <label className='faceLabel'>Face</label>}
                    </td>

                    {/* 性別 */}
                    <td>
                      {(() => {
                        const gender = optionModel.filter((option) => {
                          return option.value === reservationRecord.gender;
                        });

                        return gender && gender.length > 0 ? gender[0].label : '-'
                      })()}
                    </td>

                    {/* 宿泊予定日 */}
                    <td>{formatDateWithTime(reservationRecord.stay_date_from)}</td>

                    {/* 泊数 / 人数 */}
                    <td>{`${reservationRecord.stay_days || '-'} / ${reservationRecord.number_of_guests || '-'}`}</td>

                    {/* 男性 / 女性 */}
                    <td>
                      {reservationRecord.number_of_guests_male}
                          &nbsp;/&nbsp;
                          {reservationRecord.number_of_guests_female}
                    </td>

                    {/* 編集ボタン */}
                    <td className={s.editButton}>
                      <button
                        onClick={() => {
                          this.setState({
                            addingNewRecord: false,
                            editFlag: {
                              ...this.state.editFlag,
                              page: 1,
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

                  {/* 予約リスト 編集 1/3 */}
                  <tr className={`${this.checkRecordEditing(1, index) ? `${s.active} fadeIn` : 'd-none'}`}>
                    {/* 予約者名 */}
                    <td className={s.name}>
                      <input
                        className={s.kanji}
                        name="reservation_holder"
                        value={
                          `${reservationRecord.reservation_holder || ''}`
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservation_holder
                              ];

                              reservationRecordModel[index].reservation_holder = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].reservation_holder = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
                            field: 'reservation_holder',
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

                            await this.saveReservationInfo({
                              field: 'reservation_holder',
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
                        name="reservation_holder_kana"
                        value={
                          `${reservationRecord.reservation_holder_kana || ''}`
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservation_holder_kana
                              ];

                              reservationRecordModel[index].reservation_holder_kana = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].reservation_holder_kana = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
                            field: 'reservation_holder_kana',
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

                            await this.saveReservationInfo({
                              field: 'reservation_holder_kana',
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
                    </td>

                    {/* 宿泊者名 */}
                    <td className={s.name}>
                      <input
                        className={s.kanji}
                        name="name"
                        value={
                          `${reservationRecord.name || ''}`
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.name
                              ];

                              reservationRecordModel[index].name = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].name = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
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

                            await this.saveReservationInfo({
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
                        value={
                          `${reservationRecord.name_kana || ''}`
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.name_kana
                              ];

                              reservationRecordModel[index].name_kana = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].name_kana = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
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

                            await this.saveReservationInfo({
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
                          }
                        }}
                      />
                    </td>

                    {/* 性別 */}
                    <td>
                      <select
                        name="gender"
                        value={reservationRecord.gender}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].gender = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })

                              await this.saveReservationInfo({
                                field: 'gender',
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
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].gender = parseInt(event.target.value);
                            this.setState(reservationRecordModel);

                            await this.saveReservationInfo({
                              field: 'gender',
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
                      >
                        {
                          (() => {
                            return optionModel.map((option, index) => (
                              <option
                                value={option.value}
                                selected={
                                  reservationRecord.gender === option.value
                                }
                              >
                                { option.label}
                              </option>
                            ))
                          })()
                        }
                      </select>
                    </td>

                    {/* 宿泊予定日 */}
                    <td>
                      <DatePicker2
                        reservationDate={
                          (() => {
                            const value = reservationRecord.stay_date_from || "-";
                            return value
                          })()
                        }
                        onChange={async (date) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].stay_date_from = date;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].stay_date_from = date;
                            this.setState(reservationRecordModel);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
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
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            await this.saveReservationInfo({
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
                          }
                        }}
                        onCalendarClose={async () => {
                          await this.saveReservationInfo({
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

                    {/* 泊数 / 人数 */}
                    <td className={s.twins}>
                      <select
                        name="stay_days"
                        value={reservationRecord.stay_days || ''}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (Number(event.target.value) > -1) {
                            if (this.SearchBarRef.current.state.stringValue.length > 0) {
                              if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                                reservationRecordModel = [
                                  ...this.state.searchBar.reservationRecordModel
                                ];

                                reservationRecordModel[index].stay_days = Number(event.target.value);

                                this.setState({
                                  searchBar: {
                                    ...this.state.searchBar,
                                    reservationRecordModel: reservationRecordModel
                                  }
                                })
                              }
                            } else {
                              reservationRecordModel = [
                                ...this.state.reservationRecordModel
                              ];

                              reservationRecordModel[index].stay_days = Number(event.target.value);
                              this.setState(reservationRecordModel);
                            }
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
                            field: 'stay_days',
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

                            await this.saveReservationInfo({
                              field: 'stay_days',
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
                      >
                        <SelectHundred />
                      </select>

                      <select
                        name="number_of_guests"
                        value={reservationRecord.number_of_guests || ''}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (Number(event.target.value) > -1) {
                            if (this.SearchBarRef.current.state.stringValue.length > 0) {
                              if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                                reservationRecordModel = [
                                  ...this.state.searchBar.reservationRecordModel
                                ];

                                reservationRecordModel[index].number_of_guests = Number(event.target.value);

                                // 人数の合計数をその時に選択されている性別に合わせて男性もしくは女性に初期値を入れる
                                if (reservationRecordModel[index].gender === 2) {
                                  reservationRecordModel[index].number_of_guests_male = reservationRecordModel[index].number_of_guests
                                  reservationRecordModel[index].number_of_guests_female = 0
                                } else {
                                  reservationRecordModel[index].number_of_guests_female = reservationRecordModel[index].number_of_guests
                                  reservationRecordModel[index].number_of_guests_male = 0
                                }

                                this.setState({
                                  searchBar: {
                                    ...this.state.searchBar,
                                    reservationRecordModel: reservationRecordModel
                                  }
                                })
                              }
                            } else {
                              reservationRecordModel = [
                                ...this.state.reservationRecordModel
                              ];

                              reservationRecordModel[index].number_of_guests = Number(event.target.value);

                              // 人数の合計数をその時に選択されている性別に合わせて男性もしくは女性に初期値を入れる
                              if (reservationRecordModel[index].gender === 2) {
                                reservationRecordModel[index].number_of_guests_male = reservationRecordModel[index].number_of_guests
                                reservationRecordModel[index].number_of_guests_female = 0
                              } else {
                                reservationRecordModel[index].number_of_guests_female = reservationRecordModel[index].number_of_guests
                                reservationRecordModel[index].number_of_guests_male = 0
                              }

                              this.setState(reservationRecordModel);
                            }
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
                            field: 'number_of_guests',
                            listIndex: index,
                          })
                          await this.saveReservationInfo({
                            field: 'number_of_guests_male',
                            listIndex: index,
                          })
                          await this.saveReservationInfo({
                            field: 'number_of_guests_female',
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

                            await this.saveReservationInfo({
                              field: 'number_of_guests',
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
                      >
                        <SelectHundred />
                      </select>
                    </td>

                    {/* 男性 / 女性 */}
                    <td className={s.twins}>
                      <select
                        name="number_of_guests_male"
                        value={
                          `${reservationRecord.number_of_guests_male || ''}`
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].number_of_guests_male = Number(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].number_of_guests_male = Number(event.target.value);
                            this.setState(reservationRecordModel);
                          }
                        }}
                        onBlur={async (event) => {
                          if (reservationRecord.number_of_guests !==
                            (reservationRecord.number_of_guests_male +
                              reservationRecord.number_of_guests_female)
                            || reservationRecord.gender === 2 && reservationRecord.number_of_guests_male === 0
                            || reservationRecord.gender === 1 && reservationRecord.number_of_guests_female === 0
                          ) {
                            this.setState({
                              validation: {
                                numberOfGuestsTotalErrorEdit: true,
                              },
                              popupStatus: {
                                showValidationModal: true,
                              }
                            })
                          } else {
                            await this.saveReservationInfo({
                              field: 'number_of_guests_male',
                              listIndex: index,
                            })
                            await this.saveReservationInfo({
                              field: 'number_of_guests_female',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                page: this.state.currentPagination,
                                recordNumber: index,
                                editing: false
                              },
                              validation: {
                                numberOfGuestsTotalErrorEdit: false,
                              },
                              popupStatus: {
                                showValidationModal: false,
                              }
                            })
                          }
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }
                            if (reservationRecord.number_of_guests !==
                              (reservationRecord.number_of_guests_male +
                                reservationRecord.number_of_guests_female)
                              || reservationRecord.gender === 2 && reservationRecord.number_of_guests_male === 0
                              || reservationRecord.gender === 1 && reservationRecord.number_of_guests_female === 0
                            ) {
                              this.setState({
                                validation: {
                                  numberOfGuestsTotalErrorEdit: true,
                                },
                                popupStatus: {
                                  showValidationModal: true,
                                }
                              })
                            } else {
                              await this.saveReservationInfo({
                                field: 'number_of_guests_male',
                                listIndex: index,
                              })
                              await this.saveReservationInfo({
                                field: 'number_of_guests_female',
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
                          }
                        }}
                      >
                        <SelectHundred />
                      </select>

                      <select
                        name="number_of_guests_female"
                        value={
                          `${reservationRecord.number_of_guests_female || ''}`
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].number_of_guests_female = Number(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].number_of_guests_female = Number(event.target.value);
                            this.setState(reservationRecordModel);
                          }
                        }}
                        onBlur={async (event) => {
                          if (reservationRecord.number_of_guests !==
                            (reservationRecord.number_of_guests_male +
                              reservationRecord.number_of_guests_female)
                            || reservationRecord.gender === 2 && reservationRecord.number_of_guests_male === 0
                            || reservationRecord.gender === 1 && reservationRecord.number_of_guests_female === 0
                          ) {
                            this.setState({
                              validation: {
                                numberOfGuestsTotalErrorEdit: true,
                              },
                              popupStatus: {
                                showValidationModal: true,
                              }
                            })
                          } else {
                            await this.saveReservationInfo({
                              field: 'number_of_guests_male',
                              listIndex: index,
                            })
                            await this.saveReservationInfo({
                              field: 'number_of_guests_female',
                              listIndex: index,
                            })

                            this.setState({
                              editFlag: {
                                ...this.state.editFlag,
                                page: this.state.currentPagination,
                                recordNumber: index,
                                editing: false
                              },
                              validation: {
                                numberOfGuestsTotalErrorEdit: false,
                              },
                              popupStatus: {
                                showValidationModal: false,
                              }
                            })
                          }
                        }}
                        onKeyDown={async (event) => {
                          if (event.key === 'Enter') {
                            if (event.nativeEvent.isComposing) {
                              return;
                            }

                            if (reservationRecord.number_of_guests !==
                              (reservationRecord.number_of_guests_male +
                                reservationRecord.number_of_guests_female)
                              || reservationRecord.gender === 2 && reservationRecord.number_of_guests_male === 0
                              || reservationRecord.gender === 1 && reservationRecord.number_of_guests_female === 0
                            ) {
                              this.setState({
                                validation: {
                                  numberOfGuestsTotalErrorEdit: true,
                                },
                                popupStatus: {
                                  showValidationModal: true,
                                }
                              })
                            } else {
                              await this.saveReservationInfo({
                                field: 'number_of_guests_male',
                                listIndex: index,
                              })
                              await this.saveReservationInfo({
                                field: 'number_of_guests_female',
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
                          }
                        }}
                      >
                        <SelectHundred />
                      </select>
                    </td>

                    {/* 削除ボタン */}
                    <td className={s.deleteButton}>
                      <button
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              page: 1,
                              recordNumber: index,
                              editing: false
                            }
                          })

                          this.setState({
                            popupStatus: {
                              show: true,
                              data: {
                                reservation_id: reservationRecord.reservation_id
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
            </tbody>
          </table>

          {/* 予約リスト 2/3 */}
          <table className={`${this.state.currentPagination === 2 ? 'fadeIn' : 'd-none'}`}>
            <thead>
              <tr>
                <td style={{ width: 400 }}>宿泊者名</td>
                <td>部屋数</td>
                <td style={{ width: 200 }}>チェックイン</td>
                <td style={{ width: 140 }}>新規/既存</td>
                <td style={{ width: 200 }}>予約経路</td>
                <td style={{ width: 100 }}>クーポン</td>
                <td>決済</td>
                <td style={{ width: 200 }}>支払い方法</td>
                <td style={{ width: 120 }}></td>
              </tr>
            </thead>

            <tbody>
              {reservationRender().map((reservationRecord, index) => (
                <>
                  {/* 予約リスト 一覧 2/3 */}
                  <tr className={`${this.checkRecordEditing(2, index) ? 'd-none' : 'fadeIn'}`}>
                    {/* 宿泊者名 */}
                    <td
                      className={s.name}
                      onClick={() => {
                        this.props.history.push(`/reservation/detail/${reservationRecord.reservation_id}`)
                      }}
                    >
                      {reservationRecord.name || "未登録"} ,
                          {reservationRecord.name_kana || "未登録"}
                      {reservationRecord.face_id_azure && <label className='faceLabel'>Face</label>}
                    </td>

                    {/* 部屋数 */}
                    <td>{reservationRecord.number_of_rooms || '-'}</td>

                    {/* チェックイン */}
                    <td>
                      {(() => {
                        const checkin = checkinModel.filter((option) => {
                          return option.value === reservationRecord.is_checkin;
                        });

                        return checkin[0].label
                      })()}
                    </td>

                    {/* 新規 / 既存 */}
                    <td>
                      {(() => {
                        const newGuestFlag = newGuestModel.filter((option) => {
                          return option.value === reservationRecord.new_guest_flag;
                        });

                        return newGuestFlag.length > 0 && newGuestFlag[0].label
                      })()}
                    </td>

                    {/* 予約経路 */}
                    <td>
                      {(() => {
                        const reservation = reservationModel.filter((reservation) => {
                          return reservation.value === reservationRecord.reservation_method;
                        });

                        return reservation.length > 0 && reservation[0].label;
                      })()}
                    </td>

                    {/* クーポン */}
                    <td>
                      {(() => {
                        const coupon = couponModel.filter((option) => {
                          return option.value === reservationRecord.coupon;
                        });

                        return coupon[0].label
                      })()}
                    </td>

                    {/* 決済 */}
                    <td>
                      {(() => {
                        const payment = paymentStatusModel.filter((option) => {
                          return option.value === reservationRecord.payment_status;
                        });

                        return payment[0].label
                      })()}
                    </td>

                    {/* 支払い方法 */}
                    <td>
                      {(() => {
                        const paymentMethod = paymentMethodModel.filter((option) => {
                          return option.value === reservationRecord.payment_method;
                        });

                        return paymentMethod[0].label
                      })()}
                    </td>

                    {/* 編集ボタン */}
                    <td className={s.editButton}>
                      <button
                        onClick={() =>
                          this.setState({
                            addingNewRecord: false,
                            editFlag: {
                              ...this.state.editFlag,
                              page: 2,
                              recordNumber: index,
                              editing: true
                            }
                          })
                        }
                      >
                        編集
                          </button>
                    </td>
                  </tr>

                  {/* 予約リスト 編集 2/3 */}
                  <tr className={`${this.checkRecordEditing(2, index) ? `${s.active} fadeIn` : 'd-none'}`}>
                    {/* 宿泊者名 */}
                    <td className={s.name}>
                      {reservationRecord.name || "未登録"} ,
                          {reservationRecord.name_kana || "未登録"}
                      {reservationRecord.face_id_azure && <label className={s.faceLabel}>Face</label>}
                    </td>

                    {/* 部屋数 */}
                    <td>
                      <select
                        name="number_of_rooms"
                        value={reservationRecord.number_of_rooms || ''}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (Number(event.target.value) > -1) {
                            if (this.SearchBarRef.current.state.stringValue.length > 0) {
                              if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                                reservationRecordModel = [
                                  ...this.state.searchBar.reservationRecordModel
                                ];

                                reservationRecordModel[index].number_of_rooms = Number(event.target.value);

                                this.setState({
                                  searchBar: {
                                    ...this.state.searchBar,
                                    reservationRecordModel: reservationRecordModel
                                  }
                                })
                              }
                            } else {
                              reservationRecordModel = [
                                ...this.state.reservationRecordModel
                              ];

                              reservationRecordModel[index].number_of_rooms = Number(event.target.value);
                              this.setState(reservationRecordModel);
                            }
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
                            field: 'number_of_rooms',
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

                            await this.saveReservationInfo({
                              field: 'number_of_rooms',
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
                      >
                        <SelectHundred />
                      </select>
                    </td>

                    {/* チェックイン */}
                    <td>
                      <select
                        name="is_checkin"
                        value={reservationRecord.is_checkin}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].is_checkin = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })

                              await this.saveReservationInfo({
                                field: 'is_checkin',
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
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].is_checkin = parseInt(event.target.value);
                            this.setState(reservationRecordModel);

                            await this.saveReservationInfo({
                              field: 'is_checkin',
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
                      >
                        {
                          checkinModel.map((option, index) => (
                            <option
                              value={option.value}
                              selected={
                                reservationRecord.is_checkin === option.value
                              }
                            >
                              { option.label}
                            </option>
                          ))
                        }
                      </select>
                    </td>

                    {/* 新規 / 既存 */}
                    <td>
                      <select
                        name="new_guest_flag"
                        value={reservationRecord.new_guest_flag}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].new_guest_flag = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })

                              await this.saveReservationInfo({
                                field: 'new_guest_flag',
                                listIndex: index,
                              });

                              this.setState({
                                editFlag: {
                                  ...this.state.editFlag,
                                  page: this.state.currentPagination,
                                  recordNumber: index,
                                  editing: false
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].new_guest_flag = parseInt(event.target.value);
                            this.setState(reservationRecordModel);

                            await this.saveReservationInfo({
                              field: 'new_guest_flag',
                              listIndex: index,
                            });

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
                      >
                        {
                          newGuestModel.map((option) => (
                            <option
                              value={option.value}
                              selected={
                                reservationRecord.new_guest_flag === option.value
                              }
                            >
                              { option.label}
                            </option>
                          ))
                        }
                      </select>
                    </td>

                    {/* 予約経路 */}
                    <td>
                      <select
                        name="reservation_method_name"
                        value={reservationRecord.reservation_method}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].reservation_method = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })

                              await this.saveReservationInfo({
                                field: 'reservation_method',
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
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].reservation_method = parseInt(event.target.value);
                            this.setState(reservationRecordModel);

                            await this.saveReservationInfo({
                              field: 'reservation_method',
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
                      >
                        {
                          (() => {
                            return reservationModel.map((reservation, index) => (
                              <option
                                value={reservation.value}
                                selected={
                                  reservationRecord.reservation_method === reservation.value
                                }
                              >
                                { reservation.label}
                              </option>
                            ))
                          })()
                        }
                      </select>
                    </td>

                    {/* クーポン */}
                    <td>
                      <select
                        name="coupon"
                        value={reservationRecord.coupon}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].coupon = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })

                              await this.saveReservationInfo({
                                field: 'coupon',
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
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].coupon = parseInt(event.target.value);
                            this.setState(reservationRecordModel);

                            await this.saveReservationInfo({
                              field: 'coupon',
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
                      >
                        {
                          couponModel.map((option) => (
                            <option
                              value={option.value}
                              selected={
                                reservationRecord.coupon === option.value
                              }
                            >
                              { option.label}
                            </option>
                          ))
                        }
                      </select>
                    </td>

                    {/* 決済 */}
                    <td>
                      <select
                        name="payment_status"
                        value={reservationRecord.payment_status}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].payment_status = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })

                              await this.saveReservationInfo({
                                field: 'payment_status',
                                listIndex: index,
                              });

                              this.setState({
                                editFlag: {
                                  ...this.state.editFlag,
                                  page: this.state.currentPagination,
                                  recordNumber: index,
                                  editing: false
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].payment_status = parseInt(event.target.value);
                            this.setState(reservationRecordModel);

                            await this.saveReservationInfo({
                              field: 'payment_status',
                              listIndex: index,
                            });

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
                      >
                        {
                          paymentStatusModel.map((option, index) => (
                            <option
                              value={option.value}
                              selected={
                                reservationRecord.payment_status === option.value
                              }
                            >
                              { option.label}
                            </option>
                          ))
                        }
                      </select>
                    </td>

                    {/* 支払い方法 */}
                    <td>
                      <select
                        name="payment_method"
                        value={reservationRecord.payment_method}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].payment_method = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })

                              await this.saveReservationInfo({
                                field: 'payment_method',
                                listIndex: index,
                              });

                              this.setState({
                                editFlag: {
                                  ...this.state.editFlag,
                                  page: this.state.currentPagination,
                                  recordNumber: index,
                                  editing: false
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].payment_method = parseInt(event.target.value);
                            this.setState(reservationRecordModel);

                            await this.saveReservationInfo({
                              field: 'payment_method',
                              listIndex: index,
                            });

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
                      >
                        {
                          paymentMethodModel.map((option, index) => (
                            <option
                              value={option.value}
                              selected={
                                reservationRecord.payment_method === option.value
                              }
                            >
                              { option.label}
                            </option>
                          ))
                        }
                      </select>
                    </td>

                    {/* 削除ボタン */}
                    <td className={s.deleteButton}>
                      <button
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              page: 2,
                              recordNumber: index,
                              editing: false
                            }
                          })

                          this.setState({
                            popupStatus: {
                              show: true,
                              data: {
                                reservation_id: reservationRecord.reservation_id
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
            </tbody>
          </table>

          {/* 予約リスト 3/3 */}
          <table className={`${this.state.currentPagination === 3 ? 'fadeIn' : 'd-none'}`}>
            <thead>
              <tr>
                <td style={{ width: 400 }}>宿泊者名</td>
                <td style={{ width: 120 }}>年齢</td>
                <td style={{ width: 120 }}>子供</td>
                <td style={{ width: 200 }}>連絡先</td>
                <td>住所</td>
                <td style={{ width: 120 }}></td>
              </tr>
            </thead>

            {/* 予約リスト 一覧 3/3 */}
            <tbody>
              {reservationRender().map((reservationRecord, index) => (
                <>
                  <tr className={`${this.checkRecordEditing(3, index) ? 'd-none' : 'fadeIn'}`}>
                    {/* 宿泊者名 */}
                    <td
                      className={s.name}
                      onClick={() => {
                        this.props.history.push(`/reservation/detail/${reservationRecord.reservation_id}`)
                      }}
                    >
                      {reservationRecord.name || "未登録"} ,
                          {reservationRecord.name_kana || "未登録"}
                      {reservationRecord.face_id_azure && <label className='faceLabel'>Face</label>}
                    </td>

                    {/* 年齢 */}
                    <td>{reservationRecord.age || '-'}</td>

                    {/* 子供 */}
                    <td>
                      {(() => {
                        const has_child = hasChildModel.filter((option) => {
                          return option.value === reservationRecord.has_child;
                        });
                        if (has_child[0]) {
                          return has_child[0].label
                        }
                        return "未登録"
                      })()}
                    </td>

                    {/* 連絡先 */}
                    <td className='text-left'>{reservationRecord.phone_number || '-'}</td>

                    {/* 住所 */}
                    <td className='text-left'>{reservationRecord.home_address || '-'}</td>

                    {/* 編集ボタン */}
                    <td className={s.editButton}>
                      <button
                        onClick={() => {
                          this.setState({
                            addingNewRecord: false,
                            editFlag: {
                              ...this.state.editFlag,
                              page: 3,
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

                  {/* 予約リスト 編集 3/3 */}
                  <tr className={`${this.checkRecordEditing(3, index) ? `${s.active} fadeIn` : 'd-none'}`}>
                    {/* 宿泊者名 */}
                    <td className={s.name}>
                      {reservationRecord.name || "未登録"} ,
                          {reservationRecord.name_kana || "未登録"}
                      {reservationRecord.face_id_azure && <label className='faceLabel'>Face</label>}
                    </td>

                    {/* 年齢 */}
                    <td>
                      <select
                        name="age"
                        value={
                          `${reservationRecord.age || '-'}`
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].age = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })

                              await this.saveReservationInfo({
                                field: 'age',
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
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].age = parseInt(event.target.value);
                            this.setState(reservationRecordModel);

                            await this.saveReservationInfo({
                              field: 'age',
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
                      >
                        <SelectHundred />
                      </select>
                    </td>

                    {/* 子供 */}
                    <td>
                      <select
                        name="has_child"
                        value={reservationRecord.has_child}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].has_child = parseInt(event.target.value);

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })

                              await this.saveReservationInfo({
                                field: 'has_child',
                                listIndex: index,
                              });

                              this.setState({
                                editFlag: {
                                  ...this.state.editFlag,
                                  page: this.state.currentPagination,
                                  recordNumber: index,
                                  editing: false
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].has_child = parseInt(event.target.value);
                            this.setState(reservationRecordModel);

                            await this.saveReservationInfo({
                              field: 'has_child',
                              listIndex: index,
                            });

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
                      >
                        {
                          hasChildModel.map((option, index) => (
                            <option
                              value={option.value}
                              selected={
                                reservationRecord.has_child === option.value
                              }
                            >
                              { option.label}
                            </option>
                          ))
                        }
                      </select>
                    </td>

                    {/* 連絡先 */}
                    <td>
                      <input
                        className='text-left'
                        name="phone_number"
                        placeholder='連絡先'
                        value={
                          `${reservationRecord.phone_number || ''}`
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].phone_number = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].phone_number = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
                            field: 'phone_number',
                            listIndex: index,
                          });

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

                            await this.saveReservationInfo({
                              field: 'phone_number',
                              listIndex: index,
                            });

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
                    </td>

                    {/* 住所 */}
                    <td>
                      <input
                        className='text-left'
                        name="home_address"
                        placeholder='住所'
                        value={
                          `${reservationRecord.home_address || ''}`
                        }
                        onChange={(event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[index].home_address = event.target.value;

                              this.setState({
                                searchBar: {
                                  ...this.state.searchBar,
                                  reservationRecordModel: reservationRecordModel
                                }
                              })
                            }
                          } else {
                            reservationRecordModel = [
                              ...this.state.reservationRecordModel
                            ];

                            reservationRecordModel[index].home_address = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                        onBlur={async (event) => {
                          await this.saveReservationInfo({
                            field: 'home_address',
                            listIndex: index,
                          });

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

                            await this.saveReservationInfo({
                              field: 'home_address',
                              listIndex: index,
                            });

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
                    </td>

                    {/* 削除ボタン */}
                    <td className={s.deleteButton}>
                      <button
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              page: 3,
                              recordNumber: index,
                              editing: false
                            }
                          })

                          this.setState({
                            popupStatus: {
                              show: true,
                              data: {
                                reservation_id: reservationRecord.reservation_id
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
            </tbody>
          </table>
        </div>

        {/* 登録ボタン */}
        <div
          className={s.addButton}
          onClick={() => {
            this.props.history.push('/reservations/register')
          }}
        >
          <AiOutlinePlus />登録
        </div>

        {/* 左側にあるボタン */}
        < div
          className={`${s.arrowLeft} ${this.state.currentPagination === 2
            || this.state.currentPagination === 3 ? 'fadeIn' : 'd-none'}`
          }
          onClick={
            () => {
              this.setState({
                currentPagination: this.state.currentPagination - 1,
              });

              if (this.state.editFlag.editing) {
                this.setState({
                  editFlag: {
                    ...this.state.editFlag,
                    page: this.state.page - 1,
                  }
                })
              }
            }
          }
        />
        {/* 右側にあるボタン */}
        <div
          className={`${s.arrowRight} ${this.state.currentPagination === 1
            || this.state.currentPagination === 2 ? 'fadeIn' : 'd-none'}`}
          onClick={
            () => {
              this.setState({
                currentPagination: this.state.currentPagination + 1
              });

              if (this.state.editFlag.editing) {
                this.setState({
                  editFlag: {
                    ...this.state.editFlag,
                    page: this.state.page + 1,
                  }
                })
              }
            }
          }
        />

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
                <button className={p.gray}>
                  キャンセル
                </button>
                <button
                  className={p.red}
                  onClick={async () => {
                    await this.deleteReservation({
                      reservation_id: this.state.popupStatus.data.reservation_id
                    });
                  }}
                >
                  削除
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
              レコードを追加
                </div>
            <div className={p.container}>
              <div className={p.errorText}>
                下記の項目に重複したレコードがありますが追加しますか？
                  </div>
              <ul className={p.errorList}>
                <li className={p.listItem}>予約者名:&nbsp;
                      <span>
                    {newReservationModel.reservation_holder}, {newReservationModel.reservation_holder_kana} 様
                      </span>
                </li>
                <li className={p.listItem}>宿泊者名:&nbsp;
                      <span>
                    {newReservationModel.name}, {newReservationModel.name_kana} 様
                      </span>
                </li>
                <li className={p.listItem}>宿泊開始日:&nbsp;
                      <span>
                    {newReservationModel.stay_date_from}
                  </span>
                </li>
                <li className={p.listItem}>予約日:&nbsp;
                      <span>
                    {newReservationModel.reservation_date}
                  </span>
                </li>
              </ul>
              <div className={p.buttonContainer}>
                <button
                  onClick={async () => {
                    await this.addReservation({
                      force: true
                    });

                    this.setState({
                      popupStatus: {
                        ...this.state.popupStatus,
                        showDuplicateModal: false
                      }
                    });
                  }}>
                  はい
                    </button>
                <button
                  className={s.red}
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

        {/* 既存顧客が見つからなかった場合のポップアップ */}
        <div
          className={`${!this.state.popupStatus.showNoExistsModal ? 'd-none' : p.popupOverlay}`}
        >
          <div className={p.popup}>
            <div className={p.title}>
              予約登録エラー
                </div>
            <div className={p.container}>
              <div className={p.errorText}>
                既存顧客が見つかりませんでした
                  </div>
              <div className={p.container}>
                <button
                  onClick={() => {
                    this.setState({
                      popupStatus: {
                        ...this.state.popupStatus,
                        showNoExistsModal: false
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

        {/* 既存顧客(名前、年齢一致)が複数名いた場合のポップアップ */}
        <div
          className={`${!this.state.popupStatus.showSameUserExistModal ? 'd-none' : p.popupOverlay}`}
        >
          <div className={p.popup}>
            <div className={p.title}>
              予約登録エラー
                </div>
            <div className={p.container}>
              <div className={p.errorText}>
                既存顧客(名前、年齢一致)のレコードが複数存在します
                  </div>
              <div className={p.buttonContainer}>
                <button
                  onClick={() => {
                    this.setState({
                      popupStatus: {
                        ...this.state.popupStatus,
                        showSameUserExistModal: false
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

        {/* バリデーションエラーのポップアップ */}
        <div
          className={`${!this.state.popupStatus.showValidationModal ? 'd-none' : p.popupOverlay}`}
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

                    if (this.state.validation.reservationHolderError) {
                      errorList.push(
                        `予約者名`
                      )
                    }

                    if (this.state.validation.reservationHolderKanaError) {
                      errorList.push(
                        `予約者名のふりがな`
                      )
                    }

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
                        `宿泊予定日`
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

                    if (this.state.validation.numberOfGuestsTotalError ||
                      this.state.validation.numberOfGuestsTotalErrorEdit) {
                      errorList.push(
                        `男女の合計人数`
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
          </div >
        </div >
      </Layout>
    );
  }
}

export default Reservations;
