const Utility = require('../Utility');
const mongoose = require('mongoose');

const PlanetModel = require('../models/planet');

class Planet {
	static async create(params_source) {
		const {name, climate, terrain} = params_source;
		return new Promise((resolve, reject) => {
			Utility.requireMandatoryParams(['name', 'climate', 'terrain'], params_source, 'every', 'corpo').then(_ => {
				PlanetModel.init().then(_ => {
					Planet.retrieveFilmsIncludingPlanetInSwapi(name).then(films_included_set => {
						const films_included = films_included_set.size;
						const planet_object = new PlanetModel({
							_id: new mongoose.Types.ObjectId(),
							name,
							climate,
							terrain,
							films_included
						});
						planet_object.save().then(planet =>
							resolve({
								status: 201,
								response: {
									message: 'Planeta criado com sucesso',
									planet: {
										_id: planet._id,
										name: planet.name,
										climate: planet.climate,
										terrain: planet.terrain,
										terrains_included: planet.films_included,
									}
								}
							})
						).catch(_ =>
							reject({status: 409, response: {message: 'Não foi possivel completar a sua requisição pois ela causaria uma duplicidade de registros!'}})
						);
					}).catch(_ =>
						reject({status: 500, response: {message: 'Houve um problema ao processar a sua requisição!'}})
					);
				}).catch(_ =>
					reject({status: 409, response: {message: 'Duplicidade no banco de dados encontrada!'}})
				);
			}).catch(message =>
				reject({status: 422, response: message})
			);
		});
	}

	static async delete(params_source) {
		const {_id} = params_source;
		return new Promise((resolve, reject) => {
			Utility.requireMandatoryParams(['_id'], params_source, 'every', 'caminho').then(_ => {
				PlanetModel.findByIdAndDelete(_id).then(removal_transaction => {
					if (removal_transaction) {
						resolve({status: 200, response: {message: `O planeta com id ${_id} foi excluído`}});
					} else {
						if (!_id) {
							reject({status: 404, response: {message: 'Não foi possível encontrar um planeta com essas características'}});
						}
						reject({status: 404, response: {message: `Nenhum planeta com id ${_id} foi encontrado`}});
					}
				}).catch(_ =>
					reject({status: 500, response: {message: 'Houve um problema ao processar a sua requisição!'}})
				);
			}).catch(message =>
					reject({status: 422, response: {message}})
			);
		});
	}

	static async find(params, params_source) {
		const {name, page, _id} = params_source;
		return new Promise((resolve, reject) => {
			Utility.requireMandatoryParams(params, params_source, 'some', 'caminho').then(_ => {
				let query_object;
				if (name) {
					query_object = {name};
				} else if (_id) {
					query_object = {_id};
				} else {
					query_object = undefined;
				}
				PlanetModel.paginate(query_object, {
					select: '_id name climate terrain films_included'
				,	page: Number.parseInt(page, 10) || 1
				}).then(pagination_response => {
					var { results, count, limit, previous, next } = pagination_response;
					const page_template = `${process.env.NODE_SERVER_ADDRESS}:${process.env.NODE_SERVER_PORT}/planets/?page=`;
					if (previous)  previous = `${page_template}${previous}`;
					if (next)  next = `${page_template}${next}`;
					const response_object = {
						count,
						limit,
						previous,
						next,
						results
					};
					if (pagination_response.count) {
						resolve({status: 200, response: response_object});
					} else {
						reject({status: 404, response: {message: 'Nenhum planeta contendo essas características pôde ser encontrado!'}});
					}
				}).catch(_ =>
					reject({status: 500, response: {message: 'Houve um problema ao processar a sua requisição!'}})
				)
			}).catch(message =>
				reject({status: 422, response: {message}})
			);
		});
	}

	//SWAPI-interation methods
	static async grabDataFromSWAPI(base_url) {
		return new Promise(async (resolve, reject) => {
			let SWAPI_data_totalized = [];
			let used_url = base_url;
			while (used_url) {
				const swapi_data_json = await Utility.retrieveDataFromWebsite(used_url);
				try {
					const swapi_data = JSON.parse(swapi_data_json);
					used_url = swapi_data.next;
					SWAPI_data_totalized.push(...swapi_data.results);
				} catch (exception) {
					reject({status: 500, response: {
						message: 'Houve um problema ao converter os dados obtidos na SWAPI!'
					}});
				}
			}
			resolve(SWAPI_data_totalized);
		});
	}

	static async retrieveFilmsIncludingPlanetInSwapi(planet_name) {
		let base_url = 'https://swapi.co/api/planets/';
		if (planet_name)  base_url += `?search=${planet_name}`;
		return new Promise((resolve, reject) => {
			Planet.grabDataFromSWAPI(base_url).then(response_objects => {
				resolve(response_objects.reduce((ac, cu) => {
					cu.films.forEach(film => {
						//Will look for the exact planet name!
						if (cu.name === planet_name)  ac.add(film);
					});
					return ac;
				}, new Set()));
			}).catch(response => reject(response));
		});
	}

	static async populate(ammount_of_planets) {
		let base_url = 'https://swapi.co/api/planets/';
		return new Promise((resolve, reject) => {
			Planet.grabDataFromSWAPI(base_url).then(async response_objects => {
				const response_objects_ammount = response_objects.length;
				if (ammount_of_planets > response_objects_ammount) {
					reject({status: 422, response: {
						message: `O número de planetas à serem populados (${ammount_of_planets} superam o número de planetas presentes na SWAPI (${response_objects_ammount})`
					}});
				} else {
					for (const object of response_objects.slice(0, ammount_of_planets)) {
						const {name, climate, terrain} = object;
						try {
							await Planet.create({name, climate, terrain});
						} catch (err) {
							reject(err);
						}
					}
					resolve({status: 201, response: {
						message: `${ammount_of_planets} planetas foram criados a partir da SWAPI!`
					}});
				}
				resolve(response_objects);
			}).catch(response => reject(response));
		});
	}
}

module.exports = Planet;