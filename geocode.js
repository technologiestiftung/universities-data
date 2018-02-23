let fs = require('fs'),

	config = require('./config.json'),
	googleMapsClient = require('@google/maps').createClient({
		key: config.api_key,
		Promise: Promise
	})

let unis = fs.readFileSync('./data/unis_merged.json', 'utf8')
unis = JSON.parse(unis);

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
};

function activate(uni) {
    this.uni = uni.id_hochschule;
    
    return googleMapsClient.geocode({
        address:  uni.anschrift.Hausanschrift
    })
    .asPromise()
    .then(response => {
        if (response.json.status == 'ZERO_RESULTS') {
            console.log(`Uni #${this.id}, ZERO_RESULTS`);
        }
        const lat = response.json.results[0].geometry.location.lat
        const lng = response.json.results[0].geometry.location.lng
        uni.anschrift.lat = lat;
        uni.anschrift.lng = lng;
        return uni;
    })
    .catch(err => console.log(err))
}

async function geocodeUnis() {
    let geo_arr = [];
    await asyncForEach( unis, async (uni) => {
        const geocoded = await activate(uni);
        await geo_arr.push(geocoded);
    })
    fs.writeFileSync('./data/unis_geo.json', JSON.stringify(geo_arr), 'utf8');
}

geocodeUnis();