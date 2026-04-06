"use strict";

const wrapper = document.querySelector(".wrapper");

wrapper.addEventListener("click", event => {
  if (event.target.tagName === "BUTTON") {
    console.log(event.target.textContent);
  }
});