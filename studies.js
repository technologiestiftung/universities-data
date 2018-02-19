var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

req = request.defaults({
	jar: true
});

urls = {
    cookie: "https://www.hochschulkompass.de/hochschulen/hochschulsuche.html?tx_szhrksearch_pi1%5Bsearch%5D=1&tx_szhrksearch_pi1%5BQUICK%5D=1&tx_szhrksearch_pi1%5Bname%5D=&tx_szhrksearch_pi1%5Btraegerschaft%5D=",
    studiengaenge: "https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche/search/1/studtyp/3/hslauf/"
}

function getCookie(url) {
    return new Promise( (resolve, reject) => {
        req.get(url, (error, response, body) =>{ 
            console.log('cookie created');
            resolve(); 
        })
    })
};

function getData() {
    var  fileName = './data/universities.json'
    return new Promise(function(resolve, reject){
        fs.readFile(fileName, (err, data) => {
            var parsed = JSON.parse(data);
            err ? reject(err) : resolve(parsed);
        });
    });
}

function filterCountStudies(tag) {
    var re = /ingesamt \d{1,3}/;
    var match = re.exec(tag)[0];
    var num_result = match.replace('ingesamt ', '');
    return num_result;
}

function filterId(url) {
    var re = /\d{1,3}\.html/;
    var id = re.exec(url)[0].replace('.html', '');
    return(id);
}

function requestNumberStudies(id) {
    var url = `${urls.studiengaenge}${id}/pn/0.html`
    req.get(url, (error, response, body) => {
        $ = cheerio.load(body);

        var num_studiengaenge = $('section.search-results').children('p').text();
        filterCountStudies(num_studiengaenge);
    })
}

function requestStudies(id,page) {
 
    return new Promise( (resolve,reject) => {
        
        const ext = "?tx_szhrksearch_pi1%5Bresults_at_a_time%5D=100";
        const url = `${urls.studiengaenge}${id}/pn/${page}.html${ext}`;
        
        req.get(url, (error, response, body) => {
            if(!error && response.statusCode == 200) { 
                let data_unis = [];
                $ = cheerio.load(body);
                
                var study = $('section.search-results').children('div.clearfix').children('section.result-box').each( (i,element) => {
                    var list = {};
                    var name = $(element).children('h2').text();
                    var detail_link = $(element).children('a').attr('href');
                    var id_studiengang = filterId(detail_link);
                    
                    list.name = name;
                    list.id_studiengang = id_studiengang;
                    
                    var li = $(element).children('ul').children('li').each( (i, element) => {
                        var title = $(element).children('span.title').text();
                        var status = $(element).children('span.status').text();
                        title !== 'SiT-Passung' ? list[title] = status : null;
                    })
                    data_unis.push(list);
                });
                resolve(data_unis);
            }
        })
    })
}

function writeJson(data, id) {
    return new Promise( (resolve, object) => {
        fs.writeFileSync(`./data/${id}.json`, JSON.stringify(data), 'utf8');
        resolve();
    });
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
};

function mergeData(json1, json2) {
    return new Promise( (resolve, reject) => {
        let arr = [];
        arr.push(json1);
        arr.push(json2);
        resolve(arr);
    })
}

const start = async (data) => {
    await asyncForEach(data, async (item) => {
        let merged = [];
        const studyPage1 = await requestStudies(item.id_hochschule,0);
        const studyPage2 = await requestStudies(item.id_hochschule,1);
        const merge = await mergeData(studyPage1, studyPage2);
        const log = await writeJson(merge, item.id_hochschule);
    });
}

const asyncQuery = async () => {
    const cookie = await getCookie(urls.cookie);
    const data = await getData();
    start(data);
};

asyncQuery();
