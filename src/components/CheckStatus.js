import React from "react";
import s from '../scss/components/CheckStatus.module.scss';
import { IoMdArrowDropright } from 'react-icons/io';

const CheckStatus = ({ status }) => {
  return (
    <div className={s.container}>
      {(status === 'checkin1' || status === 'checkin2' || status === 'checkin3') &&
        <>
          <div className={s.title}>＜チェックイン手続きのステータス＞</div>
          <div className={s.row}>
            <div className={`${status === 'checkin1' ? `${s.textActive}` : `${s.text}`}`}>
              撮影
            </div>
            <IoMdArrowDropright />
            <div className={`${status === 'checkin2' ? `${s.textActive}` : `${s.text}`}`}>
              確認/登録
            </div>
            <IoMdArrowDropright />
            <div className={`${status === 'checkin3' ? `${s.textActive}` : `${s.text}`}`}>
              完了
            </div>
          </div>
        </>
      }

      {(status === 'checkout1' || status === 'checkout2' || status === 'checkout3') &&
        <>
          <div className={s.title}>＜チェックアウト手続きのステータス＞</div>
          <div className={s.row}>
            <div className={`${status === 'checkout1' ? `${s.textActive}` : `${s.text}`}`}>
              撮影
            </div>
            <IoMdArrowDropright />
            <div className={`${status === 'checkout2' ? `${s.textActive}` : `${s.text}`}`}>
              会計
            </div>
            <IoMdArrowDropright />
            <div className={`${status === 'checkout3' ? `${s.textActive}` : `${s.text}`}`}>
              完了
            </div>
          </div>
        </>
      }
    </div>
  );
};

export default CheckStatus;
