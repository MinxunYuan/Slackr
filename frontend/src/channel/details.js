import { removeDoms } from "../helpers.js";
/**
 * Author: Jerry Yuan
 * Created: 26/10/2023
 *
 * ChannelDetails is a custom component, which is responsible for rendering channel details.
 * It shows the channel name, description, created time, private or public, creator.
 */
class ChannelDetails extends HTMLElement {
  constructor() {
    super();

    // init channel state
    this._channelName = "";
    this._channelDesc = "";
    this._channelCreatedAt = "";
    this._channelPrivate = "";
    this._channelCreator = "";

    this._content = null;
  }

  // mount data and render component
  set channelData(data) {
    this._channelName = data.name;
    this._channelDesc = data.description;
    this._channelCreatedAt = data.createdAt;
    this._channelPrivate = data.private;
    this._channelCreator = data.creator;
    this.render();
  }

  // tell browser observe attributes changes on <channel-component>
  // .setAttribute('channel-name', 'xxx'), attributeChangedCallback() will be called
  static get observedAttributes() {
    return ["channel-name", "channel-desc"];
  }

  render() {
    console.log("render channel meta");
    // this.innerHTML = "";
    removeDoms(this);

    const template = document.getElementById("channel-details-template");
    this._content = template?.content.cloneNode(true);

    // Modify DOMs
    const channelName = this._content.querySelector(".channel-name");
    channelName.innerText = this._channelName;

    const channelDesc = this._content.querySelector(".channel-desc");
    channelDesc.innerText = this._channelDesc;

    const channelDetailSec = this._content.querySelector(".channel-detail");
    // channelDetailSec.addEventListener("click", (event) => {

    // load channel details modal when click <channel-details>
    this.onclick = (event) => {
      let channelDetails = document.getElementById("channelDetails");

      let modalTitle = document.querySelector(
        ".modal-title.channel-detail-modal-title"
      );
      modalTitle.innerText = `#${this._channelName} - (${this._channelPrivate})`;
      channelDetails.textContent = this._channelDesc;

      document.querySelector(
        "#channel-creator"
      ).innerText = `Created by ${this._channelCreator}`;
      document.querySelector(
        "#channel-create-at"
      ).innerText = `At ${this._channelCreatedAt}`;

      // load modal
      let channelModal = new bootstrap.Modal(
        document.getElementById("channelModal")
      );
      channelModal.show();
    };

    // mount <channel-details> to DOM tree
    this.appendChild(this._content);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "channel-name":
        this._channelName = newValue;
        break;
      case "channel-desc":
        this._channelDesc = newValue;
        break;
    }
    // console.log("changedAttr: ", name);
  }

  // will be called if specified attr get changed
  requestUpdate() {
    if (!this.updatePending) {
      this.updatePending = true;
      // update batched
      // debounce, prevent multiple attr get changed in a short time
      // therefore, this.render() will be called only one time
      // even if attributeChangedCallback is called multiple times
      setTimeout(() => {
        this.update();
      });
    }
  }

  update() {
    this.updatePending = false;
    // change attr and render
    // console.log("Attributes updated:", this._channelName, this._channelDesc);
    this.render();
  }

  // use js to modify attr directly
  get channelName() {
    return this._channelName;
  }

  set channelName(name) {
    this.setAttribute("channel-name", name);
    this.requestUpdate();
  }

  get channelDesc() {
    return this._channelDesc;
    this.requestUpdate();
  }

  set channelDesc(desc) {
    this.setAttribute("channel-desc", desc);
  }
}

customElements.define("channel-details", ChannelDetails);

export default ChannelDetails;
