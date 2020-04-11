'use strict'

class CiudadModel
{
	constructor()
	{
		this.db = require('./conexion.js')
		this.ciudad = []
		this.ciudadOne = []

    }

    async getAll()
    {
    	return this.db.collection('ciudad').get()
		.then((snapshot) => {
	    	snapshot.forEach((doc) => {
	    		var objeto = doc.data()
	    			objeto.id = doc.id
	      			this.ciudad.push(objeto)
	    	});
			return this.ciudad	    	
		})
	  	.catch((err) => {
	    	console.log('Error getting documents: ' + err);
		});
    }

    async getAllActive()
    {
    	return this.db.collection('ciudad').where('estado', '==', '1').get()
		.then((snapshot) => {
	    	snapshot.forEach((doc) => {
	    		var objeto = doc.data()
	    			objeto.id = doc.id
	      			this.ciudad.push(objeto)
	    	});
			return this.ciudad	    	
		})
	  	.catch((err) => {
	    	console.log('Error getting documents: ' + err);
		});
    }

    async getOne(ciudad)
    {
    	return this.db.collection('ciudad').doc(ciudad).get()
	    .then(doc => {
	    	var objeto = doc.data()
	    	objeto.id = doc.id
	      	this.ciudadOne.push(objeto)
	        		
	        return this.ciudadOne

	      	})
	      	.catch((error) => {
		        console.log('Error getting document: ' + error);
	      });
	}

	async create(data)
	{
	    return this.db.collection('ciudad').doc(data.id.toLowerCase()).set({
	    	nombre: data.nombre,
	    	imagen: data.imagen,
	    	estado: data.estado,
	    	departamento: data.departamento
	    })
	    .then(doc => {
	      	return true
	    }).catch(err => {
	      console.log('Error getting documents: ' + err);
	    });
	}

	async edit(data)
	{
	    return this.db.collection('ciudad').doc(data.id).update({
	    	nombre:data.nombre,
	    	departamento:data.departamento,
	    	estado:data.estado,
	    	imagen:data.imagen
	    })
	    .then(doc => {
	      	return true
	    }).catch(err => {
	      console.log('Error getting documents: ' + err);
	    });
	}

	creatList(objeto)
	{
		let list = []
		let key = 0
		
		for(key = 0; key < objeto.length; key ++)
		{
			list.push({clave:objeto[key].id, valor:objeto[key].nombre})
		}
		return list
	}
}

module.exports = CiudadModel