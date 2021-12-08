const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
// we have one more module among many called xlsx provided by node.js which is used for
// creation and manipulation in our xl files
const xlsx = require("xlsx");

// we will get many urls to process from our allMatch.js therefore we have created a function
// we will take the url and make the request and collect the response in callback function
function processScoreCard(url){
    request(url,cb);
}


function cb(error,response,html){
    if(error){
        console.log(error);
    }else{
        // uncomment below line to view the html response
        // console.log(html);
        // now this is the final page which is containing our main information
        //  we will work on this page in our separate function
        extractMatchDetails(html);
    }
}
// Our hierarchy would be like
// IPL Folder
// -> Team name
// -> -> Player name xl file
// -> -> -> Information like name,runs,balls,four,six,opponent,venue,date

function extractMatchDetails(html){

    // at first we will oad our html response in cheerio
    let $ = cheerio.load(html);
    // so in the whole web page we have to work with our description conatiner
    // below is the html attribute of that description container, we will simply 
    // explore it and there is one more attribute which shows the result which team won the match
    // we will scrap it as well
    let descElem = $(".match-header-container .description");
    let result = $(".match-header-container .status-text");
    // we can view the text of both the fields by uncommenting below two lines
    // console.log(descElem.text());
    // console.log(result.text());
    
    // we will split the text of description alon the comma and collec it into an array 
    let stringArr = descElem.text().split(",");
    // at index one there is the match venue, used trim function to remove trailing spaces
    let venue = stringArr[1].trim();
    // at index two there is the match venue, used trim function to remove trailing spaces
    let date = stringArr[2].trim();
    // we have to confirm which team won the match
    // we will simply view the text of our result
    result = result.text();

    //  below is the html attribute which have information about winning and lossing team
    // we will extract it first in the whole web page
    //  therfore inning object is an array of two elements
    let inning = $(".card.content-block.match-scorecard-table>.Collapsible");
    let htmlString = "";
    for(let i=0 ;i<inning.length;i++){
        htmlString += $(inning[i]);
    //      team and opponent
    // team name is mentioned as a h5 html tag we will simply  use find function of cheerio
    // to view the name of the team
         let teamName = $(inning[i]).find("h5").text();
        //  we only want team name therefore spliting rest information from innings onwards
         teamName = teamName.split("INNINGS")[0].trim();
        //  obviously opponent index will toggle, if we are viewing first team then second one is opponent
         let opponentIndex = i==0?1:0;
        //  similarily we will extract the opponent team name
         let opponentTeamName = $(inning[opponentIndex]).find("h5").text();
         opponentTeamName = opponentTeamName.split("INNINGS")[0].trim();
        //  we will now work dedicatedly on the current team therefore storing the refernce in a separate object
         let currentInning = $(inning[i]);

        //  we can uncomment the below line to view earlier information that we have collected
        //  console.log(`${venue} | ${date} | ${teamName} | ${opponentTeamName} | ${result}`);

        // now there is a table which contains several rows and columns and our information
        // is within that cells
        // at first we will extract all the rows 
        //  below is the html element conatining all rows
        let allRows = currentInning.find(".table.batsman tbody tr");
        // now for each row we will traverse each columns to collect our information
        for(let j=0; j<allRows.length; j++){
            // in html table we have two attribute one is for row and one is for col
            //  td stands for columns
            // we first extract all the columns of the row
            let allCols = $(allRows[j]).find("td");
            // but among all the columns there are some columns which are not useful
            // after studying the web page html we found the html element
            // we need only those columns which have this attribute
            let isWorthy = $(allCols[0]).hasClass("batsman-cell");
            // if our column contains that attribute we will further process
            if(isWorthy == true){
                //  very first column contains the player name
                //  we will extract the name through text function of cheerio
                let playerName = $(allCols[0]).text().trim();
                // at third column we have runs scored by the player 
                let runs = $(allCols[2]).text().trim();
                // at fourth column we have balls thrown by the player
                let balls = $(allCols[3]).text().trim();
                // at six column we have fours hit by the player
                let fours = $(allCols[5]).text().trim();
                // at seven column we have sixes hit by the player
                let sixes = $(allCols[6]).text().trim();
                // at eight column we have sixes rate of the player
                let srate = $(allCols[7]).text().trim();
                // below is the line to display all these information
                console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes} ${srate}`);
                // Finally we have to now make a xl file for each player as we have collected all the information
                // we have a separate function for that, we simply pass our data to that function
                processPlayer(teamName,playerName,runs,balls,fours,sixes,srate,opponentTeamName,venue,date,result);
            }
        }
    }
    //  uncomment below line to see the html of only one element among the two
    // console.log(htmlString);
}

function processPlayer(teamName,playerName,runs,balls,fours,sixes,srate,opponentTeamName,venue,date,result){
    // at first we have to create a folder under IPL folder with its name same as that of team name
    // we will join the path till our ipt folder and finally add the team team to crate the file path
    let teamPath = path.join(__dirname,"ipl",teamName);
    // and finaaly pass that path to our function which will create the folder
    dirCreator(teamPath);
    // now under this folder we have to create xl files for all the players
    // to create file path as the name of the player name
    //  we will join our player name in our team path and xlsx as the extension to create
    // xl file of our player
    let filePath = path.join(teamPath,playerName+".xlsx");
    // now after creating the path we have to create our xlsx file and nee to add the data in the cells
    let content = excelReader(filePath,playerName);
    // If it is the forst time that we are creating our xl file we will get an empty array
    // as the response or else we will get the earlier data in json format
    // now we will create an objetc which will conatin information of the player
    let playerObj = {
         teamName,
         playerName,
         runs,
         balls,
         fours,
         sixes,
         srate,
         opponentTeamName,
         venue,
         date,
         result
    }
    //  finally we will push our object in the content if is was empty then t will be filled
    //  or new information will be added
    content.push(playerObj);
    // after pushing we have to update our xl file as well we will use another function for that
    excelWriter(filePath,content,playerName);
}

function dirCreator(filePath){
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}

// This function will the file  path and json data and sheet name
function excelWriter(filePath,json,sheetName) {
    // we will create a new work book
    let newWB = xlsx.utils.book_new();
    // we will create a new work sheet
    let newWS = xlsx.utils.json_to_sheet(json);
    // after getting the reference of our work book and work sheet we will append the data in 
    // our work book
    xlsx.utils.book_append_sheet(newWB,newWS,sheetName);
    // after updating our work book we will write our data in the same file path
    xlsx.writeFile(newWB,filePath);
}
    
//  This function takes the file path and the name that we want to keep of the xlsx sheet
function excelReader(filePath,sheetName){
    // if file is not already existing we will simply return an emoty array
    if(fs.existsSync(filePath) == false){
        return [];
    }
    // if file is aleady existing then we have to modify the data
    // for that we first read our existing file 
    // we have a function on our xlsx module for doing that
    let wb = xlsx.readFile(filePath);
    // after taking the instance of our xl file we will extract the data fo our xl file
    //  for this we have to use below syntax
    let excelData = wb.Sheets[sheetName];
    // now excel data reference will be containing data of our xl file
    // finaaly we convert it to json format we have a xlsx method for doing that 
    let ans = xlsx.utils.sheet_to_json(excelData);
    //  and then simply return that json format
    return ans;
}

module.exports = {
    ps : processScoreCard
}