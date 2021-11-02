import React, { useState } from "react";
import DatePicker, { registerLocale } from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import '../scss/components/DatePicker2.scss'
import ja from 'date-fns/locale/ja';
import { formatDateWithTime } from "../helper/date";

registerLocale('ja', ja)

const DatePicker2 = (
  {
    reservationDate,
    withoutTime = false,
    onKeyDown,
    onBlur,
    onChange,
    onCalendarClose
  }
  ) => {
  const [
    startDate,
    setStartDate,
  ] = useState(
    reservationDate ? new Date(reservationDate) : new Date()
  );

  const filterPassedTime = time => {
    const currentDate = new Date();
    const selectedDate = new Date(time);

    return currentDate.getTime() < selectedDate.getTime();
  }

  return (
    <div className={'datePickerComponent'}>
      {/* shouldCloseOnSelect falseは別のところをクリックしてもカレンダーを閉じさせない設定 */}
      {
        !withoutTime && (
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date)
              onChange(formatDateWithTime(date));
            }}
            onKeyDown={async (event) => {
              onKeyDown(event);
            }}
            onBlur={async () => {
              onBlur();
            }}
            onCalendarClose={() => {
              onCalendarClose();
            }}
            shouldCloseOnSelect={false}
            // filterTime={filterPassedTime}
            dateFormat="yyyy-MM-dd HH:mm"
            showTimeSelect={true}
          />
        )
      }
      {
        withoutTime && (
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date)
              onChange(formatDateWithTime(date));
            }}
            onKeyDown={async (event) => {
              onKeyDown(event);
            }}
            onBlur={async () => {
              onBlur();
            }}
            onCalendarClose={() => {
              onCalendarClose();
            }}
            shouldCloseOnSelect={false}
            dateFormat="yyyy-MM-dd"
          />
        )
      }
    </div>
  );
}

export default DatePicker2;
