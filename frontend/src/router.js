import {showPage} from "./helpers.js";

// listen the route change
const checkHashRoute = () => {
    const path = window.location.hash;
    // console.log(path);
    // #login -> login
    let realPath = path.slice(1);
    if (realPath.length === 0) {
        realPath = "dashboard";
    }
    showPage(realPath);
}

/**
 * Redirects to the specified page and optionally executes a provided function.
 *
 * @param {string} pageName - The name of the page to navigate to.
 * @param {Function} [doSth] - An optional callback function to execute after changing the URL but before showing the page.
 */
const redirectTo = (pageName, doSth) => {
    history.pushState(null, null, `#${pageName}`);
    if (doSth) {
      doSth();
    }
    // for specific channel and profile
    if (pageName.includes("=")) {
      return;
    }
    showPage(pageName);
  };

// window.onhashchange = checkHashRoute;
// window.onload = checkHashRoute;

const router = {
    checkHashRoute,
    redirectTo,
};

export default router;