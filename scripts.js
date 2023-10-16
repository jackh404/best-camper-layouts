//server location: https://best-camper-layouts-server.onrender.com/campers

//global js variables
let activeCamper
let upVote = false
let downVote = false

//runs initial fetch to retrieve camper data from server
const fetchCampers = () => {
    fetch("https://best-camper-layouts-server.onrender.com/campers")
    .then(resp => resp.json())
    .then(data => renderCampers(data))
    .catch(error =>{
        alert("Oh noes! Something went wrong!")
        console.log(error)
    })
}
fetchCampers()

//shows list & thumbnails of campers in the thumbail pane
const renderCampers = (campers) => {
    campers.forEach(element => {
        
    });
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