
var config = {
    apiKey: "AIzaSyCxkcHFOJzK8OE6lx07vL6S513tCuAQycI",
    authDomain: "sea-bot-yybfat.firebaseapp.com",
    databaseURL: "https://sea-bot-yybfat.firebaseio.com",
    projectId: "sea-bot-yybfat",
    storageBucket: "sea-bot-yybfat.appspot.com",
    messagingSenderId: "1097231524206",
    appId: "1:1097231524206:web:1173832d8d53891f4c617f"
    };

firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function(user){
    if (user) 
    {
        var displayName = user.displayName;
        var emailUser = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        let usuario_login = document.getElementById('usuario-sigin')
        if(usuario_login)
        {
            usuario_login.innerText = emailUser
        }
    } 
    else 
    {
        let header = document.getElementById('header')
        let main = document.getElementById('main')

        if(header && main)
        {
            document.getElementById('content').innerHTML = unAuthorized()
        }
    }
})

function login(event)
{
    event.preventDefault()
    event.stopPropagation()
    shoWLoading()
    let form_login = document.getElementById('login-form')
    if(!validateForm(form_login,0, 1))
    {
        showMsg("Todos los campos son requeridos", "#DC4A4A")
        hideLoading()
        return false
    }
    else
    {
        firebase.auth().signInWithEmailAndPassword(form_login.email.value, form_login.password.value)
            .then(e =>{
                location.assign(baseUrl + "/index")
            })
            .catch( (e) =>{
                hideLoading()
                showMsg(e.message, "#DC4A4A")
            }) 
    }
}

function logout(event)
{
    shoWLoading()
    firebase.auth().signOut()
        .then(function(){
            location.assign(baseUrl + "/login")
        })
        .catch(e => showMsg(e.message,"#DC4A4A"))
}

function unAuthorized()
{
    return `
        <style>
            body 
            {
              margin: 0;
              padding: 0;
              background-color:rgba(23, 162, 184, 0.8);
              height: 100vh;
            }

        </style>
        <div class="row justify-content-center align-items-center mt-5 pt-5">
            <div class="col-12 text-center">
                <img src="/images/logo.png" height="100">
            </div>
            <div class="col-12 text-center text-white">
                <h2>Pagina No autorizada</h2>
            </div>
        </div>
    `
}

function toogleChat(event)
{
    event.preventDefault()
    event.stopPropagation()
    let chat = document.getElementById('chat')
    let icon_chat = document.getElementById('icono-chat')
    let load = document.getElementById('load')

    console.log(chat.style.height)
    if(chat.style.height == '460px')
    {
        chat.style.height = '48px'
        icon_chat.style.display = 'block'
        load.style.display = 'block'

    }
    else if(chat.style.height == '')
    {
        chat.style.height = '460px'
        icon_chat.style.display = 'none'
        load.style.display = 'none'
    }
    else if(chat.style.height == '48px')
    {
        chat.style.height = '460px'
        icon_chat.style.display = 'none'
        load.style.display = 'none'
    }
}

let form =  document.getElementById('send')
if(form)
{
    form.addEventListener('submit', setMessage)
}

function setMessage(event)
{
    if(event)
    {
        event.preventDefault()
        event.stopPropagation()
        let texto = document.getElementById('texto').value
        if(texto.trim())
        {
            document.getElementById('texto').value = null
            saveMessage(texto)
        }
    }
}


function saveMessage(texto)
{
    showType()
    getResponse(texto).then((data) =>{
        // console.log(data)
        setResponse(data)
    }).catch((error) =>{
        console.error('Error:', error)
    })
    
    html = `
    <div class="mensaje">
    <div class="mensaje-out">${texto}</div>
    <div class="mensaje-fecha-out">${getHora()}</div>
    </div>
    `
    append(html)
}

function setResponse(queryResult)
{
    let orquestador = getMensajesByTipo(queryResult.fulfillmentMessages)
    // console.log(orquestador)
    let contador = 0
    for(key in orquestador)
    {
        switch(String(Object.keys(orquestador[key])))
        {
            case 'texto':
                fin = parseInt(orquestador[key].texto,10) + contador
                setResponseText(queryResult.fulfillmentMessages, contador, fin)
                contador = fin
                break;
            case 'card':
                fin = parseInt(orquestador[key].card,10) + contador
                setResponseSlider(queryResult.fulfillmentMessages, contador, fin)
                contador = fin
                break;
            case 'quickReplies':
                fin = parseInt(orquestador[key].quickReplies,10) + contador
                setResponseQuickButton(queryResult.fulfillmentMessages, contador, fin)
                contador = fin
                break;
        }
    }
    hideType()
    setTimeout(function(){
        $('#chat-body').scrollTop( $('#chat-body').prop('scrollHeight') );
    }, 1000)
}

function setResponseText(objeto, inicio, fin)
{
    for(i = inicio; i < fin ; i ++)
    {
        html =`
            <div class="mensaje">
                <div class="mensaje-in-logo mr-2"><img src="/images/favicon.png" width="40" data-toggle="tooltip" title="Sisten chat" /></div>
                <div class="mensaje-in">${objeto[i].text.text[0]}</div>
                <div class="mensaje-fecha-in">${getHora()}</div>
            </div>
         `
        append(html)
    }
}


function setResponseSlider(objeto, inicio, fin)
{
    // console.log(inicio, fin)
    let num_slider = document.querySelectorAll('.slideshow-container').length + 1
    let html = `<div class="mensaje s_${num_slider} contador="1"><div class="slideshow-container">`
    let contador = 1
    for(i = inicio; i <  fin; i ++)
    {
            html += `
                <div class="mySlides fade-slider">
                    <div class="numbertext">${contador} / ${(fin -inicio)}</div>
                    <img src="${objeto[i].card.imageUri}" style="width:100%">
                    <div class="text" onclick="responseSlider(event)" data-toggle="tooltip" title="Click para enviar respuesta">${objeto[i].card.title}</div>
                </div>
            `
            contador += 1
    }
    html += `<a class="prev" onclick="plusSlides(-1, ${num_slider})">&#10094;</a><a class="next" onclick="plusSlides(1, ${num_slider})">&#10095;</a></div><div id="controls" >`
    
    contador =  1
    for(i = inicio; i < fin; i ++)
    {
        html += `<span class="dot" onclick="currentSlide(${contador}, ${num_slider})"></span>`
        contador += 1
    }
    html += `</div></div>`

    append(html)
    plusSlides(null, null)
    currentSlide(null, null)
    showSlidesIni(null)
    showSlides(null,null,null)
    responseSlider(null)
    setMessage(null)
    toolTip()
    showSlidesIni(1)   
      
}

function setResponseQuickButton(objeto, inicio, fin)
{
    
    for(i = inicio; i <  fin; i ++)
    {
        html = `<div class="mensaje"><div class="row justify-content-center align-items-center">`
        for(j = 0; j <  objeto[i].quickReplies.quickReplies.length; j ++)
        {
            html += `<button class="quickButton" onclick="responseSlider(event)" data-toggle="tooltip" title="Click para enviar respuesta">${objeto[i].quickReplies.quickReplies[j]}</button>`
        }

        html += ` </div></div>`
        append(html)
        toolTip()
        setMessage(null)
    }

}

function responseSlider(event)
{
    if(event)
    {
        saveMessage(event.target.textContent)
    }
}
async function getResponse(texto)
{
    let url = 'https://us-central1-sea-bot-yybfat.cloudfunctions.net/dialogflowGateway';
    datos = {
        "sessionId":sessionId,
        "queryInput":{
            "text":{
                "text":texto,
                "languageCode":"es"  
            }
        }
    }
    let response = await fetch(url, {
        method: "POST", 
        body: JSON.stringify(datos), 
        headers:{
            'Content-Type': 'application/json'
        }
    });
    return response.json()
    
}
    
function append(html)
{
    $('#chat-body').append(html)
    downScroll(1) 
}

function getHora()
{
    momentoActual = new Date()
    hora = String(momentoActual.getHours())
    minuto = String(momentoActual.getMinutes())

    horaImprimible = hora + ":" + minuto 

    return horaImprimible
}

function getMensajesByTipo(objeto)
{
    var arreglo =[]
    var texto =1
    var card =1
    var quickreplies = 1 

    for(key in objeto)
    {
        if(key == 0)
        {
            if(Object.keys(objeto[key]).find(element => element == 'text'))
            {
                arreglo.push({"texto":1})  
                texto = 0
            }
            else if(Object.keys(objeto[key]).find(element => element == 'card'))
            {
                arreglo.push({"card":1})  
                card = 0
            }
            else if(Object.keys(objeto[key]).find(element => element == 'quickReplies'))
            {
                arreglo.push({"quickReplies":1})  
                quickreplies = 0
            }
        }
        else
        {
            if(Object.keys(objeto[key]).find(element => element == 'text'))
            {
                if(texto == 0)
                    {
                        contador = arreglo[arreglo.length -1].texto
                        arreglo[arreglo.length -1].texto = contador + 1
                    }
                    else
                    {
                        arreglo.push({"texto":1}) 
                    }
                    texto = 0
                    card = 1
                    quickreplies = 1
            }
            else if(Object.keys(objeto[key]).find(element => element == 'card'))
            {
                if(card == 0)
                {
                    contador = arreglo[arreglo.length -1].card
                    arreglo[arreglo.length -1].card = contador + 1
                }
                else
                {
                    arreglo.push({"card":1})
                }
                card = 0
                texto = 1
                quickreplies = 1
            }
            else if(Object.keys(objeto[key]).find(element => element == 'quickReplies'))
            {
                if(quickreplies == 0)
                {
                    contador = arreglo[arreglo.length -1].quickReplies
                    arreglo[arreglo.length -1].quickReplies = contador + 1
                }
                else
                {
                    arreglo.push({"quickReplies":1})
                }
                quickreplies = 0
                card = 1
                texto = 1
            }
        }      
    }
    return arreglo
}

////SLIDER CHAT
showSlidesIni(1);
function plusSlides(n, num_slider) 
{
    if(n != null)
    {
      let selectedIndex = parseInt(document.querySelector('.s_'+num_slider).getAttribute('contador'))
      showSlides(selectedIndex += n, num_slider, selectedIndex);
    }
}

function currentSlide(n, num_slider) 
{
  if(n != null)
  {

      let selectedIndex = parseInt(document.querySelector('.s_'+num_slider).getAttribute('contador'))
      showSlides(selectedIndex, num_slider, n);
  }
}

function showSlides(n, num_slider, selectedIndex)
{
    if(n != null)
    {
        let i;
        let slides = document.querySelectorAll(".s_" + num_slider + " .mySlides");
        let dots = document.querySelectorAll(".s_" + num_slider + " .dot");
        
        // console.log(selectedIndex)
        if (n > slides.length) 
        {
            selectedIndex = 1
        }
        
        if (n < 1) 
        {
            selectedIndex = slides.length
            
        }
        for (i = 0; i < slides.length; i++) 
        {
            slides[i].style.display = "none";
        }
        
        for (i = 0; i < dots.length; i++) 
        {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        
        slides[selectedIndex-1].style.display = "block";
        dots[selectedIndex-1].className += " active";
        document.querySelector('.s_'+num_slider).setAttribute('contador', selectedIndex)
    }
}
    
function showSlidesIni(n) 
{
    if(n != null)
    {

        let i;
        
        for(j = 1; j <= document.querySelectorAll('.slideshow-container').length; j++)
        {
            selectedIndex = 1
            var slides = document.querySelectorAll(".s_"+j+" .mySlides");
            var dots = document.querySelectorAll(".s_"+j+" .dot");
            
            if (n > slides.length) 
            {
                selectedIndex = 1
            }
            
            if (n < 1) 
            {
                selectedIndex = slides.length
            }
            
            for (i = 0; i < slides.length; i++) 
            {
                slides[i].style.display = "none";
            }
            
            for (i = 0; i < dots.length; i++) 
            {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            
            slides[selectedIndex-1].style.display = "block";
            dots[selectedIndex-1].className += " active";
            document.querySelector('.s_' + j).setAttribute('contador', selectedIndex)
        }
    }
}
////FIN SLIDER

function toolTip()
{
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
  })
}

function showType()
{
    document.getElementById('typing').classList.add('actives')
}

function hideType()
{
    document.getElementById('typing').classList.remove('actives')
}

function downScroll(flag)
{
    if(flag)
    {
        $('#chat-body').scrollTop( $('#chat-body').prop('scrollHeight') );
    }
}



