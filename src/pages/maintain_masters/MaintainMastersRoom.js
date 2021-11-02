import React from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import plan1 from "../../assets/images/maintain_masters/plan/plan1.png";
import plan2 from "../../assets/images/maintain_masters/plan/plan2.png";
import plan3 from "../../assets/images/maintain_masters/plan/plan3.png";
import plan4 from "../../assets/images/maintain_masters/plan/plan4.png";
import bed from "../../assets/images/maintain_masters/room/bed-icon.png";
import s from '../../scss/pages/maintain_masters/MaintainMastersPage.module.scss';
import b from '../../scss/pages/maintain_masters/MaintainMasters.module.scss';

const floors = [
  { floor: 1 },
  { floor: 2 },
  { floor: 3 },
  { floor: 4 },
  { floor: 5 },
];

const roomData = [
  {
    id: 101,
    name: "川里の間",
    src: plan1,
    square_metre: 46.25,
    max_guest: 4,
    amenities: ["露天風呂", "バス", "トイレ"],
  },
  {
    id: 102,
    name: "鳥舞の間",
    src: plan2,
    square_metre: 32.7,
    max_guest: 3,
    amenities: ["露天風呂", "バス", "トイレ"],
  },
  {
    id: 103,
    name: "莱蓉の間",
    src: plan3,
    square_metre: 30.2,
    max_guest: 3,
    amenities: ["露天風呂", "バス", "トイレ"],
  },
  {
    id: 104,
    name: "欄月の間",
    src: plan4,
    square_metre: 52.25,
    max_guest: 4,
    amenities: ["露天風呂", "バス", "トイレ"],
  },
  {
    id: 105,
    name: "青陽の間",
    src: plan1,
    square_metre: 52.25,
    max_guest: 5,
    amenities: ["露天風呂", "バス", "トイレ"],
  },
  {
    id: 106,
    name: "風采の間",
    src: plan2,
    square_metre: 48.0,
    max_guest: 5,
    amenities: ["露天風呂", "バス", "トイレ"],
  },
];

class MaintainMastersRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isViewingDetail: false,
      viewingTab: 0,
    };
  }

  handleOnClickCard = () => {
    this.setState({ isViewingDetail: true });
  };

  render() {
    const { location } = this.props;
    const { isViewingDetail } = this.state;

    return (
      <Layout navType='maintain-masters'>
        <StatusBar2 icon='master' text='商品マスタのマスタ情報を照会・更新します。' />

        <div className={s.contents}>
          <div className={s.tabs}>
            {floors.map((i, idx) => {
              if (idx === 0) {
                return (
                  <div className={s.tabActive} key={idx}>
                    {i.floor}F
                  </div>
                )
              } else {
                return (
                  <button
                    className={s.tab}
                    key={idx}
                    onClick={() =>
                      this.setState({
                        isViewingDetail: false,
                        viewingTab: i.key,
                      })
                    }
                  >
                    {i.floor}F
                  </button>
                )
              }
            })}
          </div>

          {/* 客室マスタ一覧 */}
          {isViewingDetail === false && (
            <div className={s.grid2}>
              {roomData.map((i) => (
                <div className={s.card}
                  onClick={() => this.handleOnClickCard(i.plan_id)}
                >
                  <div class={s.cardHeader}>
                    {i.id} : {i.name}
                    <img src={bed} />
                  </div>
                  <div className={s.cardBody}>
                    <img src={i.src} />
                    <div className={s.info}>
                      <div>{i.square_metre}m²</div>
                      <div>最大{i.max_guest}名様</div>
                      <div>アメニティセット</div>
                      {i.amenities.join("、")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 客室マスタ 詳細 */}
          {isViewingDetail === true && (
            <div className={s.roomDetail}>
              <div className={s.left}>
                102 : 鳥舞の間
                    <img src={plan1} />
              </div>

              <div className={s.right}>
                <div>設備情報</div>
                <div className={s.listTableContainer}>
                  <table>
                    <thead>
                      <tr>
                        <td style={{ width: 200 }}>設備タイプ</td>
                        <td style={{ width: 300 }}>情報タイプ</td>
                        <td>数量</td>
                        <td>表示優先<br />順位</td>
                      </tr>
                    </thead>
                    <tbody>
                      {Array(15).fill('').map(() => {
                        return (
                          <tr>
                            <td>最大人数</td>
                            <td>最大人数</td>
                            <td>4</td>
                            <td>2</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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
      </Layout>
    );
  }
}

export default MaintainMastersRoom;