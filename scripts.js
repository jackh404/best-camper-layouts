//server location: https://best-camper-layouts-server.onrender.com/campers
//dev server: http://localhost:3000/campers
const serverURL = "http://localhost:3000/campers"

//global js variables
const campers = []
let activeCamper
let upVote = false
let downVote = false



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
    campers.forEach(element => {
        const newDiv = document.createElement('div')
        newDiv.classList.add("camperThumbDiv")

        const camperImg = document.createElement('img')
        camperImg.src = element.layoutPic
        camperImg.alt = element.manufacturer + " " + element.line + " " + element.model
        camperImg.classList.add("camperThumb")

        const label = document.createElement('h6')
        label.textContent = element.line + " " + element.model

        newDiv.append(camperImg)
        newDiv.append(label)
        camper_thumbs.append(newDiv)
    });
}
//initial call upon page load
fetchCampers()

//filters camper list according to selected criteria
const filterCampers = (criterion,value) => {

}

/* checks whether user has already upvoted or downvoted in the current session and adjusts 
 * vote counts appropriately before updating server and calling for a screen update. */
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

}