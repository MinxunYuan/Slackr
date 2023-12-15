import channels from "../channels.js";
import { removeDoms } from "../helpers.js";

/**
 * ChannelItem component
 * <channel-item>
 */
class ChannelItem extends HTMLElement {
  constructor() {
    super();

    // this._shadowRoot = this.attachShadow({ mode: "open" });
    this.channelName = "";
    this.channelId = "";
    this.channelMembers = [];
    this.channelType = "";
    this.debounceTimer = null;
  }

  static get observedAttributes() {
    return ["id"];
  }

  // set state
  set channelData(data) {
    this.channelName = data.name;
    this.channelId = data.id;
    this.channelMembers = data.members;
    this.channelType = data.private ? "private" : "public";
    // console.log(data);

    // set id for <channel-item>
    this.id = this.channelId;
  }

  // will be called if specified attr get changed
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "id":
        // console.log(`ID changed from ${oldValue} to ${newValue}`);
        this.channelId = newValue;
        break;
    }

    // debounce, prevent multiple attr get changed in a short time
    // cause multiple render called
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.render();
    }, 50);

    // this.render();
  }

  // render data on <channel-item>
  render() {
    // this.innerHTML = "";
    removeDoms(this);
    // tags
    const divTag = document.createElement("div");
    const pTag = document.createElement("p");
    const joinBtn = document.createElement("button");
    const leaveBtn = document.createElement("button");

    // this.className += this._channelType;
    // divTag.className = `${this._channelType}-channel`;
    // mount data
    pTag.innerText = this.channelName;

    divTag.appendChild(pTag);
    const curUser = JSON.parse(localStorage.getItem("curUser"));
    // check user is a member of the channel or not
    // if not, user can join the channel

    joinBtn.innerText = "Join";
    // joinBtn.className = "channel-join-btn";
    joinBtn.className = "btn btn-secondary btn-sm";

    leaveBtn.innerText = "Leave";
    // leaveBtn.className = "channel-leave-btn";
    leaveBtn.className = "btn btn-secondary btn-sm";

    if (this.channelMembers.includes(curUser.id)) {
      joinBtn.style.display = "none";
    } else {
      leaveBtn.style.display = "none";
    }

    joinBtn.addEventListener("click", (event) => {
      channels
        .joinChannel(this.channelId)
        .then((resp) => {
          joinBtn.style.display = "none";
          leaveBtn.style.display = "block";
          event.stopPropagation();
          this.click();
        })
        .catch((err) => {
          alert(err);
        });
      // joinBtn.style.display = "none";
      // leaveBtn.style.display = "block";
      // event.stopPropagation();
      // channels.flushChannels();
      // this.click();
    });
    leaveBtn.addEventListener("click", (event) => {
      channels
        .leaveChannel(this.channelId)
        .then((resp) => {
          leaveBtn.style.display = "none";
          joinBtn.style.display = "block";
          event.stopPropagation();
          this.click();

        })
        .catch((err) => {
          alert("You have already left this channel!");
        });
    });

    divTag.appendChild(joinBtn);
    divTag.appendChild(leaveBtn);

    divTag.className = `channel-item-div ${this.channelType}-channel`;
    divTag.className +=
      " list-group-item d-flex justify-content-between align-items-center";
    divTag.id = `channel-${this.channelId}`;
    pTag.classList.add("mb-0");
    pTag.classList.add("channel-name");
    // pTag.className = "mb-0";

    this.appendChild(divTag);
    // this._shadowRoot.appendChild(divTag);
  }
}

customElements.define("channel-item", ChannelItem);

export default ChannelItem;
