const { sendText } = require("./venomFunctions");

module.exports.remind = (client, time, chatId) => {
  const now = new Date();
  let remTime = new Date(`${now.toLocaleDateString()} ${time}:00`) - now;
  if (remTime < 0) {
    remTime += 86400000;
  }
  const msg = "Will remind you at " + time;

  const timer = setTimeout(
    () => replyAndRemove(client, timer, chatId, msg),
    remTime
  );

  return timer;
};

const replyAndRemove = (client, timer, chatId, msg) => {
  console.log("meh");
  sendText(client, chatId, msg, "Error when sending: ");
  // clearTimeout(timer);
};
