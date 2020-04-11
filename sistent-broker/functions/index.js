// 'use strict';
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const {WebhookClient, Card, Suggestion} = require('dialogflow-fulfillment')
const { SessionsClient } = require('dialogflow')
const cors = require('cors')({ origin: true})
const serviceAccount = require('./service-account.json')

process.env.DEBUG = 'dialogflow:*'
admin.initializeApp(functions.config().firebase)
const db = admin.firestore()

exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {

    const { queryInput, sessionId } = request.body;
    const sessionClient = new SessionsClient({ credentials: serviceAccount });
    const session = sessionClient.sessionPath('sea-bot-yybfat', sessionId);
    const responses = await sessionClient.detectIntent({ session, queryInput});
    const result = responses[0].queryResult;
    response.send(result);
  });
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
	const agent = new WebhookClient({ request, response })
	function solicitud_reserva(agent)
	{
		let respuesta = [
			'Por supuesto estas son las ciudades que tenemos disponibles', 
			'Ok, ya mismo, esta es la lista de las ciudades en las que estamos presentes:',
			'Por supuesto, tenemos nuestros hoteles en las siguientes ciudades:'
		]
		agent.add(respuesta[getRandom(respuesta.length)])
    	const dialogflowAgentDoc = db.collection('ciudad').where('estado','==','1');
    	return dialogflowAgentDoc.get()
      		.then(querySnapshot => {

       			var orders = [];
                querySnapshot.forEach((doc) => { orders.push(doc.data()) });
                orders.forEach((eachOrder, index) => {
                        agent.add(new Card({
					    	title: eachOrder.nombre,
					      	imageUrl: eachOrder.imagen,
					      	buttonText:eachOrder.departamento,
					      	buttonUrl:eachOrder.imagen
					    }))
                })
        		
        		agent.add(`Por favor dime a ¿que ciudad quieres ir?`);

                return Promise.resolve('Lectura Completa');
            })
            .catch((error) => {
        		agent.add('Error:' + error);
      		});       
	}

	function solicitud_reserva_1(agent)
	{
		var context = agent.context.get('solicitud-reserva-followup-2')
		let ciudad = normalize(agent.parameters.ciudad).toLowerCase()

		const hoteles = db.collection('hotel').where('ciudad', '==', ciudad);

    	return hoteles.get()
      		.then(querySnapshot => {

       			var orders = [];
                querySnapshot.forEach((doc) => { orders.push(doc.data()) });

                if(orders.length > 0)
                {
                	agent.add(`Perfecto! en la bella ciudad de ${agent.parameters.ciudad} tenemos los siguientes hoteles:`);
	                orders.forEach((eachOrder, index) => {

                        agent.add(new Card({
					    	title: eachOrder.nombre,
					      	imageUrl: eachOrder.imagen,
					      	buttonText:eachOrder.ciudad,
					      	buttonUrl:eachOrder.site
					    }))
	                })
	                agent.add(`¿Cuál deseas elegir?`);
	                orders.forEach((eachOrder, index) => {

	                	agent.add(new Suggestion(eachOrder.nombre));
	                })

	                agent.context.set({
            			'name': 'solicitud-reserva-custom-followup', 
            			'lifespan' : 5, 
            			'parameters' : {
                			'ciudad': context.parameters.ciudad
	                	} 
                	})
                }
                else
                {
        			agent.add(`Actualmente en la ciudad de ${agent.parameters.ciudad} no tenemos hoteles disponibles por favor elige uno de los hoteles que te sugerimos`);
                }
        	
                return Promise.resolve('Lectura Completa');
            })
            .catch((error) => {
        		agent.add('Error:' + error);
      		});
	}

	function solicitud_reserva_2(agent)
	{
		var context = agent.context.get('solicitud-reserva-custom-followup')
		let hotel = agent.parameters.hotel
		const hab = db.collection('hotel').where('nombre', '==', hotel);
		return hab.get()
			.then(querySnapshot =>{
				var orders = [];
                querySnapshot.forEach((doc) => { orders.push(doc.data()) });

                if(orders.length > 0)
                {
                	orders.forEach((eachOrder, index) => {
                		var habitacion;
                		var habitaciones = eachOrder.habitaciones.filter(doc => doc.estado === '1')

                		if(habitaciones.length)
                		{
                			agent.add(`Ok tenemos las siguiente habitaciones: `);
	                		for(habitacion in habitaciones)
	                		{
		                		agent.add(new Card({
							    	title:`Habitacion ${habitaciones[habitacion].nombre}`,
							      	imageUrl: habitaciones[habitacion].imagen,
							      	buttonText:`Precio $${habitaciones[habitacion].precio}`,
							      	buttonUrl:'#'
							    }))
	                		}
	                		agent.add(`Si estas interesado por favor elige una`);
	                		for(habitacion in habitaciones)
	                		{  
	                			agent.add(new Suggestion(habitaciones[habitacion].nombre));
	                		}
	                		agent.context.set({
	                			'name': 'solicitud-reserva-custom-custom-followup', 
	                			'lifespan' : 5, 
	                			'parameters' : {
		                			'hotel': hotel, 
		                			'ciudad': context.parameters.ciudad
			                	} 
		                	})
                		}
                		else
                		{
                			agent.add(`Lo sentimos no hay habitaciones habilitadas en  ${hotel}`);
                		}
                	})
                }
                else
                {
        			agent.add(`Lo sentimos No encontramos habitaciones`);
                }
                return Promise.resolve('Lectura Completa');
			})
			.catch((error) => {
        		agent.add('Error:' + error);
      		});
	}

	function solicitud_reserva_3(agent)
	{
		var context = agent.context.get('solicitud-reserva-custom-custom-followup')
		agent.add(`Ok por favor dime la fecha de ingreso y la fecha de salida para realizar la validación`)
		agent.context.set({
			'name': 'fecha_reserva', 
			'lifespan' : 5, 
			'parameters' : {
				'numero_habitacion': agent.parameters.numero_habitacion, 
				'hotel': context.parameters.hotel,
				'ciudad': context.parameters.ciudad
			} 
		})
	}

	function fechas(agent)
	{
		var context = agent.context.get('fecha_reserva')
		var fechas = formatDateChat(agent.parameters.fecha)
		if(fechas.length === 2)
		{
			agent.add(`Perfecto entonces le confirmo:`)
			agent.add(`Fecha ingreso: ${fechas[0].substr(0,10)}`)
			agent.add(`Fecha salida: ${fechas[1].substr(0,10)}`)
			agent.add(`Habitación: ${context.parameters.numero_habitacion}`)
			agent.add(`Hotel: ${context.parameters.hotel}`)
			agent.add(`Ciudad: ${capitalizeFirstLetter(context.parameters.ciudad)}`)
			agent.add(``)
			agent.add(`Ahora necesito que por favor me proporcione los siguientes datos:`)
			agent.add(`Nombre completo:`)
			agent.add(`Cédula:`)
			agent.add(`Correo eléctronico:`)
			agent.add(`Teléfono:`)
			agent.add(`Número Personas:`)

			agent.context.set({
				'name': 'fechas-followup', 
				'lifespan' : 5, 
				'parameters' : {
					'numero_habitacion': context.parameters.numero_habitacion, 
					'hotel': context.parameters.hotel,
					'ciudad': context.parameters.ciudad,
					'fecha_ingreso': fechas[0],
					'fecha_salida': fechas[1]
				} 
			})	

		}
		else
		{
			agent.add(`Me podrías repetir el rango de fechas en un formato más entendible para mi, por ejemplo "del 24 de Diciembre al 28 de Diciembre de 2020"`)
		}
	}

	function datos_reserva(agent)
	{
		var context = agent.context.get('fechas-followup')

		const reserva = db.collection('reserva').add({
			nombre_completo:agent.parameters.person.name,
			cedula: agent.parameters.numero_cedula[0],
			telefono: agent.parameters.phone[0],
			ciudad:context.parameters.ciudad,
			hotel: context.parameters.hotel,
			email: context.parameters.email,
			habitacion:context.parameters.numero_habitacion,
			numero_personas:agent.parameters.numero_personas[0],
			fecha_ingreso:context.parameters.fecha_ingreso,
			fecha_salida:context.parameters.fecha_salida,
			estado:1
		});
    	return reserva.then(doc => {

		agent.add(`Perfecto! señor ${agent.parameters.person.name} su reserva ha sido realizada exitosamente`)
		agent.add(`Le confirmo los datos de su reserva: `)
		agent.add(`Nombre completo: ${agent.parameters.person.name}`)
		agent.add(`Cédula: ${agent.parameters.numero_cedula}`)
		agent.add(`Email: ${context.parameters.email}`)
		agent.add(`Teléfono: ${agent.parameters.phone}`)
		agent.add(`Ciudad: ${context.parameters.ciudad}`)
		agent.add(`Hotel: ${context.parameters.hotel}`)
		agent.add(`Habitación: ${context.parameters.numero_habitacion}`)
		agent.add(`Para: ${agent.parameters.numero_personas} personas`)
		agent.add(`Fecha Ingreso: ${context.parameters.fecha_ingreso.substr(0,10)}`)
		agent.add(`Fecha Salida: ${context.parameters.fecha_salida.substr(0,10)}`)
		agent.add(`¿Le puedo ayudar en algo más?`)

      		return Promise.resolve('Read complete');
	    }).catch((error) => {
	     	agent.add('Error:' + error);
	    });
	}

	function servicios(agent)
	{
		agent.add(`Ok, recuerde que  le puedo ayudar con lo siguiente:`)
		agent.add(new Suggestion(`Realizar reserva`));
		agent.add(new Suggestion(`Consultar reserva`));
		agent.add(new Suggestion('Cancelar reserva'));
	}

	function consultar_reserva(agent)
	{
		let cedula = agent.parameters.cedula
		const reservas = db.collection('reserva').where('cedula','==',cedula).where('estado', '==', 1)

    	return reservas.get()
  		.then(querySnapshot => {
   			var orders = [];
            querySnapshot.forEach((doc) => { orders.push(doc.data()) });

            if(orders.length >0)
            {
            	agent.add(`Efectivamente tiene una reserva`)
	            orders.forEach((eachOrder, index) => {
	            	agent.add(`Nombre: ${eachOrder.nombre_completo}`)
	            	agent.add(`Cédula: ${eachOrder.cedula}`)
	            	agent.add(`Teléfono: ${eachOrder.telefono}`)
	            	agent.add(`Ciudad: ${eachOrder.ciudad}`)
	            	agent.add(`Hotel: ${eachOrder.hotel}`)
	            	agent.add(`Habitación: ${eachOrder.habitacion}`)
	            	agent.add(`Para ${eachOrder.numero_personas} personas`)
	            	agent.add(`Fecha ingreso: ${eachOrder.fecha_ingreso.substr(0,10)}`)
	            	agent.add(`Fecha salida: ${eachOrder.fecha_salida.substr(0,10)}`)
	            	agent.add(`¿Le puedo ayudar en algo más?`)
	            })
            }
            else
            {
            	agent.add(`Lo siento pero no me registran reservas activas con el número de cédula: ${cedula}`)
            	agent.add(`Puedes volver a intentarlo´si verificas que hubo un error de digitación`)
            }

            return Promise.resolve('Lectura Completa');
        })
        .catch((error) => {
    		agent.add('Error:' + error);
  		});

	}

	function consultar_reserva_cancelar(agent)
	{
		let cedula = agent.parameters.cedula
		const reservas = db.collection('reserva').where('cedula','==',cedula).where('estado', '==', 1)

    	return reservas.get()
  		.then(querySnapshot => {
   			var orders = [];
   			var id;
            querySnapshot.forEach((doc) => { 
            	id = doc.id
            	orders.push(doc.data()) 
            });
            if(orders.length >0)
            {
            	agent.add(`Efectivamente tiene una reserva`)
	            orders.forEach((eachOrder, index) => {
	            	agent.add(`Nombre: ${eachOrder.nombre_completo}`)
	            	agent.add(`Cédula: ${eachOrder.cedula}`)
	            	agent.add(`Teléfono: ${eachOrder.telefono}`)
	            	agent.add(`Ciudad: ${eachOrder.ciudad}`)
	            	agent.add(`Hotel: ${eachOrder.hotel}`)
	            	agent.add(`Habitación: ${eachOrder.habitacion}`)
	            	agent.add(`Para ${eachOrder.numero_personas} personas`)
	            	agent.add(`Fecha ingreso: ${eachOrder.fecha_ingreso.substr(0,10)}`)
	            	agent.add(`Fecha salida: ${eachOrder.fecha_salida.substr(0,10)}`)
	            	agent.add(`¿Estas seguro que deseas cancelar esta reserva?`)
	            })

	            agent.context.set({
					'name': 'cancelar-reserva-yes-custom-followup', 
					'lifespan' : 2, 
					'parameters' : {
						'id': id
					} 
				})
            }
            else
            {
            	agent.add(`Lo siento pero no me registran reservas activas con el número de cédula: ${cedula}`)
            	agent.add(`Puedes volver a intentarlo´si verificas que hubo un error de digitación`)
            }

            return Promise.resolve('Lectura Completa');
        })
        .catch((error) => {
    		agent.add('Error:' + error);
  		});
	}

	function cancelar_reserva(agent)
	{
		var context = agent.context.get('cancelar-reserva-yes-custom-followup')
		const estado = db.collection('reserva').doc(context.parameters.id);
    	return estado.update({
    		estado:0
    	})
		.then(doc => {
      		agent.add(`Ok, su reserva ha sido cancelada exitosamente`);
      		agent.add(`¿Le puedo ayudar en algo más?`);
      		return Promise.resolve('Read complete');
    	}).catch((error) => {
      		agent.add('Error:' + error);
    	});
	}

	function formatDateChat(objeto)
	{
	    var fecha = []
	    if(objeto.length === 1)
	    {
	        fecha[0] = objeto[0].startDate
	        fecha[1] = objeto[0].endDate
	    }
	    else if(objeto.length === 2)
	    {
	        fecha = objeto
	    }
	    return fecha
	}

	function capitalizeFirstLetter(string) 
	{
    	return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function getRandom(length)
	{
		return Math.floor((Math.random() * ( 0 - length )) + length);
	}

	var normalize = (function(){
		var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
		to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
		mapping = {};

		for(var i = 0, j = from.length; i < j; i++ )
		{
			mapping[ from.charAt( i ) ] = to.charAt( i );
		}
		
		return function( str ){
			var ret = [];
			for( var i = 0, j = str.length; i < j; i++ ) 
			{
				var c = str.charAt( i );
				if( mapping.hasOwnProperty( str.charAt( i ) ) )
				{
					ret.push( mapping[ c ] );
				}
				else
				{
					ret.push( c );
				}
			}      
			return ret.join( '' );
		}
	})();

	let intentMap = new Map();
  	intentMap.set('solicitud-reserva', solicitud_reserva);
  	intentMap.set('solicitud-reserva - custom', solicitud_reserva_1);
  	intentMap.set('solicitud-reserva - custom - custom', solicitud_reserva_2)
  	intentMap.set('solicitud-reserva - custom - custom - custom', solicitud_reserva_3)
  	intentMap.set('fechas', fechas)
  	intentMap.set('datos reserva', datos_reserva)
  	intentMap.set('datos reserva - yes', servicios)
  	intentMap.set('consultar-reserva - custom - yes', servicios)
  	intentMap.set('consultar-reserva - custom', consultar_reserva)
  	intentMap.set('cancelar-reserva - yes - custom', consultar_reserva_cancelar)
  	intentMap.set('cancelar-reserva - yes - custom - no', servicios)
  	intentMap.set('cancelar-reserva - yes - custom - yes', cancelar_reserva)
	intentMap.set('cancelar-reserva - yes - custom - yes - yes', servicios)
  	agent.handleRequest(intentMap);
})