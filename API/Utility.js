const https = require('https');

class Utility {
	static async retrieveDataFromWebsite(website_url) {
		return new Promise((resolve, reject) => {
			https.get(website_url, website_data => {
				var data_retrieved = '';
				website_data.on('data', data_chunk => data_retrieved += data_chunk)
							.on('end', _ => resolve(data_retrieved));
			});
		});
	}

	static async requireMandatoryParams(params_names, params_source_object, param_criteria, params_input_from) {
		return new Promise((resolve, reject) => {
			var last_source_object_param;
			const params_source_object_keys = Object.keys(params_source_object);
			if (params_source_object_keys.length && !(Object.keys(params_source_object)[param_criteria](param => {
				const param_index = params_names.indexOf(param);
				last_source_object_param = param;
				return (param_index >= 0) &&
					params_names.splice(param_index, 1) &&
						delete params_source_object[param];
			}))) {
				reject(`Essa operação não pode ser realizada com a declaração do parâmetro ${last_source_object_param} no ${params_input_from} da requisição.`);
			}
			if (params_names.length && param_criteria === 'every') {
				reject(`Essa operação não pode ser realizada sem a declaração do parâmetro ${params_names[0]} no ${params_input_from} da requisição.`);
			}
			resolve(true);
		});
	}
}

module.exports = Utility;