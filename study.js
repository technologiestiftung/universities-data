const fs = require('fs');
const folder = './data/studies';
const request = require('request');
const cheerio = require('cheerio');

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

function getCookie(url) {
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
    
}

const asyncQuery = async () => {
    const files = await readDir(folder);
    const cookie = await getCookie(urls.cookie);
    // put inside loop 
    const study_list = await getData(files[0]);

    console.log(study_list[5]); // mit richtiger id austauschen (for-loop);
}



asyncQuery();