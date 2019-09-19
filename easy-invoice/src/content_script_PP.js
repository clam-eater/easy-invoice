console.log("hello from content_script_PP");

var address = [];
var emailIndex = 0;
var countryIndex = 0;
var nameIndex = 0;
var catalogue_start = 0;
var catalogue_length = 0;
var international = false;
var catalogue_sections = [];
getInfo();

function getInfo() {
    // get relevant section information (email, catalogue items)
    chrome.storage.local.get({sections: []}, function(result) {
        catalogue_sections = result.sections;
        for (var i = 0; i < catalogue_sections.length; i++) {
            if(catalogue_sections[i].match(/email address/i)) {
                emailIndex = i;
            }
            if(catalogue_sections[i].match(/country/i)) {
                countryIndex = i;
            }
            if(catalogue_sections[i].match(/name/i)) {
                nameIndex = i;
            }
        }
    });

    // connect to the background script to grab the userInfo
    chrome.runtime.sendMessage({method:"getAddress"},function(response) {
        address = response;

        chrome.storage.local.get(['exclude'], function(result) {
            if (!result.exclude.includes(address[nameIndex])) {
                if (!address[countryIndex].match("USA") && !address[countryIndex].match(/united states/i)) {
                    chrome.storage.local.get(['international_shipping'], function(result) {
                        $("#shippingAmount").val(result.international_shipping);
                    });
                } else {
                    chrome.storage.local.get(['domestic_shipping'], function(result) {
                        $("#shippingAmount").val(result.domestic_shipping);
                    });
                }
            }
        });

        chrome.storage.local.get(['catalogue_index'], function(result) {
            catalogue_start = result.catalogue_index;
            var num = 0;
            var i = 0;
            while ((i + Number(catalogue_start)) != address.length+1) {
                if (address[i + Number(catalogue_start)].match(/yes/i)) {
                    addItem(num, 1, i + Number(catalogue_start));
                    num++;
                    i++;
                } else if (!isNaN(address[i + Number(catalogue_start)]) && address[i + Number(catalogue_start)] != 0) {
                    addItem(num, address[i + Number(catalogue_start)], i + Number(catalogue_start));
                    num++;
                    i++;
                } else {
                    i++;
                    // else this entry was not a catalogue-able entry
                }
            }
        });
    });
}

function addItem(num, quantity, section) {
    // check whether the item has a description and add it if it exists
    chrome.storage.local.get(['catalogueVals'], function(result) {
        if (num != 0) {
            $("#invoiceItems tfoot").before('<tbody><tr class="errorRow"><td colspan="5"></td></tr><tr class="itemRow"><td class="highlightTD" id="tdItemName_0"><label for="itemName_0" class="accessAid">Enter item name/ID</label><input type="text" name="itemName ui-autocomplete-input" class="itemName" id="itemName_'+num+'" maxlength="200" value="" autocomplete="off" placeholder="Item name"></td><td class="showItemDateDisplay hide" id="tdItemDate_0"><label for="itemDate_0" class="accessAid">Date</label><input type="text" name="itemDate" id="itemDate_'+num+'" class="itemDatePicker hasDatepicker itemDate" size="12" autocomplete="off" value=""></td><td class="showItemQtyDisplay" id="tdItemQty_0"><label for="itemQty_0" class="accessAid">Quantity</label><input type="text" name="itemQty" class="itemQty text-right" id="itemQty_'+num+'" maxlength="13" size="6" value="1"></td><td class="showItemPriceDisplay" id="tdItemPrice_0"><label for="itemPrice_0" class="accessAid">Price</label><input type="text" name="itemPrice" class="itemPrice text-right" id="itemPrice_'+num+'" maxlength="16" size="8" placeholder="0.00"></td><td id="tdItemDiscount_0" class="showItemDiscDisplay hide"><label for="itemDiscount_0" class="accessAid">Discount</label><input type="text" name="itemDiscount" class="itemDiscount text-right" id="itemDiscount_'+num+'" maxlength="16" size="6"></td><td class="showItemDiscDisplay hide" id="tdItemDiscountType_0"><label for="itemDiscType_0" class="accessAid">Discount Type</label><div class="dropdown" style="background-position: 35px -3787px;"><div class="iconBlock"></div><span style="width: 50px;">%</span><select name="itemDiscType" class="itemDiscType" id="itemDiscType_'+num+'" style="width: 50px;"><option value="percentage">%</option><option value="dollar">$</option></select></div></td><td class="showItemTaxDisplay" id="tdItemTax_0"><div class="dropdownBlock tax"><span class="iconDown"></span><div class="dropDownButton">No tax</div><div id="selectTax_'+num+'" class="dropDownBody selectTax hidden"><ul id="notaxSection"><li class="dropDownSelect"><label id="notax_'+num+'"><span></span>No tax</label></li></ul><ul id="selectTaxSection" class="hide submenu"></ul><ul><li class="dropDownSelect"><label id="addnewtax_'+num+'"><span></span>Add a new tax</label></li></ul></div></div> <input type="hidden" id="itemTax_'+num+'" name="itemTax" value=""><input type="text" id="selectTax_'+num+'" class="selectTaxTab" style="position:absolute;z-index:-100;" autocomplete="off"></td><td id="tdItemAmount_0" class="showItemAmountDisplay"><label for="itemAmount_0" class="accessAid">Amount</label><input type="text" name="itemAmount" class="itemAmount text-right" id="itemAmount_'+num+'" readonly="" disabled=""></td><td><div class="deleteItem" style="width:23px;">&nbsp;</div></td></tr><tr class="descRow showItemDescDisplay" id="trItemDescription_0"><td colspan="4" class="DetailedDescTD highlightTD"><label for="itemDescription_0" class="accessAid">Item Description</label><textarea name="itemDescription" class="form-control itemDescription" id="itemDescription_'+num+'" rows="2" maxlength="1000" placeholder="Enter detailed description (optional)"></textarea></td><td><span class="showItemDiscDisplay lineItemDiscountAmount hide"></span><input type="hidden" id="itemCalculatedDiscountAmount_'+num+'" name="itemCalculatedDiscountAmount" value=""></td><td></td></tr><tr class="actionRow" id="trItemActions_0" style="display: none;"><td colspan="5"><div class="itemAction"><ul><li class="hide" id="itemSavedMessage_'+num+'" style="">Item saved to catalog</li><li class="errorItemSave hide" id="itemErrorMessage_'+num+'">Error saving item to catalog</li><li class="disabledSaveItem" id="SaveItem_'+num+'">Save item</li><li class="addRow">Add row</li><li class="deleteItem">Delete row</li></ul></div></td></tr></tbody>');
        }

        // set the item name
        //$("#itemName_" + num).val(catalogue_sections[section]);

        // set quantity
        $("#itemQty_" + num).val(quantity);

        var array = result.catalogueVals;
        for (var i = 0; i <= array.length; i++) {
            if (typeof array[i] !== 'undefined' && array[i] !== null) {
                if(array[i][0] === catalogue_sections[section]) {
                    $("#itemPrice_" + num).val(array[i][2]);
                    if (array[i][1] != undefined) {
                        $("#itemDescription_" + num).val(array[i][0] + " - " + array[i][1]);
                    }
                }
            }
        }
    });
}

// choices: Goods:Pickup/Drop-off, Goods:Shippable, Goods:Digital goods, Service
// change invoice type
chrome.storage.local.get(['invoiceSelect'], function(result) {
    $("div.field-table-cell-full > div > div > div").text(result.invoiceSelect);
});

// choices: Once only, Every week, Every month, Every year, Every quarter, *Custom*
chrome.storage.local.get(['frequencySelect'], function(result) {
    $("div.enhancedDropdown.recurringDropdownBlock > div > div").text(result.frequencySelect);
});


    // choices: No due date, Due on receipt, Due on date specified, Due in 10 days, Due in 15 days, Due in 30 days, Due in 45 days
    // Due in 60 days, Due in 90 days
//    chrome.storage.local.get(['dueDateSelect'], function(result) {
//        $("div.dueDate.dropdown > span").attr("value", result.dueDateSelect);
//        if(result.dueDateSelect.match("Due on date specified")) {
//            // MUST unhide date chooser
//            $("#dueDateDiv").attr('class', 'form-group');
//            chrome.storage.local.get(['due_date'], function(result) {
//                // MUST specify date
//                $("#dueDate").val(result.due_date);
//            });
//        }
//    });

window.onload=function() {
    $("#billtotokenfield-tokenfield").focus();
    $('#billtotokenfield').val(address[emailIndex]);
    $('#billtotokenfield-tokenfield').val(address[emailIndex]);
    $("#itemName_0").focus();
}

// add a nice comment
chrome.storage.local.get(['note'], function(result) {
    $("#notes").val(result.note);
});

//terms and conditions
chrome.storage.local.get(['terms'], function(result) {
    $("#terms").val(result.terms);
});

// check partial payments
chrome.storage.local.get(['partialPay'], function(result) {
    $( "#allowPartialPayments" ).prop( "checked", result.partialPay );
});

// check tips
chrome.storage.local.get(['tip'], function(result) {
    $( "#allowTips" ).prop( "checked", result.tip );
});

////adjust shipping
//chrome.storage.local.get(['international_shipping'], function(result) {
//    $("#shippingAmount").val(result.international_shipping);
//});
