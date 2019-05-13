// let port = chrome.tabs.connect(chrome.tabs[0]);

// port.onMessage.addListener(msg => {});
// port.onDisconnect.addListener(s => {
//     bkg.console.log(">>>>>>>>",focusedNoteId)
//   if (focusedNoteId) {
//     onEditComplete(focusedNoteId);
//   }
// });
var focusedNoteId = null;
var cards = document.getElementById("cards_container");
var mainSection = document.getElementById("main_section");
var bkg = chrome.extension.getBackgroundPage();

// submitBtn.onclick = e => {
//   let color = e.target.getAttribute("color");
//   // eslint-disable-next-line no-undef
//   chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//     // eslint-disable-next-line no-undef
//     chrome.tabs.executeScript(tabs[0].id, {
//       code: `document.body.style.backgroundColor="${color}";`
//     });
//   });
// };

function addCardOnClick() {
  let noteId = new Date().valueOf();
  let note = { text: "", noteId };
  appendCard(note,true);
  let content = document.querySelector(`[data-edit-id="${noteId}"]`);
  content.focus();
  getNotesAnd(notes => {
    notes.push(note);

    chrome.storage.sync.set({ notes });
  });
}

document.addEventListener("DOMContentLoaded", e => {
  let el = document.getElementsByClassName("content_card--dummy")[0];
  el && (el.onclick = addCardOnClick);

  let add_notes_btn = document.getElementById("add_notes_btn");
  add_notes_btn.onclick = addCardOnClick;
});

//append previously pasted cards
getNotesAnd(notes => {
  notes && Array.isArray(notes) && notes.forEach(note => appendCard(note));
  scrollToBottom(mainSection);
});

document.body.addEventListener("keydown", async e => {
  if (e.ctrlKey && e.keyCode == 86) {
    // const text = await navigator.clipboard.readText().catch(err=>alert(err));
    // const text = window.clipboardData.getData('Text')
    if (e.target.className == "note-content") {
      return false;
    }
    const text = getClipboardData();
    const noteId = new Date().valueOf();
    appendCard({ text, noteId }, true);

    scrollToBottom(mainSection);

    getNotesAnd(notes => {
      bkg.console.log(notes);
      chrome.storage.sync.set(
        {
          notes: (Array.isArray(notes) ? notes : []).concat([{ text, noteId }])
        },
        () => {
          //success | fail?
        }
      );
    });
  }
});

function getClipboardData() {
  let input = document.createElement("input");
  //   input.setAttribute('hidden',true);
  input.style.width = "0px";
  input.style.height = "0px";
  document.body.appendChild(input);
  input.focus();
  document.execCommand("paste");
  let text = input.value;
  document.body.removeChild(input);
  //   bkg.console.log(input);
  return text;
}

/**
 * 
 * @param {object} param0 
 * @param {boolean} animation 
 */
function appendCard({ text, noteId }, animation) {
  let contentCard = document.createElement("div");
  contentCard.setAttribute("data-note-id", noteId);
  contentCard.classList.add("content_card");
  let date = new Date(noteId);
  //   let dateString = date.toString();
  let dateString = formatDate(date);
  contentCard.innerHTML = `<div class="card__header"><h4 class="card__title">${dateString}</h4><div class="card__actions">
  <button class="btn--no_style card__action-btn" data-edit-id="${noteId}" >${editIcon} 
  </button>
  <button class="btn--no_style card__action-btn delete-card-btn" data-remove-id="${noteId}" >${deleteIcon()}</button>
  <button class="btn--no_style card__action-btn" data-copy-id="${noteId}" >${copyIcon}</button>
  </div></div><div class="note-content" contentEditable=true>${text}</div>`; //.replace(/\n/g, "<br/>")
  cards.appendChild(contentCard);
  document.querySelector(`[data-remove-id="${noteId}"]`).onclick = () =>
    removeNote(noteId);
  let content = contentCard.getElementsByClassName("note-content")[0];

  content.onfocus = e => {
    focusedNoteId = noteId;
    //add save icon.
    contentCard.insertAdjacentHTML(
      "beforeend",
      `<div class="" id="save_card_btn" >${saveIcon}</div>`
    );

    let saveBtn = document.getElementById("save_card_btn");
    // alert(!!saveBtn);
    saveBtn &&
      (saveBtn.onclick = () => {
        onEditComplete(content, noteId);
        saveBtn.parentNode.removeChild(saveBtn);
      });
  };

  content.onkeyup = e => {};
  content.addEventListener("paste", pasteAsPlainText);
  document.querySelector(`[data-edit-id="${noteId}"]`).onclick = () => {
    // content.focus();
    createCaretPlacer(false)(content);
  };

  document.querySelector(`[data-copy-id="${noteId}"]`).onclick = () =>
    selectText(content);

  if (animation) contentCard.style.animation = "glow 1s linear 0s 1";
}

function getNotesAnd(cb) {
  chrome.storage.sync.get("notes", data => {
    // bkg.console.log(data);
    cb(data.notes);
  });
}

function scrollToBottom(el) {
  el.scrollTo(0, el.scrollHeight);
}

function selectText(node) {
  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
    document.execCommand("copy");
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("copy");
  } else {
    // bkg.console.warn("Could not select text in node: Unsupported browser.");
  }
}

function deleteIcon(className) {
  return `<img src="data:image/svg+xml;base64,
  PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDQ1OSA0NTkiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ1OSA0NTk7IiB4bWw6c3BhY2U9InByZXNlcnZlIiBjbGFzcz0iIj48ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjkwNDM4MiAwIDAgMC45MDQzODIgMjEuOTQ0MyAyMS45NDQzKSI+PGc+Cgk8ZyBpZD0iZGVsZXRlIj4KCQk8cGF0aCBkPSJNNzYuNSw0MDhjMCwyOC4wNSwyMi45NSw1MSw1MSw1MWgyMDRjMjguMDUsMCw1MS0yMi45NSw1MS01MVYxMDJoLTMwNlY0MDh6IE00MDgsMjUuNWgtODkuMjVMMjkzLjI1LDBoLTEyNy41bC0yNS41LDI1LjUgICAgSDUxdjUxaDM1N1YyNS41eiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBzdHlsZT0iZmlsbDojQ0NDQ0NDIiBkYXRhLW9sZF9jb2xvcj0iI2NjY2NjYyI+PC9wYXRoPgoJPC9nPgo8L2c+PC9nPiA8L3N2Zz4=" />`;
}

const editIcon = `<img src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUyOC44OTkgNTI4Ljg5OSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTI4Ljg5OSA1MjguODk5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgY2xhc3M9IiI+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMC45MjI2NTIgMCAwIDAuOTIyNjUyIDIwLjQ1NDUgMjAuNDU0NSkiPjxnPgoJPHBhdGggZD0iTTMyOC44ODMsODkuMTI1bDEwNy41OSwxMDcuNTg5bC0yNzIuMzQsMjcyLjM0TDU2LjYwNCwzNjEuNDY1TDMyOC44ODMsODkuMTI1eiBNNTE4LjExMyw2My4xNzdsLTQ3Ljk4MS00Ny45ODEgICBjLTE4LjU0My0xOC41NDMtNDguNjUzLTE4LjU0My02Ny4yNTksMGwtNDUuOTYxLDQ1Ljk2MWwxMDcuNTksMTA3LjU5bDUzLjYxMS01My42MTEgICBDNTMyLjQ5NSwxMDAuNzUzLDUzMi40OTUsNzcuNTU5LDUxOC4xMTMsNjMuMTc3eiBNMC4zLDUxMi42OWMtMS45NTgsOC44MTIsNS45OTgsMTYuNzA4LDE0LjgxMSwxNC41NjVsMTE5Ljg5MS0yOS4wNjkgICBMMjcuNDczLDM5MC41OTdMMC4zLDUxMi42OXoiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6I0NDQ0NDQyIgZGF0YS1vbGRfY29sb3I9IiNjY2NjY2MiPjwvcGF0aD4KPC9nPjwvZz4gPC9zdmc+" />`;

const copyIcon = `<img src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDU2MSA1NjEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDU2MSA1NjE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjkxMzUxNyAwIDAgMC45MTM1MTcgMjQuMjU4NCAyNC4yNTg0KSI+PGc+Cgk8ZyBpZD0iY29udGVudC1jb3B5Ij4KCQk8cGF0aCBkPSJNMzk1LjI1LDBoLTMwNmMtMjguMDUsMC01MSwyMi45NS01MSw1MXYzNTdoNTFWNTFoMzA2VjB6IE00NzEuNzUsMTAyaC0yODAuNWMtMjguMDUsMC01MSwyMi45NS01MSw1MXYzNTcgICAgYzAsMjguMDUsMjIuOTUsNTEsNTEsNTFoMjgwLjVjMjguMDUsMCw1MS0yMi45NSw1MS01MVYxNTNDNTIyLjc1LDEyNC45NSw0OTkuOCwxMDIsNDcxLjc1LDEwMnogTTQ3MS43NSw1MTBoLTI4MC41VjE1M2gyODAuNVY1MTAgICAgeiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBzdHlsZT0iZmlsbDojQ0NDQ0NDIiBkYXRhLW9sZF9jb2xvcj0iI2NjY2NjYyI+PC9wYXRoPgoJPC9nPgo8L2c+PC9nPiA8L3N2Zz4=" />`;

const saveIcon = `<img src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDkgNDkiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5IDQ5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGNsYXNzPSIiPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuODc3NTIxIDAgMCAwLjg3NzUyMSAzLjAwMDczIDMuMDAwNzMpIj48Zz4KCTxyZWN0IHg9IjI3LjUiIHk9IjUiIHdpZHRoPSI2IiBoZWlnaHQ9IjEwIiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBjbGFzcz0iYWN0aXZlLXBhdGgiIHN0eWxlPSJmaWxsOiNDQ0NDQ0MiIGRhdGEtb2xkX2NvbG9yPSIjY2NjY2NjIj48L3JlY3Q+Cgk8cGF0aCBkPSJNMzkuOTE0LDBIMC41djQ5aDQ4VjguNTg2TDM5LjkxNCwweiBNMTAuNSwyaDI2djE2aC0yNlYyeiBNMzkuNSw0N2gtMzFWMjZoMzFWNDd6IiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBjbGFzcz0iYWN0aXZlLXBhdGgiIHN0eWxlPSJmaWxsOiNDQ0NDQ0MiIGRhdGEtb2xkX2NvbG9yPSIjY2NjY2NjIj48L3BhdGg+Cgk8cGF0aCBkPSJNMTMuNSwzMmg3YzAuNTUzLDAsMS0wLjQ0NywxLTFzLTAuNDQ3LTEtMS0xaC03Yy0wLjU1MywwLTEsMC40NDctMSwxUzEyLjk0NywzMiwxMy41LDMyeiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBzdHlsZT0iZmlsbDojQ0NDQ0NDIiBkYXRhLW9sZF9jb2xvcj0iI2NjY2NjYyI+PC9wYXRoPgoJPHBhdGggZD0iTTEzLjUsMzZoMTBjMC41NTMsMCwxLTAuNDQ3LDEtMXMtMC40NDctMS0xLTFoLTEwYy0wLjU1MywwLTEsMC40NDctMSwxUzEyLjk0NywzNiwxMy41LDM2eiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBzdHlsZT0iZmlsbDojQ0NDQ0NDIiBkYXRhLW9sZF9jb2xvcj0iI2NjY2NjYyI+PC9wYXRoPgoJPHBhdGggZD0iTTI2LjUsMzZjMC4yNywwLDAuNTItMC4xMSwwLjcxLTAuMjljMC4xOC0wLjE5LDAuMjktMC40NSwwLjI5LTAuNzFzLTAuMTEtMC41MjEtMC4yOS0wLjcxYy0wLjM3LTAuMzctMS4wNC0wLjM3LTEuNDEsMCAgIGMtMC4xOSwwLjE4OS0wLjMsMC40MzktMC4zLDAuNzFjMCwwLjI3LDAuMTA5LDAuNTIsMC4yOSwwLjcxQzI1Ljk3OSwzNS44OSwyNi4yMjksMzYsMjYuNSwzNnoiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6I0NDQ0NDQyIgZGF0YS1vbGRfY29sb3I9IiNjY2NjY2MiPjwvcGF0aD4KPC9nPjwvZz4gPC9zdmc+" />`;

const plusIcon = `<img src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNTIgNTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUyIDUyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGNsYXNzPSIiPjxnPjxwYXRoIGQ9Ik0yNiwwQzExLjY2NCwwLDAsMTEuNjYzLDAsMjZzMTEuNjY0LDI2LDI2LDI2czI2LTExLjY2MywyNi0yNlM0MC4zMzYsMCwyNiwweiBNMzguNSwyOEgyOHYxMWMwLDEuMTA0LTAuODk2LDItMiwyICBzLTItMC44OTYtMi0yVjI4SDEzLjVjLTEuMTA0LDAtMi0wLjg5Ni0yLTJzMC44OTYtMiwyLTJIMjRWMTRjMC0xLjEwNCwwLjg5Ni0yLDItMnMyLDAuODk2LDIsMnYxMGgxMC41YzEuMTA0LDAsMiwwLjg5NiwyLDIgIFMzOS42MDQsMjgsMzguNSwyOHoiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6I0NDQ0NDQyIgZGF0YS1vbGRfY29sb3I9IiNjY2NjY2MiPjwvcGF0aD48L2c+IDwvc3ZnPg==" />`;

function removeNote(noteId) {
  //getNotes
  getNotesAnd(notes => {
    if (!notes || !Array.isArray(notes)) {
      //   bkg.console.log("removenote error", notes, noteId);
      return false;
    }
    //remove this note
    notes = (notes || []).filter(n => n.noteId != noteId);
    //and set notes to storage
    chrome.storage.sync.set({ notes }, () => {
      //   bkg && bkg.console.log("updated notes after remove item:", noteId);
    });
    //remove card instead of rerender
    let el = document.querySelector('[data-note-id="' + String(noteId) + '"]');
    el.parentNode.removeChild(el);
  });
}

function onEditComplete(content, noteId, cb) {
  // bkg.console.log(content,noteId)
  focusedNoteId = null;

  getNotesAnd(notes => {
    notes = notes.reduce((nts, n) => {
      if (n.noteId == noteId) {
        n.text = content.innerHTML;
      }
      nts.push(n);
      return nts;
    }, []);
    chrome.storage.sync.set({ notes }, () => {
      cb && cb();
    });
    // content.setAttribute('contentEditable',false);
  });
}

function formatDate(date) {
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[date.getDay()]} ${date.getDate()}-${doubleDigits(
    date.getMonth() + 1
  )}-${date.getFullYear()} ${doubleDigits(date.getHours())}:${doubleDigits(
    date.getMinutes()
  )}:${doubleDigits(date.getSeconds())}`;
}

function doubleDigits(d) {
  return Number(d) < 10 ? "0" + d : d;
}

function createCaretPlacer(atStart) {
  return function(el) {
    el.focus();
    if (
      typeof window.getSelection != "undefined" &&
      typeof document.createRange != "undefined"
    ) {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(atStart);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(atStart);
      textRange.select();
    }
  };
}

function pasteAsPlainText(e) {
  // cancel paste
  e.preventDefault();

  // get text representation of clipboard
  var text = (e.originalEvent || e).clipboardData.getData("text/plain");

  // insert text manually
  document.execCommand("insertHTML", false, text);
}
