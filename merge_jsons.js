const fs = require('fs');

function readFile(id) {
    return new Promise( (resolve, reject) => {
        const path = `${id}.json`;
        fs.readFile(path, (err,data) => {
            const parsed = JSON.parse(data);
            resolve(parsed);
        })
    })
}

const mergeFiles