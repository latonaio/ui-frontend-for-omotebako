import React from "react";
import Layout from "../components/Layout";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { postFetch, putFetch } from "../util/api";
import s from "../scss/pages/ListPage.module.scss";
import p from "../scss/components/Popup.module.scss";
import StatusBar2 from "../components/StatusBar2";
import SearchBar from "../components/SearchBar";
import RequestRedisManager from "../util/requestRedisManager";
import config from '../util/config'
import * as formModel from '../util/formModel'
import queryString from '../util/queryString';
import DatePicker2 from '../components/DatePicker2';
import { formatDateWithTime } from "../helper/date";

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
    // 更新されたモデルを抽出
    const getReservationRecordModel = (reservationID) => {
      return this.state.reservationRecordModel.filter((data) => {
        if (data.reservation_id === reservationID) {
          return true;
        }
      });
    }

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

    // try {
    //   await deleteFetch(`reservations/${reservationID}`);
    //
    //   await this.getReservation();
    // } catch (e) {
    //   console.error("=== EDIT RESERVATION ERROR ===", e);
    //   throw e;
    // }
  }

  // レコードを追加する
  addReservation = async (option = {}) => {
    try {
      const setStatePromise = (setData) => {
        return new Promise((resolve, reject) => {
          this.setState(setData, () => {
            return resolve();
          })
        });
      }

      const validationCheck = async (newReservationModel) => {
        const {
          reservation_holder,
          reservation_holder_kana,
          name,
          name_kana,
          stay_date_from,
          stay_days,
          gender: guests_gender,
          number_of_guests,
          number_of_guests_male,
          number_of_guests_female,
          number_of_rooms,
        } = newReservationModel;

        // 予約者名
        await setStatePromise({
          validation: {
            ...this.state.validation,
            reservationHolderError: reservation_holder.length <= 0
          }
        });

        // 予約者名のふりがな
        await setStatePromise({
          validation: {
            ...this.state.validation,
            reservationHolderKanaError: reservation_holder_kana.length <= 0
          }
        });

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

        // 男女の合計人数
        const guestsCountsFlag =
          number_of_guests !== number_of_guests_male + number_of_guests_female // 人数の合計が男女の合計と合わない場合
          || (guests_gender === 2 && number_of_guests_male === 0)   // 男性申し込みだが男性がいない場合
          || (guests_gender === 1 && number_of_guests_female === 0) // 女性申し込みだが女性がいない場合

        await setStatePromise({
          validation: {
            ...this.state.validation,
            numberOfGuestsTotalError: guestsCountsFlag
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

      await validationCheck(this.state.newReservationModel);

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

      const newGuestInfoToAdditionalRecord = {
        guest_id: null,
        reservation_holder: this.state.newReservationModel.reservation_holder,
        reservation_holder_kana: this.state.newReservationModel.reservation_holder_kana,
        name: this.state.newReservationModel.name,
        name_kana: this.state.newReservationModel.name_kana,
        new_guest_flag: this.state.newReservationModel.newGuestFlag,
        stay_date_from: this.state.newReservationModel.stay_date_from,
        stay_days: this.state.newReservationModel.stay_days,
        number_of_guests: this.state.newReservationModel.number_of_guests,
        number_of_guests_male: this.state.newReservationModel.number_of_guests_male,
        number_of_guests_female: this.state.newReservationModel.number_of_guests_female,
        has_child: this.state.newReservationModel.has_child,
        number_of_rooms: this.state.newReservationModel.number_of_rooms,
        gender: this.state.newReservationModel.gender,
        age: this.state.newReservationModel.age,
        reservation_method: this.state.newReservationModel.reservationMethodName,
        is_checkin: this.state.newReservationModel.isCheckin,
        coupon: this.state.newReservationModel.coupon,
        payment_status: this.state.newReservationModel.payment_status,
        payment_method: this.state.newReservationModel.payment_method,
        phone_number: this.state.newReservationModel.phone_number,
        home_address: this.state.newReservationModel.home_address
      }

      // 重複したレコードでも登録を許可する場合はforceの値を入れる
      if (option.force) {
        newGuestInfoToAdditionalRecord.force = true;
      }

      try {
        // 予約情報の新規作成に関してはRedisのキー管理が難しいためmysqlに変える
        await postFetch.registerNewReservation(newGuestInfoToAdditionalRecord);

        this.setState({
          newReservationModel: {
            reservation_holder: '',
            reservation_holder_kana: '',
            name: '',
            name_kana: '',
            newGuestFlag: 0,
            stay_date_from: '',
            stay_days: '',
            number_of_guests: 1,
            number_of_guests_male: 0,
            number_of_guests_female: 0,
            has_child: 0,
            number_of_rooms: 0,
            gender: 1,
            age: 0,
            reservationMethodName: 1,
            isCheckin: 0,
            coupon: 0,
            payment_status: 0,
            payment_method: 0,
            phone_number: '',
            home_address: ''
          }
        });

        // postに成功した場合は新規レコード編集を閉じる
        // this.setState({
        //   addingNewRecord: false,
        //   editFlag: {
        //     ...this.state.editFlag,
        //     editing: false
        //   }
        // })

        // 新規登録はmysqlのためgetReservationsを実行
        this.requestRedisManager.io.emit('getReservations');
      } catch (e) {
        if (e.error) {
          // 既存顧客が見つからなかった場合のエラー
          if (e.error.errorDetail === 'cannot found exists guest') {
            this.setState({
              popupStatus: {
                ...this.state.popupStatus,
                showNoExistsModal: true
              }
            });

            return;
          }

          // 既存顧客(名前、年齢一致)が複数名いた場合のエラー
          if (e.error.errorDetail === 'more than 2 same users exist') {
            this.setState({
              popupStatus: {
                ...this.state.popupStatus,
                showSameUserExistModal: true
              }
            });

            return;
          }

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

      // this.requestRedisManager.io.emit('addNewReservation', JSON.stringify({
      //   ...newGuestInfoToAdditionalRecord,
      // }));

      // 予約情報を更新
      // await this.getReservation();
    } catch (e) {
      console.error("=== ADD RESERVATION ERROR ===", e);
      throw e;
    }
  };

  // 該当のレコードが編集中かどうかをチェック
  checkRecordEditing = (pageIndex, recordNumber) => {
    return this.state.editFlag.page === pageIndex &&
      this.state.editFlag.recordNumber === recordNumber &&
      this.state.editFlag.editing;
  }

  render() {
    const { location, navType } = this.props;
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
                <td style={{ width: 200 }}>宿泊日</td>
                <td>泊数/<br />人数</td>
                <td>男性/<br />女性</td>
                <td style={{ width: 120 }}></td>
                {/* <td style={{ width: 50 }}></td>
                    <td style={{ width: 50 }}></td> */}
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

                    {/* 宿泊日 */}
                    <td>{formatDateWithTime(reservationRecord.stay_date_from)}</td>

                    {/* 泊数 / 人数 */}
                    <td>{`${reservationRecord.stay_days || '-'} / ${reservationRecord.number_of_guests || '-'}`}</td>

                    {/* 男性 / 女性 */}
                    <td>
                      {reservationRecord.number_of_guests_male}
                          &nbsp;/&nbsp;
                          {reservationRecord.number_of_guests_female}
                    </td>

                    {/* コピーボタン */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={async () => {
                                this.setState({
                                  copyGuestInfo: {
                                    ...reservationRecord
                                  }
                                });
                              }}
                              icon={faCopy}
                            />
                          )}
                        </td> */}

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

                    {/* エディットページボタン */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={() => {
                                this.setState({
                                  editPager: {
                                    ...this.state.editPager,
                                    showFlag: true,
                                    index,
                                    reservationType: 'exist'
                                  }
                                })
                              }}
                              icon={faPager}
                            />
                          )}
                        </td> */}
                  </tr>

                  {/* 予約リスト 編集 1/3 */}
                  <tr className={`${this.checkRecordEditing(1, index) ? `${s.active} fadeIn` : 'd-none'}`}>
                    {/* 予約者名 */}
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

                    {/* 予約者名 */}
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

                    {/* 宿泊日 */}
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
                        {
                          (() => {
                            const selectStayDays = [];

                            selectStayDays.push({
                              value: 0,
                              label: 0
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
                                  stay_days.value === 0
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
                        {
                          (() => {
                            const selectNumberOfGuests = [];

                            selectNumberOfGuests.push({
                              value: 0,
                              label: 0
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
                                  number_of_guests.value === 0
                                }
                              >
                                { number_of_guests.label}
                              </option>
                            ))
                          })()
                        }
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
                        {
                          (() => {
                            const selectNumberOfGuestsMale = [];

                            selectNumberOfGuestsMale.push({
                              value: 0,
                              label: 0
                            });

                            for (let i = 1; i < 101; i++) {
                              selectNumberOfGuestsMale.push({
                                value: i.toString(),
                                label: i.toString()
                              });
                            }

                            return selectNumberOfGuestsMale.map((number_of_guests_male) => (
                              <option
                                value={number_of_guests_male.value}
                                selected={
                                  number_of_guests_male.value === 0
                                }
                              >
                                { number_of_guests_male.label}
                              </option>
                            ))
                          })()
                        }
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
                        {
                          (() => {
                            const selectNumberOfGuestsFemale = [];

                            selectNumberOfGuestsFemale.push({
                              value: 0,
                              label: 0
                            });

                            for (let i = 1; i < 101; i++) {
                              selectNumberOfGuestsFemale.push({
                                value: i.toString(),
                                label: i.toString()
                              });
                            }

                            return selectNumberOfGuestsFemale.map((number_of_guests_female) => (
                              <option
                                value={number_of_guests_female.value}
                                selected={
                                  number_of_guests_female.value === 0
                                }
                              >
                                { number_of_guests_female.label}
                              </option>
                            ))
                          })()
                        }
                      </select>
                    </td>

                    {/* コピーボタン */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={async () => {
                                this.setState({
                                  copyGuestInfo: {
                                    ...reservationRecord
                                  }
                                });
                              }}
                              icon={faCopy}
                            />
                          )}
                        </td> */}

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

                    {/* 保存ボタン */}
                    {/* {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={async () => {
                                this.setState({
                                  editFlag: {
                                    ...this.state.editFlag,
                                    page: 1,
                                    recordNumber: index,
                                    editing: false
                                  }
                                })

                                await this.editReservation(reservationRecord.reservation_id);
                              }}
                              icon={faSave}
                            />
                          )} */}

                    {/* エディットページボタン */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={() => {
                                this.setState({
                                  editPager: {
                                    ...this.state.editPager,
                                    showFlag: true,
                                    index,
                                    reservationType: 'exist'
                                  }
                                })
                              }}
                              icon={faPager}
                            />
                          )}
                        </td> */}
                  </tr>
                </>
              ))}

              {/* タブ1 新規登録  */}
              <tr className={`${this.state.addingNewRecord ? `${s.active} fadeIn` : 'd-none'}`}>
                {/* 予約者名 */}
                <td className={s.name}>
                  <input
                    className={`${s.kanji} ${this.state.validation.reservationHolderError ? `${s.error}` : ''}`}
                    name="reservation_holder"
                    placeholder='予約者名'
                    value={
                      (() => {
                        return this.state.newReservationModel.reservation_holder;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          reservation_holder: event.target.value
                        }
                      });
                    }}
                  />
                  <input
                    className={`${s.kana} ${this.state.validation.reservationHolderKanaError ? `${s.error}` : ''}`}
                    name="reservation_holder_kana"
                    placeholder='予約者名(かな)'
                    value={
                      (() => {
                        return this.state.newReservationModel.reservation_holder_kana;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          reservation_holder_kana: event.target.value
                        }
                      });
                    }}
                  />
                </td>

                {/* 宿泊者名 */}
                <td className={s.name}>
                  <input
                    className={`${s.kanji} ${this.state.validation.nameError ? `${s.error}` : ''}`}
                    name="name"
                    placeholder='宿泊者名'
                    value={
                      (() => {
                        return this.state.newReservationModel.name;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          name: event.target.value
                        }
                      });
                    }}
                  />
                  <input
                    className={`${s.kana} ${this.state.validation.nameKanaError ? `${s.error}` : ''}`}
                    name="name_kana"
                    placeholder='宿泊者名(かな)'
                    value={
                      (() => {
                        return this.state.newReservationModel.name_kana;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          name_kana: event.target.value
                        }
                      });
                    }}
                  />
                </td>

                {/* 性別 */}
                <td>
                  <select
                    name="gender"
                    value={this.state.newReservationModel.gender}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          gender: Number(event.target.value)
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

                {/* 宿泊日 */}
                <td className={`${this.state.validation.stayDateFromError ? `${s.errorForDatePicker}` : ''}`}>
                  <DatePicker2
                    name="stay_date_from"
                    reservationDate={this.state.newReservationModel.stay_date_from}
                    onChange={(date) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
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

                {/* 泊数 / 人数 */}
                <td className={s.twins}>
                  <select
                    className={`${this.state.validation.stayDaysError ? `${s.error}` : ''}`}
                    name="stay_days"
                    value={this.state.newReservationModel.stay_days || ''}
                    onChange={(event) => {
                      if (Number(event.target.value) > -1) {
                        this.setState({
                          newReservationModel: {
                            ...this.state.newReservationModel,
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
                          value: 0,
                          label: 0
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
                              stay_days.value === 0
                            }
                          >
                            { stay_days.label}
                          </option>
                        ))
                      })()
                    }
                  </select>

                  {/* 人数 */}
                  <select
                    className={`${this.state.validation.numberOfGuestsError ? `${s.error}` : ''}`}
                    name="number_of_guests"
                    value={this.state.newReservationModel.number_of_guests || ''}
                    onChange={(event) => {
                      const numberOfGuestsForGender = {};

                      if (Number(event.target.value) > -1) {
                        if (this.state.newReservationModel.gender === 2) {
                          numberOfGuestsForGender.number_of_guests_male = Number(event.target.value)
                          numberOfGuestsForGender.number_of_guests_female = 0
                        } else {
                          numberOfGuestsForGender.number_of_guests_female = Number(event.target.value)
                          numberOfGuestsForGender.number_of_guests_male = 0
                        }

                        this.setState({
                          newReservationModel: {
                            ...this.state.newReservationModel,
                            number_of_guests: Number(event.target.value),
                            ...numberOfGuestsForGender,
                          }
                        });
                      }
                    }}
                  >
                    {
                      (() => {
                        const selectNumberOfGuests = [];

                        selectNumberOfGuests.push({
                          value: 0,
                          label: 0
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
                              number_of_guests.value === 0
                            }
                          >
                            { number_of_guests.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </td>

                {/* 男性 / 女性 */}
                <td className={s.twins}>
                  <select
                    className={`${this.state.validation.numberOfGuestsTotalError ? `${s.error}` : ''}`}
                    name="number_of_guests_male"
                    value={this.state.newReservationModel.number_of_guests_male}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          number_of_guests_male: Number(event.target.value)
                        }
                      });
                    }}
                  >
                    {
                      (() => {
                        const selectNumberOfGuestsMale = [];

                        selectNumberOfGuestsMale.push({
                          value: 0,
                          label: 0
                        });

                        for (let i = 1; i < 101; i++) {
                          selectNumberOfGuestsMale.push({
                            value: i.toString(),
                            label: i.toString()
                          });
                        }

                        return selectNumberOfGuestsMale.map((number_of_guests_male) => (
                          <option
                            value={number_of_guests_male.value}
                            selected={
                              number_of_guests_male.value === 0
                            }
                          >
                            { number_of_guests_male.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                  <select
                    className={`${this.state.validation.numberOfGuestsTotalError ? `${s.error}` : ''}`}
                    name="number_of_guests_female"
                    value={this.state.newReservationModel.number_of_guests_female}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          number_of_guests_female: Number(event.target.value)
                        }
                      });
                    }}
                  >
                    {
                      (() => {
                        const selectNumberOfGuestsFemale = [];

                        selectNumberOfGuestsFemale.push({
                          value: 0,
                          label: 0
                        });

                        for (let i = 1; i < 101; i++) {
                          selectNumberOfGuestsFemale.push({
                            value: i.toString(),
                            label: i.toString()
                          });
                        }

                        return selectNumberOfGuestsFemale.map((number_of_guests_female) => (
                          <option
                            value={number_of_guests_female.value}
                            selected={
                              number_of_guests_female.value === 0
                            }
                          >
                            { number_of_guests_female.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </td>

                {/* ペーストボタン */}
                {/* <td>
                      <FontAwesomeIcon
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              editing: false
                            }
                          })

                          this.setState({
                            newReservationModel: {
                              ...this.state.newReservationModel,
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
                        editFlag: {
                          ...this.state.editFlag,
                          editing: false
                        }
                      })

                      await this.addReservation();
                    }}
                  >
                    保存
                      </button>
                </td>

                {/* 編集画面 */}
                {/* <td>
                      <FontAwesomeIcon
                        onClick={async () => {
                          this.setState({
                            editPager: {
                              ...this.state.editPager,
                              showFlag: true,
                              reservationType: 'new'
                            }
                          })
                        }}
                        icon={faPager}
                      />
                    </td> */}
              </tr>
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
                {/* <td style={{ width: 50 }}></td>
                    <td style={{ width: 50 }}></td> */}
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

                    {/* コピーボタン */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={async () => {
                                this.setState({
                                  copyGuestInfo: {
                                    ...reservationRecord
                                  }
                                });
                              }}
                              icon={faCopy}
                            />
                          )}
                        </td> */}

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

                    {/* エディットページボタン */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={() => {
                                this.setState({
                                  editPager: {
                                    ...this.state.editPager,
                                    showFlag: true,
                                    index,
                                    reservationType: 'exist'
                                  }
                                })
                              }}
                              icon={faPager}
                            />
                          )}
                        </td> */}
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
                        {
                          (() => {
                            const selectNumberOfRooms = [];

                            selectNumberOfRooms.push({
                              value: '-',
                              label: '-'
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
                                  number_of_rooms.value === (reservationRecord.number_of_rooms || '-')
                                }
                              >
                                {number_of_rooms.label}
                              </option>
                            ))
                          })()
                        }
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

                    {/* コピーボタン */}
                    {/* <td>
                          <FontAwesomeIcon
                            onClick={async () => {
                              this.setState({
                                copyGuestInfo: {
                                  ...reservationRecord
                                }
                              });
                            }}
                            icon={faCopy}
                          />
                        </td> */}

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

                    {/* エディットページボタン */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={() => {
                                this.setState({
                                  editPager: {
                                    ...this.state.editPager,
                                    showFlag: true,
                                    index,
                                    reservationType: 'exist'
                                  }
                                })
                              }}
                              icon={faPager}
                            />
                          )}
                        </td> */}
                  </tr>
                </>
              ))}

              {/* タブ2 新規登録 */}
              <tr className={`${this.state.addingNewRecord ? `${s.active} fadeIn` : 'd-none'}`}>
                {/* 宿泊者名 */}
                <td className={s.name}>
                  <input
                    className={s.kanji}
                    name="name"
                    placeholder='宿泊者名'
                    value={
                      (() => {
                        return this.state.newReservationModel.name;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          name: event.target.value
                        }
                      });
                    }}
                  />
                  <input
                    className={s.kana}
                    name="name_kana"
                    placeholder='宿泊者名(かな)'
                    value={
                      (() => {
                        return this.state.newReservationModel.name_kana;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          name_kana: event.target.value
                        }
                      });
                    }}
                  />
                </td>

                {/* 部屋数 */}
                <td>
                  <select
                    className={`${this.state.validation.numberOfRoomsError ? `${s.error}` : ''}`}
                    name="number_of_rooms"
                    value={this.state.newReservationModel.number_of_rooms || ''}
                    onChange={(event) => {
                      if (Number(event.target.value) > -1) {
                        this.setState({
                          newReservationModel: {
                            ...this.state.newReservationModel,
                            number_of_rooms: Number(event.target.value)
                          }
                        });
                      }
                    }}
                  >
                    {
                      (() => {
                        const selectNumberOfRooms = [];

                        selectNumberOfRooms.push({
                          value: 0,
                          label: 0
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
                              number_of_rooms.value === 0
                            }
                          >
                            { number_of_rooms.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </td>

                {/* チェックイン */}
                <td>
                  <select
                    name="is_checkin"
                    value={this.state.newReservationModel.isCheckin}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          isCheckin: event.target.value
                        }
                      });
                    }}
                  >
                    {
                      checkinModel.map((option, index) => (
                        <option
                          value={option.value}
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
                    value={this.state.newReservationModel.newGuestFlag}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          newGuestFlag: event.target.value
                        }
                      });
                    }}
                  >
                    {
                      newGuestModel.map((option, index) => (
                        <option
                          value={option.value}
                        >
                          { option.label}
                        </option>
                      ))
                    }
                  </select>
                </td>

                {/* 予約経路  */}
                <td>
                  <select
                    name="reservation_method_name"
                    value={this.state.newReservationModel.reservationMethodName}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          reservationMethodName: event.target.value
                        }
                      });
                    }}
                  >
                    {
                      (() => {
                        return reservationModel.map((reservation, index) => (
                          <option
                            value={reservation.value}
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
                    value={this.state.newReservationModel.coupon}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          coupon: parseInt(event.target.value)
                        }
                      });
                    }}
                  >
                    {
                      couponModel.map((option, index) => (
                        <option
                          value={option.value}
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
                    value={this.state.newReservationModel.payment_status}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          payment_status: parseInt(event.target.value)
                        }
                      });
                    }}
                  >
                    {
                      paymentStatusModel.map((option, index) => (
                        <option
                          value={option.value}
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
                    value={this.state.newReservationModel.payment_method}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          payment_method: parseInt(event.target.value)
                        }
                      });
                    }}
                  >
                    {
                      paymentMethodModel.map((option, index) => (
                        <option
                          value={option.value}
                        >
                          { option.label}
                        </option>
                      ))
                    }
                  </select>
                </td>

                {/* ペーストボタン */}
                {/* <td>
                      <FontAwesomeIcon
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              editing: false
                            }
                          })

                          this.setState({
                            newReservationModel: {
                              ...this.state.newReservationModel,
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
                        addingNewRecord: false,
                        editFlag: {
                          ...this.state.editFlag,
                          editing: false
                        }
                      })

                      await this.addReservation();
                    }}
                  >
                    保存
                      </button>
                </td>

                {/* エディットページボタン */}
                {/* <td>
                      <FontAwesomeIcon
                        onClick={async () => {
                          this.setState({
                            editPager: {
                              ...this.state.editPager,
                              showFlag: true,
                              reservationType: 'new'
                            }
                          })
                        }}
                        icon={faPager}
                      />
                    </td> */}
              </tr>
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
                {/* <td style={{ width: 50 }}></td>
                    <td style={{ width: 50 }}></td> */}
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

                    {/* コピーボタン */}
                    {/* <td class={s.icon}>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={async () => {
                                this.setState({
                                  copyGuestInfo: {
                                    ...reservationRecord
                                  }
                                });
                              }}
                              icon={faCopy}
                            />
                          )}
                        </td> */}

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

                    {/* エディットページボタン */}
                    {/* <td class={s.icon}>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={() => {
                                this.setState({
                                  editPager: {
                                    ...this.state.editPager,
                                    showFlag: true,
                                    index,
                                    reservationType: 'exist'
                                  }
                                })
                              }}
                              icon={faPager}
                            />
                          )}
                        </td> */}
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
                        {
                          (() => {
                            const selectAge = [];

                            selectAge.push({
                              value: '-',
                              label: '-'
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
                                  age.value === (reservationRecord.age || '-')
                                }
                              >
                                { age.label}
                              </option>
                            ))
                          })()
                        }
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

                    {/* コピー */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={async () => {
                                this.setState({
                                  copyGuestInfo: {
                                    ...reservationRecord
                                  }
                                });
                              }}
                              icon={faCopy}
                            />
                          )}
                        </td> */}

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

                    {/* エディットページボタン */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={() => {
                                this.setState({
                                  editPager: {
                                    ...this.state.editPager,
                                    showFlag: true,
                                    index,
                                    reservationType: 'exist'
                                  }
                                })
                              }}
                              icon={faPager}
                            />
                          )}
                        </td> */}

                    {/* 保存ボタン */}
                    {/* <td>
                          {this.state.availableEditing && (
                            <FontAwesomeIcon
                              onClick={async () => {
                                this.setState({
                                  editFlag: {
                                    ...this.state.editFlag,
                                    page: 3,
                                    recordNumber: index,
                                    editing: false
                                  }
                                })

                                await this.editReservation(reservationRecord.reservation_id);
                              }}
                              icon={faSave}
                            />
                          )}
                        </td> */}
                  </tr>
                </>
              ))}

              {/* 3/3 新規登録  */}
              <tr className={`${this.state.addingNewRecord ? `${s.active} fadeIn` : 'd-none'}`}>
                {/* 宿泊者名 */}
                <td className={s.name}>
                  <input
                    className={s.kanji}
                    name="name"
                    placeholder='宿泊者名'
                    value={
                      (() => {
                        return this.state.newReservationModel.name;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          name: event.target.value
                        }
                      });
                    }}
                  />
                  <input
                    className={s.kana}
                    name="name_kana"
                    placeholder='宿泊者名(かな)'
                    value={
                      (() => {
                        return this.state.newReservationModel.name_kana;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
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
                    value={this.state.newReservationModel.age}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          age: event.target.value
                        }
                      });
                    }}
                  >
                    {
                      (() => {
                        const selectAge = [];

                        selectAge.push({
                          value: '-',
                          label: '-'
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

                {/* 子供 */}
                <td>
                  <select
                    name="has_child"
                    value={this.state.newReservationModel.has_child}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          has_child: parseInt(event.target.value)
                        }
                      });
                    }}
                  >
                    {
                      hasChildModel.map((option, index) => (
                        <option
                          value={option.value}
                        >
                          { option.label}
                        </option>
                      ))
                    }
                  </select>
                </td>

                {/* 連絡先 */}
                <td >
                  <input
                    className='text-left'
                    name="number_of_rooms"
                    placeholder='連絡先'
                    value={this.state.newReservationModel.phone_number}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          phone_number: event.target.value
                        }
                      });
                    }}
                  />
                </td>

                {/* 住所 */}
                <td >
                  <input
                    className='text-left'
                    name="home_address"
                    placeholder='住所'
                    value={this.state.newReservationModel.home_address}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          home_address: event.target.value
                        }
                      });
                    }}
                  />
                </td>

                {/* ペーストボタン */}
                {/* <td>
                      <FontAwesomeIcon
                        onClick={async () => {
                          this.setState({
                            editFlag: {
                              ...this.state.editFlag,
                              editing: false
                            }
                          })

                          this.setState({
                            newReservationModel: {
                              ...this.state.newReservationModel,
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
                      // this.setState({
                      //   addingNewRecord: false,
                      //   editFlag: {
                      //     ...this.state.editFlag,
                      //     editing: false
                      //   }
                      // })

                      await this.addReservation();
                    }}
                  >
                    保存
                      </button>
                </td>

                {/* エディットページボタン */}
                {/* <td>
                      <FontAwesomeIcon
                        onClick={async () => {
                          this.setState({
                            editPager: {
                              ...this.state.editPager,
                              showFlag: true,
                              reservationType: 'new'
                            }
                          })
                        }}
                        icon={faPager}
                      />
                    </td> */}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 編集画面（エディットページ）（値を変更しても保存はしない） */}
        {/* <div className={`reservationListTableWrapper__editPage ${this.state.editPager.showFlag ? 'reservationListTableWrapper__editPage--active' : ''}`}>
              <div className={s.button}>
                <div
                  className={s.buttonSave}
                  onClick={async () => {
                    if (this.state.editPager.reservationType === 'new') {
                      await this.addReservation();
                    } else {
                      await this.saveReservationInfoCombine({
                        listIndex: this.state.editPager.index,
                      });

                      // await Promise.all(recordContents.map(async (field) => {
                      //   await this.saveReservationInfo({
                      //     field: field,
                      //     listIndex: this.state.editPager.index,
                      //   })
                      // }));
                    }

                    this.setState({
                      editPager: {
                        ...this.state.editPager,
                        showFlag: false,
                      }
                    })

                    this.setState({
                      editFlag: {
                        ...this.state.editFlag,
                        page: this.state.currentPagination,
                        recordNumber: this.state.editPager.index,
                        editing: false
                      }
                    })
                  }}
                >保存</div>
                <div
                  className={s.buttonCancel}
                  onClick={() => {
                    this.setState({
                      editFlag: {
                        ...this.state.editFlag,
                        page: this.state.currentPagination,
                        recordNumber: this.state.editPager.index,
                        editing: false
                      }
                    })

                    this.setState({
                      editPager: {
                        ...this.state.editPager,
                        showFlag: false
                      }
                    })
                  }}
                >閉じる</div>
              </div> */}
        {/* 既存の予約編集 */}
        {/* <div className={`reservationListTableWrapper__editPage__content ${this.state.editPager.reservationType === 'exist' ? 'fadeIn' : 'd-none'}`}>
                <div className={s.title}>予約編集</div>
                {
                  reservationRender()[this.state.editPager.index] &&
                  [
                    <div>予約者名</div>,
                    <div className={`${this.state.validation.reservationHolderError ? 'reservationListTable_td-error' : ''}`}>
                      <input
                        className={s.inputMiddle}
                        name="reservation_holder"
                        value={
                          (() => {
                            return reservationRender()[this.state.editPager.index].reservation_holder;
                          })()
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[this.state.editPager.index].reservation_holder = event.target.value;

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

                            reservationRecordModel[this.state.editPager.index].reservation_holder = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                      />
                    </div>,

                    <div>予約者名（カナ名）</div>,
                    <div className={`${this.state.validation.reservationHolderKanaError ? 'reservationListTable_td-error' : ''}`}>
                      <input
                        className={s.inputMiddle}
                        name="reservation_holder_kana"
                        value={
                          (() => {
                            return reservationRender()[this.state.editPager.index].reservation_holder_kana;
                          })()
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[this.state.editPager.index].reservation_holder_kana = event.target.value;

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

                            reservationRecordModel[this.state.editPager.index].reservation_holder_kana = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                      />
                    </div>,

                    <div>宿泊者名</div>,
                    <div className={`${this.state.validation.nameError ? 'reservationListTable_td-error' : ''}`}>
                      <input
                        className={s.inputMiddle}
                        name="name"
                        value={
                          (() => {
                            return reservationRender()[this.state.editPager.index].name;
                          })()
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[this.state.editPager.index].name = event.target.value;

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

                            reservationRecordModel[this.state.editPager.index].name = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                      />
                    </div>,

                    <div>宿泊者名（カナ名）</div>,
                    <div className={`${this.state.validation.nameError ? 'reservationListTable_td-error' : ''}`}>
                      <input
                        className={s.inputMiddle}
                        name="name_kana"
                        value={
                          (() => {
                            return reservationRender()[this.state.editPager.index].name_kana;
                          })()
                        }
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[this.state.editPager.index].name_kana = event.target.value;

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

                            reservationRecordModel[this.state.editPager.index].name_kana = event.target.value;
                            this.setState(reservationRecordModel);
                          }
                        }}
                      />
                    </div>,

                    <div>新規 / 既存</div>,
                    <div>
                      <select
                        name="new_guest_flag"
                        value={reservationRender()[this.state.editPager.index].new_guest_flag}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (this.SearchBarRef.current.state.stringValue.length > 0) {
                            if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                              reservationRecordModel = [
                                ...this.state.searchBar.reservationRecordModel
                              ];

                              reservationRecordModel[this.state.editPager.index].new_guest_flag = parseInt(event.target.value);

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

                            reservationRecordModel[this.state.editPager.index].new_guest_flag = parseInt(event.target.value);
                            this.setState(reservationRecordModel);
                          }
                        }}
                      >
                        {
                          newGuestModel.map((option, index) => (
                            <option
                              value={option.value}
                            >
                              { option.label}
                            </option>
                          ))
                        }
                      </select>
                    </div>,

                    <div>宿泊日</div>,
                    <DatePicker2
                      reservationDate={
                        (() => {
                          const value = reservationRender()[this.state.editPager.index].stay_date_from || "-";
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

                            reservationRecordModel[this.state.editPager.index].stay_date_from = date;

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

                          reservationRecordModel[this.state.editPager.index].stay_date_from = date;
                          this.setState(reservationRecordModel);
                        }
                      }}
                      onBlur={() => {
                      }}
                      onKeyDown={() => {
                      }}
                      onCalendarClose={() => {
                      }}
                    />,

                    <div>泊数</div>,
                    <div className={`${this.state.validation.stayDaysError ? 'reservationListTable_td-error' : ''}`}>
                      <input
                        className={s.inputNumber}
                        name="stay_days"
                        value={reservationRender()[this.state.editPager.index].stay_days || ''}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (Number(event.target.value) > -1) {
                            if (this.SearchBarRef.current.state.stringValue.length > 0) {
                              if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                                reservationRecordModel = [
                                  ...this.state.searchBar.reservationRecordModel
                                ];

                                reservationRecordModel[this.state.editPager.index].stay_days = Number(event.target.value);

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

                              reservationRecordModel[this.state.editPager.index].stay_days = Number(event.target.value);
                              this.setState(reservationRecordModel);
                            }
                          }
                        }}
                      />
                    </div>,

                    <div>人数</div>,
                    <div className={`${this.state.validation.stayDaysError ? 'reservationListTable_td-error' : ''}`}>
                      <input
                        className={s.inputNumber}
                        name="number_of_guests"
                        value={reservationRender()[this.state.editPager.index].number_of_guests || ''}
                        onChange={async (event) => {
                          let reservationRecordModel = [];

                          if (Number(event.target.value) > -1) {
                            if (this.SearchBarRef.current.state.stringValue.length > 0) {
                              if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                                reservationRecordModel = [
                                  ...this.state.searchBar.reservationRecordModel
                                ];

                                reservationRecordModel[this.state.editPager.index].number_of_guests = Number(event.target.value);

                                // 人数の合計数をその時に選択されている性別に合わせて男性もしくは女性に初期値を入れる
                                if (reservationRecordModel[this.state.editPager.index].gender === 2) {
                                  reservationRecordModel[this.state.editPager.index].number_of_guests_male = reservationRecordModel[this.state.editPager.index].number_of_guests
                                  reservationRecordModel[this.state.editPager.index].number_of_guests_female = 0
                                } else {
                                  reservationRecordModel[this.state.editPager.index].number_of_guests_female = reservationRecordModel[this.state.editPager.index].number_of_guests
                                  reservationRecordModel[this.state.editPager.index].number_of_guests_male = 0
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

                              reservationRecordModel[this.state.editPager.index].number_of_guests = Number(event.target.value);

                              // 人数の合計数をその時に選択されている性別に合わせて男性もしくは女性に初期値を入れる
                              if (reservationRecordModel[this.state.editPager.index].gender === 2) {
                                reservationRecordModel[this.state.editPager.index].number_of_guests_male = reservationRecordModel[this.state.editPager.index].number_of_guests
                                reservationRecordModel[this.state.editPager.index].number_of_guests_female = 0
                              } else {
                                reservationRecordModel[this.state.editPager.index].number_of_guests_female = reservationRecordModel[this.state.editPager.index].number_of_guests
                                reservationRecordModel[this.state.editPager.index].number_of_guests_male = 0
                              }

                              this.setState(reservationRecordModel);
                            }
                          }
                        }}
                      />
                    </div>,

                    <div>年齢</div>,
                    <select
                      name="age"
                      value={
                        `${reservationRender()[this.state.editPager.index].age || '-'}`
                      }
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].age = parseInt(event.target.value);

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

                          reservationRecordModel[this.state.editPager.index].age = parseInt(event.target.value);
                          this.setState(reservationRecordModel);
                        }
                      }}
                    >
                      {
                        (() => {
                          const selectAge = [];

                          selectAge.push({
                            value: '-',
                            label: '-'
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
                                age.value === (reservationRender()[this.state.editPager.index].age || '-')
                              }
                            >
                              { age.label}
                            </option>
                          ))
                        })()
                      }
                    </select>,

                    <div>予約経路</div>,
                    <select
                      name="reservation_method_name"
                      value={reservationRender()[this.state.editPager.index].reservation_method}
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].reservation_method = parseInt(event.target.value);

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

                          reservationRecordModel[this.state.editPager.index].reservation_method = parseInt(event.target.value);
                          this.setState(reservationRecordModel);
                        }
                      }}
                    >
                      {
                        (() => {
                          return reservationModel.map((reservation, index) => (
                            <option
                              value={reservation.value}
                              selected={
                                reservationRender()[this.state.editPager.index].reservation_method === reservation.value
                              }
                            >
                              { reservation.label}
                            </option>
                          ))
                        })()
                      }
                    </select>,

                    <div>性別</div>,
                    <select
                      name="gender"
                      value={reservationRender()[this.state.editPager.index].gender}
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].gender = parseInt(event.target.value);

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

                          reservationRecordModel[this.state.editPager.index].gender = parseInt(event.target.value);
                          this.setState(reservationRecordModel);
                        }
                      }}
                    >
                      {
                        (() => {
                          return optionModel.map((option, index) => (
                            <option
                              value={option.value}
                              selected={
                                reservationRender()[this.state.editPager.index].gender === option.value
                              }
                            >
                              { option.label}
                            </option>
                          ))
                        })()
                      }
                    </select>,

                    <div>クーポン</div>,
                    <select
                      name="coupon"
                      value={reservationRender()[this.state.editPager.index].coupon}
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].coupon = parseInt(event.target.value);

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

                          reservationRecordModel[this.state.editPager.index].coupon = parseInt(event.target.value);
                          this.setState(reservationRecordModel);
                        }
                      }}
                    >
                      {
                        couponModel.map((option, index) => (
                          <option
                            value={option.value}
                            selected={
                              reservationRender()[this.state.editPager.index].coupon === option.value
                            }
                          >
                            { option.label}
                          </option>
                        ))
                      }
                    </select>,

                    <div>支払い方法</div>,
                    <select
                      name="payment_status"
                      value={reservationRender()[this.state.editPager.index].payment_status}
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRender()[this.state.editPager.index].payment_status = parseInt(event.target.value);

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

                          reservationRender()[this.state.editPager.index].payment_status = parseInt(event.target.value);
                          this.setState(reservationRecordModel);
                        }
                      }}
                    >
                      {
                        paymentStatusModel.map((option, index) => (
                          <option
                            value={option.value}
                            selected={
                              reservationRender()[this.state.editPager.index].payment_status === option.value
                            }
                          >
                            { option.label}
                          </option>
                        ))
                      }
                    </select>,

                    <div>連絡先</div>,
                    <input
                      className={s.inputMiddle}
                      name="phone_number"
                      value={
                        `${reservationRender()[this.state.editPager.index].phone_number || ''}`
                      }
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].phone_number = event.target.value;

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

                          reservationRecordModel[this.state.editPager.index].phone_number = event.target.value;
                          this.setState(reservationRecordModel);
                        }
                      }}
                    />,

                    <div>住所</div>,
                    <input
                      className={s.inputLong}
                      name="home_address"
                      value={
                        `${reservationRender()[this.state.editPager.index].home_address || ''}`
                      }
                      onChange={(event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].home_address = event.target.value;

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

                          reservationRecordModel[this.state.editPager.index].home_address = event.target.value;
                          this.setState(reservationRecordModel);
                        }
                      }}
                    />,

                    <div>チェックイン</div>,
                    <select
                      name="is_checkin"
                      value={reservationRender()[this.state.editPager.index].is_checkin}
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].is_checkin = parseInt(event.target.value);

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

                          reservationRecordModel[this.state.editPager.index].is_checkin = parseInt(event.target.value);
                          this.setState(reservationRecordModel);
                        }
                      }}
                    >
                      {
                        checkinModel.map((option, index) => (
                          <option
                            value={option.value}
                            selected={
                              reservationRender()[this.state.editPager.index].is_checkin === option.value
                            }
                          >
                            { option.label}
                          </option>
                        ))
                      }
                    </select>,

                    <div>男性</div>,
                    <select
                      name="number_of_guests_male"
                      value={
                        `${reservationRender()[this.state.editPager.index].number_of_guests_male || ''}`
                      }
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].number_of_guests_male = Number(event.target.value);

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

                          reservationRecordModel[this.state.editPager.index].number_of_guests_male = Number(event.target.value);
                          this.setState(reservationRecordModel);
                        }
                      }}
                    >
                      {
                        (() => {
                          const selectNumberOfGuestsMale = [];

                          selectNumberOfGuestsMale.push({
                            value: 0,
                            label: 0
                          });

                          for (let i = 1; i < 101; i++) {
                            selectNumberOfGuestsMale.push({
                              value: i.toString(),
                              label: i.toString()
                            });
                          }

                          return selectNumberOfGuestsMale.map((number_of_guests_male) => (
                            <option
                              value={number_of_guests_male.value}
                              selected={
                                number_of_guests_male.value === 0
                              }
                            >
                              { number_of_guests_male.label}
                            </option>
                          ))
                        })()
                      }
                    </select>,

                    <div>女性</div>,
                    <select
                      name="number_of_guests_female"
                      value={
                        `${reservationRender()[this.state.editPager.index].number_of_guests_female || ''}`
                      }
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].number_of_guests_female = Number(event.target.value);

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

                          reservationRecordModel[this.state.editPager.index].number_of_guests_female = Number(event.target.value);
                          this.setState(reservationRecordModel);
                        }
                      }}
                    >
                      {
                        (() => {
                          const selectNumberOfGuestsFemale = [];

                          selectNumberOfGuestsFemale.push({
                            value: 0,
                            label: 0
                          });

                          for (let i = 1; i < 101; i++) {
                            selectNumberOfGuestsFemale.push({
                              value: i.toString(),
                              label: i.toString()
                            });
                          }

                          return selectNumberOfGuestsFemale.map((number_of_guests_female) => (
                            <option
                              value={number_of_guests_female.value}
                              selected={
                                number_of_guests_female.value === 0
                              }
                            >
                              { number_of_guests_female.label}
                            </option>
                          ))
                        })()
                      }
                    </select>,

                    <div>子供</div>,
                    <select
                      name="has_child"
                      value={reservationRender()[this.state.editPager.index].has_child}
                      onChange={async (event) => {
                        let reservationRecordModel = [];

                        if (this.SearchBarRef.current.state.stringValue.length > 0) {
                          if (searchBar.reservationRecordModel && searchBar.reservationRecordModel.length > 0) {
                            reservationRecordModel = [
                              ...this.state.searchBar.reservationRecordModel
                            ];

                            reservationRecordModel[this.state.editPager.index].has_child = parseInt(event.target.value);

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

                          reservationRecordModel[this.state.editPager.index].has_child = parseInt(event.target.value);
                          this.setState(reservationRecordModel);
                        }
                      }}
                    >
                      {
                        hasChildModel.map((option, index) => (
                          <option
                            value={option.value}
                            selected={
                              reservationRender()[this.state.editPager.index].has_child === option.value
                            }
                          >
                            { option.label}
                          </option>
                        ))
                      }
                    </select>
                  ]
                }
              </div>

              {/* 新規の予約編集 */}
        {/* <div className={`reservationListTableWrapper__editPage__content ${this.state.editPager.reservationType === 'new' ? 'fadeIn' : 'd-none'}`}>
                <div className={s.title}>予約編集</div>
                <div>予約者名</div>
                <div className={`${this.state.validation.reservationHolderError ? 'reservationListTable_td-error' : ''}`}>
                  <input
                    className={s.inputMiddle}
                    name="reservation_holder"
                    value={
                      (() => {
                        return this.state.newReservationModel.reservation_holder;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          reservation_holder: event.target.value
                        }
                      });
                    }}
                  />
                </div>
                <div>予約者名（カナ名）</div>
                <div className={`${this.state.validation.reservationHolderKanaError ? 'reservationListTable_td-error' : ''}`}>
                  <input
                    className={s.inputMiddle}
                    name="reservation_holder_kana"
                    value={
                      (() => {
                        return this.state.newReservationModel.reservation_holder_kana;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          reservation_holder_kana: event.target.value
                        }
                      });
                    }}
                  />
                </div>
                <div>宿泊者名</div>
                <div className={`${this.state.validation.nameError ? 'reservationListTable_td-error' : ''}`}>
                  <input
                    className={s.inputMiddle}
                    name="name"
                    value={
                      (() => {
                        return this.state.newReservationModel.name;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          name: event.target.value
                        }
                      });
                    }}
                  />
                </div>
                <div>宿泊者名（カナ名）</div>
                <div className={`${this.state.validation.nameKanaError ? 'reservationListTable_td-error' : ''}`}>
                  <input
                    className={s.inputMiddle}
                    name="name_kana"
                    value={
                      (() => {
                        return this.state.newReservationModel.name_kana;
                      })()
                    }
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          name_kana: event.target.value
                        }
                      });
                    }}
                  />
                </div>
                <div>新規 / 既存</div>
                <select
                  name="new_guest_flag"
                  value={this.state.newReservationModel.newGuestFlag}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        newGuestFlag: event.target.value
                      }
                    });
                  }}
                >
                  {
                    newGuestModel.map((option, index) => (
                      <option
                        value={option.value}
                      >
                        { option.label}
                      </option>
                    ))
                  }
                </select>
                <div>宿泊日</div>
                <DatePicker2
                  name="stay_date_from"
                  reservationDate={this.state.newReservationModel.stay_date_from}
                  onChange={(date) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
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
                <div>泊数</div>
                <div className={`${this.state.validation.stayDaysError ? 'reservationListTable_td-error' : ''}`}>
                  <input
                    className={s.inputNumber}
                    name="stay_days"
                    value={this.state.newReservationModel.stay_days || ''}
                    onChange={(event) => {
                      if (Number(event.target.value) > -1) {
                        this.setState({
                          newReservationModel: {
                            ...this.state.newReservationModel,
                            stay_days: Number(event.target.value)
                          }
                        });
                      }
                    }}
                  />
                </div>
                <div>人数</div>
                <div className={`${this.state.validation.numberOfGuestsError ? 'reservationListTable_td-error' : ''}`}>
                  <input
                    className={s.inputNumber}
                    name="number_of_guests"
                    value={this.state.newReservationModel.number_of_guests || ''}
                    onChange={(event) => {
                      const numberOfGuestsForGender = {};

                      if (Number(event.target.value) > -1) {
                        if (this.state.newReservationModel.number_of_guests.gender === 2) {
                          numberOfGuestsForGender.number_of_guests_male = Number(event.target.value)
                          numberOfGuestsForGender.number_of_guests_female = 0
                        } else {
                          numberOfGuestsForGender.number_of_guests_female = Number(event.target.value)
                          numberOfGuestsForGender.number_of_guests_male = 0
                        }

                        this.setState({
                          newReservationModel: {
                            ...this.state.newReservationModel,
                            number_of_guests: Number(event.target.value),
                            ...numberOfGuestsForGender,
                          }
                        });
                      }
                    }}
                  />
                </div>

                <div>年齢</div>
                <select
                  name="age"
                  value={this.state.newReservationModel.age}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        age: event.target.value
                      }
                    });
                  }}
                >
                  {
                    (() => {
                      const selectAge = [];

                      selectAge.push({
                        value: '-',
                        label: '-'
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

                <div>予約経路</div>
                <select
                  name="reservation_method_name"
                  value={this.state.newReservationModel.reservationMethodName}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        reservationMethodName: event.target.value
                      }
                    });
                  }}
                >
                  {
                    (() => {
                      return reservationModel.map((reservation, index) => (
                        <option
                          value={reservation.value}
                        >
                          { reservation.label}
                        </option>
                      ))
                    })()
                  }
                </select>

                <div>性別</div>
                <select
                  name="gender"
                  value={this.state.newReservationModel.gender}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        gender: Number(event.target.value)
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
                <div>クーポン</div>
                <select
                  name="coupon"
                  value={this.state.newReservationModel.coupon}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        coupon: parseInt(event.target.value)
                      }
                    });
                  }}
                >
                  {
                    couponModel.map((option, index) => (
                      <option
                        value={option.value}
                      >
                        { option.label}
                      </option>
                    ))
                  }
                </select>
                <div>決済</div>
                <select
                  name="payment_status"
                  value={this.state.newReservationModel.payment_status}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        payment_status: parseInt(event.target.value)
                      }
                    });
                  }}
                >
                  {
                    paymentStatusModel.map((option, index) => (
                      <option
                        value={option.value}
                      >
                        { option.label}
                      </option>
                    ))
                  }
                </select>
                <div>支払い方法</div>
                <select
                  name="payment_method"
                  value={this.state.newReservationModel.payment_method}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        payment_method: parseInt(event.target.value)
                      }
                    });
                  }}
                >
                  {
                    paymentMethodModel.map((option, index) => (
                      <option
                        value={option.value}
                      >
                        { option.label}
                      </option>
                    ))
                  }
                </select>
                <div>連絡先</div>
                <input
                  className={s.inputMiddle}
                  name="number_of_rooms"
                  value={this.state.newReservationModel.phone_number}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        phone_number: event.target.value
                      }
                    });
                  }}
                />
                <div>住所</div>
                <input
                  className={s.inputLong}
                  name="home_address"
                  value={this.state.newReservationModel.home_address}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        home_address: event.target.value
                      }
                    });
                  }}
                />
                <div>チェックイン</div>
                <select
                  name="is_checkin"
                  value={this.state.newReservationModel.isCheckin}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        isCheckin: event.target.value
                      }
                    });
                  }}
                >
                  {
                    checkinModel.map((option, index) => (
                      <option
                        value={option.value}
                      >
                        { option.label}
                      </option>
                    ))
                  }
                </select>
                <div>男性</div>
                <div className={`${this.state.validation.numberOfGuestsTotalError ? 'reservationListTable_td-error' : ''}`}>
                  <select
                    name="number_of_guests_male"
                    value={this.state.newReservationModel.number_of_guests_male}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          number_of_guests_male: Number(event.target.value)
                        }
                      });
                    }}
                  >
                    {
                      (() => {
                        const selectNumberOfGuestsMale = [];

                        selectNumberOfGuestsMale.push({
                          value: 0,
                          label: 0
                        });

                        for (let i = 1; i < 101; i++) {
                          selectNumberOfGuestsMale.push({
                            value: i.toString(),
                            label: i.toString()
                          });
                        }

                        return selectNumberOfGuestsMale.map((number_of_guests_male) => (
                          <option
                            value={number_of_guests_male.value}
                            selected={
                              number_of_guests_male.value === 0
                            }
                          >
                            { number_of_guests_male.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </div>
                <div>女性</div>
                <div className={`${this.state.validation.numberOfGuestsTotalError ? 'reservationListTable_td-error' : ''}`}>
                  <select
                    name="number_of_guests_female"
                    value={this.state.newReservationModel.number_of_guests_female}
                    onChange={(event) => {
                      this.setState({
                        newReservationModel: {
                          ...this.state.newReservationModel,
                          number_of_guests_female: Number(event.target.value)
                        }
                      });
                    }}
                  >
                    {
                      (() => {
                        const selectNumberOfGuestsFemale = [];

                        selectNumberOfGuestsFemale.push({
                          value: 0,
                          label: 0
                        });

                        for (let i = 1; i < 101; i++) {
                          selectNumberOfGuestsFemale.push({
                            value: i.toString(),
                            label: i.toString()
                          });
                        }

                        return selectNumberOfGuestsFemale.map((number_of_guests_female) => (
                          <option
                            value={number_of_guests_female.value}
                            selected={
                              number_of_guests_female.value === 0
                            }
                          >
                            { number_of_guests_female.label}
                          </option>
                        ))
                      })()
                    }
                  </select>
                </div>
                <div>子供</div>
                <select
                  name="has_child"
                  value={this.state.newReservationModel.has_child}
                  onChange={(event) => {
                    this.setState({
                      newReservationModel: {
                        ...this.state.newReservationModel,
                        has_child: parseInt(event.target.value)
                      }
                    });
                  }}
                >
                  {
                    hasChildModel.map((option, index) => (
                      <option
                        value={option.value}
                      >
                        { option.label}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div > */}

        {/* 登録ボタン */}
        < div
          className={`d-flex`
          }
        >
          <div
            className={`${s.addButton} ${!this.state.addingNewRecord ? 'fadeIn' : 'd-none'} ${this.state.queryParams.from ? 'd-none' : 'fadeIn'}`}
            onClick={() =>
              this.setState({
                addingNewRecord: true,
                editFlag: {
                  ...this.state.editFlag,
                  editing: false
                }
              })
            }
          >
            <AiOutlinePlus />登録
              </div>

          {/* 閉じるボタン */}
          <div
            className={`
                ${s.closeButton}
                ${this.state.addingNewRecord ? 'fadeIn' : 'd-none'}
                ${this.state.queryParams.from ? 'd-none' : 'fadeIn'}
                `}
            onClick={() =>
              this.setState({
                addingNewRecord: false,
                editFlag: {
                  ...this.state.editFlag,
                  editing: false
                }
              })
            }
          >
            <AiOutlineClose />閉じる
              </div>

          {/* 戻るボタン */}
          <button
            className={`button back ${!this.state.queryParams.from ? 'd-none' : 'fadeIn'}`}
            style={{
              marginLeft: `${this.state.queryParams.from ? '20px' : '0'}`
            }}
            onClick={() => {
              this.props.history.push(`/checkin/guest/info/${this.state.queryParams.guestId}`)
            }}
          >
            戻る
              </button>

        </div >

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
                <button
                  onClick={async () => {
                    await this.deleteReservation({
                      reservation_id: this.state.popupStatus.data.reservation_id
                    });
                  }}>
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
