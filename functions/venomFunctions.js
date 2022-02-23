module.exports.sendReply = (client, sender, text, messageId, errMsg) => {
  client
    .reply(sender, text, messageId)
    .then(() => {
      console.log("Reply sent:\n" + text + "\n------------------------------");
    })
    .catch((erro) => {
      console.error(errMsg, erro);
    });
};

module.exports.sendText = (client, sender, text, errMsg) => {
  client
    .sendText(sender, text)
    .then(() => {
      console.log("Sent message: " + text + "\n------------------\n");
    })
    .catch((erro) => {
      console.error(errMsg, erro);
    });
};
