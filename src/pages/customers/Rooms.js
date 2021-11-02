import React from "react";
import Layout from "../../components/Layout";
import SearchBar from "../../components/SearchBar";
import StatusBar2 from "../../components/StatusBar2";
import s from "../../scss/pages/ListPage.module.scss";
import RequestRedisManager from "../../util/requestRedisManager";
import config from '../../util/config';
import * as formModel from '../../util/formModel'

const {
  statusCodeModel,
} = formModel.default;

const RequestRedisManagerAPIURL = config.RequestRedisManagerAPIURL;

class CustomersRooms extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      stayGuests: [],
      name: null,
      name_kana: null,
      stay_date_from: null,
      stay_date_to: null,
      stay_days: null,
      number_of_guests: null,
      number_of_rooms: null,
      status_code_id: null,
    };
    this.SearchBarRef = React.createRef();
    this.requestRedisManager = null;
  }

  async componentWillMount() {
    // 客室割当を取得する
    await this.createRequestRedisManager();
  }

  async createRequestRedisManager() {
    if (!this.requestRedisManager) {
      this.requestRedisManager = new RequestRedisManager(RequestRedisManagerAPIURL);

      this.requestRedisManager.io.on('getStayGuests', async (stayGuests) => {
        this.setState({
          stayGuests
        });

        // 検索バーのリストを初期化
        this.SearchBarRef.current.onResetInputSearch();
      });

      this.requestRedisManager.io.emit('getStayGuests');

      this.requestRedisManager.io.on('getGuests', async (guest) => {
        this.setState({
          guest
        });

        // 検索バーのリストを初期化
        this.SearchBarRef.current.onResetInputSearch();
      });

      this.requestRedisManager.io.emit('getGuests');
    }
  }

  async componentWillUnmount() {
    if (this.requestRedisManager) {
      this.requestRedisManager.io.close();
    }
  }

  saveGuestInfo = async (data) => {
    const sendValue = () => {
      // 検索バーに文言がセットされていれば
      // 検索バーの文言は別タブを押した時、空白になる
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        return this.state.searchBar.assignedRooms[data.listIndex][data.field]
      } else {
        return this.state.stayGuests[data.listIndex][data.field];
      }
    }

    const sendGuestId = () => {
      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        return this.state.searchBar.assignedRooms[data.listIndex]['stay_guests_id']
      } else {
        return this.state.stayGuests[data.listIndex]['stay_guests_id'];
      }
    }


    this.requestRedisManager.io.emit('editStayGuestDetail', JSON.stringify({
      ...data,
      value: sendValue(),
      stay_guests_id: sendGuestId()
    }));

    this.requestRedisManager.io.emit('getStayGuests');
    this.requestRedisManager.io.emit('getGuests');
  }

  nextDate = (date) => {
    date.setDate(date.getDate() + 1);
    let month = "" + (date.getMonth() + 1)
    let day = "" + date.getDate();
    let year = date.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  getDate = (date) => {
    date.setDate(date.getDate());
    let month = "" + (date.getMonth() + 1);
    let day = "" + date.getDate();
    let year = date.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  render() {
    const {
      stayGuests,
      searchBar
    } = this.state;

    const guestRender = () => {
      if (!this.SearchBarRef.current) {
        return [];
      }

      if (this.SearchBarRef.current.state.stringValue.length > 0) {
        if (searchBar.assignedRooms && searchBar.assignedRooms.length > 0) {
          return searchBar.assignedRooms
        } else {
          return []
        }
      }

      return stayGuests;
    }

    return (
      <Layout navType='customers'>
        <StatusBar2 icon='hands' text='顧客の情報を管理しています。'
          right={
            <SearchBar
              ref={this.SearchBarRef}
              placeholder="検索文字を入力してください"
              result={this.state.stayGuests}
              guest={this.state.guest}
              onChangeInputSearchBar={(e) => {
                this.setState({
                  editFlag: {
                    ...this.state.editFlag,
                    editing: false
                  }
                })

                const SearchBarSelectTabNumber = 'assignedRooms';

                this.setState({
                  searchBar: {
                    ...this.state.searchBar,
                    [SearchBarSelectTabNumber]: e
                  }
                })
              }}
            />
          }
        />

        <div className={s.listTypes}>
          <div className={s.listType}
            onClick={() => { this.props.history.push(`/customers/reservations`); }}
          >
            宿泊情報
          </div>
          <div className={s.listTypeActive}>
            客室割当
          </div>
          <div className={s.listType}
            onClick={() => { this.props.history.push(`/customers/others`); }}
          >
            その他のお客様情報
          </div>
        </div>

        <div className={s.listTableContainer}>
          <table>
            <thead>
              <tr>
                <td style={{ width: 440 }}>顧客名</td>
                <td>ステータス</td>
                <td>宿泊日１/客室１</td>
                <td>宿泊日２/客室２</td>
              </tr>
            </thead>

            <tbody>
              {guestRender().map((customerRecord) => (
                <tr>
                  {/* 顧客名 */}
                  <td
                    className={s.name}
                    onClick={() => {
                      this.props.history.push(`/customers/detail/${customerRecord.stay_guests_id}`)
                    }}
                  >
                    {customerRecord.name} ,{customerRecord.name_kana}
                  </td>

                  {/* ステータス */}
                  <td>
                    {(() => {
                      const statusCode = statusCodeModel.filter((option) => {
                        return option.value === customerRecord.status_code;
                      });

                      return statusCode.length > 0 && statusCode[0].label
                    })()}
                  </td>

                  {/* 宿泊日１/客室１ */}
                  <td
                    className='cursor-pointer'
                    onClick={() => {
                      this.props.history.push(`/customer-info/room/assignment/${customerRecord.stay_guests_id}`)
                    }}
                  >
                    {
                      (() => {
                        if (customerRecord.stay_days > 0) {
                          const firstDate = this.getDate(new Date(customerRecord.stay_date_from));

                          if (customerRecord.assigned_rooms && customerRecord.assigned_rooms.length === 0) {
                            return [
                              <div className='cursor-pointer'>
                                {firstDate}<br />
                                <span className='text-red'>未割当</span>
                              </div>
                            ]
                          }

                          const assignedRoomData = customerRecord.assigned_rooms.filter(
                            assignedRoom => firstDate === assignedRoom.stay_date
                          )[0]

                          if (assignedRoomData) {
                            if (assignedRoomData.room_name) {
                              return [
                                <>{firstDate}<br /></>,
                                <span
                                  className='text-blue'
                                  onClick={() => {
                                    this.props.history.push(`/room-assignment/${customerRecord.stay_guests_id}/${customerRecord.stay_date_from}/${customerRecord.stay_date_to}`)
                                  }}
                                >{assignedRoomData.room_name}</span>
                              ]
                            } else {
                              return [
                                <div className='cursor-pointer'>
                                  {firstDate}<br />
                                  <span className='text-red'>未割当</span>
                                </div>
                              ]
                            }
                          }
                        } else {
                          // 宿泊日初日にstay_daysがないレコードは未入力
                          return ('-')
                        }
                      })()
                    }
                  </td>

                  {/* 宿泊日２/客室２ */}
                  <td
                    onClick={() => {
                      this.props.history.push(`/customer-info/room/assignment/${customerRecord.stay_guests_id}`)
                    }}
                  >
                    {
                      (() => {
                        if (customerRecord.stay_days > 1) {
                          const nextDate = this.nextDate(new Date(customerRecord.stay_date_from));

                          if (customerRecord.assigned_rooms && customerRecord.assigned_rooms.length === 0) {
                            return [
                              <div className='cursor-pointer'>
                                {nextDate}<br />
                                <span className='text-red'>未割当</span>
                              </div>
                            ]
                          }

                          if (customerRecord.assigned_rooms && customerRecord.assigned_rooms.length > 0) {
                            const assignedRoomData = customerRecord.assigned_rooms.filter(
                              assignedRoom => assignedRoom.stay_date === this.nextDate(new Date(customerRecord.stay_date_from))
                            )[0]

                            if (assignedRoomData) {
                              if (assignedRoomData.room_name) {
                                return [
                                  <>{nextDate}<br /></>,
                                  <span className='text-blue'>{assignedRoomData.room_name}</span>
                                ]
                              } else {
                                // 宿泊日2のデータがあってもルームネームがない場合は部屋が未割り当ての状態とみなす
                                return [
                                  <div className='cursor-pointer'>
                                    {nextDate}<br />
                                    <span className='text-red'>未割当</span>
                                  </div>
                                ]
                              }
                            }
                          }
                        } else {
                          return ('-')
                        }
                      })()
                    }
                  </td>
                </tr >
              ))
              }
            </tbody >
          </table >
        </div >
      </Layout>
    );
  }
}

export default CustomersRooms;
