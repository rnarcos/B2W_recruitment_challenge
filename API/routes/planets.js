const express = require('express');
const mongoose = require('mongoose');
const https = require('https');
const Utility = require('../Utility');

const router = express.Router();
const PlanetModel = require('../models/planet');

class Planet {
	static async create({name, climate, terrain}) {
		return new Promise((resolve, reject) => {
			Planet.retrieveFilmsIncludingPlanetInSwapi(name).then(films_included_set => {
				const films_included = films_included_set.size;
				const planet_object = new PlanetModel({
					_id: new mongoose.Types.ObjectId()
					,	name
					,	climate
					,	terrain
					,	films_included
				});
				resolve(planet_object.save());
			}).catch(onrejected => reject(onrejected));
		});
	}

	static async retrieveFilmsIncludingPlanetInSwapi(planet_name, planet_url) {
		const url = planet_url || `https://swapi.co/api/planets/?search=${planet_name}`;

		const Swapi_data = await Utility.retrieveDataFromWebsite(url);
		try {
			const JSON_data = JSON.parse(Swapi_data);
			var next_page = JSON_data.next;
			var films = JSON_data.results.reduce((ac, cu) => {
				cu.films.forEach(film => {
					// Only exact matches!
					if (cu.name === planet_name)  ac.add(film);
				});
				return ac;
			}, new Set());
			if (next_page) {
				const next_page_films = await Planet.retrieveFilmsIncludingPlanetInSwapi(planet_name, next_page);
				return new Set([...films, ...next_page_films]);
			} else {
				return films;
			}
		} catch (e) {
			console.warn('A malformed JSON was found in response to ' + url);
			return [];
		}
	}
}

router.get('/list', (req, res, next) => {
	// TODO: Pagination
	PlanetModel.find().exec().then(planet_objects => {
		res.status(200).json(planet_objects);
	});
});

router.post('/create', (req, res, next) => {
	const { name, climate, terrain } = req.body;
	const mandatory_body_params = ['name', 'climate', 'terrain'];
	let missing_mandatory_params = mandatory_body_params.filter(param_name => !(param_name in req.body));
	if (missing_mandatory_params.length) {
		const missing_mandatories_params_string = Utility.formatText(missing_mandatory_params, 'e');
		res.status(422).json({
			message: `Essa operação não pode ser feita sem a declaração dos parâmetros ${missing_mandatories_params_string} no corpo da requisição.`
		});
	}

	Planet.create({name, climate, terrain}).then(planet_object => {

		res.status(201).json({
			message: 'Um planeta novo foi criado!'
		,	planet_object
		});
	}).catch(onrejected => {
		res.status(500).json({
			message: 'Houve um problema ao processar a sua requisição!'
		});
	});
});

router.delete('/', (req, res, next) => {
	const { planet_id } = req.body;
	const mandatory_body_params = ['planet_id'];
	let missing_mandatory_params = mandatory_body_params.filter(param_name => !(param_name in req.body));
	if (missing_mandatory_params.length) {
		const missing_mandatories_params_string = Utility.formatText(missing_mandatory_params, 'ou');
		res.status(422).json({
			message: `Essa operação não pode ser feita sem a declaração do(s) parâmetro(s) ${missing_mandatories_params_string} no corpo da requisição.`
		});
	} else {
		PlanetModel.findByIdAndDelete(planet_id).exec().then(removal_transaction => {
			if (removal_transaction) {
				res.status(200).json({
					message: `O planeta com id ${planet_id} foi excluído`
				});
			} else {
				res.status(404).json({
					message: `Nenhum planeta com id ${planet_id} foi encontrado`
				});
			}
		}).catch(onrejected => {
			res.status(500).json({
				message: 'Houve um problema ao processar a sua requisição!'
			});
		});
	}
});

router.get('/id/:planet_id?', (req, res, next) => {
	const {planet_id} = req.params;
	if (!planet_id) {
		res.status(200).json({
			message: 'Essa operação não pode ser feita sem a explicitação do id do planeta'
		});
	} else {
		PlanetModel.findById(planet_id).exec().
			then(onfulfilled => {
				res.status(200).json(
					onfulfilled
				);
			}).catch(onrejected => {
				res.status(500).json({
					message: 'Houve um problema ao processar a sua requisição!'
				});
			});
	}
});

router.get('/name/:planet_name?', (req, res, next) => {
	//TODO: Implement pagination
	const {planet_name} = req.params;
	if (!planet_name) {
		res.status(421).json({
			message: 'Essa operação não pode ser feita sem a explicitação do nome do planeta'
		});
	} else {
		PlanetModel.find().where('name').equals(planet_name).exec().then(planet_object => {
			if (planet_object.length) {
				res.status(200).json(planet_object);
			} else {
				res.status(404).json({
					message: `O planeta com nome ${planet_name} não pôde ser encontrado.`
				});
			}
		});
	}
});

module.exports = router;