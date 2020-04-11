window.onload = function(){

	var d = document	
	eventoIcono(d)
}

function addHotel()
{
	document.getElementById('habitaciones').innerHTML =  ''
	document.getElementById('habitacion_nueva').classList.add('ocultar')
	document.getElementById('hotel').classList.remove('col-6') 
	document.getElementById('hotel').classList.add('col-12')
	document.getElementById('detail_hotel').reset() 
	document.getElementById('detail_hotel').id.value = '' 

}

function focusImagen(event, flag, key)
{
	if(flag)
	{
		document.getElementById('img_' + key).src = event.target.value
	}
}


function validarCiudad(event)
{
	shoWLoading()
	let nombre = document.getElementById('nombre').value
	let departamento = document.getElementById('departamento').value
	let estado = document.getElementById('estado').value
	let imagen = document.getElementById('imagen').value

	if(!nombre || !departamento || !estado || !imagen)
	{
		showMsg("debes llenar todos los datos de la Ciudad", '#DC4A4A')
		event.stopPropagation()
		event.preventDefault()
		hideLoading()
	}
}

function validarReserva(event)
{
	shoWLoading()
	let id = document.getElementById('id').value 
	let cedula = document.getElementById('cedula').value 
	let nombre_completo = document.getElementById('nombre_completo').value 
	let telefono = document.getElementById('telefono').value 
	let ciudad = document.getElementById('ciudad').value 
	let hotel = document.getElementById('hotel').value 
	let habitacion = document.getElementById('habitacion').value 
	let numero_personas = document.getElementById('numero_personas').value 
	let fecha_ingreso = document.getElementById('fecha_ingreso').value 
	let fecha_salida = document.getElementById('fecha_salida').value 
	let estado = document.getElementById('estado').value 

	if(!id || !cedula || !nombre_completo || !telefono || !ciudad || !hotel ||!habitacion || !numero_personas ||!fecha_ingreso ||!fecha_salida || !estado)
	{
		showMsg("debes llenar todos los datos de la reserva", '#DC4A4A')
		event.stopPropagation()
		event.preventDefault()
		hideLoading()
	}

	if(parseInt(numero_personas) > 10)
	{
		showMsg("El número de personas debe ser menor o igual a 10", '#DC4A4A')
		event.stopPropagation()
		event.preventDefault()
		hideLoading()

	}
}

function validarHotel(event)
{
	if(event)
	{
		shoWLoading()
		let form_hotel = document.getElementById('detail_hotel')

		if(!validateForm(form_hotel,1, 1))
		{
			event.preventDefault()
			event.stopPropagation()
		 	showMsg("Si vas a Guardar el Hotel Todos los campos son obligatorios", "#DC4A4A")
		 	hideLoading()
		 	return false
		}

		if(form_hotel.id.value)
		{
			event.preventDefault()
			event.stopPropagation()

			let imagen = form_hotel.imagen.value
			
			const hotel = new URLSearchParams(`id=${form_hotel.id.value}&nombre=${form_hotel.nombre.value}&ciudad=${form_hotel.ciudad.value}&imagen=${imagen.replace('%2F','*')}&site=${form_hotel.site.value}&estado=${form_hotel.estado.value}`);

			saveHotelAjax(hotel, baseUrl).then(function(data){
				hideLoading()
				if(data == true)
				{
					showMsg(`La habitación ${form_hotel.nombre.value} ha sido  Actualizado correctamente`, "#78C363")
				}
				else
				{
					showMsg("Error, no se ha podido Actualizar la habitación", "#DC4A4A")
				}
			})
		}
		

	}
}

function setHotel(id)
{
	shoWLoading()
	document.getElementById('habitacion_nueva').classList.remove('ocultar')
	document.getElementById('hotel').classList.remove('col-12') 
	document.getElementById('hotel').classList.add('col-6') 
	getHotel(id, baseUrl).then(function(data){
		setValoresHotel(data[0],id)
	})
}

function setValoresHotel(data,id)
{
	document.getElementById('id').value = id
	document.getElementById('nombre').value = data.nombre
	document.getElementById('ciudad').value = data.ciudad
	document.getElementById('site').value = data.site
	document.getElementById('imagen').value = data.imagen
	document.getElementById('estado').value = data.estado

	var html = ''
	if(data.habitaciones.length)
	{
		for(key in data.habitaciones)
		{

			html += createHabitacion(data.habitaciones[key], key)
		}

		document.getElementById('habitaciones').innerHTML = html

		for(key in data.habitaciones)
		{
			setSelects(data.habitaciones[key], key)
		}
		focusImagen(null, null, null)
		validarHotel(null)
		saveHabitacion(null, null)
		deleteHabitacion(null, null, null)
		updateHabitacion(null, null, null)
	}
	else
	{
		html = '<div  class="col-12"><center><p>Actualmente no hay habitaciones registradas para este hotel</p></center></div>'
		document.getElementById('habitaciones').innerHTML = html
	}
	hideLoading()
}

function createHabitacion(habitacion, key)
{

	let html = `
	<div class="col-6">
		<form  method="POST" action="#" id="habitacion_${key}" >
			<div class="row justify-content-center align-items-center">
			<div class="col-10 center bg-dark-h mb-1 habitacion">
			Habitacion ${habitacion.nombre}
			</div>
				<div class="col-3">
					<center>
						<img src="${habitacion.imagen}" id="img_${key}" width="70">
					</center>
				</div>
				<div class="col-7 form-group">
					<label for="imagen_habitacion_${key}">Imagen</label>
					<textarea rows="3" onfocusout="focusImagen(event, 1, '${key}')" class="form-control form-control-textarea" id="imagen_habitacion_${key}" name ="imagen_habitacion_${key}" placeholder="imagen habitación" ></textarea>
				</div>
				
				<div class="col-3">
					<label for="numero_habitacion_${key}">Nº habitación</label>
					<input type="text" class="form-control" id="numero_habitacion_${key}" name ="numero_habitacion_${key}" placeholder="numero habitacion" value="${habitacion.nombre}">
				</div>
				<div class="col-3">
					<label for="capacidad_${key}">Capacidad</label>
					<input type="text" class="form-control" id="capacidad_${key}" name ="capacidad_${key}" placeholder="capacidad" value="${habitacion.capacidad}" onkeypress="return valida(event)" maxlength="2">
				</div>
				<div class="col-4">
					<label for="tipo_${key}">Tipo</label>
					<select class="form-control" id="tipo_${key}" name="tipo_${key}">
						<option value="">Seleccione..</option>
						<option value="a">A</option>
						<option value="b">B</option>
						<option value="c">C</option>
					</select>
				</div>
				
				<div class="col-3">
					<label for="precio_${key}">Precio</label>
					<input type="text" class="form-control" id="precio_${key}" name ="precio_${key}" placeholder="precio" value="${habitacion.precio}" onkeypress="return valida(event)" maxlength="8">
				</div>
				<div class="col-3">
					<label for="fecha_ult_reserva_${key}">Fecha última reserva</label>
					<input type="text" class="form-control" id="fecha_ult_reserva_${key}" name ="fecha_ult_reserva_${key}" readOnly="true"  placeholder="fecha ultima reserva" value="${habitacion.fecha_ult_reserva}">
				</div>
				<div class="col-4">
				<label for="estado_${key}">Estado</label>
					<select class="form-control" id="estado_${key}" name="estado_${key}">
						<option value="">Seleccione..</option>
						<option value="1">Activo</option>
						<option value="0">Inactivo</option>
					</select>
				</div>
				<div class="form-group col-10 center mt-3">
			  		<center>
			  			<button class="btn btn-danger" onclick="deleteHabitacion(1, event, ${key})">Eliminar</button>
			  			<button class="btn bg-dark-h" onclick="updateHabitacion(1, event, ${key})">Actualizar</button>
			  		</center>
				</div>
			</div>
		</form>
	</div>`

	return html
}

function updateHabitacion(flag, event, key)
{
	if(flag)
	{
		event.stopPropagation()
		event.preventDefault()
		shoWLoading()
		let id = document.getElementById('id').value
		let form_habitacion = document.getElementById('habitacion_' + key)

		if(!validateForm(form_habitacion, 0, 2))
		{
		 	showMsg("Si vas a Actualizar una habitación Todos los campos son obligatorios", "#DC4A4A")
		 	hideLoading()
		 	return false
		}

		let imagen = form_habitacion[0].value

		const nueva_habitacion = new URLSearchParams(`id=${id}&capacidad=${form_habitacion[2].value}&estado=${form_habitacion[6].value}&fecha_ult_reserva=${form_habitacion[5].value}&imagen=${imagen.replace('%2F','*')}&nombre=${form_habitacion[1].value}&precio=${form_habitacion[4].value}&tipo=${form_habitacion[3].value}&key=${key}`);

		saveHabitacionAjax(nueva_habitacion, baseUrl).then(function(data){
			hideLoading()
			if(data == true)
			{
				setHotel(id)
				showMsg(`La habitación ${form_habitacion[2].value} ha sido  Actualizada correctamente`, "#78C363")
			}
			else
			{
				showMsg("Error, no se ha podido Actualizar la habitación", "#DC4A4A")
			}
		})
	}
}

function deleteHabitacion(flag, event, key)
{
	if(flag)
	{
		event.stopPropagation()
		event.preventDefault()
		swal({
        title: "¿Estas seguro que deseas Eliminar esta habitación?",
        text: "",
        icon: "warning",
        buttons: ["No", "Si"],
        confirmButtonText: "Si",
        dangerMode: true,
	    })
	    .then((res) =>{
	        if (res) 
	        {
	            shoWLoading()
				let id = document.getElementById('id').value
				const habitacion_down = new URLSearchParams(`id=${id}&key=${key}`);

				deleteHabitacionAjax(habitacion_down, baseUrl).then(function(data){
					// console.log(data)
					if(data == true)
					{
						setHotel(id)
						showMsg(`La habitación ha sido  Eliminada correctamente`, "#78C363")
					}
					else
					{
						showMsg("Error, no se ha podido guadar la nueva habitación", "#DC4A4A")
						hideLoading()
					}
				})
	        } 

	    });
		
	}
}

function saveHabitacion(flag, event)
{
	if(flag)
	{
		shoWLoading()
		event.stopPropagation()
		event.preventDefault()
		let id = document.getElementById('id').value
		let form_habitacion_nueva = document.getElementById('habitacion_nueva')

		 if(!validateForm(form_habitacion_nueva, 0, 1))
		 {
		 	showMsg("Si vas a agregar una nueva habitación Todos los campos son obligatorios", "#DC4A4A")
		 	hideLoading()
		 	return false
		 }
		
		 let imagen = form_habitacion_nueva.imagen_habitacion_nueva.value

		const nueva_habitacion = new URLSearchParams(`id=${id}&capacidad=${form_habitacion_nueva.capacidad_nueva.value}&estado=${form_habitacion_nueva.estado_nueva.value}&fecha_ult_reserva=-&imagen=${imagen.replace('%2F','*')}&nombre=${form_habitacion_nueva.numero_habitacion_nueva.value}&precio=${form_habitacion_nueva.precio_nueva.value}&tipo=${form_habitacion_nueva.tipo_nueva.value}&key=false`);

		saveHabitacionAjax(nueva_habitacion, baseUrl).then(function(data){
			hideLoading()
			if(data == true)
			{
				setHotel(id)
				showMsg(`La habitación ${form_habitacion_nueva.capacidad_nueva.value} ha sido  añadida correctamente`, "#78C363")
				document.getElementById('habitacion_nueva').reset()
				document.getElementById('img_nueva').href= ''
			}
			else
			{
				showMsg("Error, no se ha podido guadar la nueva habitación", "#DC4A4A")
			}
		})
	}
}

function validateForm(form, inicio, index)
{
	let resultado = true
	for(i = inicio ; i < form.length - index ; i++)
	{
		if(!form[i].value)
		{
			form[i].classList.add('validate')
			resultado =  false
		}
		else
		{
			form[i].classList.remove('validate')
		}
	}

	return resultado
}

function Error(elemento)
{
	elemento.classList.add('validate')
	elemento.focus()
}

async function saveHotelAjax(data, baseUrl)
{
	let response = await fetch(baseUrl + '/add_hotel', {method: "POST", body:data});
    let datos =  response.json()
    return datos
}

async function saveHabitacionAjax(data, baseUrl)
{
	let response = await fetch(baseUrl + '/add_habitacion', {method: "POST", body:data});
    let datos =  response.json()
    return datos
}

async function deleteHabitacionAjax(data, baseUrl)
{
	let response = await fetch(baseUrl + '/delete_habitacion', {method: "POST", body:data});
    let datos =  response.json()
    return datos
}

function setSelects(habitacion, key)
{
	document.getElementById('tipo_' + key).value = habitacion.tipo
	document.getElementById('estado_' + key).value = habitacion.estado
	document.getElementById('imagen_habitacion_' + key).value = habitacion.imagen
}

async function getHotel(id, baseUrl)
{
    let response = await fetch(baseUrl + '/detail_hotel/' + id, {method: "GET"});
    let datos =  response.json()
    return datos
}

function setReserva(id, cedula, nombre_completo, telefono, ciudad, hotel,habitacion, numero_personas,fecha_ingreso,fecha_salida,estado)
{
	shoWLoading()
	document.getElementById('id').value = id
	document.getElementById('cedula').value = cedula
	document.getElementById('nombre_completo').value = nombre_completo
	document.getElementById('telefono').value = telefono
	document.getElementById('ciudad').value = ciudad
	document.getElementById('habitacion').value = habitacion
	document.getElementById('numero_personas').value = numero_personas
	document.getElementById('fecha_ingreso').value = fecha_ingreso
	document.getElementById('fecha_salida').value = fecha_salida
	document.getElementById('estado').value = estado

	getHotelByCiudad(ciudad, baseUrl).then(function(data){
		setSelectHotelsByCiudad(data)
		hideLoading()
	})

}

function setSelectHoteles(event)
{
	shoWLoading()
	getHotelByCiudad(event.target.value, baseUrl).then(function(data){
		setSelectHotelsByCiudad(data)
		hideLoading()
	})
}

function setSelectHotelsByCiudad(data)
{
	let hotel = document.getElementById('hotel')
	let html = ''
	if(data.length > 0)
	{
		// console.log(data)
		for(key in data)
		{
			html += `<option value="${data[key].clave}">${data[key].valor}</option>`
		}
	}
	else
	{
		html += `<option value="no disponible">No hay hotel Para esta ciudad</option>`
	}

	hotel.innerHTML = html
}

async function getHotelByCiudad(ciudad, baseUrl)
{
	if(ciudad)
	{

		let response = await fetch(baseUrl + '/hotels_ciudad/' + ciudad, {method: "GET"});
	    let datos =  response.json()
	    return datos
	}
	else
	{
		return false
	}
}


function eventoIcono(d)
{
	var iconos =d.querySelectorAll('.icono-menu')

	for(var n =0; n <  iconos.length; n++)
	{
		iconos[n].addEventListener('click', clickIcono, true)
	}
}

function clickIcono(event)
{
	var resultado = event.target.classList
	var rigth = false
	for(res  in resultado)
	{
		if(resultado[res] == "fa-angle-right")
		{
			rigth = true
		}
	}

	if(rigth)
	{
		event.target.classList.remove('fa-angle-right')
		event.target.classList.add('fa-angle-down')
	}
	else
	{
		event.target.classList.remove('fa-angle-down')
		event.target.classList.add('fa-angle-right')
	}
}


function valida(e)
{
	if(e)
	{
	    tecla = (document.all) ? e.keyCode : e.which;
		//Tecla de retroceso para borrar, siempre la permite
		if (tecla==8){
		    return true;
		}     
		// Patron de entrada, en este caso solo acepta numeros
		patron =/[0-9]/;
		tecla_final = String.fromCharCode(tecla);
		return patron.test(tecla_final);
	}
}

function showMsg(msg, color)
{
	var toast = new iqwerty.toast.Toast();
        toast
        .setText(msg)
        .setDuration(3000)
        .stylize({
            background: color,
            color: 'white',
            'box-shadow': '0 0 50px rgba(0, 0, 0, .7)'
        })
        .show();
}

function shoWLoading()
{
	document.getElementById("loader").style.display = "block"
	document.getElementById("loader-modal").style.display = "block"
	
}

function hideLoading() 
{
	document.getElementById("loader").style.display = "none"
	document.getElementById("loader-modal").style.display = "none"
}