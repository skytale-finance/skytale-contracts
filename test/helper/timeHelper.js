const timeTravel = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [time], // 86400 is num seconds in day
        id: new Date().getTime(),
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        web3.currentProvider.send(
          {
            jsonrpc: '2.0',
            method: 'evm_mine',
            params: [],
            id: new Date().getSeconds(),
          },
          (err, res) => {
            if (err) {
              return reject(err);
            }
            return resolve(res);
          }
        );
      }
    );
  });
};

const currentBlockTime = async () => {
  const p = new Promise((resolve, reject) => {
    web3.eth.getBlock('latest', (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res.timestamp);
    });
  });

  return p;
};

const getTimestamp = async (timestamp, days) => {
  // Get a date object for the current time
  var d = new Date(timestamp * 1000);

  // Set it to one month ago
  d.setMonth(d.getMonth() + days);

  // Zero the time component
  d.setHours(0, 0, 0, 0);

  // Get the time value in milliseconds and convert to seconds
  return (d / 1000) | 0;
};

module.exports = {
  timeTravel,
  currentBlockTime,
  getTimestamp,
};
