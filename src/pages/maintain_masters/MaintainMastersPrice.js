import React from "react";
import Layout from "../../components/Layout";
import config from '../../util/config';
import StatusBar2 from "../../components/StatusBar2";
import s from '../../scss/pages/ListPage.module.scss';
import b from '../../scss/pages/maintain_masters/MaintainMasters.module.scss';
import { Label } from 'recharts';
const API_URL = config.ReactAppAPIURL;

class MaintainMastersPrice extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      results: [{}],
    };
  }

  componentWillMount() {
    this.getPriceMaster();
  }

  getPriceMaster = () => {
    fetch(`${API_URL}price/`, {})
      .then((response) => response.json())
      .then((results) => {
        this.setState({
          results,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  render() {
    return (
      <Layout navType='maintain-masters'>
        <StatusBar2 icon='master' text='価格マスタのマスタ情報を照会・更新します' />

        <div className={`${s.listTableContainer} ${s.masterPage}`}>
          <table>
            <thead>
              <tr>
                <td>条件タイプ</td>
                <td>テキスト</td>
                <td>数量単位</td>
                <td> 数量1</td>
                <td>数量2</td>
                <td>価格(円)</td>
                <td>価格タイプ</td>
              </tr>
            </thead>

            <tbody>
              {Array(15).fill('').map(() => {
                return (
                  <tr>
                    <td>RY001</td>
                    <td>朝食(客室対応)</td>
                    <td>泊</td>
                    <td>1</td>
                    <td>1</td>
                    <td>12,000</td>
                    <td>サ・税込</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer>
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
        </footer>
      </Layout>
    );
  }
}

export default MaintainMastersPrice;