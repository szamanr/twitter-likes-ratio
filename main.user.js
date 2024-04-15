// ==UserScript==
// @name        twitter likes ratio
// @namespace   szamanr
// @description shows the ratio of likes to views for each twitter post on the page
// @match       https://twitter.com/*
// @grant       none
// @version     0.2
// @author      szamanr
// @supportURL  https://github.com/szamanr/twitter-likes-ratio
// @licence     MIT
// ==/UserScript==

const parseNumber = (numberString) => {
  let parsed;
  if (numberString.slice(-1) === "K") { parsed = parseFloat(numberString.slice(0,-1)) * 1000; }
  else if (numberString.slice(-1) === "M") { parsed = parseFloat(numberString.slice(0,-1)) * 1000_000; }
  else parsed = parseFloat(numberString.replace(",",""));

  return parsed || 0;
}

const main = () => {
  const tweets = document.querySelectorAll("[data-testid=tweet]");

  tweets.forEach(tweet => {
    let views = Array.from(tweet.querySelectorAll("a")).filter(link=>link.getAttribute("href").includes("analytics"))[0]?.textContent;
    const likes = tweet.querySelectorAll("[data-testid=like],[data-testid=unlike]")[0];

    if (!views) {
      views = Array.from(tweet.querySelectorAll("span")).find(el => el.textContent.includes("Views")).textContent.replace("Views", "").trim();
    }
    if (!views || !likes) { console.debug(tweet); return; }

    const alreadyProcessed = likes.parentElement.textContent.includes("(");
    if (alreadyProcessed) return;

    const viewCount = parseNumber(views);
    const likeCount = parseNumber(likes?.textContent);
    const ratio = (likeCount / viewCount * 100).toFixed(1) + "%";

    if (likeCount === 0) return;

    const likeCountElement = likes.querySelector("[data-testid=app-text-transition-container]");
    const likeContainer = likeCountElement?.parentElement;
    if (!likeContainer) return;
    const ratioElement = document.createElement("span")
    const ratioContainer = document.createElement("span");

    ratioElement.textContent = ` (${ratio})`;
    ratioElement.style["font-size"] = "13px";
    ratioElement.style["line-height"] = "16px";
    ratioElement.style["color"] = window.getComputedStyle(likeCountElement).color;

    ratioContainer.appendChild(ratioElement);
    ratioElement.className = likeContainer.getAttribute("class");

    likeContainer.style["flex-direction"] = "row";
    likeContainer.style["align-items"] = "center";
    likeContainer.appendChild(ratioContainer);
  });
}

// If the script loads before the UI loads, the script's UI won't be added.
// Observe the DOM for changes and re-run `main` when it changes to ensure the script loads.
const addMutationObserver = () => {
    // Select the node that will be observed for mutations
    const targetNode = document.getElementsByTagName('body')[0];

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
      main();
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}


main();
addMutationObserver();
