import Jimp from "jimp";

/*
usage

jimpの各メソッドをラップし、imageEditor()に渡してあげることで、レイアウトや用途に応じた画像編集ができる。
設定できるメソッドはここ(https://github.com/oliver-moran/jimp/tree/master/packages/jimp)を参照すること。
ラップした関数で使用する変数はImageEditorOptionに随時追加して使用すること。
 */

export function ImageEditorOption(bgHex, containW, containH) {
  this.bgHex = bgHex;
  this.containW = containW;
  this.containH = containH;
}

export const setBackground = (image, option) => {
  image.background(option.bgHex)
}

export const setFittingToSize = (image, option) => {
  image.contain(option.containW, option.containH)
}

export async function imageEditor  (
  imgUrlByBase64,
  mime,
  callback,
  option,
  ...f
) {
  const image = await Jimp.read(imgUrlByBase64).catch((err) => {
    console.error(err)
  })

  f.forEach(f => f(image, option))
  image.getBase64(mime, (err, src) => {
    if (err !== null) {
      console.error(err)
    }
    callback(src)
  })
}
