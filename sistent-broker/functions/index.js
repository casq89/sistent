// 'use strict';
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const {WebhookClient, Card, Suggestion} = require('dialogflow-fulfillment')
const { SessionsClient } = require('dialogflow')
const cors = require('cors')({ origin: true})
const serviceAccount = require('./service-account.json')
const means = require('./means.js')

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
	const action = request.body.queryResult.action
	// console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  	// console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
	function solicitud_reserva(agent)
	{
		let respuesta
		var m = new means()
		if(String(action) === 'solicitud_reserva_1')
		{
			respuesta = m.solicitud_reserva(1)
		}
		else if(String(action) === 'solicitud_reserva_2')
		{
			respuesta = m.solicitud_reserva(2)
		}

		agent.add(respuesta.respuesta_1[getRandom(respuesta.respuesta_1.length)])
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
        		
        		agent.add(`${respuesta.respuesta_2}`);

                return Promise.resolve('Lectura Completa');
            })
            .catch((error) => {
        		agent.add('Error:' + error);
      		});       
	}

	function solicitud_reserva_1(agent)
	{
		let respuesta
		let last_context
		let contexto
		var m = new means()
		let ciudad = normalize(agent.parameters.ciudad).toLowerCase()

		if(String(action) === 'solicitud-reserva.solicitud-reserva-custom')
		{
			respuesta = m.solicitud_reserva_1(1)
			contexto = 1
			last_context = 'solicitud-reserva-followup-2'
		}
		else if(String(action) === 'solicitud-reserva-2.solicitud-reserva-2-custom')
		{
			respuesta = m.solicitud_reserva_1(2)
			contexto = 2
			last_context = 'solicitud-reserva-2-followup'
		}

		var context = agent.context.get(last_context)
		const hoteles = db.collection('hotel').where('ciudad', '==', ciudad);

    	return hoteles.get()
      		.then(querySnapshot => {

       			var orders = [];
                querySnapshot.forEach((doc) => { orders.push(doc.data()) });

                if(orders.length > 0)
                {
                	agent.add(`${respuesta[0]} ${agent.parameters.ciudad} tenemos los siguientes hoteles:`);
	                orders.forEach((eachOrder, index) => {

                        agent.add(new Card({
					    	title: eachOrder.nombre,
					      	imageUrl: eachOrder.imagen,
					      	buttonText:eachOrder.ciudad,
					      	buttonUrl:eachOrder.site
					    }))
	                })
	                agent.add(`${respuesta[1]}`);
	                orders.forEach((eachOrder, index) => {

	                	agent.add(new Suggestion(eachOrder.nombre));
	                })

	                agent.context.set({
            			'name': 'solicitud-reserva-custom-followup', 
            			'lifespan' : 5, 
            			'parameters' : {
							'ciudad': context.parameters.ciudad,
							'contexto':contexto
	                	} 
                	})
                }
                else
                {
        			agent.add(`${respuesta[2]} ${agent.parameters.ciudad} ${respuesta[3]}`);
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
		let contexto = context.parameters.contexto
		let hotel = agent.parameters.hotel
		let respuesta
		var m = new means()

		if(contexto === 1)
		{
			respuesta = m.solicitud_reserva_2(1)
		}
		else if(contexto === 2)
		{
			respuesta = m.solicitud_reserva_2(2)
		}
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
                			agent.add(`${respuesta[0]}`);
	                		for(habitacion in habitaciones)
	                		{
		                		agent.add(new Card({
							    	title:`Habitacion ${habitaciones[habitacion].nombre}`,
							      	imageUrl: habitaciones[habitacion].imagen,
							      	buttonText:`Precio $${habitaciones[habitacion].precio}`,
							      	buttonUrl:'#'
							    }))
	                		}
	                		agent.add(`${respuesta[1]}`);
	                		for(habitacion in habitaciones)
	                		{  
	                			agent.add(new Suggestion(habitaciones[habitacion].nombre));
	                		}
	                		agent.context.set({
	                			'name': 'solicitud-reserva-custom-custom-followup', 
	                			'lifespan' : 5, 
	                			'parameters' : {
		                			'hotel': hotel, 
									'ciudad': context.parameters.ciudad,
									'contexto': contexto
			                	} 
		                	})
                		}
                		else
                		{
                			agent.add(`${respuesta[2]}  ${hotel}`);
                		}
                	})
                }
                else
                {
        			agent.add(`${respuesta[3]}`);
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
		let contexto = context.parameters.contexto
		let respuesta
		var m = new means()

		if(contexto === 1)
		{
			respuesta = m.solicitud_reserva_3(1)
		}
		else if(contexto === 2)
		{
			respuesta = m.solicitud_reserva_3(2)
		}

		agent.add(`${respuesta[0]}`)
		agent.context.set({
			'name': 'fecha_reserva', 
			'lifespan' : 5, 
			'parameters' : {
				'numero_habitacion': agent.parameters.numero_habitacion, 
				'hotel': context.parameters.hotel,
				'ciudad': context.parameters.ciudad,
				'contexto': contexto
			} 
		})
	}

	function fechas(agent)
	{
		var context = agent.context.get('fecha_reserva')
		var fechas = formatDateChat(agent.parameters.fecha)
		let contexto = context.parameters.contexto
		let respuesta
		let next_context
		var m = new means()

		if(contexto === 1)
		{
			respuesta = m.fechas(1)
			next_context = 'fechas-followup'
		}
		else if(contexto === 2)
		{
			respuesta = m.fechas(2)
			next_context = 'fechas-followup-2'
		}

		if(fechas.length === 2)
		{
			agent.add(`${respuesta[0]}`)
			agent.add(`Fecha ingreso: ${fechas[0].substr(0,10)}`)
			agent.add(`Fecha salida: ${fechas[1].substr(0,10)}`)
			agent.add(`Habitación: ${context.parameters.numero_habitacion}`)
			agent.add(`Hotel: ${context.parameters.hotel}`)
			agent.add(`Ciudad: ${capitalizeFirstLetter(context.parameters.ciudad)}`)

			agent.add(`${respuesta[1]}`)
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
			agent.add(`${respuesta[2]}`)
		}
	}

	function datos_reserva(agent)
	{
		var context = agent.context.get('fechas-followup')

		const reserva = db.collection('reserva').add({
			nombre_completo:agent.parameters.person.name,
			cedula: String(agent.parameters.numero_cedula[0]),
			telefono: String(agent.parameters.phone[0]),
			ciudad:context.parameters.ciudad,
			hotel: context.parameters.hotel,
			email: context.parameters.email,
			habitacion: String(context.parameters.numero_habitacion),
			numero_personas: String(agent.parameters.numero_personas[0]),
			fecha_ingreso:context.parameters.fecha_ingreso,
			fecha_salida:context.parameters.fecha_salida,
			estado:'1'
		});
    	return reserva.then(doc => {

		agent.add(`Perfecto! señor(a) ${agent.parameters.person.name} su reserva ha sido realizada exitosamente`)
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
		let respuesta
		var m = new means()

		switch(String(action))
		{
			case 'cancelar-reserva.cancelar-reserva-yes.cancelar-reserva-yes-custom.cancelar-reserva-yes-custom-no':
			case 'cancelar-reserva.cancelar-reserva-yes.cancelar-reserva-yes-custom.cancelar-reserva-yes-custom-yes.cancelar-reserva-yes-custom-yes-yes': 
			case 'consultar-reserva.consultar-reserva-custom.consultar-reserva-custom-yes':
			case 'fechas.fechas-custom.datosreserva-yes':
			respuesta = m.ofrecer_servicios(1)	
			break;
			case 'cancelar-reserva-2.cancelar-reserva-2-yes.cancelar-reserva-2-yes-custom.cancelar-reserva-2-yes-custom-no':
			case 'cancelar-reserva-2.cancelar-reserva-2-yes.cancelar-reserva-2-yes-custom.cancelar-reserva-2-yes-custom-yes.cancelar-reserva-2-yes-custom-yes-yes':
			case 'consultar-reserva-2.consultar-reserva-2-custom.consultar-reserva-2-custom-yes':
			case 'fechas.fechas-custom.datosreserva-2-yes':
			respuesta = m.ofrecer_servicios(2)	
			break;
			default:
			respuesta = m.ofrecer_servicios(1)
			break;
		}
		agent.add(`${respuesta[0]}`)
		agent.add(new Suggestion(`Realizar una reserva`));
		agent.add(new Suggestion(`Consultar una reserva`));
		agent.add(new Suggestion('Cancelar una reserva'));
	}

	function consultar_reserva(agent)
	{
		let cedula = String(agent.parameters.cedula)
		let respuesta
		let contexto
		var m = new means()
		if(action === 'consultar-reserva.consultar-reserva-custom')
		{
			respuesta = m.consultar_reserva_info(1)
		}
		else
		{
			respuesta = m.consultar_reserva_info(2)
		}
		const reservas = db.collection('reserva').where('cedula','==',cedula).where('estado', '==', '1')

    	return reservas.get()
  		.then(querySnapshot => {
   			var orders = [];
            querySnapshot.forEach((doc) => { orders.push(doc.data()) });

            if(orders.length > 0)
            {
            	agent.add(`${respuesta[0]}`)
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
	            	agent.add(`${respuesta[1]}`)
	            })
            }
            else
            {
            	agent.add(`${respuesta[2]} ${cedula}`)
            	agent.add(`${respuesta[3]}`)
            }

            return Promise.resolve('Lectura Completa');
        })
        .catch((error) => {
    		agent.add('Error:' + error);
  		});

	}

	function consultar_reserva_cancelar(agent)
	{
		let cedula = String(agent.parameters.cedula)
		let respuesta
		let contexto
		var m = new means()
		if(action === 'cancelar-reserva.cancelar-reserva-yes.cancelar-reserva-yes-custom')
		{
			respuesta = m.cancelar_reserva_info(1)
			contexto = 1
		}
		else
		{
			respuesta = m.cancelar_reserva_info(2)
			contexto = 2
		}
		const reservas = db.collection('reserva').where('cedula','==',cedula).where('estado', '==', '1')

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
            	agent.add(`${respuesta[0]}`)
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
	            	agent.add(`${respuesta[1]}`)
	            })

	            agent.context.set({
					'name': 'cancelar-reserva-yes-custom-followup', 
					'lifespan' : 2, 
					'parameters' : {
						'id': id,
						'contexto': contexto
					} 
				})
            }
            else
            {
            	agent.add(`${respuesta[2]} ${cedula}`)
            	agent.add(`${respuesta[3]}`)
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
		let contexto = context.parameters.contexto
		let respuesta
		var m = new means()
		if(contexto === 1)
		{
			respuesta = m.cancelar_reserva(contexto)
		}
		else if(contexto === 2)
		{
			respuesta = m.cancelar_reserva(contexto)
		}
		const estado = db.collection('reserva').doc(context.parameters.id);
    	return estado.update({
    		estado:'0'
    	})
		.then(doc => {
      		agent.add(`${respuesta[0]}`);
      		agent.add(`${respuesta[1]}`);
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
	intentMap.set('solicitud-reserva-1', solicitud_reserva);
	intentMap.set('solicitud-reserva-2', solicitud_reserva);
	intentMap.set('solicitud-reserva-1 - custom', solicitud_reserva_1);
	intentMap.set('solicitud-reserva-2 - custom', solicitud_reserva_1);
  	intentMap.set('solicitud-reserva - custom - custom', solicitud_reserva_2)
  	intentMap.set('solicitud-reserva - custom - custom - custom', solicitud_reserva_3)
  	intentMap.set('fechas', fechas)
	intentMap.set('datos reserva-1', datos_reserva)
	intentMap.set('datos reserva-1 - yes', servicios)
	intentMap.set('datos reserva-2 - yes', servicios)
	intentMap.set('consultar-reserva-1 - custom - yes', servicios)
	intentMap.set('consultar-reserva-2 - custom - yes', servicios)
	intentMap.set('consultar-reserva-1 - custom', consultar_reserva)
	intentMap.set('consultar-reserva-2 - custom', consultar_reserva)
	intentMap.set('cancelar-reserva-1 - yes - custom', consultar_reserva_cancelar)
	intentMap.set('cancelar-reserva-2 - yes - custom', consultar_reserva_cancelar)
	intentMap.set('cancelar-reserva-1 - yes - custom - no', servicios)
	intentMap.set('cancelar-reserva-2 - yes - custom - no', servicios)
	intentMap.set('cancelar-reserva-1 - yes - custom - yes', cancelar_reserva)
	intentMap.set('cancelar-reserva-2 - yes - custom - yes', cancelar_reserva)
	intentMap.set('cancelar-reserva-1 - yes - custom - yes - yes', servicios)
	intentMap.set('cancelar-reserva-2 - yes - custom - yes - yes', servicios)
  	agent.handleRequest(intentMap);
})