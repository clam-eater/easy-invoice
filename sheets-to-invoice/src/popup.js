document.addEventListener('DOMContentLoaded', function() {
  var getRows = document.getElementById('enter');
  getRows.addEventListener('click', saveRowsToStorage);

  var grabCell = document.getElementById('grabCell');
  grabCell.addEventListener('click', initiateGrabCell);

  var resetInput = document.getElementById('resetInput');
  resetInput.addEventListener('click', resetInputs);

  var viewSettings = document.getElementById('viewSettings');
  viewSettings.addEventListener('click', setSettings);

  var viewCatalogue = document.getElementById('viewCatalogue');
  viewCatalogue.addEventListener('click', displayCatalogue);

  var catalogueInput = document.getElementById('submit');
  catalogueInput.addEventListener('click', addInput);
}, false);

function addInput() {
    value = document.getElementById('catalogueInput').value;
    cost = document.getElementById('cataloguePrice').value;
    des = document.getElementById('detailedDes').value;
    chrome.storage.local.get({catalogueVals: [[]]}, function(result) {
        var catalogueVals = result.catalogueVals;
        catalogueVals.push([value, des, cost]);
        chrome.storage.local.set({catalogueVals: catalogueVals}, function () {
        });
    });
}

var isVisible = [];
// view and adjust catalogue
function displayCatalogue() {
    var buttons = document.createElement("DIV");
    buttons.id = "buttons";
    document.body.appendChild(buttons);
    var hideCatalogue = document.createElement("BUTTON");
    hideCatalogue.innerHTML = "Hide Catalogue";
    document.body.appendChild(hideCatalogue);
    hideCatalogue.onclick = function () {
        hideCatalogue.parentNode.removeChild(hideCatalogue);
        buttons.parentNode.removeChild(buttons);
        for (var i = 0; i < isVisible.length; i++) {
            isVisible[i] = "no";
        }
    }
    // catalogueVals is arranged as: [name, description, price]
    chrome.storage.local.get({catalogueVals: [[]]}, function(result) {
            var catalogueVals = result.catalogueVals;
            for(var i = 0; i < catalogueVals.length; i++) {
                if (isVisible[i] != "yes" && catalogueVals[i] != undefined) {
                    isVisible[i] = "yes";
                    createCatButton(catalogueVals[i], catalogueVals[i][2], i);
                }
            }
    });
}

function createCatButton(input, price, num) {
    var node = document.createElement("Button");
    node.innerHTML = input[0] + "<br>" + price;
    node.className = "circleButton";
    node.title = input[1];
    node.id = num;
    node.onmouseover = function() {
        node.innerHTML = "X";
    }
    node.onmouseleave = function() {
        node.innerHTML = input[0] + "<br>" + price;
    }
    node.onclick = function () {
        node.parentNode.removeChild(node);
        // remove entry from chrome storage
        chrome.storage.local.get({catalogueVals: []}, function (result) {
            var catalogueVals = result.catalogueVals;
            catalogueVals[num] = undefined;
            chrome.storage.local.set({catalogueVals: catalogueVals}, function () {
            });
         });
    };
    document.getElementById('buttons').appendChild(node);
}

// create an input box
function createInput(id, type, value) {
    var input = document.createElement("INPUT");
    input.id = id;
    input.setAttribute("type", type);
    input.setAttribute("placeholder", value);
    settings.appendChild(input);
}

// view and adjust paypal preferences
function setSettings() {
    var settings = document.createElement("div");
    settings.id = "settings";
    document.body.appendChild(settings);

    // drop down for frequency
    //Create array of options to be added
    var frequencyOptions = ["Once only","Every week","Every month","Every year", "Every quarter"];

    //Create and append select list
    var frequencySelectList = document.createElement("select");
    frequencySelectList.id = "frequencySelect";
    settings.appendChild(frequencySelectList);

    //Create and append the options
    for (var i = 0; i < frequencyOptions.length; i++) {
        var option = document.createElement("option");
        option.id = "frequencySelectOption";
        option.value = frequencyOptions[i];
        option.text = frequencyOptions[i];
        frequencySelectList.appendChild(option);
    }

    // drop down for due date options
    //Create array of options to be added
    var dueDateOptions = ["No due date","Due on receipt","Due on date specified","Due in 10 days", "Due in 15 days", "Due in 30 days", "Due in 45 days", "Due in 60 days", "Due in 90 days"];

    //Create and append select list
    var dueDateSelect = document.createElement("select");
    dueDateSelect.id = "dueDateSelect";
    settings.appendChild(dueDateSelect);

    //Create and append the options
    for (var i = 0; i < dueDateOptions.length; i++) {
        var option = document.createElement("option");
        option.id = "dueDateOptions";
        option.value = dueDateOptions[i];
        option.text = dueDateOptions[i];
        dueDateSelect.appendChild(option);
    }
    dueDateSelect.onchange = function () {
        if (dueDateSelect.value.match("Due on date specified")) {
            // pop up calendar for due date
            // TODO: change to a popup calendar
            var due_date = document.createElement("INPUT");
            due_date.id = "due_date";
            due_date.setAttribute("type", "text");
            due_date.setAttribute("placeholder", "MM/DD/YYYY");
            dueDateSelect.parentNode.insertBefore(due_date, dueDateSelect.nextSibling);
        }
    }

    // drop down for type
    //Create array of options to be added
    var invoiceTypes = ["Goods: Shippable","Goods: Pickup/Drop-off","Goods: Digital goods","Service"];

    //Create and append select list
    var invoiceSelectList = document.createElement("select");
    invoiceSelectList.id = "invoiceSelect";
    settings.appendChild(invoiceSelectList);

    //Create and append the options
    for (var i = 0; i < invoiceTypes.length; i++) {
        var option = document.createElement("option");
        option.id = "invoiceSelectOption";
        option.value = invoiceTypes[i];
        option.text = invoiceTypes[i];
        invoiceSelectList.appendChild(option);
    }

    // input for PO#
    createInput("PO_num", "text", "PO#");

    // input for domestic shipping
    createInput("domestic_shipping", "number", "domestic shipping");
    domestic_shipping.setAttribute("min", "0.00");
    domestic_shipping.setAttribute("step", "0.01");
    domestic_shipping.setAttribute("max", "9,999.99");

    // input for international shipping
    createInput("international_shipping", "number", "international shipping");
    international_shipping.setAttribute("step", "0.01");
    international_shipping.setAttribute("min", "0.00");
    international_shipping.setAttribute("max", "9,999.99");

    // row that catalogue items begin on
    createInput("catalogue_index", "number", "Row which catalogue items begin on?");
    catalogue_index.setAttribute("min", "1");
    catalogue_index.setAttribute("step", "1");
    catalogue_index.setAttribute("max", "9,999");

    // input for note
    settings.appendChild(document.createElement("br"));
    settings.appendChild(document.createElement("br"));
    var noteLabel = document.createElement('label');
    noteLabel.htmlFor = "noteLabel";
    noteLabel.id = "noteLabel";
    noteLabel.appendChild(document.createTextNode('Notes'));
    settings.appendChild(noteLabel);
    settings.appendChild(document.createElement("br"));
    var note = document.createElement("TEXTAREA");
    note.id = "note";
    settings.appendChild(note);


    // input for terms and conditions
    settings.appendChild(document.createElement("br"));
    settings.appendChild(document.createElement("br"));
    var termsLabel = document.createElement('label');
    termsLabel.htmlFor = "termsLabel";
    termsLabel.id = "termsLabel";
    termsLabel.appendChild(document.createTextNode('Terms and conditions'));
    settings.appendChild(termsLabel);
    var terms = document.createElement("TEXTAREA");
    terms.id = "terms";
    settings.appendChild(terms);

    // input for shipping exclusion
    settings.appendChild(document.createElement("br"));
    settings.appendChild(document.createElement("br"));
    var excludeLabel = document.createElement('label');
    excludeLabel.htmlFor = "excludeLabel";
    excludeLabel.id = "noteLabel";
    excludeLabel.appendChild(document.createTextNode('Exclude shipping on'));
    settings.appendChild(excludeLabel);
    settings.appendChild(document.createElement("br"));
    var exclude = document.createElement("TEXTAREA");
    exclude.id = "exclude";
    settings.appendChild(exclude);

    // check marks for partial payment / tip
    settings.appendChild(document.createElement("br"));
    createInput("tip", "checkbox", "allow tip");
    var tipLabel = document.createElement('label')
    tipLabel.htmlFor = "tip";
    tipLabel.id = "tipLabel";
    tipLabel.appendChild(document.createTextNode('allow tip'));
    settings.appendChild(tipLabel);

    settings.appendChild(document.createElement("br"));
    createInput("partialPay", "checkbox", "allow partial payment");
    var partialPayLabel = document.createElement('label')
    partialPayLabel.htmlFor = "partialPay";
    partialPayLabel.id = "partialPayLabel";
    partialPayLabel.appendChild(document.createTextNode('allow partial payment'));
    settings.appendChild(partialPayLabel);


    // save value to storage
    settings.appendChild(document.createElement("br"));
    var saveButton = document.createElement("BUTTON");
    saveButton.innerHTML = "save";
    saveButton.id = "save";
    saveButton.className = "saveButton";
    settings.appendChild(saveButton);
    saveButton.addEventListener('click', saveInfo);
}

function saveInfo() {
    var saved = document.createElement("P");
    saved.className = "displayFade";
    var node = document.createTextNode("saved!");
    saved.appendChild(node);
    document.body.appendChild(saved);

    var frequency = document.getElementById("frequencySelect");
    chrome.storage.local.set({frequencySelect: frequency.value}, function() {
    });

    var invoice = document.getElementById("invoiceSelect");
    chrome.storage.local.set({invoiceSelect: invoice.value}, function() {
    });

    var PO = document.getElementById("PO_num");
    chrome.storage.local.set({PO_num: PO.value}, function() {
    });

    var duedate = document.getElementById("dueDateSelect");
    chrome.storage.local.set({dueDateSelect: duedate.value}, function() {
    });
    if (duedate.value.match("Due on date specified")) {
        var due = document.getElementById("due_date");
        chrome.storage.local.set({due_date: due.value}, function() {
        });
    }

    var domestic_shipping = document.getElementById("domestic_shipping");
    chrome.storage.local.set({domestic_shipping: domestic_shipping.value}, function() {
    });

    var international_shipping = document.getElementById("international_shipping");
    chrome.storage.local.set({international_shipping: international_shipping.value}, function() {
    });

    var catalogue_index = document.getElementById("catalogue_index");
    chrome.storage.local.set({catalogue_index: catalogue_index.value}, function() {
    });

    var note = document.getElementById("note");
    chrome.storage.local.set({note: note.value}, function() {
    });

    var exclude = document.getElementById("exclude");
    var array = [];
    var temp = "";
    for (var i = 0; i < exclude.value.length; i++) {
        if (exclude.value.charAt(i).match('\n')) {
            array.push(temp);
            temp = "";
            i++;
        }
        temp += exclude.value.charAt(i);
    }
    chrome.storage.local.set({exclude: array}, function() {
    });

    var terms = document.getElementById("terms");
    chrome.storage.local.set({terms: terms.value}, function() {
    });

    var tip = document.getElementById("tip");
    chrome.storage.local.set({tip: tip.checked}, function() {
    });

    var partialPay = document.getElementById("partialPay");
    chrome.storage.local.set({partialPay: partialPay.checked}, function() {
    });

    settings.parentNode.removeChild(settings);
}


// resets all clicked on buttons
function resetInputs() {
    chrome.storage.local.remove(['userKeyIds'],function(){
    });
    initiateGrabCell();
}

// saves the user inputted number of rows to storage
function saveRowsToStorage() {
    rowVal = document.getElementById('rows').value;
    chrome.storage.local.set({key: rowVal}, function() {
    });
    chrome.storage.local.get(['key'], function(result) {
        console.log(result.key);
    });
}

// set grabCell button active
function initiateGrabCell() {
    // connect to the background script to grab the userInfo
    chrome.runtime.sendMessage({method:"getUserInfo"},function(response) {
        console.log(response);
        responseFormat(response);
    });
}

// formats response
function responseFormat(userArray) {
    var date = userArray[0];

    chrome.storage.local.get(['key'], function(result) {
        // keeps track of which entry within a user's info we're in
        var count = 0;
        // keeps track of the array values of a user's info we're in
        var entry = [];
        // keeps track of which entry this user is
        var formEntry = 0;
        for(var i = 0; i < userArray.length; i++) {
            if(userArray[i] != "") {
                entry.push(userArray[i]);
                count++;
            }
            // if the next entry starts with a time stamp and we have the minimum amount of entries required,
            // log the entire entry as a button
             if (count >= result.key) {
                 count = 0;
                 formEntry++;
                 createButton(entry, formEntry);
                 entry = [];
             }
        }
    });
}

//creates a Button
function createButton(e, num) {
    chrome.storage.local.get({userKeyIds: []}, function (result) {
        var userKeyIds = result.userKeyIds;
        if (userKeyIds[num] == undefined) {
            var node = document.createElement("BUTTON");
            for (var i = 0; i < e.length; i++) {
                node.innerHTML += e[i] + "<br>";
            }
            node.className = "roundButton";
            node.onclick = function () {
                //on click: open paypal with user info and remove this user from the button list
                chrome.runtime.sendMessage({method:"openPP", inner: e},function(response) {
                });
                userKeyIds[num] = e;
                chrome.storage.local.set({userKeyIds: userKeyIds}, function () {
                });
            };
            node.setAttribute("id", num);
            document.body.appendChild(node);
        }
    });
}

