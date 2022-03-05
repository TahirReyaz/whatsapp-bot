module.exports.sendReply = async (client, sender, text, messageId, errMsg) => {
  client
    .reply(sender, text, messageId)
    .then((res) => {
      console.log("Reply sent:\n" + text + "\n------------------------------");

      return res.to._serialized; // The id of this msg, can be used to delete this msg in future
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
