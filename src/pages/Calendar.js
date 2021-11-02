import React, { useState, useEffect, useMemo, useCallback } from "react";
import moment from 'moment';

import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Schedule from "../components/Schedule";
import NoDataDisplay from "../components/NoDataDisplay";

import config from '../util/config'
import RequestRedisManager from "../util/requestRedisManager";
import s from "../scss/pages/Calendar.module.scss";
import Calendar2 from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {formatDateWithHyphen} from "../helper/date";

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;
// 下記の値でセルのカラーを設定
const checkedData = [
  {
    text: 'planed',
    id: 1,
    color: '#1e90ff' // ブルー
  },
  {
    text: 'reserved',
    id: 2,
    color: '#ff9747' // オレンジ
  },
  {
    text: 'checked',
    id: 3,
    color: '#c0c0c0' // グレー
  },
];


class CalendarFilter {
  constructor(reservationList, guestsList,filterItems) {
    this.reservationList = reservationList;
    this.guestsList = guestsList;
    this.filterItems = filterItems;
  }

  filterIsCheckin() {
    if (this.filterItems['checkin_complete'].checked) {
      const list = this.reservationList.filter((reservation) => {
        return reservation.status_code === 1
      })
      console.log("filterIsCheckin: ",list)
      this.reservationList = list;
    }
    return this
  }

  filterIsCheckout() {
    if (this.filterItems['checkout_complete'].checked) {
      const list = this.guestsList.filter((guest) => {
        return guest.status_code === 2
      })
      console.log("filterIsCheckout: ",list)
      this.guestsList = list;
      this.reservationList = []; //チェックアウト済みなので予約データは全部非表示でOK
    }
    return this;
  }

  filterByCleaningStatus(filter_key,status_code){
    const now = formatDateWithHyphen(new Date())
    if (this.filterItems[filter_key].checked) {
      const reserves = this.reservationList.filter((reservation) => {
        const room = reservation.assigned_rooms.find((room) => {
          return room.stay_date === now
        })
        return room && room.room_status_master_code === status_code
      })
      const guests = this.guestsList.filter((guest) => {
        const room = guest.assigned_rooms.find((room) => {
          return room.stay_date === now
        })
        return room && room.room_status_master_code === status_code
      })
      this.reservationList = reserves
      this.guestsList = guests;
    }
    return this;
  }

  getFilterResult() {
    return {
      reservation: this.reservationList,
      guests: this.guestsList
    }
  }
}

const Calendar = ({ location, ...props }) => {
  const [reservationRecordModel, setReservationRecordModel] = useState([]);
  const [stayGuestsRecordModel, setStayGuestsRecordModel] = useState([]);
  const [firstRequest, setFirstRequest] = useState(true);
  const [requestRedisManagerInstanceState, setRequestRedisManagerInstanceState] = useState(undefined);
  const [reservationsViewList,setReservationsViewList] = useState([]);
  const [stayGuestsViewList,setStayGuestsViewList] = useState([]);
  const [filterItems, setFilterItems] = useState({
    'not_cleaned': {
      name: '未清掃',
      checked: false
    },
    'cleaning': {
      name: '清掃中',
      checked: false,
    },
    'cleaned': {
      name: '清掃済',
      checked: false,
    },
    'checkin_complete': {
      name: 'チェックイン済',
      checked: false,
    },
    'room_service': {
      name: 'ルームサービス',
      checked: false
    },
    'room_service_complete': {
      name: 'ルームサービス済',
      checked: false,
    },
    'checkout_complete': {
      name: 'チェックアウト済',
      checked: false,
    },
    'customer_memo': {
      name: 'お客様メモ',
      checked: false
    },
  });

  const checkboxList = [
    'not_cleaned',
    'cleaning',
    'cleaned',
    'checkin_complete',
    'room_service',
    'room_service_complete',
    'checkout_complete',
    'customer_memo',
  ]

  const handleClickFilter = (e) => {
    setFilterItems({
      ...filterItems,
      [e.target.value]: {
        ...filterItems[e.target.value],
        checked: !filterItems[e.target.value].checked
      }
    })
  }

  const filterAction = useMemo(() => {
    setReservationsViewList(reservationRecordModel)
    setStayGuestsViewList(stayGuestsRecordModel)
    const filter = new CalendarFilter(reservationRecordModel, stayGuestsRecordModel,filterItems);
    const result = filter.
    filterIsCheckin().
    filterIsCheckout().
    filterByCleaningStatus('not_cleaned',null).
    filterByCleaningStatus('cleaning',1).
    filterByCleaningStatus('cleaned',2).
    getFilterResult();
    setReservationsViewList(result.reservation)
    setStayGuestsViewList(result.guests)
  },[filterItems])


  // 予約&顧客取得処理
  useEffect(() => {
    const fetchRedisData = async () => {
      const getRequestRedisManagerInstance = () => {
        if (!requestRedisManagerInstanceState) {
          const instance = new RequestRedisManager(RequestRedisManagerAPIURL)

          setRequestRedisManagerInstanceState(instance)
          return instance;
        } else {
          return requestRedisManagerInstanceState
        }
      }

      const requestRedisManagerInstance = getRequestRedisManagerInstance();

      requestRedisManagerInstance.io.on('getReservations', async (reservation) => {
        console.log("reservation",reservation)
        setReservationRecordModel([...reservation]);
        setReservationsViewList([...reservation]);
      });
      requestRedisManagerInstance.io.on('getStayGuests', async (guests) => {
        console.log("guests",guests)
        setStayGuestsRecordModel([...guests]);
        setStayGuestsViewList([...guests]);
      });

      requestRedisManagerInstance.io.emit('getReservations');
      requestRedisManagerInstance.io.emit('getStayGuests');

    }
    fetchRedisData();

    return () => {
      if (requestRedisManagerInstanceState) {
        requestRedisManagerInstanceState.io.close();
      }
    }
  }, [requestRedisManagerInstanceState]); // 初期段階で取得

  // カレンダーに表示するデータの結合
  const calendarData = useMemo(() => {
    return [...reservationsViewList, ...stayGuestsViewList];
  }, [reservationsViewList, stayGuestsViewList])

  // チェックイン情報整形
  const calendarCheckInDateAry = useMemo(() => {
    return calendarData.map(item => {
      const checkInDateTime = moment(item.stay_date_from).format('YYYY-MM-DD HH:mm');
      const checkInEndDateTime = moment(item.stay_date_from).add(30, 'minutes').format('YYYY-MM-DD HH:mm');

      return {
        text: `チェックイン ${item.name}様`,
        startDate: checkInDateTime,
        endDate: checkInEndDateTime,
        priority: `${(item.is_checkin && item.is_checkin === 1) ? 3 // すでにチェックイン
          : (item.status_code === 1) ? 3 : 2}`, // 宿泊中
        isCheckin: true,
      };
    });
  }, [calendarData]);

  // チェックアウト情報整形
  const calendarCheckOutDateAry = useMemo(() => {
    return calendarData.map(item => {
      const checkOutDateTime = moment(item.stay_date_to).format('YYYY-MM-DD HH:mm');
      const checkOutEndDateTime = moment(item.stay_date_to).add(30, 'minutes').format('YYYY-MM-DD HH:mm');

      return {
        text: `チェックアウト ${item.name}様`,
        startDate: checkOutDateTime,
        endDate: checkOutEndDateTime,
        priority: 1,
        isCheckin: false,
      };
    });
  }, [calendarData]);

  // cellが更新されたらトリガー
  // ここに更新の処理を追加していく
  const updateDataCell = useCallback(( item ) => {
    console.log('update item', item)
  }, [])

  // cellが削除されたらトリガー
  // ここに削除の処理を追加していく
  const deleteDataCell = useCallback(( item ) => {
    console.log('delete item', item)
  }, [])

  // データの再結合
  const customersData = useMemo(() => {
    return [...calendarCheckInDateAry, ...calendarCheckOutDateAry]
  }, [calendarCheckInDateAry, calendarCheckOutDateAry]);

  const calendarAllData = useMemo(() => {
    return {
      customersData  : customersData,
      checkedData    : checkedData,
      updateDataCell : updateDataCell,
      deleteDataCell : deleteDataCell,
    }
  },[customersData]);

  return (
    <>
      <Header />
      <div className='d-flex'>
        <Navbar navType='calendar' />
        <div className={s.contents}>
          <div className={s.left}>
            <Calendar2
              value={new Date()}
            />
            <div className={s.checkBoxItem}>
              {checkboxList.map((item, idx) => (
                <label key={idx} className={s.labels}>
                  <input type="checkbox" name={filterItems[item].name}
                         className={s.checkbox} value={item}
                         checked={filterItems[item].checked}
                         onChange={handleClickFilter}
                  />
                  {filterItems[item].name}
                </label>
              ))}
            </div>
          </div>

          <div className={s.right}>
            <Schedule {...calendarAllData} />

            <div className={s.buttons}>
              <button className={s.button1}>
                カレンダー
						</button>
              <button className={s.button2}>
                予約サイト<br />
              連携
            </button>
              <button className={s.button3}>
                非対面<br />
							モード
						</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Calendar;
