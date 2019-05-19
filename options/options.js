document.addEventListener("DOMContentLoaded", onPageLoad);
function onPageLoad() {
  //add eventlisteners
  let bgColorPicker = document.getElementById("background-color-picker");
  let cardBgColorPicker = document.getElementById("card-bg-color-picker");
  let textColorPicker = document.getElementById("text-color-picker");
  let resetBtn = document.getElementById("options_reset_btn");
  chrome.storage.sync.get(["color", "card-bg-color", "text-color"], data => {
    bgColorPicker.value = data.color;
    bgColorPicker.onchange = e => saveValues("color", e.target.value);
    cardBgColorPicker.value = data["card-bg-color"];
    cardBgColorPicker.onchange = e =>
      saveValues("card-bg-color", e.target.value);
    textColorPicker.value = data["text-color"];
    textColorPicker.onchange = e => saveValues("text-color", e.target.value);
    resetBtn.onclick = () => {
      reset({ bgColorPicker, cardBgColorPicker, textColorPicker });
    };
  });
}

function saveValues(name, value) {
  chrome.storage.sync.set({ [name]: value }, () => {
    // console.log('done')
  });
}

function reset({ bgColorPicker, cardBgColorPicker, textColorPicker }) {
  chrome.storage.sync.set(
    {
      color: "#696969",
      "card-bg-color": "#ffffff",
      "text-color": "#333333"
    },
    () => {
      //console.log('reset finished')
    }
  );

  bgColorPicker.value = "#696969";
  cardBgColorPicker.value = "#ffffff";
  textColorPicker.value = "#333333";
}
