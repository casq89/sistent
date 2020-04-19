'use strict'

class Means
{
    solicitud_reserva(tipo)
    {
        let  respuesta = {}
        if(tipo === 1)
        {
            respuesta.respuesta_1 = [
				'Por supuesto estas son las ciudades que tenemos disponibles', 
				'Claro que si. Estas son las ciudades disponibles para reservar',
				'Por supuesto, tenemos nuestros hoteles en las siguientes ciudades:'
            ]
            
            respuesta.respuesta_2 = 'Por favor digame a que ciudad desea ir para mostrarle las habitaciones disponibles'
        }
        else if(tipo === 2)
        {
            respuesta.respuesta_1 = [
				'Pero por supuesto! a continuación te detallo las ciudades disponibles', 
				'Ok, ya mismo amigo(a), esta es la lista de las ciudades en las que estamos presentes:',
				'Por supuesto amigo(a), tenemos nuestros hoteles en las siguientes ciudades:'
            ]
            
            respuesta.respuesta_2 = 'Ahora cuentame, a qué ciudad quieres ir y acontinuación te enseñaré las habitaciones disponibles'
        }

        return respuesta
    }

    solicitud_reserva_1(tipo)
    {
        let  respuesta
        if(tipo === 1)
        {
            respuesta = [
                'Ok en la ciudad de', 
                'En cuál desea reservar',
                'Actualmente en la ciudad de',
                'no tenemos hoteles disponibles ofrecemos excusas'
            ]
        }
        else if(tipo === 2)
        {
            respuesta = [
                'Perfecto! en la bella ciudad de', 
                'Y entonces ¿Cuál deseas elegir?',
                'Lo siento pero en la ciudad de',
                'no tenemos hoteles disculpanos por favor'
            ]
        }

        return respuesta
    }

    solicitud_reserva_2(tipo)
    {
        let  respuesta
        if(tipo === 1)
        {
            respuesta = [
                'Ok tenemos las siguiente habitaciones:', 
                'Por favor elige una',
                'Lo sentimos no hay habitaciones habilitadas en',
                'Lo sentimos No encontramos habitaciones en este hotel'
            ]
        }
        else if(tipo === 2)
        {
            respuesta = [
                'Listo! tenemos estas cómodas habitaciones para ti:', 
                'Si estas interesado(a) por favor elige una',
                'Discúlpame pero no hay habitaciones disponibles en',
                'Discúlpame pero no encontramos habitaciones en este hotel'
            ]
        }

        return respuesta 
    }

    solicitud_reserva_3(tipo)
    {
        let  respuesta
        if(tipo === 1)
        {
            respuesta = [
                'Ok por favor dígame la fecha de ingreso y la fecha de salida para realizar la validación'
            ]
        }
        else if(tipo === 2)
        {
            respuesta = [
                'Listo! entonces dame la fecha de ingreso y la fecha de salida para validar la disponiblidad'
            ]
        }

        return respuesta 
    }

    fechas(tipo)
    {
        let  respuesta
        if(tipo === 1)
        {
            respuesta = [
                'Perfecto entonces le confirmo:',
                'Ahora necesito que por favor me proporcione los siguientes datos:',
                'Disculpe no entendí el rango de fechas, me podría repetir la fecha en un formato más entendible, por ejemplo "del 24 de Diciembre al 28 de Diciembre de 2020"'
            ]
        }
        else if(tipo === 2)
        {
            respuesta = [
                'Listo! entonces te confirmo!:',
                'Ahora lo que necesitamos es que me des los siguientes datos:',
                'Me podrías repetir el rango de fechas en un formato más entendible para mi, por ejemplo "del 24 de Diciembre al 28 de Diciembre de 2020"'
            ]
        }

        return respuesta 
    }

    consultar_reserva_info(tipo)
    {
        let  respuesta
        if(tipo === 1)
        {
            respuesta = [
                'Correcto! tiene una reserva', 
                '¿Le puedo ayudar en algo más?',
                'Disculpe pero no me registran reservas pendientes con el número de cédula:',
                'Por favor verifique si digitó incorrectamente la cédula. Si es el caso intentelo de nuevo'
            ]
        }
        else if(tipo === 2)
        {
            respuesta = [
                'Vale! efectivamente veo que tienes una reserva', 
                '¿Quieres que te ayude con algo más?',
                'Apreciado amigo(a) no me registran reservas con el número de cedula:',
                'Si quieres lo intentamos de nuevo y digitas la cédula otra vez'
            ]
        }

        return respuesta
    }
    cancelar_reserva_info(tipo)
    {
        let  respuesta
        if(tipo === 1)
        {
            respuesta = [
                'Efectivamente tiene una reserva', 
                '¿Esta seguro que desea cancelar esta reserva?',
                'Lo siento pero no me registran reservas activas con el número de cédula:',
                'Puede volver a intentarlo si visualiza que hubo un error de digitación'
            ]
        }
        else if(tipo === 2)
        {
            respuesta = [
                'Oh veo que si tienes una reserva!', 
                '¿De verdad quieres que cancele tu reserva?',
                'Amigo(a) no me registran reservas con el número de cedula:',
                'Puedes volver a escribir el número de cédula si ves que te equivocaste'
            ]
        }

        return respuesta
    }

    cancelar_reserva(tipo)
    {
        let  respuesta
        if(tipo === 1)
        {
            respuesta = [
                'Ok, su reserva ha sido cancelada exitosamente', 
                '¿Le puedo ayudar en algo más?'
            ]
        }
        else if(tipo === 2)
        {
            respuesta = [
                'Listo! ya te he cancelado la reserva', 
                '¿Te puedo ayudar con otra cosa?'
            ]
        }

        return respuesta
    }

    ofrecer_servicios(tipo)
    {
        let  respuesta
        if(tipo === 1)
        {
            respuesta = [
                'Ok, recuerde que  le puedo ayudar con lo siguiente:'
            ]
        }
        else if(tipo === 2)
        {
            respuesta = [
                'Vale! recuerda que te puedo ayudar con lo siguiente:', 
            ]
        }

        return respuesta
    }
}

module.exports = Means