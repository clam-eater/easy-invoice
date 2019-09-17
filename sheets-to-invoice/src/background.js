// receive user info from content script and send to popup
var userInfo = [];
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.method == "cheese struddle") {
            userInfo = message.content;
        }
    }
);
// TODO: check that id = jmknlfaekakakkealbfbhgblckanoabh ^

// send back userInfo when requested by popup
chrome.runtime.onMessage.addListener(
    function(message,sender,sendResponse){
        if (message.method == "getUserInfo") {
            sendResponse(userInfo);
        }
    }
);

var address =[];
// open Paypal tab in new window and save user input
chrome.runtime.onMessage.addListener(
    function(message,sender,sendResponse){
        if (message.method == "openPP") {
            address = message.inner;
            var newURL = "https://www.paypal.com/invoice/create";
            chrome.tabs.create({ url: newURL });
        }
    }
);


// send the address back on request from content script pp
chrome.runtime.onMessage.addListener(
    function(message,sender,sendResponse){
        if (message.method == "getAddress") {
            sendResponse(address);
        }
    }
);
// TODO: check that id = jmknlfaekakakkealbfbhgblckanoabh ^
