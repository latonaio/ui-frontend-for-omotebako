import React from "react";
import Layout from "../../components/Layout";
import { postFetch, putFetch } from "../../util/api";
import s from "../../scss/pages/FormPage.module.scss";
import p from "../../scss/components/Popup.module.scss";
import StatusBar2 from "../../components/StatusBar2";
import RequestRedisManager from "../../util/requestRedisManager";
import config from '../../util/config'
import * as formModel from '../../util/formModel'
import queryString from '../../util/queryString';
import DatePicker2 from '../../components/DatePicker2';


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
        showRegistered: false,
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
            stay_days: 1,
            number_of_guests: 1,
            number_of_guests_male: 0,
            number_of_guests_female: 1,
            has_child: 0,
            number_of_rooms: 1,
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

        // 新規登録はmysqlのためgetReservationsを実行
        this.requestRedisManager.io.emit('getReservations');

        // 登録完了ポップアップの表示
        this.setState({
          popupStatus: {
            ...this.state.popupStatus,
            showRegistered: true,
          }
        })

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
        <StatusBar2 icon='calendar' text='予約情報を登録します。' />

        <div className={s.form}>
          <div className={s.column}>
            <div className={s.multiple}>
              <div className={s.formItem}>
                <label>
                  予約者名
                  <span className={s.required}>(必須)</span>
                </label>
                <input
                  className={`${s.half} ${this.state.validation.reservationHolderError ? `${s.error}` : ''}`}
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
              </div>

              <div className={s.formItem}>
                <label>
                  予約者名(かな)
                  <span className={s.required}>(必須)</span>
                </label>
                <input
                  className={`${s.half} ${this.state.validation.reservationHolderKanaError ? `${s.error}` : ''}`}
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
              </div>
            </div>

            <div className={s.multiple}>
              <div className={s.formItem}>
                <label>
                  宿泊者名
                  <span className={s.required}>(必須)</span>
                </label>
                <input
                  className={`${s.half} ${this.state.validation.nameError ? `${s.error}` : ''}`}
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
              </div>

              <div className={s.formItem}>
                <label>
                  宿泊者名(かな)
                  <span className={s.required}>(必須)</span>
                </label>
                <input
                  className={`${s.half} ${this.state.validation.nameKanaError ? `${s.error}` : ''}`}
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
              </div>
            </div>

            <div className={s.formItem}>
              <label>
                宿泊日
                <span className={s.required}>(必須)</span>
              </label>
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
            </div>

            <div className={s.multiple}>
              <div className={s.formItem}>
                <label>性別</label>
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
              </div>

              <div className={s.formItem}>
                <label>年齢</label>
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
              </div>
            </div>

            <div className={s.multiple}>
              <div className={s.formItem}>
                <label>泊数</label>
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
              </div>

              <div className={s.formItem}>
                <label>部屋数</label>
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
              </div>
            </div>

            <div className={s.multiple}>
              <div className={s.formItem}>
                <label>人数</label>
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
              </div>

              <div className={s.formItem}>
                <label>男性</label>
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
              </div>

              <div className={s.formItem}>
                <label>女性</label>
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
              </div>

              <div className={s.formItem}>
                <label>子供</label>
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
            </div>
          </div>

          <div className={s.column}>
            <div className={s.multiple}>
              <div className={s.formItem}>
                <label>新規 / 既存</label>
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
              </div>

              <div className={s.formItem}>
                <label>チェックイン</label>
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
              </div>
            </div>

            <div className={s.multiple}>
              <div className={s.formItem}>
                <label>予約経路</label>
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
              </div>

              <div className={s.formItem}>
                <label>クーポン</label>
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
              </div>
            </div>

            <div className={s.multiple}>
              <div className={s.formItem}>
                <label>支払い方法</label>
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
              </div>

              <div className={s.formItem}>
                <label>決済</label>
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
              </div>
            </div>

            <div className={s.formItem}>
              <label>連絡先</label>
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
            </div>

            <div className={s.formItem}>
              <label>住所</label>
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
            </div>

            <div className={s.buttonContainer}>
              {/* キャンセルボタン */}
              <button
                className={s.cancel}
                onClick={() => { this.props.history.push('/reservations') }}
              >
                キャンセル
            </button>

              {/* 新規登録ボタン */}
              <button
                className={s.register}
                onClick={async () => { await this.addReservation() }}
              >
                登録
            </button>
            </div>
          </div>
        </div>

        {/* 登録完了ポップアップ */}
        <div
          className={`${!this.state.popupStatus.showRegistered ? 'd-none' : p.popupOverlay}`}
          onClick={() => { this.props.history.push(`/reservations`); }}
        >
          <div className={p.popup}>
            <div className={p.registered}>
              登録が完了しました。
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
                        showDuplicateModal: false,
                        showRegistered: true,
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
                {(() => {
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
                })()}
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
