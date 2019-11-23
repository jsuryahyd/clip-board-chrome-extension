///<reference path="../chrome.d.ts"/>
///<reference path="../gapi.d.ts"/>
document.addEventListener("DOMContentLoaded", onPageLoad);
function onPageLoad() {
  //add eventlisteners
  let bgColorPicker = document.getElementById("background-color-picker");
  let cardBgColorPicker = document.getElementById("card-bg-color-picker");
  let textColorPicker = document.getElementById("text-color-picker");
  let resetBtn = document.getElementById("options_reset_btn");
  let downloadNotes = document.getElementById("download_notes");
  let uploadNotesInput = document.getElementById("upload_notes");
  let backupBtn = document.getElementById("backup");
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

  downloadNotes.onclick = downloadContent;

  uploadNotesInput.onchange = function() {
    uploadNotes(this);
  };

  setTimeout(() => {
    gapi.client.load("drive", "v3", () => {
      backupBtn.style.display = "block";
      backupBtn.onclick = () => {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
          chrome.storage.sync.get("notes", data => {
            driveBackup(data, token);
          });
        });
      };

      chrome.identity.getAuthToken({ interactive: true }, function(token) {
        fetchBackup(token);
      });
    });
  }, 3000);
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

function downloadContent() {
  chrome.storage.sync.get("notes", data => {
    // bkg.console.log(data);
    downloadObjectAsJson(
      data.notes,
      "ClipBoard and Notes : " + new Date().toLocaleString()
    );
  });
}

/*
- https://stackoverflow.com/a/30800715/7314900
*/
function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function uploadNotes(input) {
  const file = input.files[0];
  if (!file) return alert("No file");
  const reader = new FileReader();
  reader.onload = ev => {
    console.log(ev.target.result);

    let content = ev.target.result;
    chrome.storage.sync.get("notes", data => {
      chrome.storage.sync.set({
        notes: [...data.notes, ...JSON.parse(content + "")]
      });
    });
  };

  reader.onerror = ev => {
    console.error(ev);
    alert("Error while reading the file.");
  };
  reader.readAsText(file, "UTF-8");
}

function driveBackup(data, token) {
  var fileMetadata = {
    name: "data.json",
    parents: ["appDataFolder"]
  };

  const formData = new FormData();
  formData.append(
    "data",
    new File(
      [new Blob([JSON.stringify(data)], { type: "application/json" })],
      "data.json"
    )
  );
  var media = {
    mimeType: "application/json",
    // body: new Blob([JSON.stringify(data)], { type: "application/json" })
    body: new File(
      [new Blob([JSON.stringify(data)], { type: "application/json" })],
      "data.json"
    )
    // "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  };
  const createRequest = gapi.client.drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id",
    oauth_token: token
  });

  createRequest.execute((...args) => {
    console.log(args);

    chrome.storage.sync.set({ backupId: args[0].id });
  });

  // const files = gapi.client.drive.files.list({
  //   maxResults: 5,
  //   oauth_token: token
  // });
  // files.then(
  //   files => {
  //     console.log(files);
  //   },
  //   err => {
  //     console.error(err);
  //   }
  // );

  // fetch(
  //   `https://www.googleapis.com/upload/drive/v3/files?uploadType=media&spaces=appDataFolder`,
  //   {
  //     method: "POST",
  //     // body: new Blob([JSON.stringify(data)], { type: "application/json" }),
  //     body: JSON.stringify(data),
  //     // body: {
  //     //   media: new Blob([JSON.stringify(data)], { type: "application/json" }),
  //     //   parents: ["appDataFolder"],
  //     //   name: "data.json"
  //     // },
  //     // body: formData,
  //     // body:
  //     //   "data:text/json;charset=utf-8," +
  //     //   encodeURIComponent(JSON.stringify(data)),
  //     headers: {
  //       "content-type": "application/json",
  //       authorization: "Bearer " + token
  //     }
  //   }
  // )
  //   .then(response => {
  //     if (response.ok) return response;
  //     else
  //       throw Error(
  //         `Server returned ${response.status}: ${response.statusText}`
  //       );
  //   })
  //   .then(response => console.log(response.text()))
  //   .catch(err => {
  //     console.error(err);
  //   });
}

function fetchBackup(token) {
  chrome.storage.sync.get("backupId", data => {
    console.log(data);
    if (!data.backupId) {
      return false;
    }

    // gapi.client.drive.()

    const files = gapi.client.drive.files.list({
      maxResults: 5,
      oauth_token: token
    });
    files.then(
      files => {
        console.log(files);
      },
      err => {
        console.error(err);
      }
    );
  });
}
