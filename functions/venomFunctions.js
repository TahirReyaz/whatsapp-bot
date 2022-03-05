module.exports.sendReply = (client, sender, text, messageId, errMsg) => {
  let returnValue;
  client
    .reply(sender, text, messageId)
    .then((res) => {
      console.log("Reply sent:\n" + text + "\n------------------------------");
      console.log(res);
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

module.exports.delMsg = (client, sender, messageId, errMsg) => {
  client
    .deleteMessageMe(sender, messageId)
    .then(() => {
      console.log("Deleted the message\n------------------\n");
    })
    .catch((erro) => {
      console.error(errMsg, erro);
    });
};
