import React from "react";
import Layout from "../components/Layout";
import StatusBar2 from "../components/StatusBar2";
import { getFetch } from "../util/api";
import s from '../scss/pages/ReservationList.module.scss';
import { connect } from "react-redux";

class ReservationList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      guestId: null,
      reservationList: [],
      checkin: this.props.checkin
    };
  }

  async componentWillMount() {
    await this.getReservationList();
  }

  getReservationList = async () => {
    try {
      const result = await getFetch.getReservationList('0');
      this.setState({
        reservationList: result,
      });

      console.log(result);
    } catch (e) {
      console.error("getReservationList error:", e);
      throw e;
    }
  };

  render() {
    const {
      checkin,
    } = this.props;

    const { } = this.state;

    return (
      <Layout navType='checkin'>
        <StatusBar2 icon='checkin' text='お客様のチェックインを行っています。' />

        <div className={s.reservationList}>
          <div className={s.left}>
            <img
              className={s.leftImage}
              src={checkin.imagePath}
            />
          </div>

          <div className={s.right}>
            <div className={s.listTitle}>
              顧客リストから該当する顧客を選択してください。
            </div>
            <div className={s.listTableContainer}>
              <table>
                <thead>
                  <tr>
                    <td style={{ width: 500 }}>顧客名</td>
                    <td>宿泊日</td>
                    <td>{`泊数/\n人数`}</td>
                    <td>部屋数</td>
                  </tr>
                </thead>

                <tbody>
                  {this.state.reservationList.length > 0 && this.state.reservationList.map((list) => (
                    <tr>
                      <td
                        className={s.name}
                        onClick={() => {
                          this.props.history.push(`/checkin/guest/info/${list.guest_id}`)
                        }}
                      >
                        {list.name}, {list.name_kana}
                      </td>
                      <td>{list.stay_date_from.substr(0, 10)}</td>
                      <td>{list.stay_days}/{list.number_of_guests}</td>
                      <td>{list.number_of_rooms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    checkin: state.checkin
  };
};

const mapActionsToProps = {

}

export default connect(mapStateToProps, mapActionsToProps)(ReservationList);

