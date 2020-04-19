'use sctrict'

var CiudadModel = require('../models/CiudadModel.js')
var colombia = require('../public/js/colombia.json')

CiudadController =  () => {}

CiudadController.getMunicipio = (req, res, next) =>{

	let departamento = req.params.departamento
	const found = colombia.find(element => element.departamento == departamento)
	res.send(found.ciudades)
}

CiudadController.getAll = (req, res, next) =>{
	var obj = new CiudadModel()
	obj.getAll().then((data) =>{
		// console.log(data)
		let locals ={
			data:data,
			colombia:colombia,
			path_form:'/crear_ciudad',
			title:'Sistent chat',
			title_window:'Ciudades',
			description:'Sistema reservas hoteleras por chat'
		}
		res.render('ciudades', locals)
	})
}

CiudadController.getAllActive = (req, res, next) =>{

	var obj = new CiudadModel()
	obj.getAllActive().then((data) =>{
		let locals ={
			data : data,
			title:'Landing',
			landing : true
		}

		res.render('landing', locals)
	})
}


CiudadController.detail = (req, res, next) =>{
	
	let ciudad_id =req.params.ciudad_id
	var obj = new CiudadModel()
	obj.getOne(ciudad_id).then((data) =>{
		// console.log(data)
		let locals ={
			data:data[0],
			colombia:colombia,
			path_form:'/editar_ciudad',
			title:'Sistent chat',
			title_window:'Ciudad '+ data[0].nombre,
			description:'Detalle Ciudad'
		}
		res.render('detail_ciudad', locals)
	})
}

CiudadController.create = (req, res, next) =>{
	var datos = req.body
	var obj = new CiudadModel()
	datos.id = datos.nombre
	obj.create(datos).then((data) =>{
		
		res.redirect('ciudades')
	})
}

CiudadController.edit = (req, res, next) =>{
	var datos = req.body
	var obj = new CiudadModel()
	obj.edit(datos).then((data) =>{
		
		let locals ={
			data:datos,
			colombia:colombia,
			title:'Sistent chat',
			title_window:'Ciudad '+ data.nombre,
			description:'Detalle Ciudad',
			flag:true,
			msg:"Ciudad Actualizada Correctamente",
		}

		// res.redirect('detail_ciudad/'+ datos.id)
		res.render('detail_ciudad', locals)
	})
}

module.exports = CiudadController