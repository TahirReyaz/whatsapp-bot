const { sendReply } = require("./venomFunctions");

module.exports.stkToImg = (client, msgType, sendIn, replyTo) => {
  console.log("in stk to img");
  if (msgType === ".sticker") {
    console.log("image from sticker requested");
    sendReply(
      client,
      sendIn,
      "This feature has not been implemented yet.\nThe developer will complete it when he feels like it.",
      replyTo,
      "Error when sending warning: "
    );
  } else {
    console.log("selected msg wasnt stk");
    sendReply(
      client,
      sendIn,
      "The selected message is not a sticker",
      replyTo,
      "Error when sending warning: "
    );
  }
};
