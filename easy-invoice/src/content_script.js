console.log("hello from normal content script");

//window.onload=function() {
    set();
//}

function set() {
    //grab all the html from the spreadsheet
    var htmlString = $("table.waffle").html();
    if(htmlString != null) {
        grabCell(htmlString);
    }
}


function grabCell(htmlString) {
    //grab all the html from the spreadsheet
    //var htmlString = $("table.waffle").html();
    var entry = "";
    var count = 0;
    var sections = [];
    var emailList = [];

    chrome.storage.local.get(['key'], function(result) {
        var totalSections = result.key;
        // get the emails from the spreadsheet
        for (var i = 0; i < htmlString.length; i++) {
            // Case 1: information is contained between <td class="s# softmerge"><div class="softmerge-inner" ...></td></div>
            if (htmlString.charAt(i) == 't' &&
                htmlString.charAt(i+1) == 'd' &&
                htmlString.charAt(i+2) == ' ' &&
                htmlString.charAt(i+3) == 'c' &&
                count <= totalSections &&
                htmlString.charAt(i+13) == 's' &&
                htmlString.charAt(i+14) == 'o' &&
                htmlString.charAt(i+15) == 'f') {
                i+=97;
                // end an entry when we see an ending "<" bracket that doesn't belong to "<br>"
                while(htmlString.charAt(i) != '<' ||
                     (htmlString.charAt(i) == '<' &&
                      htmlString.charAt(i+1) == 'b')) {
                    entry += htmlString.charAt(i);
                    i++;
                }

                sections.push(entry);
                count++;
                entry = "";
            }
            // Case 2: sections are contained between <td class=" "> ... </td>
            if (htmlString.charAt(i) == 't' &&
                htmlString.charAt(i+1) == 'd' &&
                htmlString.charAt(i+2) == ' ' &&
                htmlString.charAt(i+3) == 'c' &&
                count <= totalSections) {

                // move var i past the end of the "<td class=" ">" string
                i += 14;

                // special case: dir="ltr">
                if (htmlString.charAt(i) == 'd' &&
                    htmlString.charAt(i+1) == 'i' &&
                    htmlString.charAt(i+2) == 'r') {
                    i += 10;
                }

                // end an entry when we see an ending "<" bracket that doesn't belong to "<br>"
                while(htmlString.charAt(i) != '<' ||
                      (htmlString.charAt(i) == '<' &&
                       htmlString.charAt(i+1) == 'b')) {
                    entry += htmlString.charAt(i);
                    i++;
                }

                sections.push(entry);
                count++;
                entry = "";
            }

            if (count == totalSections) {
                console.log(sections);
                chrome.storage.local.set({sections: sections}, function () { });
            }

            //after we got the sections, we can start getting the actual data

            // Case 1: information is contained within <td class=" " dir="ltr">
            if (count > totalSections &&
                htmlString.charAt(i) == 'd' &&
                htmlString.charAt(i+1) == 'i' &&
                htmlString.charAt(i+2) == 'r') {
                // move var i past the end of the "dir="ltr">" string
                i += 10;
                // end an entry when we see an ending "<" bracket that doesn't belong to "<br>"
                while(htmlString.charAt(i) != '<' ||
                      (htmlString.charAt(i) == '<' &&
                       htmlString.charAt(i+1) == 'b')) {
                    entry += htmlString.charAt(i);
                    i++;
                }
                emailList.push(entry);
                entry = "";
            }
            // Case 2: information is contained within <div class="softmerge-inner" style="width: 147px; left: -1px;">
             if (count > totalSections &&
                 htmlString.charAt(i) == '1' &&
                 htmlString.charAt(i+1) == 'p' &&
                 htmlString.charAt(i+2) == 'x') {
                 // move var i past the end of the html bracket
                 i += 6;
                 // end an entry when we see an ending "</" bracket
                 while (htmlString.charAt(i) != '<' ||
                        (htmlString.charAt(i) == '<' &&
                         htmlString.charAt(i+1) == 'b')) {
                    entry += htmlString.charAt(i);
                    i++;
                 }
                 emailList.push(entry);
                 entry = "";
             }
        }
        console.log(emailList);
        chrome.runtime.sendMessage(
            {method: "cheese struddle", content: emailList},
            function (response) {
            }
        );
    });
}