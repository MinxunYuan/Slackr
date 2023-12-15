import { apiPutCall, apiDeleteCall, removeDoms, formatDate } from "../helpers.js";
import channels from "../channels.js";
import messages from "../messages.js";
import user, { User } from "../user.js";

class ChannelMessage extends HTMLElement {
  // init, set default value, component may not me mounted at this stage
  constructor() {
    super();

    // members
    this._msgId = "";
    this._message = "";
    this._sentAt = "";

    // fields related to user
    this._sender = "";
    this._senderId = "";
    this._senderImg = "";

    // default value
    this._edited = false;
    this._editedAt = null;
    this._pinned = false;

    this._content = null;
  }

  // when component is added to dom, render component
  connectedCallback() {
    // this.render();
    this.loadToolTip();
  }

  // Code for the Bootstrap toggle down list, copied from Bootstrap 5 webpage
  loadToolTip() {
    let tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  set msgId(id) {
    this._msgId = id;
  }

  get msgId() {
    return this._msgId;
  }

  // this refers to the component <channel-message>
  set msg(newMsg) {
    this._message = newMsg;
    this.querySelector(".msg-content").innerText = newMsg;
  }

  set edited(edited) {
    this._edited = edited;
  }

  get edited() {
    return this._edited;
  }

  set editedAt(editedAt) {
    this._editedAt = editedAt;
  }

  get editedAt() {
    return this._editedAt;
  }

  // after set data, render component
  set data(data) {
    // BE CAREFUL!!!
    // this.sender calls setter implicitly, even if it is not defined

    // data.sender
    this._senderId = data.sender;

    // get sender info from server
    user
      .getInfoById(data.sender)
      .then((userInfo) => {
        this._senderImg = userInfo.image;
        this._sender = userInfo.name;

        // render DOMs
        this.render();
      })
      .catch((err) => {
        alert(err);
      });

    this._msgId = data.id;
    // this._sender = data.sender;
    this._message = data.message;
    this._sentAt = formatDate(new Date(data.sentAt));
    // this._sentAt = data.sentAt;

    this._edited = data.edited;

    // this._editedAt = data.editedAt;
    this._editedAt = formatDate(new Date(data.editedAt));

    this._pinned = data.pinned;

    // render DOMs
    this.render();
  }

  get data() {
    return {
      id: this._msgId,
      senderId: this._senderId,
      sender: this._sender,
      message: this._message,
      sentAt: this._sentAt,
      senderImg: this._senderImg,
      edited: this._edited,
      editedAt: this._editedAt,
      pinned: this._pinned,
    };
  }

  // this refers to the target event

  // Users can delete their own messages they see displayed from the single channel screen.
  deleteMessage() {
    // check sender
    if (+this._senderId !== +localStorage.getItem("uid")) {
      alert("You can only delete your own messages!");
      return;
    }

    // console.log(
    //   `Deleting mgs ${this._msgId} from channel ${channels.getChannelId()}`
    // );
    apiDeleteCall(`message/${channels.getChannelId()}/${this._msgId}`)
      .then((res) => {
        // console.log(res);
        // remove the deleted message from DOM
        this.remove();
      })
      .catch((err) => {
        alert(err);
      });
  }

  editMessage() {
    const msgInput = this.querySelector(".message-edit#channel-input-textarea");
    const msgContent = this.querySelector(".msg-content");
    // Press Enter
    if (event.key === "Enter") {
      event.preventDefault();
      // console.log("Editing message!");
      // console.log(msgInput.value);

      // After adding a new message, it is required to request the backend to get the meta of the added msg
      // In this editing situation, need to ask for the backend to get the original message?????

      // request backend, PUT message
      apiPutCall(
        `message/${channels.getChannelId()}/${this.msgId}`,
        { message: msgInput.value },
        true
      )
        .then((res) => {
          // console.log(res);
          // display new message
          msgContent.innerText = msgInput.value;
          msgContent.style.display = "block";
          msgInput.style.display = "none";

          // update data and rerender the edited message
          messages
            .getMsgsByChannelId(channels.getChannelId(), 0)
            .then((resp) => {
              // const latestMsg = resp.messages[0];
              this.data = resp.messages[0];
            })
            .catch((err) => {
              alert(err);
            });
        })
        .catch((err) => {
          alert(err);
        });
    }

    // Press Esc
    if (event.key === "Escape") {
      event.preventDefault();
      // console.log("Cancel editing message!");
      // activate textarea
      msgContent.style.display = "block";
      msgInput.style.display = "none";
    }
  }

  showEditBlock() {
    // activate textarea
    const msgInput = this.querySelector(".message-edit#channel-input-textarea");
    const msgContent = this.querySelector(".msg-content");
    msgContent.style.display = "none";
    msgInput.style.display = "block";

    // this.querySelector(".msg-content").innerText;
    msgInput.value = this._message;
  }

  render() {
    // clear existing elements
    removeDoms(this);

    // get doms in the template
    const template = document.getElementById("channel-message-template");
    this._content = template?.content.cloneNode(true);

    // const msgContainer = this.content.querySelector(".msg-container");

    const senderImg = this._content.querySelector(".user-img");

    // if no img provided, use the default image
    if (!this._senderImg) {
      senderImg.src = "./asset/defaultImg.jpg";
    } else {
      senderImg.src = this._senderImg;
    }

    senderImg.innerText = this._sender;

    // Modify DOMs
    const msgContent = this._content.querySelector(".msg-content");
    msgContent.innerText = this._message;

    const senderName = this._content.querySelector(".sender-name");
    senderName.innerText = this._sender;

    const sendTime = this._content.querySelector(".send-time");
    sendTime.innerText = `@ ${this._sentAt}`;

    // check whether the message is edited or not
    const editedP = this._content.querySelector(".msg-edited");
    // call setter
    if (this.edited) {
      editedP.style.display = "block";
      editedP.setAttribute("title", `Edited at ${this.editedAt}`);
    }

    // textarea for edit message
    const msgInput = this._content.querySelector(
      ".message-edit#channel-input-textarea"
    );

    msgInput.addEventListener("keydown", (event) => {
      this.editMessage();
    });

    // register handler for message opts menu
    // handle event for editing message
    this._content.querySelector("#channel-message-edit").onclick = () => {
      this.showEditBlock();
    };

    // register handler for user to delete message
    this._content.querySelector("#channel-message-delete").onclick = () => {
      this.deleteMessage();
    };

    // fix bug, urgent!!!
    this.style.position = "relative";

    this.appendChild(this._content);
    this.loadToolTip();
  }
}

customElements.define("channel-message", ChannelMessage);

export default ChannelMessage;
