document.addEventListener("DOMContentLoaded", onPageLoad);
function onPageLoad() {
  //add eventlisteners
  let bgColorPicker = document.getElementById("background-color-picker");
  let cardBgColorPicker = document.getElementById("card-bg-color-picker");
  let textColorPicker = document.getElementById("text-color-picker");
  let resetBtn = document.getElementById("options_reset_btn");
  chrome.storage.sync.get(["color", "card-bg-color", "text-color"], data => {
    console.log(data);
    bgColorPicker.value = data.color;
    bgColorPicker.parentElement.style.backgroundColor = data.color;
    bgColorPicker.parentElement.style.color = invertColor(data.color, true);
    bgColorPicker.onchange = e => saveValues("color", e);
    cardBgColorPicker.value = data["card-bg-color"];
    cardBgColorPicker.onchange = e => saveValues("card-bg-color", e);
    console.log(cardBgColorPicker.parentElement);
    cardBgColorPicker.parentElement.style.backgroundColor =
      data["card-bg-color"];
    cardBgColorPicker.parentElement.style.color = invertColor(
      data["card-bg-color"],
      true
    );
    textColorPicker.value = data["text-color"];
    textColorPicker.onchange = e => saveValues("text-color", e);
    textColorPicker.parentElement.style.backgroundColor = data["text-color"];
    textColorPicker.parentElement.style.color = invertColor(
      data["text-color"],
      true
    );
    resetBtn.onclick = () => {
      reset({ bgColorPicker, cardBgColorPicker, textColorPicker });
      bgColorPicker.parentElement.style.backgroundColor = "#696969";
      bgColorPicker.parentElement.style.color = "initial";

      textColorPicker.parentElement.style.backgroundColor = "#333333";
      textColorPicker.parentElement.style.color = "initial";

      cardBgColorPicker.parentElement.style.backgroundColor = "#ffffff";
      cardBgColorPicker.parentElement.style.color = "initial";
    };
  });
}

function saveValues(name, event) {
  let value = event.target.value;
  chrome.storage.sync.set({ [name]: value }, () => {
    // console.log('done')
  });
  event.target.parentElement.style.backgroundColor = value;
  event.target.parentElement.style.color = invertColor(value, true);
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
