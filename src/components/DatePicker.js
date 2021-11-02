import React, { useState } from "react";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import DatePicker from "react-modern-calendar-datepicker";

function DateInput({ onChangeDate, name }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const handleOnChange = (val => {
    setSelectedDay(val);
    onChangeDate(name, val);
  })

  const renderCustomInput = ({ ref }) => (
    <input
      ref={ref}
      className="input"
      defaultValue={
        selectedDay
          ? `${selectedDay.year}-${selectedDay.month.toString().length === 1
            ? "0" + selectedDay.month
            : selectedDay.month
          }-${selectedDay.day.toString().length === 1
            ? "0" + selectedDay.day
            : selectedDay.day
          }`
          : ""
      }
      style={{
        width: "200px",
        height: "44px",
        border: "1px solid #a1a1aa",
        borderRadius: "5px",
        padding: "0 10px",
        fontSize: "25px",
        outline: "none",
      }}
    />
  );

  return (
    <DatePicker
      onChange={handleOnChange}
      defaultValue={selectedDay}
      renderInput={renderCustomInput}
      shouldHighlightWeekends
    />
  );
}

export default DateInput;
