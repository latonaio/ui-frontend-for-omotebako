import React, { useState } from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import logo from './logo.png'
import s from '../../scss/pages/maintain_masters/MaintainMastersSetting.module.scss';
import b from '../../scss/pages/maintain_masters/MaintainMasters.module.scss';

const MaintainMastersSetting = () => {
  const [tab, setTab] = useState(1);

  return (
    <Layout navType='maintain-masters' >
      <StatusBar2 icon='setting' text='各種設定を行います' right='契約プラン：プロフェッショナル' />

      <div className={s.maintainMastersSetting}>
        {/* Arrows */}
        <div
          className={tab === 1 ? 'd-none' : `${s.arrowLeft} fadeIn`}
          onClick={() => setTab(tab - 1)}
        ></div>
        <div
          className={tab === 3 ? 'd-none' : `${s.arrowRight} fadeIn`}
          onClick={() => setTab(tab + 1)}
        ></div>

        {/* タブ1 */}
        <table className={tab === 1 ? 'fadeIn' : 'd-none'}>
          <tr>
            <th>
              旅館名：
          </th>
            <td><input type='text' /></td>
          </tr>
          <tr>
            <th>
              施設名：
          </th>
            <td><input type='text' /></td>
            <label>親施設</label>
          </tr>
          <tr>
            <th>
              担当者：
          </th>
            <td><input type='text' /></td>
            <label>親施設</label>
          </tr>
          <tr>
            <th>
              担当者メール：
          </th>
            <td><input type='text' /></td>
            <label>親施設</label>
          </tr>
          <tr>
            <th>
              IP：
          </th>
            <td><input type='text' /></td>
            <label>親施設</label>
          </tr>
        </table>

        {/* タブ2 */}
        <table className={tab === 2 ? 'fadeIn' : 'd-none'}>
          <tr>
            <th>
              郵便番号：
          </th>
            <td><input type='text' /></td>
            <label>親施設</label>
          </tr>
          <tr>
            <th>
              住所：
          </th>
            <td><input type='text' /></td>
            <label>親施設</label>
          </tr>
          <tr>
            <th>
              Tel：
          </th>
            <td><input type='text' /></td>
            <label>親施設</label>
          </tr>
          <tr>
            <th>
              Fax：
          </th>
            <td><input type='text' /></td>
            <label>親施設</label>
          </tr>
          <tr>
            <th>
              ロゴ：
              </th>
            <div className={s.logo}>
              <img src={logo} />
              <input type="file" accept="image/png, image/jpeg" />
            </div>
          </tr>
          <tr>
            <th>
              営業<br />締め時間：
          </th>
            <td>
              <input type='text' />
            </td>
          </tr>
        </table>

        {/* タブ3 */}
        <div className={tab === 3 ? 'fadeIn' : 'd-none'}>
          <table>
            <tr>
              <th>無制限バージョン<br />アップ有効化：</th>
              <td className={s.checkBox}><input type='checkbox' /></td>
            </tr>
            <tr>
              <th>無制限バージョン<br />アップ時刻：</th>
              <td><input type='text' /></td>
            </tr>
            <tr>
              <th>現在バージョン<br />最新バージョン：</th>
              <td className={s.versionText}>
                1.05<span>/</span>1.06
                </td>
            </tr>
            <tr>
              <th>クラウド自動データ<br />バックアップ有効化：</th>
              <td className={s.checkBox}><input type='checkbox' /></td>
            </tr>
            <tr>
              <th>クラウド自動データ<br />バックアップ時刻:</th>
              <td><input type='text' /></td>
            </tr>
          </table>

          <div className={s.cloudBackUpInfo}>
            ※クラウド自動データバックアップでは、全ての顧客データは暗号化されます
            </div>

          <div className={s.memo}>
            開発メモ:<br />
              ・上記はプロフェショナルプランの場合のみ設定できる。スタンダードプランの場合はグレーアウトして設定できない。<br />
              ・無制限バージョンアップ時刻と、クラウドデータバックアップ時刻は、<br />
              1時間以上空いていないとエラーになる。<br />
              ・これらの時間が営業締め時間より前、かつ、日本時間朝6時以降だとエラーになる。<br />
          </div>
        </div>

        {/* buttons */}
        <div className={b.buttons}>
          <button className={b.button1}>
            予約サイト<br />
            連携
          </button>
          <button className={b.button2}>
            自社HP<br />
            連携
          </button>
          <button className={b.button3}>
            客室<br />
            管理
          </button>
          <button className={b.button4}>
            顧客<br />
            管理
          </button>
          <button className={b.button5}>
            非対面<br />
            モード
          </button>
        </div>
      </div>
    </Layout >
  );
};

export default MaintainMastersSetting;
