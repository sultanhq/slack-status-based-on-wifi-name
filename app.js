"use strict";

require('dotenv').config()
const axios = require("axios");
const querystring = require("querystring");
const config = require("./config");
const path = require('path');

var status = {};
var oldStatus = {};

var getGitBranchName = require('git-branch-name');

var dirPath = path.resolve('', config.path);



if (!config.slackToken) {
  console.error("Missing Slack token. Set it in config.js");
  process.exit(1);
}


function getBranchName() {
  getGitBranchName(dirPath, function(err, branch) {
    myBranch(branch)
  });
  return status
}

function myBranch(branch) {
  oldStatus = status
  status = {
    "status_text": branch,
    "status_emoji": ":office:"
  };
}

function setSlackStatus(token, status) {
  return axios.post("https://slack.com/api/users.profile.set",
      querystring.stringify({
        token: token,
        profile: JSON.stringify(status)
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then(function(response) {
      console.log("Set Slack status branch name to: %j", response.data.profile.status_text);
    })
    .catch(function(error) {
      console.error("Set Slack status error: %s", error);
    });
}


setInterval(function() {
  const newBranchName = getBranchName();
  if (status.status_text !== oldStatus.status_text) {
    setSlackStatus(config.slackToken, status);
  }
}, config.updateInterval);
