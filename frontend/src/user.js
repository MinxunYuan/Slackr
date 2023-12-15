import { apiGetCall, apiPutCall } from "./helpers.js";

export class User {
  constructor(data) {    
    this._id = data.id || "";
    this._email = data.email || "";
    this._name = data.name || "";
    this._bio = data.bio || "";
    // for profile page
    this._image = data.image || "";
  }

  static curUser;

  static getCurUserSingleton(data) {
    if (!User.curUser) {
      User.curUser = new User(data);
    }

    return User.curUser;
  }

  static updateCurUser(data) {
    User.curUser.info = data;
  }

  static getCurUserInfo() {
    return User.getCurUserSingleton(
      new User(JSON.parse(localStorage.getItem("curUser")))
    ).info;
  }


  set id(id) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  set email(email) {
    this._email = email;
  }

  get email() {
    return this._email;
  }

  set name(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set bio(bio) {
    this._bio = bio;
  }

  get bio() {
    return this._bio;
  }

  set image(image) {
    this._image = image;
  }

  get image() {
    return this._image;
  }

  get info() {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      bio: this._bio,
      image: this._image,
    };
  }

  // set user(data) {
  set info(data) {
    this._id = data.id;
    this._email = data.email;
    this._name = data.name;
    this._bio = data.bio;
    this._image = data.image;
  }
}

// {
//  "email": "betty@email.com",
//  "name": "Betty",
//  "bio": "when you are young they assume you know nothing",
//  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
// }

/**
 * Send GET request to backend, to get user info by id
 * @param {string} id
 * @returns {Promise} the promise that represent the user info
 */
const getInfoById = (id) => {
  return apiGetCall(`user/${id}`, true)
    .then((respBody) => {
      return respBody;
    })
    .catch((errMsg) => {
      alert(errMsg);
    });
};

/**
 * Send put request to backend to update user info.
 * @param {User} userInfo
 * @returns {Promise} the promise that resped by the server
 */
const update = (userInfo) => {
  return apiPutCall("user", userInfo);
  // .then((respBody) => {
  //   return respBody;
  // })
  // .catch((errMsg) => {
  //   alert(errMsg);
  // });
};

const user = { getInfoById, update };
export default user;
