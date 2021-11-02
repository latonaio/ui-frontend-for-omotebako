const optimist = require('optimist');
const reserve = require(`${__dirname}/util/reserve`);
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const json = JSON.parse(fs.readFileSync(path.resolve(__dirname, './customerInfo.json'), 'utf8'));

const args = optimist
  .usage('Count the lines in a file.\nUsage: $0')
  .options({
    version: {
      alias : 'v'
    }
  }).argv;

(async () => {
  const env = dotenv.config({
    path: path.resolve(__dirname, '../.env')
  });

  if (env.parsed.REACT_APP_ENV !== 'development') {
    console.log('you can run this. if REACT_APP_ENV is development');
    return;
  }

  const targetIndex = args._[0];

  if (!(Number(targetIndex) >= 0)) {
    console.log('targetIndex is null');
    return;
  }

  // 指定したJsonデータから予約する
  const customerInfoJson = json[Number(targetIndex)];

  await reserve({
    ...customerInfoJson
  });
})();
