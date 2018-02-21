const fs = require('fs');
const folder = './data/studies';
const request = require('request');
const cheerio = require('cheerio');

let $;

urls = {
    cookie: "https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche.html?tx_szhrksearch_pi1%5Bsearch%5D=1&genios=&tx_szhrksearch_pi1%5Bfach%5D=&tx_szhrksearch_pi1%5Bstudtyp%5D=3&tx_szhrksearch_pi1%5Bzusemester%5D=&tx_szhrksearch_pi1%5Blehramt%5D=&tx_szhrksearch_pi1%5Bsprache%5D=&tx_szhrksearch_pi1%5Bname%5D=&tx_szhrksearch_pi1%5Bplz%5D=&tx_szhrksearch_pi1%5Bort%5D=&tx_szhrksearch_pi1%5Btraegerschaft%5D=",
    studiengaenge: "https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche/search/1/studtyp/3/hslauf/"
}

req = request.defaults({
	jar: true
});

function readDir(folder) {
    return new Promise( (res,rej) => {
        fs.readdir(folder, (err, files) => {
            let file_list = [];
            files.forEach(file => {
                if(file != '.DS_Store') {
                    file_list.push(file);
                }
            });
            console.log('file list received ...');
            res(file_list);
          })
    });
}

function getData(fileName) {
    var  fileName = `./data/studies/${fileName}`;
    return new Promise(function(resolve, reject){
        fs.readFile(fileName, (err, data) => {
            var parsed = JSON.parse(data);
            err ? reject(err) : resolve(parsed);
        });
    });
};

function getCookie(id_studien) {
    const url = `https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche/search/1/studtyp/3/hslauf/${id_studien}/pn/0.html?tx_szhrksearch_pi1%5Bresults_at_a_time%5D=100`
    return new Promise( (resolve, reject) => {
        req.get(url, (error, response, body) =>{ 
            console.log('cookie created ...');
            resolve(); 
        })
    })
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
};

function requestStudy (data) {
    return new Promise( (resolve,reject) => {
        const id_studiengang = data.id_studiengang;
        const id_studien = data.id_studien;

        const url = `https://www.hochschulkompass.de/studium/studiengangsuche/erweiterte-studiengangsuche/detail/all/search/1/studtyp/3/hslauf/${id_studien}/pn/${id_studiengang}.html`

        console.log(url);

        req.get(url, (error, response, body) => {
            if(!error && response.statusCode == 200) {
                let list = {};
                $ = cheerio.load(body);
                const header = $('header.head-area').children('h1').text();

                list.Name = header;

                $('div.content-box').children('ul.info.list-inline').each((index, element) => {
                    const ul = $(element);
                    ul.children('li').each((index, element) => {
                        const title = $(element).children('span.title').text().trim().replace('                ', ' ');
                        const status = $(element).children('span.status').text().trim().replace('                ', ' ');
                        list[title] = status;
                    })
                })
                resolve(list);
            }
        })
    })
}

const asyncQuery = async () => {
    const id_studien = 329; // zuerst korrekten cookie setzen: siehe links.txt
    const files = await readDir(folder);
    // for each file
    const list_studies = await getData(files[2]);
    console.log(Object.keys(list_studies).length);
    // const data_study = list_studies[15];
    // const cookie = await getCookie(data_study.id_studien); 
    // const study_data = await requestStudy(data_study);
}



asyncQuery();