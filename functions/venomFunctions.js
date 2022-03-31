export function sendReply(client, sender, text, messageId, errMsg) {
  client
    .reply(sender, text, messageId)
    .then((res) => {
      console.log("Reply sent:\n" + text + "\n------------------------------");

      return res.to._serialized; // The id of this msg, can be used to delete this msg in future
    })
    .catch((erro) => {
      console.error(errMsg, erro);
    });
}

export function sendButtons(
  client,
  sender,
  text,
  description,
  buttons,
  errMsg
) {
  client
    .sendButtons(sender, text, buttons, description)
    .then(() => {
      console.log("Sent message: " + text + "\n-------------------");
    })
    .catch((error) => {
      console.error(errMsg, error);
    });
}

export function sendText(client, sender, text, errMsg) {
  client
    .sendText(sender, text)
    .then(() => {
      console.log("Sent message: " + text + "\n------------------\n");
    })
    .catch((erro) => {
      console.error(errMsg, erro);
    });
}

export function delMsg(client, sender, messageId, errMsg) {
  client
    .deleteMessageMe(sender, messageId)
    .then(() => {
      console.log("Deleted the message\n------------------\n");
    })
    .catch((erro) => {
      console.error(errMsg, erro);
    });
}

export function sendListMenu(
  client,
  sender,
  title,
  subtitle,
  desc,
  menuName,
  list
) {
  client
    .sendListMenu(sender, title, subtitle, desc, menuName, list)
    .then(() => {
      console.log("Menu sent");
    })
    .catch((erro) => {
      console.error("Error when sending: ", erro);
    });
}
