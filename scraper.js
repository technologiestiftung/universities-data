var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var urls = {
	"uni": "https://www.hochschulkompass.de/hochschulen/hochschulsuche/search/1/pn/0.html?tx_szhrksearch_pi1%5Bresults_at_a_time%5D=100",
}

var $,
data = []


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
					'Id': i,
					'Link': link,
					'Name': name,
					'Bundesland': cat.Bundesland,
					'Hochschulort': cat.Hochschulort,
					'Trägerschaft': cat.Trägerschaft,
					'Hochschulleitung': cat.Hochschulleitung,
				}
			)

			

			
			// var categories_uni = el.children('ul').children('li').children('span.title').text();

			// console.log(categories_uni);

		})
	}
	console.log(data);
})
