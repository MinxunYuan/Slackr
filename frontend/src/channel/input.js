import { apiPostCall, formDate } from "../helpers.js";
import channels from "../channels.js";
import ChannelMessage from "./message.js";
import messages from "../messages.js";
import { User } from "../user.js";

class ChannelInput extends HTMLElement {
  constructor() {
    super();
    this.content = null;
  }

  connectedCallback() {
    // const template = document.getElementById("channel-input-template");
    // const content = template?.content.cloneNode(true);

    this.render();
  }

  /**
   * The actual method that tells the browser how the web component should be
   * constructed.
   */
  render() {
    // get template from index.html
    const template = document.getElementById("channel-input-template");
    // const content = template?.content.cloneNode(true);

    this.content = template?.content.cloneNode(true);

    this.content
      .querySelector("#channel-input-textarea")
      .addEventListener("keydown", (event) => {
        // send message
        if (event.key === "Enter") {
          event.preventDefault();
          // request backend
          this.sendMessage(event.target.value);

          // clear input
          event.target.value = "";
        }
      });

    this.appendChild(this.content);
  }

  //
  /**
   * 3.3 Sending message
   * this refers to the component <channel-input>
   * Once messages are sent, the channel messages should automatically update
   * without requiring a page reload/refresh.
   * The frontend should validate the message so that
   * empty strings or messages containing only whitespace cannot be sent.
   * @param {string} message
   * @returns
   */
  sendMessage(message) {
    // trim message
    message = message.trim();

    if (message === "") {
      alert("Message cannot be empty!");
      return;
    }

    // console.log(message);
    apiPostCall(`message/${channels.getChannelId()}`, { message }, true)
      .then((res) => {
        // refresh channel messages
        // the channel messages should automatically update without requiring a page reload/refresh.
        const newMsg = document.createElement("channel-message");

        // get the newest message from server
        // use the newest message to update the dom
        messages
          .getMsgsByChannelId(channels.getChannelId(), 0)
          .then((resp) => {
            const latestMsg = resp.messages[0];
            // console.log(latestMsg);

            const msgDom = document.createElement("channel-message");            
            msgDom.data = latestMsg;
            document.querySelector(".channel-msgs").appendChild(msgDom);

            // newMsg.data = {
            //   ...latestMsg,
            //   senderId: latestMsg.sender,
            //   // sender: localStorage.getItem("uName"),
            //   sender: User.getCurUserInfo().name,
            //   sentAt: formDate(new Date(latestMsg.sentAt)),
            // };

            // document.querySelector(".channel-msgs").appendChild(newMsg);
          })
          .catch((err) => {
            alert(err);
          });
      })
      .catch((err) => {
        // console.log(err);
      });
  }
}

customElements.define("channel-input", ChannelInput);
export default ChannelInput;
