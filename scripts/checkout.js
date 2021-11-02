const optimist = require('optimist');
const checkout = require(`${__dirname}/util/checkout`);
const dotenv = require('dotenv');
const path = require('path');

const args = optimist
  .usage('Count the lines in a file.\nUsage: $0')
  .options({
    version: {
      alias : 'v'
    }
  }).argv;

if(args.version) {
  console.log('checkout tool');
  return false;
} else if(args.help) {
  optimist.showHelp();
  return false;
}

(async () => {
  const env = dotenv.config({
    path: path.resolve(__dirname, '../.env')
  });

  if (env.parsed.REACT_APP_ENV !== 'development') {
    console.log('you can run this. if REACT_APP_ENV is development');
    return;
  }

  const guestId = args._[0];

  if (!guestId) {
    console.log('guest id is null');
    return;
  }

  await checkout(guestId);
})();

