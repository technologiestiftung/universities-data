var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

req = request.defaults({
	jar: true
});

var $,
scraped_data = [],
offset = 0,
name, 
count,
study,
results,
numberUnis = 5,
promises = []

const urls = {
    overview: 'https://www.hochschulkompass.de/hochschulen/hochschulsuche.html?tx_szhrksearch_pi1%5Bsearch%5D=1&tx_szhrksearch_pi1%5BQUICK%5D=1&tx_szhrksearch_pi1%5Bname%5D=&tx_szhrksearch_pi1%5Btraegerschaft%5D=',
    uni: 'https://www.hochschulkompass.de/hochschulen/hochschulsuche/detail/all/search/1/pn/'
}

function createCookie(url) {
    return new Promise( (resolve, reject) => {
        req.get(url, (error, response, body) =>{ 
            console.log('cookie created');
            resolve(response); 
        })
    })
};

function requestUni(id) {
    return new Promise( (resolve,reject) => {
        var link = urls.uni + id + '.html';
        req.get(link, (error, response, body) => {
            if(!error && response.statusCode == 200) {
                $ = cheerio.load(body);

                data = {
                    id_hochschule: id,
                    id_studien: 0,
                    name: '',
                    steckbrief: {},
                    anschrift: {},
                };
                
                name = $('section.course-block').children('header').children('h1').text();

                steckbrief_items = $('section.course-block').children('div.content-box').children('ul.info').children('li').each( (i,elem) => {
                    var title = $(elem).children('span.title').text().trim();
                    var status = $(elem).children('span.status').text().trim().replace(/\n/g, '').replace('                   ', '');

                    if (title === 'Hochschule') { data.name = status };

                    data.steckbrief[title] = status;
                });

                anschrift_items = $('section.course-block').children('div.content-box.v2').children('ul.accordion').each( (i, elem) => {
                    var anschrift = $(elem).children('li#acc-anschrift').children('div.slide').children('div.cols').children('div.col').each( (i, elem) => {
                        $(elem).children('ul.info').children('li').each( (i,elem) => {
                            var title = $(elem).children('span.title').text().trim();
                            var status = $(elem).children('span.status').text().trim();
                            data.anschrift[title] = status;
                        })
                    })
                }) 

                studiengaenge = $('section.course-block').children('div.content-box.v2').children('ul.accordion').each( (i, elem) => {
                    var link = $(elem).children('li#acc-studienmoeglichkeiten-studiengaenge').children('div.slide').children('div.clearfix.links-list').children('a.sublink');
                    var element = link.attr('href');
                    var re = /\d{1,3}\.html/;
                    var id = re.exec(element)[0].replace('.html', '');
                    data.id_studien = parseInt(id);
                });

                if (Object.keys(data.anschrift).length > 0) {
                    scraped_data.push(data);
                }
                // console.log(scraped_data)
                resolve(data);
                // More Data scrapable in the same pattern as above
            }
        })
    })
}


function writeJson(data) {
    return new Promise( (resolve, object) => {
        fs.writeFileSync('./data/universities.json', JSON.stringify(data), 'utf8');
    })
}


function queryUniversities() {

    createCookie(urls.overview)
        .then((resolve) => {

            for (let index = 0; index <= numberUnis; index++) {
                promises.push(requestUni(index));
            };

        }).then( (resolve) => {
            Promise.all(promises).then( resolve  => {
                writeJson(scraped_data);
            }) 
        })
}

queryUniversities();





