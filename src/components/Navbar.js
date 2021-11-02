import React from "react";
import { Link } from "react-router-dom";
import s from '../scss/components/Navbar.module.scss'

const Navbar = ({ navType }) => {
  return (
    <div className={s.nav}>
      <Link className={`
        ${navType === 'checkin'
          ? s.navItemActive : s.navItem}`}
        to='/checkin'>
        チェックイン
      </Link>
      <Link className={`
          ${navType === 'checkout'
          ? s.navItemActive : s.navItem}`}
        to='/checkout'>
        チェックアウト
      </Link>
      <Link className={`
        ${navType === 'reservations'
          ? s.navItemActive : s.navItem}`}
        to='/reservations'
      >
        予約管理
      </Link>
      <Link className={`
        ${navType === 'room-management'
          ? s.navItemActive : s.navItem}`}
        to='/room-management'>
        客室管理
      </Link>
      <Link className={`
        ${navType === 'customers'
          ? s.navItemActive : s.navItem}`}
        to='/customers/reservations'
      >
        顧客管理
      </Link>
      <Link className={`
        ${navType === 'site-controller'
          ? s.navItemActive : s.navItem}`}
        to='/site-controller'
      >
        SC連携
      </Link>
      <Link className={`
        ${navType === 'maintain-masters'
          ? s.navItemActive : s.navItem}`}
        to='/maintain-masters'
      >
        マスタ設定
      </Link>
      <Link className={`
        ${navType === 'calendar'
          ? s.navItemActive : s.navItem}`}
        to='/calendar'
      >
        カレンダー
      </Link>
      <Link className={`
        ${navType === 'accounting'
          ? s.navItemActive : s.navItem}`}
        to="/accounting"
      >
        売上管理
      </Link>
    </div >
  );
};

export default Navbar;