const express = require('express');
const router = express.Router();

const Planet = require('../handlers/planets');


//Populating planets with SWAPI data
router.get('/populate/:ammount_of_planets', (req, res, next) => {
	const {ammount_of_planets} = req.params;
	if (!ammount_of_planets) {
		res.status(422).json({message: 'Você deve fornecer quantos planetas deverão ser inseridos na API!'});
	}
	Planet.populate(Number.parseInt(ammount_of_planets, 10)).then(response=> {
		res.status(response.status).json(response.response);
	}).catch(response =>
		res.status(response.status).json(response.response)
	);
});

//Finding planets
router.get('/:_id?', (req, res, next) => {
	const valid_filters = ['name', '_id', 'page'];
	const filters_source = {...req.params, ...req.query};
	Planet.find(valid_filters, filters_source).then(response =>
		res.status(response.status).json(response.response)
	).catch(response =>
		res.status(response.status).json(response.response)
	);
});

//Creating a planet
router.post('/', (req, res, next) => {
	Planet.create(req.body).then(response =>
		res.status(response.status).json(response.response)
	).catch(response =>
		res.status(response.status).json(response.response)
	)
});

//Deleting a planet
router.delete('/:_id?', (req, res, next) => {
	Planet.delete(req.params).then(response =>
		res.status(response.status).json(response.response)
	).catch(response =>
		res.status(response.status).json(response.response)
	)
});

module.exports = router;