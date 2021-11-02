const requestManager = require('./util/requestManager');

const fs = require('fs');
const MAX_RETRY_COUNT = 30;
const RequestManagerAPIURL = '192.168.XXX.XXX:XXXXX';
const IMAGE_PATH = RequestManagerAPIURL;

const postImage = async (imagePath) => {
  const checkFaceAuthStatus = async (key) => {
    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < MAX_RETRY_COUNT; i++) {
          await requestManager.sleep();
          const result = await requestManager.getFetch(`auth/${key}`);

          console.log('result.customer');
          console.log(result.customer);
          console.log('result.status');
          console.log(result.status);

          if (result.status === 'failed') {
            console.log('getFetch is failed');
            return resolve();
          }

          if (result.customer === 'new') {
            console.log('customer is new');

            const path = result.image_path;
            const fileName = path.split("1/");

            return resolve({
              key: key,
              imagePath: `${IMAGE_PATH}/${fileName[1]}`,
              faceInfo: result,
              newGuest: true,
            });
          }

          if (result.customer === 'existing') {
            const gueGuestResult = await requestManager.getFetch(`guest/${result.guest_id}`);

            console.log('customer is existing');

            console.log(gueGuestResult);

            return resolve({
              key: key,
              imagePath: gueGuestResult.imagePath,
              newGuest: false,
            });
          }

          if (i >= MAX_RETRY_COUNT) {
            console.log('失敗しました。もう一度試して下さい。');
          }
        }
      } catch (e) {
        return reject(e);
      }
    });
  }

  const result = await requestManager.postFetchForImg(
    `image`,
    fs.createReadStream(imagePath)
  );

  if (result.key) {
    console.log(`key was registered ${result.key}`);

    return await checkFaceAuthStatus(result.key);
  }
};

module.exports = postImage;

// postImage('./dummyFaceImages/002.jpg');
