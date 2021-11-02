import React from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import s from '../../scss/pages/accounting/detail.module.scss';


const AccountingDetail = () => {
	return (
		<Layout navType='accounting' >
			<StatusBar2 text='売上伝票を照会しています。' />

			<div className={s.contents}>
				<div className={s.voucherInfo}>
					<table>
						<tr>
							<th>
								伝票番号：
                </th>
							<td><input type='text' /></td>
						</tr>
						<tr>
							<th>
								伝票タイプ：
                </th>
							<td><input type='text' /></td>
						</tr>
						<tr>
							<th>
								伝票日付：
                </th>
							<td><input type='text' /></td>
						</tr>
						<tr>
							<th>
								Guest：
                </th>
							<td><input type='text' /></td>
						</tr>
						<tr>
							<th>
								金額：
                </th>
							<td><input type='text' /></td>
						</tr>
					</table>

					<div className={s.snapShotInfo}>
						<div>＜お客さまのSnapshot情報＞</div>
						<div>XXXXXXXX</div>
						<div>XXXXXXXX様</div>
						<div>お会計金額：37,100円(税込)</div>
						<div>支払い方法</div>
						<div>クレジット払(現地)</div>
					</div>
				</div>

				<div className={s.total}>
					<div>仕訳：</div>
					<div>売掛金：37,100円</div>
					<div>/</div>
					<div>
						<div>売上高：</div>
						<div>仮受入湯税：</div>
						<div>仮受消費税：</div>
					</div>
					<div className={s.value}>
						<div>33,455</div>
						<div>150</div>
						<div>3,455</div>
					</div>
				</div>

				<footer>

					<div className={s.left}>
						<div className={s.box}>
							<button className={s.button1}>
								領収書確認
							</button>
							<div className={s.text}>※円票情報を変更すると、領収書との整合性が取れなくなることがあります</div>
						</div>
						<div className={s.box}>
							<button className={s.button2}>
								赤伝票
							</button>
							<div className={s.text}>※赤伝票を登録すると、元の伝票の修正はできなくなります</div>
						</div>
					</div>

					<div className={s.buttons}>
						<button className={s.button1}>
							売上管理
							  </button>
						<button className={s.button2}>
							非対面<br />
								モード
							</button>
					</div>
				</footer>
			</div>
		</Layout >
	);
};

export default AccountingDetail;
