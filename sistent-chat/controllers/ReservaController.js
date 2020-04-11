'use sctrict'

var ReservaModel = require('../models/ReservaModel.js')
var CiudadModel = require('../models/CiudadModel.js')

ReservaController =  () => {}

ReservaController.getAll = (req, res, next) =>{

	let flag = false
	let msg = ''
	if(req.params.flag == "2")
	{
		flag = true
		msg = 'Reserva actualizada correctamente'
	}
	
	var obj = new ReservaModel()
	var objC = new CiudadModel()
	obj.getAll().then((data) =>{

		objC.getAllActive().then((ciudades) =>{

			let listCiudades = objC.creatList(ciudades)
			let locals ={
				data:data,
				listCiudades: listCiudades,
				path_form:'/edit_reserva',
				title:'Sistent chat',
				title_window:'Reservas',
				description:'Sistema reservas hoteleras por chat',
				baseUrl: req.protocol +'://'+ req.get('host'),
				flag:flag,
				msg:msg,
				helpers:{ 
					estadoString:function(data){
						let estado = ''
						switch(data)
						{
							case '1':
								estado = 'Activo - Pendiente CheckIn';
								break;
							case '2':
								estado = 'CheckIn';
								break;
							case '3':
								estado = 'CheckOut';
								break;
							case '0':
								estado = 'Inactivo';
								break;
							default:
								estado ='No disponible'
								break;
						}
						return estado
					}
				}
			}
			// res.send(locals.data)
			res.render('reservas', locals)
		})
	})
}

ReservaController.edit = (req, res, next) =>{
	var datos = req.body
	var obj = new ReservaModel()
	obj.edit(datos)
		.then((data) =>{
		res.redirect('reservas/2')
	})
}

function estado(data)
{

}

module.exports = ReservaController