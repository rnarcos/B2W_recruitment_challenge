const express = require('express');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

const planet_route = require('./API/routes/planets');

const app = express();

//Registering incoming requests
app.use(morgan('dev'));


//Database connection
mongoose.connect(`mongodb://localhost:27017/b2w_rc`, {useNewUrlParser: true}).catch(onrejected => {
	throw new Error('Could not connect to the mongoDB server!');
});


//Handlig Cross-Origin Resource Sharing
/*app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Accept, Content-Type')

	if (req.method === 'OPTIONS') {
		const allowed_methods = 'GET, POST, DELETE'
		//res.header('Acess-Control-Allow-Methods', allowed_methods);
		return res.status(200).json({
			message: 'Providing the allowed HTTP methods',
			allowed_methods
		});
	}
});*/

//Handling body content.
app.use(body_parser.json());

//Handling routes
app.use('/planets', planet_route);

//Disregarding non-implemented routes.
app.use((req, res, next) => {
	const error = new Error('This feature has not been implemented yet!');
	error.status = 501;
	next(error);
});

//Catching unexpected errors.
app.use((error, req, res, next) => {
	res.status(error.status || 500).
		json({
			error: {
				message: error.message
			}
		});
});

module.exports = app;