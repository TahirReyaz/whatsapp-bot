const { sendReply, sendListMenu } = require("./venomFunctions");

const grpPermissions = [
  {
    title: ".agr mention-all",
    description:
      "To enable this group for letting all members mention everyone like discord",
  },
  {
    title: ".agr mention-all-admin-only",
    description:
      "To enable this group for letting only admins mention everyone",
  },
  {
    title: ".agr nsfw-roast",
    description:
      "To enable this group for letting all members use roast command which may be nsfw",
  },
];

module.exports.groupPerms = (client, sendTo, members, senderId, replyTo) => {
  perm = false;
  members.forEach((participant) => {
    if (participant.isAdmin && participant.id === senderId) {
      perm = true;
    }
  });

  // If sender is not a an admin then send warning
  if (!perm) {
    sendReply(
      client,
      sendTo,
      "This command is used for choosing a group roles.\n\nThis commands is only for admins",
      replyTo,
      "Error when sending warning: "
    );
  } else {
    list = [
      {
        title: "Group Roles",
        rows: grpPermissions,
      },
    ];

    sendListMenu(
      client,
      sendTo,
      "Welcome to THE BOT",
      "Select the type of role",
      "Select the Group Role for this group\n\nThis command is only for admins",
      "Group Roles",
      list
    );
  }
};
