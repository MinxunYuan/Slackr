import { BACKEND_PORT, LOCAL_HOST } from "./config.js";
// A helper you may want to use when uploading new images to the server.
import { showPage, apiPostCall, fileToDataUrl, apiGetCall } from "./helpers.js";
import { User } from "./user.js";

import router from "./router.js";
import channels from "./channels.js";
import user from "./user.js";

// listen the route change
window.onhashchange = router.checkHashRoute;
// window.onload = router.checkHashRoute;

// flush channels every page load
window.addEventListener("hashchange", (event) => {
  if (event.newURL.includes("channel")) {
    channels.flushChannels();
  }
  // channels.flushChannels();
});

window.addEventListener("load", (event) => {
  if (window.location.href.includes("channel")) {
    channels.flushChannels();
  }
});

// window.addEventListener("load", channels.flushChannels);
let globalToken = null;

// currently fetch user info from local storage
// should be fetched from server later on
let curUserToken = null;
let curUserId = null;
let curUserName = null;

let curUser = null;

// event preparation
let loginForm = document.forms["login-form"];
const registerForm = document.forms["register-form"];

// get the login user info once the page is loaded
const updateCurUserInfo = () => {
  curUserToken = localStorage.getItem("token");
  curUserId = localStorage.getItem("uid");
  curUserName = localStorage.getItem("uName");
};

function main() {
  // init

  // check if user has logged in, display user profile link if so
  updateCurUserInfo();
  // console.log(curUserToken, curUserId, curUserName);

  // if user has logged in, hide login and register buttons and show user profile link
  // user can click the link to go to profile page and log out
  if (curUserToken !== null) {
    // document.querySelector("div > a#channels-link").style.display = "block";
    // registerEpilog();
    // console.log("user logged in already");

    // display first channel by default
    router.redirectTo("channels", () => {
      setTimeout(() => {
        // after 0.5s, hide loading page and show the target page
        const firstChannel = document.querySelector(
          "#channel-list channel-item:first-of-type"
        );
        if (firstChannel) {
          // console.log(firstChannel);
          firstChannel.click();
        }
        // else display default channel screen
      }, 250);
    });
  } else {
    router.redirectTo("dashboard", () => {});
  }
  // load dashboard page by default
  // showPage("dashboard");
}

main();

const goToChannel = () => {
  router.redirectTo("channels", () => {
    setTimeout(() => {
      // after 0.5s, hide loading page and show the target page
      // i.e. emulate 0.5s loading
      const firstChannel = document.querySelector(
        "#channel-list channel-item:first-of-type"
      );
      // console.log(firstChannel);
      if (firstChannel) {
        firstChannel.click();
      }
      // else display default channel screen
    }, 250);
  });
};

// register onClick for sign-in btn in login form
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // get user input from the form
  const loginEmail = loginForm["login-email"].value;
  const loginPassword = loginForm["login-password"].value;
  // POST request to server
  apiPostCall("auth/login", { email: loginEmail, password: loginPassword })
    .then((respBody) => {
      const { token, userId } = respBody;
      // update cur user
      localStorage.setItem("token", token);
      localStorage.setItem("uid", userId);
      // get user name if it doesn't exist in localStorage
      if (localStorage.getItem("uName") === null) {
        user
          .getInfoById(userId)
          .then((userInfo) => {
            localStorage.setItem("uName", userInfo.name);

            curUser = new User({ id: userId, ...userInfo });

            // set curUser singleton if login successfully
            const curUserSingleton = User.getCurUserSingleton({
              id: userId,
              ...userInfo,
            });

            // console.log(curUser.info);
            // console.log(curUserSingleton.info);

            // getter
            localStorage.setItem("curUser", JSON.stringify(curUser.info));

            location.reload();
          })
          .catch((errMsg) => {
            alert(errMsg);
            location.reload();
          });
      } else {
        // router.redirectTo("dashboard", () => {
        //   // registerEpilog();
        // });
        location.reload();
      }
    })
    .catch((msg) => {
      // should obtain error response from server late on
      alert(msg);
    });
});

// event handler for register form
registerForm.addEventListener("submit", (event) => {
  // prevent default behavior of form submit
  event.preventDefault();

  // get user input from the form
  const regName = registerForm["register-name"].value;
  const regEmail = registerForm["register-email"].value;

  const regPwd = registerForm["register-password"].value;
  const confirmedPwd = registerForm["register-confirm-password"].value;

  if (regPwd !== confirmedPwd) {
    // if the two passwords don't match the user should receive an error popup
    alert("Password not match!");
    return;
  }

  // console.log(regName, regEmail, regPwd);
  apiPostCall("auth/register", {
    name: regName,
    email: regEmail,
    password: regPwd,
  })
    .then((respBody) => {
      const { token, userId } = respBody;
      // do sth after register
      // set token and uid in localStorage

      // TODO: use OOP later
      localStorage.setItem("token", token);
      localStorage.setItem("uid", userId);
      localStorage.setItem("uName", regName);

      if (!curUser) {
        curUser = new User({ id: userId, name: regName, email: regEmail });
        localStorage.setItem("curUser", JSON.stringify(curUser.info));
        User.getCurUserSingleton(curUser.info);
      }
      location.reload();
    })
    .catch((errMsg) => {
      alert(errMsg);
    });
});

// Trigger to display the create-channel-form
document
  .querySelector("button#create-channel.btn-primary")
  .addEventListener("click", channels.createChannel);

// main();
