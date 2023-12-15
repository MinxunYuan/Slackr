import {
  apiGetCall,
  apiPostCall,
  apiPutCall,
  formatDate,
  fileToDataUrl,
  removeDoms,
} from "./helpers.js";

import ChannelDetails from "./channel/details.js";
import ChannelItem from "./channel/item.js";
import ChannelInput from "./channel/input.js";

import messages from "./messages.js";
import ChannelMessage from "./channel/message.js";

import user, { User } from "./user.js";
import router from "./router.js";

let channelId = null;
let currentPage = 1;

const pageSize = 25;

let isLoading = false;

export const setChannelId = (id) => {
  channelId = id;
};

export const getChannelId = () => {
  return channelId;
};

const formDate = (date) => {
  let day = date.getDate();
  // January is 0
  let month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }

  return day + "/" + month + "/" + year;
};

const joinChannel = (id) => {
  return apiPostCall(`channel/${id}/join`, {}, true);
};

const leaveChannel = (id) => {
  return apiPostCall(`channel/${id}/leave`, {}, true);
};

function removeElements(elements) {
  elements.forEach((element) => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
}

/**
 * Display channel info according to channelId
 * when user click a channel on the channel list
 * Generate channel-details and display channel info on the channel screen
 *
 * @param {event} event - click event, the channel user clicked
 */
// const getChannelById = (event) => {
const getChannelById = (channelId) => {
  apiGetCall(`channel/${channelId}`, true)
    .then((channel) => {
      // /#channel={channelId}
      const newUrl = "#channel=" + channelId;
      router.redirectTo(`channel=${channelId}`, () => {
        showChannel(channelId, channel);
      });
    })
    .catch((errMsg) => {
      const channelPage = document.querySelector(
        // "div#page-channels > div#right-side"
        "#page-channels .channel-screen"
      );

      // while (channelPage.firstChild) {
      // channelPage.removeChild(channelPage.lastChild);
      // }
      removeDoms(channelPage);

      const channelElement = document.createElement("channel-details");
      channelElement.channelData = {
        name: "Feel free to join any channel!",
        description: "",
      };
      channelElement.onclick = () => {};
      channelPage.appendChild(channelElement);
    });
};

const onClickHandler = (event) => {
  // get channelId attr from user clicked <li>
  const channelId = event.currentTarget.getAttribute("id");
  // <div> in <channel-item>
  const channelDiv = event.currentTarget.querySelector(".channel-item-div");
  // get the "global" module var channelId
  setChannelId(channelId);
  // activate the clicked channel
  // remove .active from every div in channel-item
  document.querySelectorAll(".channel-item-div").forEach((div) => {
    div.classList.remove("active");
  });
  // activate the clicked channel
  channelDiv.classList.add("active");
  getChannelById(channelId);
};

// 2.2.1 Viewing a list of channels
// display channel info on the screen
// localhost/#channel={channelId} to access the channel screen of the particular channelId
const showChannel = (id, channel) => {
  const channelPage = document.querySelector(
    // "div#page-channels > div#right-side"
    "#page-channels .channel-screen"
  );

  removeDoms(channelPage);

  // create channel-meta component
  const channelElement = document.createElement("channel-details");

  // TODO: handle further exception
  // Get user info by id, which is the creator of the channel
  user.getInfoById(channel.creator).then((userInfo) => {
    channelElement.channelData = {
      name: channel.name,
      description: channel.description,
      createdAt: formDate(new Date(channel.createdAt)),
      private: channel.private ? "Private" : "Public",
      creator: userInfo.name,
    };
  });

  // V1: show channel-meta on channel screen
  channelPage.appendChild(channelElement);

  // V2: chow channel-meta on banner
  const banner = document.querySelector(".banner");

  // banner.innerHTML = "";
  removeDoms(banner);

  banner.style.display = "none";
  // banner.appendChild(channelElement);

  // <section class="channel-msgs"></section>
  const channelMsgSec = document.createElement("section");
  channelMsgSec.className = "channel-msgs";
  channelPage.appendChild(channelMsgSec);

  // add scroll handler
  channelMsgSec.addEventListener("scroll", handleScroll);

  // Once loading a channel, reset its currentPage
  // each channel has one unique currentPage, honestly, it's not a good idea, but it works
  // due to the time limit, I just use this way to distinguish the pageNumber of different channel
  // If time permits, I will use a map to store the currentPage of each channel, or use OOP style.
  currentPage = 1;

  // show first 25 messages on channel screen once the channel page is loaded
  messages
    .getMsgsByChannelId(id, 0)
    .then((data) => {
      // The order of the message is not specified in the assignment spec
      // I choose to display the newest message on the bottom
      data.messages.reverse().forEach((msg) => {
        const msgItem = document.createElement("channel-message");
        msgItem.data = msg;
        channelMsgSec.appendChild(msgItem);
      });
    })
    .catch((err) => {});

  // add <channel-input-box>
  let inputBox = document.createElement("section");
  inputBox.className = "channel-input-section";
  inputBox.appendChild(document.createElement("channel-input"));
  channelPage.appendChild(inputBox);
};

/**
 * 2.2.1 Viewing a list of channels
 * Update channel list on the channel screen
 */
const flushChannels = () => {
  // If user has not logged in, do nothing
  if (!localStorage.getItem("token")) {
    return;
  }

  // delete existing channels
  const channelList = document.getElementById("channel-list");
  removeDoms(channelList);
  // append channels to the list
  apiGetCall("channel", true)
    .then((respBody) => {
      // load avatar image by curUser
      const curUserImage = User.getCurUserInfo().image;
      if (curUserImage) {
        document.querySelector("#avatar-img").src = curUserImage;
      }

      // TODO: use template to create channel list and concise the code
      const curUid = parseInt(localStorage.getItem("uid"));
      const channels = document.getElementById("channel-list");
      // <h5 class="list-group-header">header</h5>
      const publicHeader = document.createElement("h5");
      publicHeader.textContent = "Public Channels";
      channels.appendChild(publicHeader);
      publicHeader.className = "list-group-header";
      publicHeader.style.color = "#434968";

      const privateChannels = respBody.channels.filter((channel) => {
        return channel.private;
      });
      const publicChannels = respBody.channels.filter((channel) => {
        return !channel.private;
      });

      // a list of all public channels created
      publicChannels.forEach((channel) => {
        const channelItem = document.createElement("channel-item");
        channelItem.channelData = channel;
        // channelItem.addEventListener("click", getChannelById);
        channelItem.addEventListener("click", onClickHandler);

        channels.appendChild(channelItem);
      });

      const privateHeader = document.createElement("h5");
      privateHeader.textContent = "Private Channels";
      privateHeader.className = "list-group-header";
      privateHeader.style.color = "#434968";
      channels.appendChild(privateHeader);

      // a list of all private channels user have joined
      privateChannels
        .filter((channel) => {
          return channel.members.includes(curUid);
        })
        .forEach((channel) => {
          const channelItem = document.createElement("channel-item");
          channelItem.channelData = channel;
          // channelItem.addEventListener("click", getChannelById);
          channelItem.addEventListener("click", onClickHandler);

          channels.appendChild(channelItem);
        });
    })
    .catch((errMsg) => {
      alert(errMsg);
    });
};

/**
 * 2.6.1 Infinite Scroll
 * Handles the scroll event for the channel messages section.
 * When the user scrolls to the bottom, this function fetches the next set
 * of messages from the server.
 *
 * @param {Event} event - The scroll event object.
 */
const handleScroll = (event) => {
  // get the scroll info
  const channelMsgsSec = event.currentTarget;
  const { scrollTop, scrollHeight, clientHeight } = channelMsgsSec;
  const loadingSpinner = document.querySelector("#message-loading");

  if (scrollHeight - scrollTop === clientHeight) {
    const curMsgNum = currentPage * pageSize;

    // The next page should get fetched
    currentPage++;
    // console.log(
    //   `Try to load msgs from ${curMsgNum + 1} to ${pageSize * currentPage}`
    // );

    // fetch next 25 messages from the server
    messages
      .getMsgsByChannelId(getChannelId(), curMsgNum + 1)
      .then((data) => {
        // Display the spinner indicate that the message is loading.
        // document.querySelector("#message-loading").style.display = "block";
        loadingSpinner.style.display = "block";

        // Hide the spinner after 0.5s, emulate the network latency
        setTimeout(() => {
          loadingSpinner.style.display = "none";
        }, 500);

        // no more messages, roll back
        if (data.messages.length === 0) {
          currentPage--;
          return;
        }

        data.messages.reverse().forEach((msg) => {
          const msgItem = document.createElement("channel-message");
          msgItem.data = msg;
          channelMsgsSec.appendChild(msgItem);
        });
      })
      .catch((err) => {
        alert(err);
      });
    // finally, increase currentPage
  }
};

/**
 * Handles the event of channel creation form submission, collects form data,
 * and sends a POST request to the server to create a new channel. If the server
 * responds successfully, the channel list is updated, and the modal dialog is hidden.
 * In case of an error during the API call, an alert is shown with the error message.
 *
 * @param {Event} event
 *
 * No return value.
 */
const createChannel = (event) => {
  event.preventDefault();
  const createChannelForm = document.forms["create-channel"];

  const channelInfo = {
    name: createChannelForm["channel-name"].value,
    private: "",
    description: createChannelForm["channel-description"].value,
  };

  const channelType = createChannelForm.querySelector(
    'input[name="channelType"]:checked'
  ).value;

  const isPrivate = true ? channelType === "private" : false;

  // POST request to server
  // ...spread operator
  apiPostCall("channel", { ...channelInfo, private: isPrivate }, true)
    .then((respBody) => {
      // resp { "channelId": 528491 }
      // update channel list after adding a channel
      flushChannels();
    })
    .catch((errMsg) => {
      alert(errMsg);
    });

  // Get Modal instance and hide it after click Create
  const createChannelModal = bootstrap.Modal.getInstance(
    document.getElementById("createChannelModal")
  );
  createChannelModal.hide();
};

/**
 * 2.4.3 Viewing and editing user's own profile
 * add onClick event handler for <.avatar-img>
 */
document.querySelector("#avatar-img").addEventListener("click", () => {
  // Prepare the userProfileOffCanvas DOM
  const userProfileOffCanvas = document.getElementById("userProfileOffcanvas");
  const offcanvas = new bootstrap.Offcanvas(userProfileOffCanvas);

  // get the userInfo warper based on the curUser Singleton
  const curUser = User.getCurUserInfo();

  // set dom based on curUser
  // call setter in User.js

  userProfileOffCanvas.querySelector("input#userName").placeholder =
    curUser.name;
  userProfileOffCanvas.querySelector("textarea#userBio").placeholder =
    curUser.bio;
  userProfileOffCanvas.querySelector("input#userEmail").placeholder =
    curUser.email;
  userProfileOffCanvas.querySelector("input#userPassword").placeholder =
    "********";

  // activate offcanvas
  offcanvas.show();
});

/**
 *
 * 2.4.3 Viewing and editing user's own profile
 * {
 */
document
  .querySelector("#userProfileOffcanvas #updateProfileBtn")
  .addEventListener("click", (event) => {
    event.preventDefault();

    // get curUser from the localStorage
    // const curUser = JSON.parse(localStorage.getItem("curUser"));
    const editUserProfileForm = document.querySelector(
      "#userProfileOffcanvas form"
    );
    const emailValue = editUserProfileForm["userEmail"].value;
    const nameValue = editUserProfileForm["userName"].value;
    const bioValue = editUserProfileForm["userBio"].value;
    const passwordValue = editUserProfileForm["userPassword"].value;

    // init edit user info as the PUT body, grab the updated info from the form
    // not a good style
    const editUserInfo = {};

    if (emailValue) {
      editUserInfo.email = emailValue;
    }
    if (nameValue) {
      editUserInfo.name = nameValue;
    }

    if (bioValue) {
      editUserInfo.bio = bioValue;
    }

    if (passwordValue) {
      editUserInfo.password = passwordValue;
    }

    const avatarFiles = editUserProfileForm["userAvatar"].files;

    if (avatarFiles.length === 0) {
      // send POST request to server
      user
        .update(editUserInfo)
        .then((resp) => {
          // use the editedUse info to override the curUser
          const newInfo = {
            ...User.getCurUserInfo(),
            ...editUserInfo,
          };

          // update local storage and curUser singleton
          localStorage.setItem("curUser", JSON.stringify(newInfo));
          User.updateCurUser(newInfo);


          // refresh channel screen
          getChannelById(getChannelId());
          document.querySelector("#userProfileOffcanvas .btn-close").click();
        })
        .catch((err) => {
          alert(err);
        });
    } else {
      // load images async
      fileToDataUrl(avatarFiles[0])
        .then((avatarUrl) => {
          // also need to update the avatar image, put it into the PUT JSON body
          editUserInfo.image = avatarUrl;
          // request to server
          user
            .update(editUserInfo)
            .then((resp) => {
              const newInfo = {
                ...User.getCurUserInfo(),
                ...editUserInfo,
              };

              // update local storage and curUser singleton
              localStorage.setItem("curUser", JSON.stringify(newInfo));

              // update avatar img on the channel list
              document.querySelector("#avatar-img").src = avatarUrl;

              // refresh channel screen
              getChannelById(getChannelId());
              document
                .querySelector("#userProfileOffcanvas .btn-close")
                .click();
            })
            .catch((err) => {
              alert(err);
            });
        })
        .catch((err) => {
          alert(err);
        });
    }
  });

/**
 * 2.2.3 Viewing and editing channel details
 * register event for editChannel btn in editChannelModal
 */
document
  .querySelector("#editChannelButton")
  .addEventListener("click", (event) => {
    const editChannelForm = document.forms["edit-channel"];
    const name = editChannelForm["channel-name"].value;
    const description = editChannelForm["channel-desc"].value;

    const channelItem = document.querySelector(
      `div#channel-list #channel-${getChannelId()}`
    );
    const channelName = channelItem.querySelector("p.channel-name");
    channelName.textContent = name;

    // const channelMeta = document.querySelector('div.channel-meta');
    const channelComponent = document.querySelector("channel-details");

    // use setter to update channel name and description
    channelComponent.channelName = name;
    channelComponent.channelDesc = description;
    
    apiPutCall(`channel/${getChannelId()}`, {
      name,
      description,
    })
      .then((respBody) => {
        console.log("Edit channel success");
      })
      .catch((errMsg) => {
        alert(errMsg);
      });

    const createChannelModal = bootstrap.Modal.getInstance(
      document.getElementById("editChannelModal")
    );
    createChannelModal.hide();
  });

// In the editChannelModal, when user press "Enter", it triggers the submission of channel editing
document
  .getElementById("editChannelModal")
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector("#editChannelButton").click();
    }
  });

// Users should be able to edit the channel's name and description in some way.
// Channel details can only be edited by users who are in the channel.

// If the user is not a member of the channel,
// they do not need to see the channel details, but should be given a way to join the channel.
// If the user is a member of the channel, there should be an option to leave the channel.

const channels = {
  setChannelId,
  getChannelId,
  flushChannels,
  createChannel,
  getChannelById,
  joinChannel,
  showChannel,
  leaveChannel,
  handleScroll,
};

export default channels;
