const { sendText } = require("./venomFunctions");
require("dotenv").config();
const axios = require("axios");

module.exports.remind = (client, time, msg, chatId, remId) => {
  const now = new Date();
  let remTime = new Date(`${now.toLocaleDateString()} ${time}:00`) - now;
  remTime -= 19800000; // milliseconds in 5:30 (GMT) is 19800000
  if (remTime < 0) {
    remTime += 86400000; // If the time has already passed then schedule it to the next day
  }

  console.log(remTime);

  const timer = setTimeout(
    () => replyAndRemove(client, timer, chatId, msg, remId),
    remTime
  );

  return timer;
};

const replyAndRemove = (client, timer, chatId, msg, remId) => {
  const msgToSend = "Bot reminded:\n---------------------------\n" + msg;

  sendText(client, chatId, msgToSend, "Error when sending: ");
  clearTimeout(timer);

  axios
    .delete(
      `${process.env.FIREBASE_DOMAIN}/reminders/${chatId.substring(
        0,
        chatId.length - 3
      )}/${remId}.json`
    )
    .then((res) => {
      console.log("removed");
    })
    .catch((err) => {
      sendText(
        client,
        chatId,
        "An error occurred while deleting from database",
        "Error when sending error: "
      );
      console.log(err.data);
    });
};
