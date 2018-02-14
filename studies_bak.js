var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var $,
data = [],
offset = 0,
name, 
count,
study,
results

fs.readFile('./data/universities.json', (error,data) => {
  var data = JSON.parse(data);

  data.forEach( university => {
    requestUni(university.Link);
  })
})

function requestUni(url) {
    return new Promise( (resolve,reject) => {
        var url = "https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche/search/1/studtyp/3/hslauf/382.html";
        var urlDetail = "https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche/detail/all/search/1/studtyp/3/hslauf/380/pn/0.html";
        request.get(url, (error, response, body) => {
            if(!error && response.statusCode == 200) {
                $ = cheerio.load(body);
                var list = {};

                // check if there are any matches
                $('section.search-results').children('p').each( (i, elem) => {
                    var el = $(elem).text().trim();
                    results = el;
                })

                if (results === "Kein Treffer") {
                    console.log("Kein Treffer")
                }

                if (results !== "Kein Treffer") {
                    // University Name
                    $('section.search-results').children('span.search-txt').each( (i, elem) => {
                        name = $(elem).text().trim().slice(34);
                    })
                    // Count Studies
                    $('section.search-results').children('p').each( (i, elem) => {
                        var el = $(elem).text().trim();
                        var match = el.match(/von ingesamt \d{1,1000}/);
                        count = match[0].replace("von ingesamt ", "");
                    })
                }

                
                
            }
        })
    })
}


function writeJson(data) {
	fs.writeFileSync('./data/univesities.json', JSON.stringify(data), 'utf8')
}

async function queryUniversities() {
	var p1 = await requestUnis(0);
	var p2 = await requestUnis(1);
	var p3 = await requestUnis(2);
	var p4 = await requestUnis(3);
	var write = await writeJson(p4);
}





