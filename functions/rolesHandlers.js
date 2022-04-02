const { sendReply, sendListMenu } = require("./venomFunctions");

const grpPermissions = [
  {
    title: ".agp mention-all",
    description:
      "To enable this group for letting all members mention everyone like discord",
  },
  {
    title: ".agp mention-all-admin-only",
    description:
      "To enable this group for letting only admins mention everyone",
  },
  {
    title: ".agp nsfw-roast",
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

module.exports.addGroupPerm = (
  client,
  sendTo,
  members,
  senderId,
  replyTo
) => {};

module.exports.showAllRoles = (client, sendTo, grpData, replyTo) => {
  const selectedGrp = grpData.find(
    (grp) =>
      grp.grpId === message.chatId.substring(0, message.chatId.length - 3)
  );
  if (!selectedGrp) {
    sendReply(
      client,
      sendTo,
      "This group has no roles\n\nAsk admin to add some\n\nIf You are an admin yourself, add member roles to this group by using the addRole command\n\nFor example\n```.ar admin```\n```.ar active```",
      replyTo,
      "Error when sending warning: "
    );
    return;
  }

  let memberRoles = [];
  selectedGrp.roles.forEach((role) => {
    memberRoles.push({
      title: `.amr ${role.roleName}`,
      description: "Send to take this role",
    });
  });

  list = [
    {
      title: "Member Roles",
      rows: memberRoles,
    },
  ];

  sendListMenu(
    client,
    sendTo,
    "Welcome to THE BOT",
    "Select the type of role",
    "Chose appropriate role",
    "Member Roles",
    list
  );
};
