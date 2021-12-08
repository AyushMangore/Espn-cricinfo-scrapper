// Author -> Ayush Mangore
// In this project I have scrapped the espn cric info site which contains information
// about matches, I have scrapped all t-20 mathches with the team name and their players 
// and information of all the players who played and their opponent as well

// We will store the url of our web page in a constant
// We will use request module of node.js to make http request
// We use cheerio module of node.js as a scrapper tool
// And we will use our fs module to finally make some files and store the results
// Path module is used to make all the paths dynamic if the location of the folder changes
const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const allMatchesObj = require("./allMatch");

// Extract path
//  we will make a folder named as IPL in the current directory only for this we will create a 
//  path by joining our current directory location with our folder name
const iplPath = path.join(__dirname,"IPL");
// It is the function in which, when path is provided it will simply create a folder at that location
dirCreator(iplPath);

// First step is to make our request
// we will make the request and collect the response in the callback function
request(url,cb);
function cb(error,response,html){
    if(error){
        //  if some error would have been occured the we will simply print the error message
        console.log(error);
    }else{
        // If the request was successfull then we will get the whole html page as response
        //  uncomment the below line to see
        // console.log(html);
        // now our task is to move to the next page in our url where all the matches are specified
        // we will do this in different function
        extractLink(html);
    }
}

function extractLink(html){
    // we have got our main html page as a response
    // now we will provide our html response to load function of cheerio
    // Cheerio parses markup and provides an API for traversing/manipulating the resulting data structure
    let $ = cheerio.load(html);
    // now it is the html tag of the anchor element that we require as it contains the link
    // to the next page
    // for that we  will pass our html element in the cheerio reference as $
    let anchorElem = $("a[data-hover='View All Results']");
    // now we want to extract the link from the anchor element
    // we have a method called attr in cheerio we will use it and get our href
    let link = anchorElem.attr("href");
    // uncomment to view the link
    // console.log(link);
    // but the link whic hwe will get it is not the complete link we are getting forward from
    // the current pge only to generate the full link simply add the common header of the webpage
    let fullink = "https://www.espncricinfo.com/"+link;
    // uncomment below line to view the complete link
    // console.log(fullink);
    // our first part is completed here we will pass this link to our another function
    //  which will take care of second part
    allMatchesObj.gAllMatches(fullink);
}

// this is our function which will take the complete file path and will create a folder there
// if it does not exists already
function dirCreator(filePath){
    //  checking whether folder exists or not if not then simply make one
    //  we have a method of fs module called mkdir sync this will take the complete path
    //  and create the folder
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}

