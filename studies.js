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

function requestStudies(data) {
 
    return new Promise( (resolve,reject) => {
        var data_unis = []
        var id = 9;
        var index  = 0;
            
        var ext = "?tx_szhrksearch_pi1%5Bresults_at_a_time%5D=100";
        var url = `${urls.studiengaenge}${id}/pn/${index}.html${ext}`;

        req.get(url, (error, response, body) => {
            $ = cheerio.load(body);
            
            var list = {};
            
            var num_studiengaenge = $('section.search-results').children('p').text()
            var num_result = filterCountStudies(num_studiengaenge);
            list.num_studiengaenge = num_result;

            var study = $('section.search-results').children('div.clearfix').children('section.result-box').each( (i,element) => {
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

            resolve(data_unis)
        })
    })
}

function queryWrapper() {
    var data;
    getData()
        .then(resolve => {
            data = resolve;
            getCookie(urls.uni);
        }).then( resolve => {
            requestStudies(200); // echte Id mitgeben
        }).then( resolve => {
            console.log(resolve);
        })
        
        // .then( resolve => {
        //     requestStudies(data);
        // })
};

queryWrapper();
