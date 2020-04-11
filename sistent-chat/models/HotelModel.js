'use strict'

class HotelModel
{
	constructor()
	{
		this.db = require('./conexion.js')
		this.hotel = []
		this.hotelOne = []

    }

    async getAll()
    {
    	return this.db.collection('hotel').get()
		.then((snapshot) => {
	    	snapshot.forEach((doc) => {
	    		var objeto = doc.data()
	    			objeto.id = doc.id
	      			this.hotel.push(objeto)
	    	});
			return this.hotel	    	
		})
	  	.catch((err) => {
	    	console.log('Error getting documents: ' + err);
		});
    }

    async getAllByCiudad(ciudad)
    {
    	return this.db.collection('hotel').where('ciudad', '==', ciudad).get()
		.then((snapshot) => {
	    	snapshot.forEach((doc) => {
	    		var objeto = doc.data()
	    			objeto.id = doc.id
	      			this.hotel.push(objeto)
	    	});
			return this.hotel	    	
		})
	  	.catch((err) => {
	    	console.log('Error getting documents: ' + err);
		});
    }

    async getOne(hotel)
    {
    	return this.db.collection('hotel').doc(hotel).get()
	    .then(doc => {
	    	var objeto = doc.data()
	    	objeto.id = doc.id
	      	this.hotelOne.push(objeto)
	        		
	        return this.hotelOne

	      	})
	      	.catch((error) => {
		        console.log('Error getting document: ' + error);
	      	});
	}

	async save_habitacion(data)
	{
	    return this.db.collection('hotel').doc(data.id).update({
	    	habitaciones:data.habitaciones
	    })
	    .then(doc => {
	      	return true
	    }).catch(err => {
	      console.log('Error getting documents: ' + err);
	    });
	}

	async save_hotel(data)
	{
		if(data.id != '' && data.id != null)
		{
		    return this.db.collection('hotel').doc(data.id).update({
		    	nombre: data.nombre,
		    	ciudad: data.ciudad,
		    	imagen: data.imagen,
		    	site: data.site,
		    	estado: data.estado
		    })
		    .then(doc => {
		      	return true
		    }).catch(err => {
		      console.log('Error getting documents: ' + err);
		    });
		}
		else
		{
			return this.db.collection('hotel').add({
				nombre: data.nombre,
		    	ciudad: data.ciudad,
		    	imagen: data.imagen,
		    	site: data.site,
		    	estado: data.estado,
		    	galeria: ['--','--', '--'],
		    	habitaciones:[]
			})
		    .then(doc => {
		      	return true
		    }).catch(err => {
		      console.log('Error getting documents: ' + err);
		    });
		}
	}

	creatList(objeto)
	{
		let list = []
		let key = 0
		
		for(key = 0; key < objeto.length; key ++)
		{
			list.push({clave:objeto[key].nombre, valor:objeto[key].nombre})
		}
		return list
	}
}

module.exports = HotelModel