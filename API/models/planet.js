const mongoose = require('mongoose');

const planet_schema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId
	,	name: String
	,	climate: String
	,	terrain: String
	,	films_included: Number
});

module.exports = mongoose.model('Planet', planet_schema);