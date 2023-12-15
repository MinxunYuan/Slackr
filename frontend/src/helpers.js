import { LOCAL_HOST } from "./config.js";

/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 *
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export const fileToDataUrl = (file) => {
  const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  const valid = validFileTypes.find((type) => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error("provided file is not a png, jpg or jpeg image.");
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
};

/**
 * Makes a POST API call to a specified URL with a given JSON body.
 *
 * @param {string} urlPath - The URL path to which the API call should be made.
 * @param {Object} jsonBody - The JSON body payload for the POST request.
 * @returns {Promise<string>} A promise resolving with the API response,
 * or rejecting with an error.
 */
export const apiPostCall = (urlPath, jsonBody, auth = false) => {
  // return a Promise obj to manage callbacks
  return new Promise((resolve, reject) => {
    fetch(LOCAL_HOST + urlPath, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: auth
          ? `Bearer ${localStorage.getItem("token")}`
          : undefined,
      },
      body: JSON.stringify(jsonBody),
    })
      .then((response) => response.json())
      // parse response body to json
      .then((data) => {
        // if json body contains error key,
        // just pass the data['error'] to the reject callback
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });
  });
};

export const removeDoms = (parDom) => {
  while (parDom.firstChild) {
    parDom.removeChild(parDom.firstChild);
  }
}

/**
 * Follow the step that has been taught
 * Show the page with the given name, hiding all other pages.
 * For the convention, each 'page' has a class name of "page-block", and
 * an id of "page-<name>".
 * @param {string} pageName
 */
export const showPage = (pageName) => {
  const loadingPage = document.querySelector("#page-loading");
  const banner = document.querySelector(".banner");

  // hide everything
  Array.from(document.querySelectorAll(".page-block")).forEach(
    (pg) => (pg.style.display = "none")
  );

  // no need to show banner in channel page
  if (pageName.includes("channel")) {
    loadingPage.style.display = "block";
    banner.style.display = "none";
  } else {
    document.getElementById(`page-${pageName}`).style.display = "block";
    return;
  }

  setTimeout(() => {
    if (pageName.includes("channel")) {
      document.getElementById("page-channels").style.display = "flex";
    } else {
      document.getElementById(`page-${pageName}`).style.display = "block";
    }
    loadingPage.style.display = "none";
  }, 400);

};

export const apiGetCall = (urlPath, auth = false) => {
  return new Promise((resolve, reject) => {
    fetch(LOCAL_HOST + urlPath, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: auth
          ? `Bearer ${localStorage.getItem("token")}`
          : undefined,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });
  });
};

export const apiPutCall = (urlPath, jsonBody) => {
  return new Promise((resolve, reject) => {
    fetch(LOCAL_HOST + urlPath, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(jsonBody),
    })
      .then((response) => {
        // may required more error handling such as networking issue
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });
  });
};

export const apiDeleteCall = (urlPath) => {
  return new Promise((resolve, reject) => {
    // if default parameter jsonBody is not null, add it to request body
    fetch(LOCAL_HOST + urlPath, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      // body: JSON.stringify(jsonBody),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });
  });
};

// dd/mm/yyyy
export const formDate = (date) => {
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

// dd/mm/yyyy hh:mm
export const formatDate = (date) => {
  let day = date.getDate();
  // January is 0
  let month = date.getMonth() + 1;
  const year = date.getFullYear().toString().substr(-2); // 取最后两位

  let hour = date.getHours();
  let minute = date.getMinutes();

  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }

  return day + "/" + month + "/" + year + " " + hour + ":" + minute;
};
