//server location: https://best-camper-layouts-server.onrender.com/campers
//dev server: http://localhost:3000/campers
const serverURL = "https://best-camper-layouts-server.onrender.com/campers"

//global js variables
const campers = []
const filters = {}
let activeCamper
let upVote = false
let downVote = false

//global document element variables
const form = document.getElementById("filter")

/* * * * * * * * * * * * * *
 *                         *
 * Functions               *
 *                         *
 * * * * * * * * * * * * * */

//runs initial fetch to retrieve camper data from server
const fetchCampers = () => {
    fetch(serverURL)
    .then(resp => resp.json())
    .then(data => {
        campers.splice(0,0,...data)
        renderCampers(data)
    })
    .catch(error =>{
        alert("Oh noes! Something went wrong!")
        console.log(error)
    })
}
//shows list & thumbnails of campers in the thumbail pane
const renderCampers = (campers) => {
    const camper_thumbs = document.getElementById("camper_thumbs")
    camper_thumbs.textContent = ""
    if(campers.length === 0){
        camper_thumbs.innerHTML = "<h3>Whoops! No campers found!</h3>"
    }
    campers.forEach(element => {
        const newDiv = document.createElement('div')
        newDiv.classList.add("camperThumbDiv")
        newDiv.addEventListener("click",() => displayCamper(element))

        const camperImg = document.createElement('img')
        camperImg.src = element.layoutPic
        camperImg.alt = element.manufacturer + " " + element.line + " " + element.model
        camperImg.classList.add("camperThumb")

        const label = document.createElement('h5')
        label.textContent = element.line + " " + element.model

        newDiv.append(camperImg)
        newDiv.append(label)
        camper_thumbs.append(newDiv)
    });
}
//initial call upon page load
fetchCampers()


/* checks whether user has already upvoted or downvoted in the current session and 
 * adjusts vote counts appropriately before updating server and calling for a screen 
 * update. */
const updateVotes = (vote) => {
    if(vote===1){
        switch(true){
            case upVote:
                upvote = false
                activeCamper.upVotes--
                break
            case downVote:
                downVote = false
                upvote = true
                activeCamper.upVotes++
                activeCamper.downVotes--
                break
            default:
                upVote = true
                activeCamper.upVotes++
        }
    } else {
        switch(true){
            case upVote:
                upvote = false
                activeCamper.upVotes--
                downVote = true
                activeCamper.downVotes++
                break
            case downVote:
                downVote = false
                activeCamper.downVotes--
                break
            default:
                downVote = true
                activeCamper.downVotes++
        }
    }
    fetch(`https://best-camper-layouts-server.onrender.com/campers/${activeCamper}`,{
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            'upVotes' : activeCamper.upVotes,
            'downVotes' : activeCamper.downVotes
        }
    })
    .then(resp => resp.json())
    .then(camper => {
        activeCamper = camper
        displayCamper(activeCamper)
    })
}

//displays a single camper and its slideshow in the details pane
const displayCamper = (camper) => {
    activeCamper = camper
    const longName = `The ${camper.manufacturer} ${camper.line} ${camper.model}`
    document.getElementById("camperName").textContent = longName
    document.getElementById("detailLayout").src = camper.layoutPic
    document.getElementById("manufacturer").textContent = camper.manufacturer
    document.getElementById("line").textContent = camper.line
    document.getElementById("model").textContent = camper.model
    document.getElementById("slides").textContent = camper.slides
    document.getElementById("length").textContent = camper.length
    slideShow(camper,longName)
}

//sets up slideshow in detail pane
const slideShow = (camper,longName) => {
    const slides = camper.slideShowPics
    let index = 0

    displaySlide(slides[index],longName)

    document.getElementById("previous").addEventListener("click",()=>{
        if(index>0)
            index--
        else
            index=slides.length-1
        displaySlide(slides[index],longName)
    })
    document.getElementById("next").addEventListener("click",()=>{
        if(index<slides.length-1)
            index++
        else
            index=0
        displaySlide(slides[index],longName)
    })
}

//displays a single slideshow slide in the detail pane
const displaySlide = (slide,longName) =>{
    const title = `Image of ${longName} ${slide.alt}`
    const currentSlide = document.getElementById("currentSlide")
    currentSlide.classList.add("hidden")
    currentSlide.src = slide.src
    currentSlide.alt = title
    currentSlide.title = title
    currentSlide.classList.remove("hidden")
}

//updates display lable and filter parameter when user interacts with "filter by length" range slider
const setFilterLength = () => {
    const range = document.querySelector('#lengthFil')
    const rangeLbl = document.querySelector("label[for=lengthFil]")
    rangeLbl.textContent = range.value
    filters.length = parseInt(range.value)
    applyFilters()
}

//applies filters and calls renderCampers function with filtered down array
const applyFilters = () => {
    let filteredArray = campers
    if(filters.keyWord)
    {
        filteredArray = filteredArray.filter(camper =>
            (
                camper.manufacturer.toLowerCase().includes(filters.keyWord) ||
                camper.line.toLowerCase().includes(filters.keyWord) ||
                camper.model.toLowerCase().includes(filters.keyWord)
            )
        )
    }
    if(filters.length)
    {
        filteredArray = filteredArray.filter(camper =>
            (
                camper.length >= filters.length-2 &&
                camper.length <= filters.length+2
            )
        )
    }
    if(filters.slides)
    {
        filteredArray = filteredArray.filter(camper => camper.slides == filters.slides)
    }
    renderCampers(filteredArray)
}

/* * * * * * * * * * * * * *
 *                         *
 * Event Listeners         *
 *                         *
 * * * * * * * * * * * * * */


//detects and interprets clicks in the form area to create interactivity
form.addEventListener("click",e=>{
    switch(e.target){
        case form.fbLength:
            const lengthDiv = document.getElementById("lengthDiv")
            if(form.fbLength.checked){
                lengthDiv.classList.remove("hidden")
                setFilterLength()
            } else {
                lengthDiv.classList.add("hidden")
                filters.length = null
            }
            break
        case form.fbSlides:
            const slidesDiv = document.getElementById("slidesDiv")
            if(form.fbSlides.checked){
                slidesDiv.classList.remove('hidden')
                filters.slides = form.slidesFil.value
            } else {
                slidesDiv.classList.add('hidden')
                filters.slides = null
            }
            break
    }
    applyFilters()
})

//detects typing in search box and sets keyword filter parameter
form.search.addEventListener("keyup",e=>{
    filters.keyWord = form.search.value.toLowerCase()
    applyFilters()
})

//detects sliding of camper length selector and calls function to set filter parameter
form.lengthFil.addEventListener("input",()=>setFilterLength())

/* detects clicks in slide number selection area and updates slide number filter
 * parameter */
document.getElementById('slidesDiv').addEventListener('click',()=>filters.slides = form.slidesFil.value)

//prevents page refresh on form submit
form.addEventListener('submit',e=>e.preventDefault())