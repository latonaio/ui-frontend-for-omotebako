import React from 'react';
import s from "../scss/pages/Calendar.module.scss";

const NoDataDisplay = () => {
  return (
    <div className={ s.displayFlex }>
      <p>データ取得中です。</p>
    </div>
  )
}

export default NoDataDisplay;
