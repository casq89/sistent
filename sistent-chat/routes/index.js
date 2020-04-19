'use strict'

var CiudadController = require('../controllers/CiudadController'),
	HotelController = require('../controllers/HotelController'),
	ReservaController = require('../controllers/ReservaController'),
	express = require('express'),
	router = express.Router()

router
	.get('/', CiudadController.getAllActive)
	.get('/login',function(req,  res, next){

		let locals ={
			title:'Login',
			landing : true
		}
		res.render('login', locals)
	})
	.get('/index',function(req,  res, next){
		let locals ={
			title:'Sistent chat',
			title_window:'Inicio',
		}
		res.render('index', locals)
	})
	.get('/get_municipio/:departamento', CiudadController.getMunicipio)
	.get('/ciudades',CiudadController.getAll )
	.get('/detail_ciudad/:ciudad_id',CiudadController.detail )
	.post('/crear_ciudad',CiudadController.create )
	.post('/editar_ciudad',CiudadController.edit )
	.get('/hoteles', HotelController.getAll )
	.get('/hotels_ciudad/:ciudad', HotelController.getAllByCiudad)
	.post('/add_hotel', HotelController.save_hotel )
	.post('/add_habitacion', HotelController.save_habitacion )
	.post('/delete_habitacion', HotelController.delete_habitacion )
	.get('/detail_hotel/:hotel_id', HotelController.detail)
	.get('/reservas/:flag', ReservaController.getAll )
	.post('/edit_reserva', ReservaController.edit)
	.get('/chat',function (req, res, next){
		res.send('Server is  running')
	})
	.use(error404)

	function error404(req, res, next)
	{
		let error = new Error(),
			locals = {
				title: 'Error 404',
				description: 'Recurso no encontrado',
				error : error
			}

		error.status = 404
		res.render('error', locals)
	}

module.exports = router