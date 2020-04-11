'use sctrict'

var HotelModel = require('../models/HotelModel.js')
var CiudadModel = require('../models/CiudadModel.js')

HotelController =  () => {}

HotelController.getAll = (req, res, next) =>{

	var obj = new HotelModel()
	var objC = new CiudadModel()
	obj.getAll().then((data) =>{
		
		objC.getAllActive().then((ciudades) =>{

			let listCiudades = objC.creatList(ciudades)
			let locals ={
			data:data,
			listCiudades: listCiudades,
			path_form:'/add_hotel',
			title:'Sistent chat',
			title_window:'Hoteles',
			description:'Sistema reservas hoteleras por chat',
			baseUrl: req.protocol +'://'+ req.get('host')
			}
			res.render('hoteles', locals)
		})
	})
}

HotelController.detail = (req, res, next) =>{
	
	let hotel_id =req.params.hotel_id
	var obj = new HotelModel()
	obj.getOne(hotel_id).then((data) =>{
		
		res.send(data)
	})
}

HotelController.save_habitacion = (req, res, next) =>{
	
	let habitacion = req.body
	var obj = new HotelModel()
	obj.getOne(habitacion.id).then((data) =>{
		
		if(habitacion.key == 'false')
		{
			data[0].habitaciones.push({
				capacidad:habitacion.capacidad,
				estado: habitacion.estado,
				fecha_ult_reserva: habitacion.fecha_ult_reserva,
				imagen: (habitacion.imagen+'&token='+habitacion.token).replace('*','%2F'),
				nombre: habitacion.nombre,
				precio: habitacion.precio,
				tipo: habitacion.tipo
			})
		}
		else
		{
			data[0].habitaciones[parseInt(habitacion.key, 10)] = {
				capacidad:habitacion.capacidad,
				estado: habitacion.estado,
				fecha_ult_reserva: habitacion.fecha_ult_reserva,
				imagen: (habitacion.imagen+'&token='+habitacion.token).replace('*','%2F'),
				nombre: habitacion.nombre,
				precio: habitacion.precio,
				tipo: habitacion.tipo
			}
		}

		obj.save_habitacion(data[0]).then((data) =>{
			
			res.send(data)
		})
	})
}

HotelController.delete_habitacion = (req, res, next) =>{
	
	let habitacion_down = req.body
	var obj = new HotelModel()
	obj.getOne(habitacion_down.id).then((data) =>{
		
		data[0].habitaciones.splice(parseInt(habitacion_down.key, 10),1)

		obj.save_habitacion(data[0]).then((data) =>{
			
			res.send(data)
		})
	}).catch((error) =>{
		console.log('Error: '+ error)
	})
}

HotelController.save_hotel = (req, res, next) =>{
	
	let hotel = req.body
	var obj = new HotelModel()
	hotel.imagen = (hotel.imagen+'&token='+hotel.token).replace('*','%2F'),
	obj.save_hotel(hotel).then((data) =>{
		
		if(hotel.id != '' && hotel.id != null)
		{
			res.send(data)
		}
		else
		{
			res.redirect('/hoteles')
		}
	})
	
}

HotelController.getAllByCiudad = (req, res, next) =>{
	let ciudad =req.params.ciudad
	var obj = new HotelModel()
	obj.getAllByCiudad(ciudad).then((data) =>{
		
		res.send(obj.creatList(data))
	})
}


module.exports = HotelController