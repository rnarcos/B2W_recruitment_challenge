const https = require('https');

class Utility {
	static formatText(strings_list, condition) {
		var [last_string, formatted_string] = [strings_list.pop(), undefined];
		if (!(strings_list.length)) {
			formatted_string = last_string.toString();
		} else {
			formatted_string = `${strings_list.join(', ')} ${condition} ${last_string.toString()}`
		}
		return formatted_string;
	}

	static async retrieveDataFromWebsite(website_url) {
		return new Promise((resolve, reject) => {
			https.get(website_url, website_data => {
				var data_retrieved = '';
				website_data.on('data', data_chunk => data_retrieved += data_chunk).on('end', _ => resolve(data_retrieved));
			});
		});
	}
}

module.exports = Utility;