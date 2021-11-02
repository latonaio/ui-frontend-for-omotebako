import React from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import plan1 from "../../assets/images/maintain_masters/plan/plan1.png";
import plan2 from "../../assets/images/maintain_masters/plan/plan2.png";
import plan3 from "../../assets/images/maintain_masters/plan/plan3.png";
import plan4 from "../../assets/images/maintain_masters/plan/plan4.png";
import plan5 from "../../assets/images/maintain_masters/plan/plan5.png";
import plan6 from "../../assets/images/maintain_masters/plan/plan6.png";
import plan7 from "../../assets/images/maintain_masters/plan/plan7.png";
import plan8 from "../../assets/images/maintain_masters/plan/plan8.png";
import plan9 from "../../assets/images/maintain_masters/plan/plan9.png";
import plan10 from "../../assets/images/maintain_masters/plan/plan10.png";
import plan11 from "../../assets/images/maintain_masters/plan/plan11.png";
import plan12 from "../../assets/images/maintain_masters/plan/plan12.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import s from '../../scss/pages/maintain_masters/MaintainMastersPage.module.scss';
import b from '../../scss/pages/maintain_masters/MaintainMasters.module.scss';

const category = [
  { key: 0, name: "プラン" },
  { key: 1, name: "特集" },
  { key: 2, name: "料理" },
  { key: 3, name: "オプション" },
];

const plan = {
  default: [
    {
      plan_id: 0,
      name: "和室8畳(渓谷側)会席料理プラン",
      description:
        "お部屋は渓谷に面しており、季節の移ろいをお部屋からもお楽しみいただけます。",
      src: plan1,
      hashtag: ["1泊", "夕食", "朝食"],
      max_price: 16000,
      min_price: 11000,
    },
    {
      plan_id: 1,
      name: "特選和牛すき焼き・露天風呂付離れ「ほととぎす」",
      description:
        "♪♪京都市内より3°C～5°C涼しい川床席でお食事をお召し上がりいただきます。舞妓さんとの語らいや、京舞がご覧頂けます。記念写真もお撮りいただけます。天然記念物...",
      src: plan2,
      hashtag: ["1泊", "夕食", "朝食"],
      max_price: 23000,
      min_price: 35000,
    },
    {
      plan_id: 2,
      name: "【露天風呂付き客室利用】朝食付きプラン",
      description:
        "1日2組様限定！露天風呂付き客室と朝食をセットにしたプランです。朝食はビュッフェ会場にてお楽しみください。",
      src: plan3,
      hashtag: ["日帰り", "昼食"],
      max_price: 5000,
      min_price: 6500,
    },
    {
      plan_id: 3,
      name: "秋の味覚日帰り昼食",
      description:
        "～秋の北山会席又は湯葉しゃぶ御膳をご賞味～京都・高雄の紅葉狩りは古くは江戸時代より始まっていたと伝えられております。毎年多くの方が秋の紅葉の時期になると高雄...",
      src: plan4,
      hashtag: ["日帰り", "昼食"],
      max_price: 4500,
      min_price: 3500,
    },
  ],
  specialCollection: [
    {
      plan_id: 4,
      name: "川床ウェディングプラン",
      description:
        "京の夏の風物詩「川床」でのお２人だけの披露宴は如何ですか！お式は教会・お寺・神社でお済ませ頂き、さわやかな川床での披露宴です。都会の雑踏から離れ、もみじに囲まれ..",
      src: plan5,
      hashtag: ["日帰り", "昼食"],
      max_price: 50000,
      min_price: 15000,
    },
    {
      plan_id: 5,
      name: "ご結納・お顔合わせプラン",
      description:
        "ご両家の大事なお顔合わせを静かな山間のお部屋または川床でしていただけます。ＪＲ花園駅・地下鉄東西線太秦天神川駅からの送迎もご利用いただけます。",
      src: plan8,
      hashtag: ["日帰り", "昼食"],
      max_price: 11000,
      min_price: 15000,
    },
    {
      plan_id: 6,
      name: "同窓会・各種会合プラン",
      description:
        "町中から少し入った静かな山間で久しく積もったお話や近況をお話頂ければ幸いです。マイクロバスで送迎をさせていただきます。（ご相談下さい。）",
      src: plan7,
      hashtag: ["日帰り", "昼食"],
      max_price: 10000,
      min_price: 55000,
    },
    {
      plan_id: 7,
      name: "忘年会・新年会プラン",
      description:
        "町中からちょっと離れた場所での忘年会・新年会。ちょっとした旅行気分の宴会は如何でしょうか！マイクロバスでの送迎が有りますので安心してお楽しみ頂けます。",
      src: plan6,
      hashtag: ["日帰り", "昼食"],
      max_price: 8000,
      min_price: 12000,
    },
  ],
  specialDishes: [
    {
      plan_id: 8,
      name: "夏の北山[松]",
      description:
        "清滝川に架かったつり橋を渡ると、清滝川の清流に張り出して作られた川床がございます。京都市内より3～5度低いという夏の別天地ともいうべきところでございます。せせらぎの音につつまれて涼しい...",
      src: plan9,
      hashtag: ["日帰り", "昼食"],
      max_price: 50000,
      min_price: 15000,
    },
    {
      plan_id: 9,
      name: "夏の北山［朝食]",
      description:
        "清滝川に架かったつり橋を渡ると、清滝川の清流に張り出して作られた川床がございます。京都市内より3～5度低いという夏の別天地ともいうべきところでございます。せせらぎの音につつまれて涼しい",
      src: plan11,
      hashtag: ["日帰り", "昼食"],
      max_price: 11000,
      min_price: 15000,
    },
    {
      plan_id: 10,
      name: "特選和牛しゃぶしゃぶコース",
      description:
        "清滝川に架かったつり橋を渡ると、清滝川の清流に張り出して作られた川床がございます。京都市内より3～5度低いという夏の別天地ともいうべきところでございます。せせらぎの音につつまれて涼しい",
      src: plan10,
      hashtag: ["日帰り", "昼食"],
      max_price: 10000,
      min_price: 55000,
    },
    {
      plan_id: 11,
      name: "清涼の里［雪］",
      description:
        "清滝川に架かったつり橋を渡ると、清滝川の清流に張り出して作られた川床がございます。京都市内より3～5度低いという夏の別天地ともいうべきところでございます。せせらぎの音につつまれて涼しい",
      src: plan12,
      hashtag: ["日帰り", "昼食"],
      max_price: 8000,
      min_price: 12000,
    },
  ],
};

class MaintainMastersProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isViewingDetail: false,
      viewingTab: 0,
    };
  }

  getContent = () => {
    const { viewingTab } = this.state;
    switch (viewingTab) {
      case 0:
        return plan.default;
      case 1:
        return plan.specialCollection;
      case 2:
        return plan.specialDishes;
      default:
        return plan.default;
    }
  };

  handleOnClickCard = (planId) => {
    const { viewingTab } = this.state;
    const planCategory = this.getContent(viewingTab);
    const selectedPlan =
      planCategory.filter((i) => i.plan_id === planId)[0] || null;
    this.setState({ isViewingDetail: true, selectedPlan });
  };

  render() {
    const { location } = this.props;
    const { isViewingDetail, viewingTab, selectedPlan } = this.state;

    return (
      <Layout navType='maintain-masters'>
        <StatusBar2 icon='master' text='商品マスタのマスタ情報を照会・更新します。' />

        <div className={s.contents}>
          <div className={s.tabs}>
            {category.map((i, idx) => {
              return (
                <button
                  className={viewingTab === idx ? s.tabActive : s.tab}
                  key={idx}
                  onClick={() =>
                    this.setState({
                      isViewingDetail: false,
                      viewingTab: i.key,
                    })
                  }
                >
                  {i.name}
                </button>
              )
            })}
          </div>

          {/* 商品マスタ一覧 */}
          {isViewingDetail === false && (
            <div className={s.grid}>
              {this.getContent(viewingTab).map((i, idx) => (
                <div className={s.card}
                  key={idx}
                  onClick={() => this.handleOnClickCard(i.plan_id)}
                >
                  <div className={s.cardHeader}>
                    {i.name}
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </div>
                  <div className={s.cardBody}>
                    <img src={i.src} />
                    <div className={s.texts}>
                      <div className={s.description}>{i.description}</div>
                      <div className={s.hashTags}>
                        {i.hashtag.map((i, idx) => (
                          <div className={s.hashTag} key={idx}>{`#${i}`}</div>
                        ))}
                        <div className={s.price}>
                          {i.min_price} - {i.max_price}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 商品マスタ 詳細 */}
          {isViewingDetail === true && (
            <div className={s.roomDetail}>
              <div className={s.left}>
                {selectedPlan.name}
                <img src={selectedPlan.src} />
              </div>

              <div className={s.right}>
                <div className={s.plan}>
                  ＜プラン概要＞
                      <div className={s.text}>{selectedPlan.description}</div>
                </div>

                <div className={s.tagSection}>
                  <div>＜タグ＞ ※基本タグは自動生成されます</div>
                  <div className={s.tags}>
                    {selectedPlan.hashtag.map((i, idx) => (
                      <div className={s.tag} key={idx}>{`#${i}`}</div>
                    ))}
                  </div>
                  <div className={s.tableTitle}>＜価格テーブル＞</div>
                  <table>
                    <thead>
                      <tr>
                        <td>条件タイプ</td>
                        <td>テキスト</td>
                        <td>価格</td>
                        <td>価格タイプ</td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>RY002</td>
                        <td>基本宿泊料金(朝食)</td>
                        <td>8,000</td>
                        <td>サ・税込</td>
                      </tr>
                      <tr>
                        <td>SP001</td>
                        <td>追加価格 露天付き部屋</td>
                        <td>3,000</td>
                        <td>サ・税込</td>
                      </tr>
                      <tr className={s.total}>
                        <td></td>
                        <td>合計</td>
                        <td>11,000</td>
                        <td>-</td>
                      </tr>
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

export default MaintainMastersProduct;
