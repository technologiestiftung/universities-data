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
                    id_studien: '',
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


function writeJson(data, id) {
    return new Promise( (resolve, object) => {
        fs.writeFileSync(`./data/unis/${id}.json`, JSON.stringify(data), 'utf8');
        resolve();
    })
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

function fillArray(start, end) {
    return new Promise( (resolve, reject) => {
        let arr = [];
        for (let index = start; index <= end; index++) {
            arr.push(index);
        };
        resolve(arr);
    });
}

const asyncQuery = async () => {
    const arr = await fillArray(1,15); // set range of uni id's which should be scraped
    const cookie = await createCookie(urls.overview);
    const iterate = await asyncForEach(arr, async(item) => {
        const req_uni = await requestUni(item);
        const file = await writeJson(req_uni, item);
    })
}

asyncQuery();





