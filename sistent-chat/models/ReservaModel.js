'use strict'

class ReservaModel
{
	constructor()
	{
		this.db = require('./conexion.js')
		this.reserva = []
    }

    async getAll()
    {
    	return this.db.collection('reserva').get()
		.then((snapshot) => {
	    	snapshot.forEach((doc) => {
	    		var objeto = doc.data()
	    			objeto.id = doc.id
	      			this.reserva.push(objeto)
	    	});
			return this.reserva	    	
		})
	  	.catch((err) => {
	    	console.log('Error getting documents: ' + err);
		});
    }

    async edit(data)
	{
	    return this.db.collection('reserva').doc(data.id).update({
	    	cedula : data.cedula,
	    	ciudad : data.ciudad,
	    	estado : data.estado,
	    	fecha_ingreso : data.fecha_ingreso,
	    	fecha_salida : data.fecha_salida,
	    	habitacion : data.habitacion,
	    	hotel : data.hotel,
	    	nombre_completo : data.nombre_completo,
	    	numero_personas : data.numero_personas,
	    	telefono : data.telefono
	    })
	    .then(doc => {
	      	return true
	    }).catch(err => {
	      console.log('Error getting documents: ' + err);
	    });
	}
 }
module.exports = ReservaModel