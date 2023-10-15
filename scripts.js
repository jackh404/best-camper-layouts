//server location: https://best-camper-layouts-server.onrender.com/campers
const campers = []


const fetchCampers = () => {
    fetch("https://best-camper-layouts-server.onrender.com/campers")
    .then(resp => resp.json())
    .then(data => campers.splice(0,0,...data))
    .catch(error =>{
        alert("Oh noes! Something went wrong!")
        console.log(error)
    })
}

fetchCampers()