var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

request.defaults({jar: true});

var $,
data = [],
offset = 0

function requestUnis(pageOffset) {
	return new Promise( (resolve,reject) => {
		
		var urls = {
			"uni": `https://www.hochschulkompass.de/hochschulen/hochschulsuche/search/1/pn/${pageOffset}.html?tx_szhrksearch_pi1%5Bresults_at_a_time%5D=100`
		}
		var index = pageOffset * 100;
		
		request.get(urls.uni, (error, response, body) => {
			if(!error && response.statusCode == 200) {
				$ = cheerio.load(body);
				$('#c10352 div.clearfix section.result-box').each( (i, elem) => {
					var el = $(elem);
					var name = el.children('h2').text();
					var link = el.children('a').attr('href');
					var cat = {};
		
					var categories = el.children('ul').children('li').each( (i, listItem) => {
						var el = $(listItem);
						var status = el.children('span.status').text();
						var title = el.children('span.title').text();
		
						if (title === 'Hochschulleitung') {
							status = status.replace('/\r?\n|\r/', '').trim();
						}
						cat[title] = status;
					});
		
					data.push(
						{
							'Id': index,
							'Link': link,
							'Name': name,
							'Bundesland': cat.Bundesland,
							'Hochschulort': cat.Hochschulort,
							'Trägerschaft': cat.Trägerschaft,
							'Hochschulleitung': cat.Hochschulleitung,
						}
					)
					index++;
				})
			}
			resolve(data);
		})
	})
}

function writeJson(data) {
	fs.writeFileSync('./data/univesities.json', JSON.stringify(data), 'utf8')
}

async function queryUniversities() {
	var p1 = await requestUnis(0);
	var p2 = await requestUnis(1);
	var p3 = await requestUnis(2);
	var p4 = await requestUnis(3);
	var write = await writeJson(p4);
}

queryUniversities();





