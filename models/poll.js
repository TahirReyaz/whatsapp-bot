module.exports = class Poll {
  constructor(
    message,
    op1msg,
    op2msg,
    voters,
    pollerId,
    pollerName,
    pollerGrp,
    active,
    totalVotes,
    vote1,
    vote2
  ) {
    this.message = message;
    this.op1msg = op1msg;
    this.op2msg = op2msg;
    this.voters = voters;
    this.pollerId = pollerId;
    this.pollerName = pollerName;
    this.pollerGrp = pollerGrp;
    this.active = active;
    this.totalVotes = totalVotes;
    this.vote1 = vote1;
    this.vote2 = vote2;
  }
};
