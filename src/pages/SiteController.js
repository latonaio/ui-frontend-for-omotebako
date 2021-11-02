import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import statusIcon from "../assets/images/maintain_masters/setting.png";
import s from '../scss/pages/SiteController.module.scss';
import { VscCheck } from 'react-icons/vsc';

const SiteController = () => {
	return (
		<>
			<Header />
			<div className='d-flex'>
				<Navbar navType='site-controller' />
				<div className={s.siteController}>
					<div className={s.statusBar}>
						<div className={s.title}>
							<img src={statusIcon} />
              サイトコントローラーのファイル取り込みをします。
            </div>
						<div>契約プラン：プロフェッショナル</div>
					</div>

					<div className={s.listTypes}>
						<div
							className={s.listTypeActive}
						>
							予約情報
              </div>
						<div
							className={s.listType}
						>
							顧客情報
              </div>
						<div
							className={s.listTypeInactive}
						>
							未使用
              </div>
					</div>

					<div className={s.container}>
						<div className={s.uploadList}>
							<div className={s.uploadListItem}>
								<div className={s.title}>
									ファイル取り込み：
								</div>
								<input className={s.fileUploader} type='file' />
							</div>
							<div className={s.uploadListItem}>
								<div className={s.title}>
									前回の取り込み：
								</div>
								<div className={s.detail}>
									2021/05/02 22:10
								</div>
							</div>
						</div>

						{/* アップロード前 */}
						{/* <div className={s.fileImporterInactvive}>
							ファイルの取り込みをする
						</div> */}

						{/* アップロード後 */}
						<button className={s.fileImporterButton}>
							ファイルの取り込みをする
						</button>

						{/* 取り込み完了後 */}
						{/* <div className={s.complete}>
							<div className={s.completeText}>
								ファイルの取り込みが完了しました。
							</div>
							<div className={s.fileImporterComplete}>
								ファイルの取り込みをする
							</div>
							<VscCheck />
						</div> */}

					</div>
				</div>
			</div>
		</>
	);
};

export default SiteController;