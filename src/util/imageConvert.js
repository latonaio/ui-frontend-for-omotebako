
const convertToBlob = (base64) => {
  const binaryData = atob(base64.replace(/^.*,/, ""));
  const buffer = new Uint8Array(binaryData.length);

  for (let i = 0; i < binaryData.length; i++) {
    buffer[i] = binaryData.charCodeAt(i);
  }

  return new Blob([buffer.buffer], {
    type: "image/jpeg",
  });
};

export {
  convertToBlob,
}
