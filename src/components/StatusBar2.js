import React from "react";
import s from '../scss/components/StatusBar2.module.scss'
import checkIcon from ".././assets/images/check.png";
import nfcReader from "../../src/assets/images/payments/nfc-reader.png";
import paymentIcon from "../../src/assets/images/payment-icon.png";
import roomIcon from "../../src/assets/images/ryokan.png";
import checkin from "../../src/assets/images/checkin.png";
import master from "../../src/assets/images/maintain_masters/maintain-icon.png";
import masterBackup from "../assets/images/maintain_masters/backup.png";
import masterFacility from "../assets/images/maintain_masters/facility.png";
import setting from "../assets/images/maintain_masters/setting.png";
import calendar from "../assets/images/calendar-header.png";
import checkoutIcon from ".././assets/images/checkout-icon.png";
import hands from ".././assets/images/hands.png";

const StatusBar2 = ({ icon, text, right }) => {
  return (
    <div className={s.statusBar}>
      <div className={s.title}>
        {icon === 'checkIcon' && <img src={checkIcon} />}
        {icon === 'nfcReader' && <img src={nfcReader} />}
        {icon === 'paymentIcon' && <img src={paymentIcon} />}
        {icon === 'roomIcon' && <img src={roomIcon} />}
        {icon === 'checkin' && <img src={checkin} />}
        {icon === 'master' && <img src={master} />}
        {icon === 'masterBackup' && <img src={masterBackup} />}
        {icon === 'masterFacility' && <img src={masterFacility} />}
        {icon === 'setting' && <img src={setting} />}
        {icon === 'calendar' && <img src={calendar} />}
        {icon === 'checkoutIcon' && <img src={checkoutIcon} />}
        {icon === 'hands' && <img src={hands} />}
        {text}
      </div>
      {right}
    </div>
  );
};

export default StatusBar2;
