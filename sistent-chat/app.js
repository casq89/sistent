'use strict'

var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	restFul = require('express-method-override')('_method'),//para que los formularios puedan trabajar con PUT y DELETE
	routes = require('./routes/index.js'),
	faviconURL = __dirname + '/public/images/favicon.png',
	publicDir = express.static( __dirname + '/public'),
	viewDir = __dirname + '/views',
	port = (process.env.PORT || 4000),
	exphbs = require('express-handlebars'),
	app = express()

	console.log(__dirname)

app
	.engine('hbs', exphbs({
		defaultLayout: 'main',
		extname:'hbs',
		layoutsDir:__dirname + '/views/layouts/'
	}))
app
	.set('views', viewDir)
	.set('view engine', 'hbs')
	.set('port', port)
	.use( favicon(faviconURL) )
	//parsear application/json
	.use(bodyParser.json())// manejo de formularios json
	//parsear application/x-www-form.urlencoded
	.use(bodyParser.urlencoded({extended:false}))//manejo formularios url encoded
	.use( restFul)//se invoca el midleware restful
	.use(morgan('dev'))
	.use(publicDir)
	.use(routes)//si el parametro del / porque contendra varias rutas

module.exports = app
