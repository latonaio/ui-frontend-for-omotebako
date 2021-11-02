import React from "react";
import s from "../scss/pages/RoomManagement.module.scss";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import StatusBar2 from "../components/StatusBar2";
import { formatDate } from "../helper/date";
import calendarIcon from ".././assets/images/calendar.png";
import config from '../util/config';
import { ROOM_CLEANING_STATUS } from "../constraints/room"
import { formatTime } from "../helper/date";

const API_URL = config.ReactAppAPIURL;
const IMAGE_URL = config.ReactImagePath.slice(0, -1);

const floors = [
  { floor: 1 },
  { floor: 2 },
  { floor: 3 },
  { floor: 4 },
  { floor: 5 },
];

class RoomManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayRooms: [],
      selectedFloor: 1,
      rooms: []
    };
  }

  componentDidMount() {
    this.getRooms();
  }

  getRooms = () => {
    const date = new Date(Date.now());
    const today = formatDate(date);
    fetch(`${API_URL}rooms?date=${today}`, {})
      .then((response) => response.json())
      .then((result) => {
        if (result.length > 0) {
          const displayRooms = result.filter(i => i.floor_num === 1);
          this.setState({ rooms: result, displayRooms });
        }

      })
      .catch((e) => {
        console.error("===GET ROOMS ERROR===", e);
        throw e;
      });
  };

  onClickTab = (f) => {
    const { rooms } = this.state;
    const roomsByFloor = rooms.filter(i => i.floor_num === f);
    this.setState({ selectedFloor: f, displayRooms: roomsByFloor });
  }

  render() {
    const { displayRooms, selectedFloor } = this.state;

    return (
      <Layout navType='room-management'>
        <StatusBar2 icon='roomIcon' text='客室の情報を照会しています。' />

        <div className={s.floors}>
          {floors.map((i, idx) => {
            if (i.floor === selectedFloor) {
              return (
                <div className={s.floorActive} key={idx}>{i.floor}F</div>
              )
            } else {
              return (
                <button
                  className={s.floor}
                  key={idx} onClick={() => this.onClickTab(i.floor)}
                >
                  {i.floor}F
                </button>
              )
            }
          })}
        </div>

        <div className={s.rooms}>
          <div className={s.roomsContainer}>
            {displayRooms && displayRooms.map((i) => (
              <Link
                key={i.room_no || ""}
                to={`room-detail/${i.room_id}`}
                className={i.guest_id ? `${s.room}` : `${s.roomInvalid}`}
              >
                <div className={s.roomName}>
                  {`${i.room_id}：${i.room_name}`}&nbsp;<img src={calendarIcon} />
                </div>
                <div className={s.roomInfo}>
                  <img src={IMAGE_URL + i.image_path} className={s.roomImage} />
                  {i.name ? (
                    <div>
                      {i.name} 様<br />
                      {i.number_of_guests}名様
                      <br />
                      {i.status_code === 1 ? `チェックイン済` : `チェックイン前`}
                      <br />
                      {`チェックイン時間: ${formatTime(i.create_date)}`}
                      <br />
                        清掃：
                      {
                        (() => {
                          if (i.room_status_master_code === 0) {
                            return '未清掃'
                          }

                          if (i.room_status_master_code === 1) {
                            return '清掃中'
                          }

                          if (i.room_status_master_code === 2 || !i.room_status_master_code) {
                            return '清掃済'
                          }

                          return i.room_status_master_code && i.room_status_master_code === ROOM_CLEANING_STATUS.CLEANED ? "清掃済" : "清掃中"
                        })()
                      }
                    </div>
                  ) : (
                    <div>
                      予約が入っていません。または、顧客が割り当てられていません。<br />
                          清掃：
                      {
                        (() => {
                          if (!i.room_status_master_code) {
                            return '未清掃'
                          }

                          return i.room_status_master_code && i.room_status_master_code === ROOM_CLEANING_STATUS.CLEANED ? "清掃済" : "清掃中"
                        })()
                      }
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
}

export default RoomManagement;
