const fs = require('fs');

let merged = [];

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
};

function readFile(id) {
    return new Promise( (resolve, reject) => {
        const path = `./data/unis/${id}.json`;
        fs.readFile(path, (err,data) => {
            const parsed = JSON.parse(data);
            resolve(parsed);
        })
    })
};

function fillArray(start, end) {
    return new Promise( (resolve, reject) => {
        let arr = [];
        for (let index = start; index <= end; index++) {
            arr.push(index);
        };
        resolve(arr);
    });
};

function writeJson(data, id) {
    return new Promise( (resolve, object) => {
        fs.writeFileSync(`./data/${id}.json`, JSON.stringify(data), 'utf8');
        resolve();
    })
};

const mergeFiles = async () => {
    const arr = await fillArray(1,380);

    const iterate = await asyncForEach( arr, async(item) => {
        const read = await readFile(item);
        merged.push(read);
    });

    const write = await writeJson(merged, 'unis_merged');
}

mergeFiles();