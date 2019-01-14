const mongoose = require('mongoose');
const mongoose_paginate = require('mongoose-paginate-v2');

const planet_schema = mongoose.Schema({
	_id: {type: mongoose.Schema.Types.ObjectId, required: true},
	name: {type: mongoose.Schema.Types.String, required: true, unique: true},
	climate: {type: mongoose.Schema.Types.String, required: true},
	terrain: {type: mongoose.Schema.Types.String, required: true},
	films_included: {type: mongoose.Schema.Types.Number, required: true}
});
planet_schema.plugin(mongoose_paginate);

module.exports = mongoose.model('Planet', planet_schema);