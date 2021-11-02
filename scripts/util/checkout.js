const optimist = require('optimist');
const requestManager = require(`${__dirname}/requestManager`);

const args = optimist
  .usage('Count the lines in a file.\nUsage: $0')
  .options({
    version: {
      alias : 'v'
    }
  }).argv;

if(args.version) {
  console.log('new customer checkin tool');
  return false;
} else if(args.help) {
  optimist.showHelp();
  return false;
}

module.exports = async (guestId) => {
  try {
    console.log(`execute requestManager.getFetch stay-guests/guest/${guestId}`);

    const stayGuest = await requestManager.getFetch(`stay-guests/guest/${guestId}`)

    console.log(`success requestManager.getFetch stay-guests/guest/${guestId}`);

    if (!stayGuest.length > 0) {
      console.error("チェックインしていないお客様です。")
      return;
    }

    console.log(`execute requestManager.getFetch checkout`);

    await requestManager.postFetch("checkout", {
      guestID: stayGuest[0].guest_id
    })

    console.log(`success requestManager.getFetch checkout`);

  } catch (e) {
    console.error('checkout error');
    console.error(e);
  }
};
