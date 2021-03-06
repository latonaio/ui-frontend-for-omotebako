import React from "react";
import Layout from "../../components/Layout";
import StatusBar2 from "../../components/StatusBar2";
import styled from "styled-components";
import ChartByAge from "../../components/ChartByAge";
import ChartByGenderAndAge from "../../components/ChartByGenderAndAge";
import LineChart from "../../components/LineChart";
import ChartByRegion from "../../components/ChartByRegion";
import DatePicker from "../../components/DatePicker";
import config from '../../util/config';
import s from '../../scss/pages/accounting/index.module.scss';

const API_URL = config.ReactAppAPIURL;

const tab = [
  { key: 0, name: "Daily" },
  { key: 1, name: "Weekly" },
  { key: 2, name: "Monthly" },
  { key: 3, name: "Quarterly" },
  { key: 4, name: "Annualy" },
];

class Accounting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 0,
      results: { daily: {}, weekly: {}, monthly: {} },
      startDate: null,
      dateFrom: "20200901",
      dateTo: "20201230",
      resultsWeekly: {},
      rowCount: 0,
      displayChart: false
    };
  }

  componentDidMount() {
    this.getAccountingDaily();
  }

  onChangeDate = (name, date) => {
    let searchDate = "";
    const { selectedTab } = this.state;
    if (date) {
      const month =
        date.month.toString().length === 1 ? "0" + date.month : date.month;
      const day = date.day.toString().length === 1 ? "0" + date.day : date.day;
      searchDate = date.year + month + day;
      this.setState({ [name]: searchDate });
    }
    if (selectedTab === 0) {
      setTimeout(() => this.getAccountingDaily(), 100);
    };
    if (selectedTab === 1) {
      setTimeout(() => this.getAccountingWeekly(), 100);
    };


  };

  handleOnClickTab = (idx) => {
    if (idx === 0) {
      this.getAccountingDaily();

      this.setState({ selectedTab: idx });
    }

    if (idx === 1) {
      this.getAccountingWeekly();
      this.setState({ selectedTab: idx });
    }

    if (idx === 2) {
      this.setState({ selectedTab: idx });
    }
  };

  getAccountingDaily = () => {
    const { dateFrom, dateTo } = this.state;

    fetch(
      `${API_URL}accounting/daily/search?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {}
    )
      .then((response) => response.json())
      .then((results) => {
        this.setState({
          results: { daily: results.data },
          rowCount: results.data.length,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  getAccountingWeekly = () => {
    const { dateFrom, dateTo } = this.state;
    fetch(
      `${API_URL}accounting/weekly/search?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {}
    )
      .then((response) => response.json())
      .then((results) => {
        this.setState({
          results: { weekly: results.data },
          rowCount: results.data.length,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  getDashboardName = () => {
    switch (this.state.selectedTab) {
      case 0:
        return "Daily";
      case 1:
        return "Weekly";
      case 2:
        return "Monthly";
      case 3:
        return "Quarterly";
      case 4:
        return "Annually";
      default:
        return "Daily";
    }
  };

  getWeekOfMonth = (d) => {
    let week = "";
    var date = new Date(d);
    var month = date.getMonth(),
      year = date.getFullYear(),
      firstWeekday = new Date(year, month, 1).getDay(),
      lastDateOfMonth = new Date(year, month + 1, 0).getDate(),
      offsetDate = 7 - firstWeekday,
      daysAfterFirstWeek = lastDateOfMonth - offsetDate,
      weeksInMonth = Math.ceil(daysAfterFirstWeek / 7) + 1;

    var noOfDaysAfterRemovingFirstWeek = date.getDate() - offsetDate;
    if (noOfDaysAfterRemovingFirstWeek <= 0) {
      week = "1W";
    } else if (noOfDaysAfterRemovingFirstWeek <= 7) {
      week = "2W";
    } else if (noOfDaysAfterRemovingFirstWeek <= 14) {
      week = "3W";
    } else if (noOfDaysAfterRemovingFirstWeek <= 21) {
      week = "4W";
    } else if (weeksInMonth >= 5 && noOfDaysAfterRemovingFirstWeek <= 28) {
      week = "5W";
    } else if (weeksInMonth === 6) {
      week = "6W";
    }
    return week;
  };

  render() {
    const { location } = this.props;
    const {
      selectedTab,
      results: { daily, weekly },
      rowCount,
      displayChart
    } = this.state;

    return (
      <Layout navType='accounting'>
        <StatusBar2 icon='calendar' text='???????????????????????????????????????'
          right={
            <>
              <div className={s.date}>
                From<DatePicker name="dateFrom" />
              </div>
              <div className={s.date}>
                To<DatePicker name="dateTo" onChangeDate={this.onChangeDate} />
              </div>
              <div className={s.totalSales}>???????????????????????????<br />161,400 ???</div>
            </>
          } />

        <div className={s.tabs}>
          {tab.map((i, idx) => (
            <Tab
              key={i.key}
              onClick={() => this.handleOnClickTab(idx)}
              selected={idx === selectedTab ? true : false}
            >
              {i.name}
            </Tab>
          ))}
        </div>

        {/* Daily */}
        <div className={selectedTab === 0 ? `${s.listTableContainer} fadeIn` : 'd-none'}>
          <table>
            <thead>
              <tr>
                <td>?????????</td>
                <td>??????<br />?????????</td>
                <td>??????<br />??????</td>
                <td>?????????</td>
                <td>??????????????????</td>
                <td>???????????????</td>
              </tr>
            </thead>

            <tbody>
              {Array(15).fill('').map(() => {
                return (
                  <tr>
                    <td className={s.link}
                      onClick={() => {
                        this.props.history.push(`/accounting/detail`)
                      }}>?????? ??????, ????????????</td>
                    <td>5/18</td>
                    <td>1/1</td>
                    <td>1</td>
                    <td>19,800</td>
                    <td>????????????</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Weekly */}
        <div className={
          selectedTab === 1 && displayChart === false ?
            `${s.listTableContainer} fadeIn` : 'd-none'}
        >
          <table>
            <thead>
              <tr>
                <td>???????????????</td>
                <td>Term</td>
                <td>??????????????????</td>
                <td>??????/??????</td>
                <td>?????????</td>
              </tr>
            </thead>

            <tbody>
              {Array(15).fill('').map(() => {
                return (
                  <tr>
                    <td>5/13</td>
                    <td>3W</td>
                    <td>280,950</td>
                    <td>15/20</td>
                    <td>15</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          className={
            selectedTab === 1 && displayChart === true ?
              `${s.chart} fadeIn` : 'd-none'}
        >
          <ChartByAge />
          <ChartByGenderAndAge />
          <LineChart />
          <ChartByRegion />
        </div>

        <footer>
          <DashboardTag active={displayChart} onClick={() => this.setState({ displayChart: !displayChart })}>
            Dashboard {this.getDashboardName()}
          </DashboardTag>
          <div className={s.buttons}>
            <button className={s.button1}>????????????</button>
            <button className={s.button2}>?????????<br />?????????</button>
          </div>
        </footer>
      </Layout>
    );
  }
}

export default Accounting;

const DashboardTag = styled.div`
  border: 1px solid ${(props) => props.theme.primary};
  color: ${(props) => props.active ? `#FFF` : props.theme.primary};
  padding: 0 40px;
  display: flex;
  font-size: 3rem;
  justify-content: center;
  align-items: center;
  height: 50px;
  cursor: pointer;
  background: ${(props) => props.active ? props.theme.primary : `#FFF`};
`;

const Tab = styled.div`
  width: 300px;
  height: 40px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: ${(props) => props.selected ? props.theme.primary : "white"};
  color: ${(props) => (props.selected ? "white" : "#3f3f46")};
  border: 2px solid ${(props) => props.theme.primary};
`;