const fs = require('fs');

function readFile(type ,id) {
    return new Promise( (resolve, reject) => {
        const path = `./data/${type}${id}.json`;
        fs.readFile(path, (err,data) => {
            const parsed = JSON.parse(data);
            resolve(parsed);
        })
  })
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
};

function writeJson(data, id) {
    return new Promise( (resolve, object) => {
        fs.writeFileSync(`./data/${id}.json`, JSON.stringify(data), 'utf8');
        resolve();
    })
};

const merge = async () => {
  const merged = [];
  const unis = await readFile("","unis_geo");
  const iterate = await asyncForEach( unis, async(item) => {
        if(item.steckbrief['Studierendenzahl']) {
            let temp_arr = {};
            const studies = await readFile("studies/",item.id_studien);
            const count_studies = Object.keys(studies).length;
    
            const count_students = item.steckbrief['Studierendenzahl'];
        
            temp_arr.name = item.name;
            temp_arr.county = item.steckbrief['Bundesland'];
            temp_arr.sponsor = item.steckbrief['Trägerschaft'];
            temp_arr.year = parseInt(item.steckbrief['Gründungsjahr']);
            temp_arr.count_studies = count_studies;
            temp_arr.count_students = parseInt(count_students.replace(" (WS 2016/2017)", ""));
            temp_arr.lat = item.anschrift.lat;
            temp_arr.lng = item.anschrift.lng;
            temp_arr.id_studies = item.id_studien;
            temp_arr.id_hochschule = item.id_hochschule;
    
            merged.push(temp_arr);
        }
    });
    // console.log(merged);
    const write = await writeJson(merged, 'unis_refined');
}

merge();