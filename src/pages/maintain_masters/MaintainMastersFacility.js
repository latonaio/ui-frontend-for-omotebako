import React, { useState } from "react";
import { useHistory } from 'react-router-dom'
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import s from '../../scss/pages/ListPage.module.scss';
import b from '../../scss/pages/maintain_masters/MaintainMasters.module.scss';

const MaintainMastersFacility = () => {
	const [tab, setTab] = useState(1);
	const history = useHistory();
	const handleLink = path => history.push(path);

	const plan =
		[
			{
				plan_id: 0,
				facility_name: "本館、ほんかん",
				post_code:
					"123-4567",
				facility_address: "京都府",
				tel_no: "075-899-8999",
				fax_no: "075-899-8888",
				ip_address: "192.168.0.1",
				parson_charge: "ああああ",
				charge_mail: "xxxxx@xxxx.jp",
			},
			{
				plan_id: 1,
				facility_name: "露天風呂付離れ「ほととぎす」",
				post_code:
					"123-4567",
				facility_address: "大阪府",
				tel_no: "06-1234-1234",
				fax_no: "06-1234-5678",
				ip_address: "192.168.10.1",
				parson_charge: "ああああ",
				charge_mail: "xxxxx@xxxx.jp",
			},
			{
				plan_id: 2,
				facility_name: "露天風呂付き客室",
				post_code:
					"123-4567",
				facility_address: "兵庫県",
				tel_no: "078-123-1234",
				fax_no: "078-123-5678",
				ip_address: "192.168.20.1",
				parson_charge: "ああああ",
				charge_mail: "xxxxx@xxxx.jp",
			},
			{
				plan_id: 3,
				facility_name: "日帰り",
				post_code:
					"123-4567",
				facility_address: "奈良県",
				tel_no: "0800-12-1234",
				fax_no: "0800-12-8955",
				ip_address: "192.168.30.1",
				parson_charge: "ああああ",
				charge_mail: "xxxxx@xxxx.jp",
			},
			{
				plan_id: 4,
				facility_name: "日帰り",
				post_code:
					"123-4567",
				facility_address: "奈良県",
				tel_no: "0800-12-1234",
				fax_no: "0800-12-8955",
				ip_address: "192.168.30.1",
				parson_charge: "ああああ",
				charge_mail: "xxxxx@xxxx.jp",
			},
			{
				plan_id: 5,
				facility_name: "日帰り",
				post_code:
					"123-4567",
				facility_address: "奈良県",
				tel_no: "0800-12-1234",
				fax_no: "0800-12-8955",
				ip_address: "192.168.30.1",
				parson_charge: "ああああ",
				charge_mail: "xxxxx@xxxx.jp",
			},
			{
				plan_id: 6,
				facility_name: "日帰り",
				post_code:
					"123-4567",
				facility_address: "奈良県",
				tel_no: "0800-12-1234",
				fax_no: "0800-12-8955",
				ip_address: "192.168.30.1",
				parson_charge: "ああああ",
				charge_mail: "xxxxx@xxxx.jp",
			},
			{
				plan_id: 7,
				facility_name: "日帰り",
				post_code:
					"123-4567",
				facility_address: "奈良県",
				tel_no: "0800-12-1234",
				fax_no: "0800-12-8955",
				ip_address: "192.168.30.1",
				parson_charge: "ああああ",
				charge_mail: "xxxxx@xxxx.jp",
			},
			{
				plan_id: 8,
				facility_name: "日帰り",
				post_code:
					"123-4567",
				facility_address: "奈良県",
				tel_no: "0800-12-1234",
				fax_no: "0800-12-8955",
				ip_address: "192.168.30.1",
				parson_charge: "ああああ",
				charge_mail: "xxxxx@xxxx.jp",
			},
		]

	return (
		<Layout navType='maintain-masters'>
			<StatusBar2 icon='maintainFacility' text='施設マスタの設定を行います。'
				right='契約プラン：プロフェッショナル'
			/>

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
			<div className={`${s.listTableContainer} ${s.masterPage}`}>
				<table className={tab === 1 ? 'fadeIn' : 'd-none'}>
					<thead>
						<tr >
							<td width={"150px"}>施設番号</td>
							<td width={"300px"}>旅館名</td>
							<td>郵便番号</td>
							<td width={"800px"}>住所</td>
						</tr>
					</thead>
					<tbody>
						{Array(...plan).map((i) => {
							return (
								<tr onClick={() => handleLink(`../maintain-masters/setting`)}>
									<td>{i.plan_id}</td>
									<td>{i.facility_name}</td>
									<td>{i.post_code}</td>
									<td>{i.facility_address}</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				{/* タブ2 */}
				<table className={tab === 2 ? 'fadeIn' : 'd-none'}>
					<thead>
						<tr>
							<td width={"150px"}>施設番号</td>
							<td width={"300px"}>旅館名</td>
							<td>TEL</td>
							<td>FAX</td>
							<td>IP</td>
						</tr>
					</thead>

					<tbody>
						{Array(...plan).map((i) => {
							return (
								<tr onClick={() => handleLink(`../maintain-masters/setting`)}>
									<td>{i.plan_id}</td>
									<td>{i.facility_name}</td>
									<td>{i.tel_no}</td>
									<td>{i.fax_no}</td>
									<td>{i.ip_address}</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				{/* タブ3 */}
				<table className={tab === 3 ? 'fadeIn' : 'd-none'}>
					<thead>
						<tr>
							<td width={"150px"}>施設番号</td>
							<td width={"300px"}>旅館名</td>
							<td>担当者</td>
							<td>担当者メール</td>
						</tr>
					</thead>

					<tbody>
						{Array(...plan).map((i) => {
							return (
								<tr onClick={() => handleLink(`../maintain-masters/setting`)}>
									<td>{i.plan_id}</td>
									<td>{i.facility_name}</td>
									<td>{i.parson_charge}</td>
									<td>{i.charge_mail}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<footer>
				<div className={s.memo}>
					親施設の情報はここでは変更することができません
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
			</footer>
		</Layout>
	);
};

export default MaintainMastersFacility;