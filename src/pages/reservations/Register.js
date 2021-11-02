import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import Layout from "../../components/Layout";
import SelectHundred from "../../components/Select";
import { formatDateWithTime } from "../../helper/date";
import { postFetch } from "../../util/api";
import s from "../../scss/pages/FormPage.module.scss";
import p from "../../scss/components/Popup.module.scss";
import StatusBar2 from "../../components/StatusBar2";
import * as formModel from '../../util/formModel'
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

const Reservations = () => {
  const [newReservationModel, setNewReservationModel] = useState({
    reservation_holder: '',
    reservation_holder_kana: '',
    name: '',
    name_kana: '',
    newGuestFlag: 0,
    stay_date_from: formatDateWithTime(new Date()),
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
  });
  const [popupStatus, setPopupStatus] = useState({
    show: false,
    showDuplicateModal: false,
    showRegistered: false,
    showValidationModal: false,
    data: {}
  });
  const [validation, setValidation] = useState({
    reservationHolderError: false,
    reservationHolderKanaError: false,
    nameError: false,
    nameKanaError: false,
    numberOfGuestsTotalError: false,
  });
  const history = useHistory();

  // レコードを追加する
  const addReservation = async (option = {}) => {
    try {
      const validationCheck = async (newReservationModel) => {
        const {
          reservation_holder,
          reservation_holder_kana,
          name,
          name_kana,
          gender,
          number_of_guests,
          number_of_guests_male,
          number_of_guests_female,
        } = newReservationModel;

        // 予約者名
        validation.reservationHolderError = reservation_holder ? false : true;
        // 予約者名のふりがな
        validation.reservationHolderKanaError = reservation_holder_kana ? false : true;
        // 宿泊者名
        validation.nameError = name ? false : true;
        // 宿泊者名のふりがな
        validation.nameKanaError = name_kana ? false : true;
        // 男女の合計人数
        const guestsCountsFlag =
          number_of_guests !== number_of_guests_male + number_of_guests_female // 人数の合計が男女の合計と合わない場合
          || (gender === 2 && number_of_guests_male === 0)   // 男性申し込みだが男性がいない場合
          || (gender === 1 && number_of_guests_female === 0) // 女性申し込みだが女性がいない場合
        validation.numberOfGuestsTotalError = !guestsCountsFlag ? false : true;

        // 一つでもエラーがあればバリデーションモーダルを表示
        if (
          validation.reservationHolderError === true ||
          validation.reservationHolderKanaError === true ||
          validation.nameError === true ||
          validation.nameKanaError === true ||
          validation.numberOfGuestsTotalError === true
        ) {
          popupStatus.showValidationModal = true
        } else {
          popupStatus.showValidationModal = false
        }

        setValidation({ ...validation })
      }

      await validationCheck(newReservationModel);

      const newGuestInfoToAdditionalRecord = {
        guest_id: null,
        reservation_holder: newReservationModel.reservation_holder,
        reservation_holder_kana: newReservationModel.reservation_holder_kana,
        name: newReservationModel.name,
        name_kana: newReservationModel.name_kana,
        new_guest_flag: newReservationModel.newGuestFlag,
        stay_date_from: newReservationModel.stay_date_from,
        stay_days: newReservationModel.stay_days,
        number_of_guests: newReservationModel.number_of_guests,
        number_of_guests_male: newReservationModel.number_of_guests_male,
        number_of_guests_female: newReservationModel.number_of_guests_female,
        has_child: newReservationModel.has_child,
        number_of_rooms: newReservationModel.number_of_rooms,
        gender: newReservationModel.gender,
        age: newReservationModel.age,
        reservation_method: newReservationModel.reservationMethodName,
        is_checkin: newReservationModel.isCheckin,
        coupon: newReservationModel.coupon,
        payment_status: newReservationModel.payment_status,
        payment_method: newReservationModel.payment_method,
        phone_number: newReservationModel.phone_number,
        home_address: newReservationModel.home_address
      }

      // 重複したレコードでも登録を許可する場合はforceの値を入れる
      if (option.force) {
        newGuestInfoToAdditionalRecord.force = true;
      }

      try {
        // 予約情報の新規作成に関してはRedisのキー管理が難しいためmysqlに変える
        await postFetch.registerNewReservation(newGuestInfoToAdditionalRecord);


        // 登録完了ポップアップの表示
        setPopupStatus({
          ...popupStatus,
          showRegistered: true,
        })

        // 新規登録はmysqlのためgetReservationsを実行
        this.requestRedisManager.io.emit('getReservations');
      } catch (e) {
        if (e.error && popupStatus.showValidationModal === false) {
          // 既存顧客が見つからなかった場合のエラー
          if (e.error.errorDetail === 'cannot found exists guest') {
            setPopupStatus({
              ...popupStatus,
              showNoExistsModal: true
            });

            return;
          }

          // 既存顧客(名前、年齢一致)が複数名いた場合のエラー
          if (e.error.errorDetail === 'more than 2 same users exist') {
            setPopupStatus({
              ...popupStatus,
              showSameUserExistModal: true
            });

            return;
          }

          if (e.error.errorType === 'BAD_REQUEST') {
            setPopupStatus({
              ...popupStatus,
              showDuplicateModal: true
            });
          }
        }
      }
    } catch (e) {
      console.error("=== ADD RESERVATION ERROR ===", e);
      throw e;
    }
  };

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
                className={`${s.half} ${validation.reservationHolderError ? `${s.error}` : ''}`}
                name="reservation_holder"
                placeholder='予約者名'
                value={
                  (() => {
                    return newReservationModel.reservation_holder;
                  })()
                }
                onChange={async (event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    reservation_holder: event.target.value
                  })
                }}
              />
            </div>

            <div className={s.formItem}>
              <label>
                予約者名(かな)
                  <span className={s.required}>(必須)</span>
              </label>
              <input
                className={`${s.half} ${validation.reservationHolderKanaError ? `${s.error}` : ''}`}
                name="reservation_holder_kana"
                placeholder='予約者名(かな)'
                value={
                  (() => {
                    return newReservationModel.reservation_holder_kana;
                  })()
                }
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    reservation_holder_kana: event.target.value
                  })
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
                className={`${s.half} ${validation.nameError ? `${s.error}` : ''}`}
                name="name"
                placeholder='宿泊者名'
                value={
                  (() => {
                    return newReservationModel.name;
                  })()
                }
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    name: event.target.value
                  })
                }}
              />
            </div>

            <div className={s.formItem}>
              <label>
                宿泊者名(かな)
                  <span className={s.required}>(必須)</span>
              </label>
              <input
                className={`${s.half} ${validation.nameKanaError ? `${s.error}` : ''}`}
                name="name_kana"
                placeholder='宿泊者名(かな)'
                value={
                  (() => {
                    return newReservationModel.name_kana;
                  })()
                }
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    name_kana: event.target.value
                  })
                }}
              />
            </div>
          </div>

          <div className={s.formItem}>
            <label>
              宿泊日
            </label>
            <DatePicker2
              name="stay_date_from"
              reservationDate={newReservationModel.stay_date_from}
              onChange={(date) => {
                setNewReservationModel({
                  ...newReservationModel,
                  stay_date_from: date
                })
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
                value={newReservationModel.gender}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    gender: Number(event.target.value)
                  })
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
                value={newReservationModel.age}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    age: event.target.value
                  });
                }}
              >
                <SelectHundred />
              </select>
            </div>
          </div>

          <div className={s.multiple}>
            <div className={s.formItem}>
              <label>泊数</label>
              <select
                className={`${validation.stayDaysError ? `${s.error}` : ''}`}
                name="stay_days"
                value={newReservationModel.stay_days || ''}
                onChange={(event) => {
                  if (Number(event.target.value) > -1) {
                    setNewReservationModel({
                      ...newReservationModel,
                      stay_days: Number(event.target.value)
                    });
                  }
                }}
              >
                <SelectHundred />
              </select>
            </div>

            <div className={s.formItem}>
              <label>部屋数</label>
              <select
                className={`${validation.numberOfRoomsError ? `${s.error}` : ''}`}
                name="number_of_rooms"
                value={newReservationModel.number_of_rooms || ''}
                onChange={(event) => {
                  if (Number(event.target.value) > -1) {
                    setNewReservationModel({
                      ...newReservationModel,
                      number_of_rooms: Number(event.target.value)
                    });
                  }
                }}
              >
                <SelectHundred />
              </select>
            </div>
          </div>

          <div className={s.multiple}>
            <div className={s.formItem}>
              <label>人数</label>
              <select
                className={`${validation.numberOfGuestsTotalError ? `${s.error}` : ''}`}
                name="number_of_guests"
                value={newReservationModel.number_of_guests || ''}
                onChange={(event) => {
                  const numberOfGuestsForGender = {};

                  if (Number(event.target.value) > -1) {
                    if (newReservationModel.gender === 2) {
                      numberOfGuestsForGender.number_of_guests_male = Number(event.target.value)
                      numberOfGuestsForGender.number_of_guests_female = 0
                    } else {
                      numberOfGuestsForGender.number_of_guests_female = Number(event.target.value)
                      numberOfGuestsForGender.number_of_guests_male = 0
                    }

                    setNewReservationModel({
                      ...newReservationModel,
                      number_of_guests: Number(event.target.value),
                      ...numberOfGuestsForGender,
                    });
                  }
                }}
              >
                <SelectHundred />
              </select>
            </div>

            <div className={s.formItem}>
              <label>男性</label>
              <select
                className={`${validation.numberOfGuestsTotalError ? `${s.error}` : ''}`}
                name="number_of_guests_male"
                value={newReservationModel.number_of_guests_male}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    number_of_guests_male: Number(event.target.value)
                  });
                }}
              >
                <SelectHundred />
              </select>
            </div>

            <div className={s.formItem}>
              <label>女性</label>
              <select
                className={`${validation.numberOfGuestsTotalError ? `${s.error}` : ''}`}
                name="number_of_guests_female"
                value={newReservationModel.number_of_guests_female}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    number_of_guests_female: Number(event.target.value)
                  });
                }}
              >
                <SelectHundred />
              </select>
            </div>

            <div className={s.formItem}>
              <label>子供</label>
              <select
                name="has_child"
                value={newReservationModel.has_child}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    has_child: parseInt(event.target.value)
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
                value={newReservationModel.newGuestFlag}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    newGuestFlag: event.target.value
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
                value={newReservationModel.isCheckin}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    isCheckin: event.target.value
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
                value={newReservationModel.reservationMethodName}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    reservationMethodName: event.target.value
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
                value={newReservationModel.coupon}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    coupon: parseInt(event.target.value)
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
                value={newReservationModel.payment_method}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    payment_method: parseInt(event.target.value)
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
                value={newReservationModel.payment_status}
                onChange={(event) => {
                  setNewReservationModel({
                    ...newReservationModel,
                    payment_status: parseInt(event.target.value)
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
              value={newReservationModel.phone_number}
              onChange={(event) => {
                setNewReservationModel({
                  ...newReservationModel,
                  phone_number: event.target.value
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
              value={newReservationModel.home_address}
              onChange={(event) => {
                setNewReservationModel({
                  ...newReservationModel,
                  home_address: event.target.value
                });
              }}
            />
          </div>

          <div className={s.buttonContainer}>
            {/* キャンセルボタン */}
            <button
              className={s.gray}
              onClick={() => history.push('/reservations')}
            >
              キャンセル
            </button>

            {/* 新規登録ボタン */}
            <button
              className={s.blue}
              onClick={async () => { await addReservation() }}
            >
              登録
            </button>
          </div>
        </div>
      </div>

      {/* 登録完了ポップアップ */}
      <div
        className={`${!popupStatus.showRegistered ? 'd-none' : p.popupOverlay}`}
        onClick={() => history.push('/reservations')}
      >
        <div className={p.popup}>
          <div className={p.registered}>
            登録が完了しました。
            </div>
        </div>
      </div>

      {/* レコード重複ポップアップ */}
      <div
        className={`${!popupStatus.showDuplicateModal ? 'd-none' : p.popupOverlay}`}
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
            </ul>
            <div className={p.buttonContainer}>

              <button
                className={p.gray}
                onClick={() => {
                  setPopupStatus({
                    ...popupStatus,
                    showDuplicateModal: false
                  });
                }}
              >
                キャンセル
              </button>
              <button
                onClick={async () => {
                  await addReservation({
                    force: true
                  });

                  setPopupStatus({
                    ...popupStatus,
                    showDuplicateModal: false,
                    showRegistered: true,
                  });
                }}>
                追加
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 既存顧客が見つからなかった場合のポップアップ */}
      <div
        className={`${!popupStatus.showNoExistsModal ? 'd-none' : p.popupOverlay}`}
      >
        <div className={p.popup}>
          <div className={p.title}>
            予約登録エラー
                </div>
          <div className={p.container}>
            <div className={p.errorText}>
              既存顧客が見つかりませんでした
              </div>
            <div className={p.buttonContainer}>
              <button
                onClick={() => {
                  setPopupStatus({
                    ...popupStatus,
                    showNoExistsModal: false
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
        className={`${!popupStatus.showSameUserExistModal ? 'd-none' : p.popupOverlay}`}
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
                  setPopupStatus({
                    ...popupStatus,
                    showSameUserExistModal: false
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
        className={`${!popupStatus.showValidationModal ? 'd-none' : p.popupOverlay}`}
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

                if (validation.reservationHolderError) {
                  errorList.push(
                    `予約者名`
                  )
                }

                if (validation.reservationHolderKanaError) {
                  errorList.push(
                    `予約者名のふりがな`
                  )
                }

                if (validation.nameError) {
                  errorList.push(
                    `宿泊者名`
                  )
                }

                if (validation.nameKanaError) {
                  errorList.push(
                    `宿泊者名のふりがな`
                  )
                }

                if (validation.numberOfGuestsTotalError ||
                  validation.numberOfGuestsTotalErrorEdit) {
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
                  setPopupStatus({
                    ...popupStatus,
                    showValidationModal: false
                  });
                }}
              >
                閉じる
                </button>
            </div>
          </div>
        </div >
      </div >
    </Layout >
  );
}

export default Reservations;
