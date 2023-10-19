//server location: https://best-camper-layouts-server.onrender.com/campers
//dev server: http://localhost:3000/campers
const serverURL = "https://best-camper-layouts-server.onrender.com/campers"

//global js variables
const campers = []
const filters = {}
let activeCamper

//upvote/downvote image urls
const grayUp = "https://raw.githubusercontent.com/jackh404/best-camper-layouts/main/local/thumbUpGray.png"
const grayDn = "https://raw.githubusercontent.com/jackh404/best-camper-layouts/main/local/thumbDownGray.png"
const greenUp = "https://raw.githubusercontent.com/jackh404/best-camper-layouts/main/local/thumbUpGreen.png"
const redDn = "https://raw.githubusercontent.com/jackh404/best-camper-layouts/main/local/thumbDownRed.png"

//global document element variables
const form = document.getElementById("filter")

/* * * * * * * * * * * * * *
 *                         *
 *        Functions        *
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
        newDiv.addEventListener("click", e => displayCamper(e,element))

        const camperImg = document.createElement('img')
        camperImg.src = element.layoutPic
        camperImg.alt = element.manufacturer + " " + element.line + " " + element.model
        camperImg.classList.add("camperThumb")

        const label = document.createElement('h5')
        label.textContent = element.line + " " + element.model

        newDiv.append(camperImg)
        newDiv.append(label)
        camper_thumbs.append(newDiv)
        if(element!=campers[0])
            newDiv.classList.add('divider')
    })
}

//initial call upon page load
fetchCampers()


/* checks whether user has already upvoted or downvoted the selected 
 * camper in the current session and adjusts vote counts appropriately 
 * before updating server and calling for a screen update. */
const updateVotes = (vote,camper) => {
    if(vote===1){
        switch(true){
            case camper.upVote:
                camper.upVote = false
                camper.upVotes--
                break
            case camper.downVote:
                camper.downVote = false
                camper.upVote = true
                camper.upVotes++
                camper.downVotes--
                break
            default:
                camper.upVote = true
                camper.upVotes++
        }
    } else {
        switch(true){
            case camper.upVote:
                camper.upVote = false
                camper.upVotes--
                camper.downVote = true
                camper.downVotes++
                break
            case camper.downVote:
                camper.downVote = false
                camper.downVotes--
                break
            default:
                camper.downVote = true
                camper.downVotes++
        }
    }
    
    fetch(`https://best-camper-layouts-server.onrender.com/campers/${camper.id}`,{
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'upVotes' : camper.upVotes,
            'downVotes' : camper.downVotes
        })
    })
    .then(displayCamper(camper))
    .catch(error =>{
        console.log(error)
        alert("Whoops! Something went wrong with that vote. Try again?")
    })
}

//displays a single camper and its slideshow in the details pane
const displayCamper = (e,camper) => {
    for(thumb of document.getElementsByClassName('camperThumbDiv')){
        thumb.firstChild.classList.remove('active')
    }
    console.log(e.target.tagName)
    if(e.target.tagName === "IMG")
        e.target.classList.add('active')
    const longName = `The ${camper.manufacturer} ${camper.line} ${camper.model}`
    document.getElementById("camperName").textContent = longName
    document.getElementById("detailLayout").src = camper.layoutPic
    document.getElementById("manufacturer").textContent = camper.manufacturer
    document.getElementById("line").textContent = camper.line
    document.getElementById("model").textContent = camper.model
    document.getElementById("slides").textContent = camper.slides
    document.getElementById("length").textContent = camper.length

    voteDisplay(camper)
    slideShow(camper,longName)

    activeCamper = camper
}

/* sets colors of vote thumbs based on whether the user has thumbed the selected camper up or down this
 * session, then sets upvote/downvote numeric counters*/
const voteDisplay = (camper) => {
    //grab buttons
    const upBtn = document.getElementById('upBtn')
    const dnBtn = document.getElementById('dnBtn')
    //change button colors as neccessary
    if(camper.upVote)
        upBtn.src = greenUp
    else
        upBtn.src = grayUp
    if(camper.downVote)
        dnBtn.src = redDn
    else
        dnBtn.src = grayDn
    document.getElementById("upCount").textContent = camper.upVotes
    document.getElementById("dnCount").textContent = camper.downVotes
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
 *     Event Listeners     *
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

//calls function to handle up/down voting when up/down thumbs are clicked
document.getElementById('upBtn').addEventListener("click",()=>updateVotes(1,activeCamper))
document.getElementById('dnBtn').addEventListener("click",()=>updateVotes(-1,activeCamper))