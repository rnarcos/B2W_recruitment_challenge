const express = require('express');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const mongoose_paginate = require('mongoose-paginate-v2');
const morgan = require('morgan');
const CORS = require('cors');

const planet_route = require('./API/routes/planets');

const app = express();

//Registering incoming requests
app.use(morgan('dev'));

//Setting up Mongoose Indexes.
mongoose.set('useCreateIndex', true);

//Setting-up response patterns for database connection-related responses.
mongoose_paginate.paginate.options = {
	limit: 10,
	page: 1,
	customLabels: {
		totalDocs: 'count',
		docs: 'results',
		nextPage: 'next',
		prevPage: 'previous'
	}
};

//Database connection
mongoose.connect(`${process.env.MONGO_DB_ADDRESS}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_DATABASE_NAME}`, {useNewUrlParser: true}).catch(_ => {
	throw new Error('Could not connect to the mongoDB server!');
});

//Handling Cross-Origin Resource Sharing
app.use(CORS({origin: true, optionsSuccessStatus: 200}));

//Handling body content.
app.use(body_parser.json());

//Handling routes
app.use('/planets', planet_route);

//Disregarding non-implemented routes.
app.use((req, res, next) => {
	const error = new Error('Unknown schema/resource');
	error.status = 501;
	next(error);
});

//Catching unexpected errors.
app.use((error, req, res, next) => {
	res.status(error.status || 500).
		json({
			error: {
				message: 'An unexpected error was found while processing your request!',
				details: error.message
			}
		});
});

module.exports = app;