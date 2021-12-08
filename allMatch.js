const request = require("request");
const cheerio = require("cheerio");
const scorecardObject = require("./scorecard")

// this function is being called from our main.js file
// after extracting the link
// so, after we got the link it's time to again make a request on the url
// again we will do the same thing
function getAllMatchesLink(url){
    request(url,function(error,response,html){
        if(error){
            console.log(error);
        }else{
            // uncomment below line to view the complete html output
            // console.log(html);
            // now we will pass our html response to another function
            extractAlllinks(html);
        }
    });
};

// So in this page there are various cards in which team information is mentioned
//  but we need the complete detail of the players for that we have to go inside the
// score card option so first we will try to extract the link in that score card element 
// and will agin make a request
function extractAlllinks(html){
    let $ = cheerio.load(html);
    // below mentioned html element is that element of the score card button which contains the link
    //  to the next page, again we will extract the href link and add our default header of the webpage
    // and will pass it to another function
    let scoreCardElem = $("a[data-hover='Scorecard']");
    for(let i=0 ;i<scoreCardElem.length;i++){
        let link = $(scoreCardElem[i]).attr("href");
        let fullink =  "https://www.espncricinfo.com/"+link;
        // these are all the actual links which is containing the information about the winnig team
        // and lossing team
        console.log(fullink);
        scorecardObject.ps(fullink);
    }
}

// we will encapsulate our allMath.js function so that it can be imported and used
module.exports = {
    gAllMatches : getAllMatchesLink
}