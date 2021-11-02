// 現在日時
// formatDate(new Date(Date.now()))
// 加算日時
// formatDate(nowDate.setDate(nowDate.getDate() + parseInt(days)))
import moment from 'moment'

/**
 * date = Date Tue Dec 22 2020 16:35:48 GMT+0900 (日本標準時)
 * formatDate(date) return 20201212
 */
const formatDate = (date) => {
  return moment(date).format('YYYYMMDD');
};

/**
 * date = Date Tue Dec 22 2020 16:35:48 GMT+0900 (日本標準時)
 * formatDate(date) return 2020-12-12
 */
const formatDateWithHyphen = (date) => {
  return moment(date).format('YYYY-MM-DD');
}

const formatDateWithTime = (date) => {
  return moment(date).format('YYYY-MM-DD HH:mm');
}

const formatDateWithTimeJP = (date) => {
  return moment(date).format('M月DD日 HH:mm');
}

const formatTime = (date) => {
  return moment(date).format('HH:mm');
}

export {
  formatDate,
  formatDateWithHyphen,
  formatDateWithTime,
  formatDateWithTimeJP,
  formatTime,
}

