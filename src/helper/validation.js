import image_format from '../util/constants'

const FileType = require('file-type/browser');
const imgFmt = image_format.image_formats

export const validateDate = (date) => {
	if (!date.match(/^\d{4}-\d{2}-\d{2}$/g)) {
		alert(
			"日付の形式が正しくありません。(YYYY-MM-DDの形式に直してください。)"
		);
	}
	return true;
};

export const validateNumber = (num) => {
	if (!String(num).match(/\d/)) {
		alert("数字のみ入力可能です。" + num);
	}
	return true;
};

export const validateImage = async (imgFile) => {
  try {
    const res = await FileType.fromBlob(imgFile)
    // 偽装しているファイルタイプの場合
    if (res === undefined) {
      throw new Error('不正なファイルです。');
    }
    // 以下のファイル形式以外は受け付けない
    if (res.mime !== imgFmt.IMAGE_FORMAT_PNG &&
      res.mime !== imgFmt.IMAGE_FORMAT_JPG &&
      res.mime !== imgFmt.IMAGE_FORMAT_JPEG
    ) {
      throw new Error('画像形式が正しくありません。png,jpeg,jpgの画像を使用してください。');
    }
    console.log({res})
  } catch (e) {
    throw e
  }
}

