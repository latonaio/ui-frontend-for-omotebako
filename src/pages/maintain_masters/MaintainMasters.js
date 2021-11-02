import React from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import StatusBar2 from "../../components/StatusBar2";
import product from "../.././assets/images/maintain_masters/product.png";
import room from "../.././assets/images/maintain_masters/room.png";
import facility from "../.././assets/images/maintain_masters/facility.png";
import price from "../.././assets/images/maintain_masters/price.png";
import backup from "../.././assets/images/maintain_masters/backup.png";
import setting from "../.././assets/images/maintain_masters/setting.png";
import s from '../../scss/pages/maintain_masters/MaintainMasters.module.scss';

const MaintainMasters = () => {
	return (
		<Layout navType='maintain-masters'>
			<StatusBar2 icon='master' text='マスタ情報を照会・更新します。' />

			<div className={s.contents}>
				<div className={s.images}>
					<Link to={`/maintain-masters/product`}>
						<img src={product} />
								商品マスタ
							</Link>
					<Link to={`/maintain-masters/room`}>
						<img src={room} />
								客室マスタ
							</Link>
					<Link to={`/maintain-masters/facility`}>
						<img src={facility} />
								施設マスタ
							</Link>
					<Link to={`/maintain-masters/price`}>
						<img src={price} />
								価格マスタ
							</Link>
					<Link to={`/maintain-masters/backup`}>
						<img src={backup} />
								バックアップ
							</Link>
					<Link to={`/maintain-masters/setting`}>
						<img src={setting} />
								各種設定
							</Link>
				</div>
			</div>
		</Layout>
	);
};

export default MaintainMasters;