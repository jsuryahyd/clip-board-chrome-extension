var optionsContainer = document.getElementById("options_container");
const kButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#4688f1"];

function buildOptions(colors) {
    optionsContainer.style.height = "100px";
    optionsContainer.style.border = "1px solid #ccc"
  for (let color of colors) {
    let button = document.createElement("button");
    button.style.backgroundColor = color;
    button.style.borderRadius = "6px";
    button.addEventListener("click", e => {
      chrome.storage.sync.set({ color: color }, () => {
        //success
      });
    });
    optionsContainer.appendChild(button);
  }
}

buildOptions(kButtonColors);