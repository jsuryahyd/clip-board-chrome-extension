chrome.runtime.onInstalled.addListener(function() {
  onInstalled();
  onPageChanged();
});

// chrome.runtime.onConnect.addListener(port => {
//     port.onDisconnect.addListener((e)=>{
        
//     })
// });

function onInstalled() {
  chrome.storage.sync.set({ color: "#3aa757", notes: [] }, function() {
    console.log("what the hell?");
  });
}

function onPageChanged() {
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//     chrome.declarativeContent.onPageChanged.addRules([
//       {
//         conditions: [
//           new chrome.declarativeContent.PageStateMatcher({
//             pageUrl: { hostEquals: "*/*" 
//             urlMatches:"(slfdk|xmcmx).*"
//              }
//             // pageUrl:"*"
//           })
//         ],
//         actions: [new chrome.declarativeContent.ShowPageAction()]
//       }
//     ]);
//   });
}
