const fs = require("fs");
const mime = require("mime-types");
const gm = require("gm").subClass({ imageMagick: true });

const { sendReply } = require("./venomFunctions");

module.exports.stkToImg = (client, msgType, sendIn, replyTo) => {
  if (msgType === "sticker") {
    console.log("image from sticker requested");
    sendReply(
      client,
      sendIn,
      "This feature has not been implemented yet.\nThe developer will complete it when he feels like it.",
      replyTo,
      "Error when sending warning: "
    );
  } else {
    sendReply(
      client,
      sendIn,
      "The selected message is not a sticker",
      replyTo,
      "Error when sending warning: "
    );
  }
};

module.exports.imgToSticker = async (client, message, sendIn, replyTo) => {
  const buffer = await client.decryptFile(message);
  console.log("Buffer generated");
  let fileName = `some-file-name.${mime.extension(message.mimetype)}`;
  fs.writeFile(fileName, buffer, (err) => {
    if (err) {
      sendReply(
        client,
        sendIn,
        "There was a problem while downloading the image\nTry again",
        replyTo,
        "Error when sending sticker progress: "
      );
      return;
    }
    gm(fileName)
      .resizeExact(500, 500)
      .gravity("Center")
      .write(fileName, function (err) {
        if (err) {
          sendReply(
            client,
            sendIn,
            "Image editing failed😞\n\nTry Again",
            replyTo,
            "Error when sending sticker progress: "
          );
          return;
        }
        client
          .sendImageAsSticker(message.chatId, fileName)
          .then(() => {
            console.log("Sticker sent\n-------------------------\n");
          })
          .catch((erro) => {
            console.error("Error when sending sticker: \n", erro);
            sendReply(
              client,
              sendIn,
              "Sending sticker failed😞\n\nTry again",
              replyTo,
              "Error when sending sticker error: "
            );
          });
      });
  });
};
