const sleep = () => {
  return new Promise((resolve, reject) => {
    return setTimeout(() => {
      return resolve();
    }, 1000);
  });
}

export {
  sleep
}
