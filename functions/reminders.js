const { sendText } = require("./venomFunctions");

module.exports.remind = (client, time, chatId) => {
  const now = new Date();
  let remTime = new Date(`${now.toLocaleDateString()} ${time}:00`) - now;
  if (remTime < 0) {
    remTime += 86400000;
  }
  const timer = setTimeout(
    () => replyAndRemove(client, timer, chatId),
    remTime
  );

  return timer;
};

const replyAndRemove = (client, timer, chatId) => {
  console.log("meh");
  sendText(
    client,
    chatId,
    "No need to say hi to me, I am always here, reading every message you send to this guy.😁\nSend 'HelpBot' for commands",
    "Error when sending: "
  );
  clearTimeout(timer);
};
