import React from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import s from '../../scss/pages/maintain_masters/MaintainMastersBackup.module.scss';
import b from '../../scss/pages/maintain_masters/MaintainMasters.module.scss';
import { VscCheck } from 'react-icons/vsc';


const MaintainMastersBackup = () => {
	return (
		<Layout navType='maintain-masters'>
			<StatusBar2 icon='masterBackup' text='手動によるデータバックアップを行います' />

			<div className={s.contents}>
				<table>
					<tr>
						<th>
							USBストレージ<br />
							接続状況
						</th>
						<td>
							<input type='checkbox' />
						</td>
					</tr>
					<tr>
						<th>
							USBストレージ<br />
							型番シリアル
						</th>
						<td>BUFFALO123-090</td>
					</tr>
				</table>


				{/* バックアップ実行 */}
				<button className={s.backupButton}>
					バックアップ実行
				</button>

				{/* バックアップ完了テキスト */}
				<div className={s.complete}>
					<VscCheck />
					<div className={s.completeMessage}>
						バックアップ<br />
						処理が正常に<br />行われました
					</div>
				</div>

				{/* バックアップ実行中 */}
				{/* <div className={s.backupButtonLoading}>
							バックアップ処理を<br />
							実行しています
						</div> */}
			</div>

			<footer>
				<div className={s.memo}>
					開発メモ：<br />
					・二個以上のUSBストレージを接続しても、片方しか認識しない<br />
					・バックアップ実行中も、他の作業はできる(=バックアップ実行コンテナは独立したマイクロサービスとする)
				</div>
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
};

export default MaintainMastersBackup;
