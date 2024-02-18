console.log('java script');
let currentsong = new Audio();
let songs;
let currfloder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;

}



async function getsongs(floder) {
    currfloder = floder;
    let a = await fetch(`/${floder}/`);
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${floder}/`)[1])
        }
    }




    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
    <div class="info">
        <div> ${song.replaceAll("%20", " ")}</div>
        <div>Chetan</div>
    </div>
    <div class="playnow">
    <span>Play Now</span>
        <img  class="invert" src="img/play.svg" alt="">
    </div>

     </li>`;
    }

    // attach envent listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs
}


const playMusic = (track, pause = false) => {
    //   let audio = new Audio("/songs/"+track)
    currentsong.src = `/${currfloder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}


async function displayalbums() {
    
    let a = await fetch(`/songs/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")

    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];



        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let floder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${floder}/info.json`)
            let response = await a.json(); 
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${floder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${floder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`

        }
    }


    //load floder
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}


async function main() {


    await getsongs("songs/ncs")
    // console.log(songs)
    //play song
    // currentsong.src=songs[0]
    playMusic(songs[0], true)


    //display all albums 

    displayalbums()


    // var audio = new Audio(songs[0]);
    // // audio.play();


    // audio.addEventListener("loadeddata", () => {

    //     console.log(audio.duration, audio.currentSrc, audio.currentTime)
    // });


    // attch event listener to play next previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    })

    //time update

    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";

    })

    //ad   seebar event
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration) * percent / 100

    })

    //hamburger


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        console.log("previous clicked")
        // console.log(currentsong)

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log("next clicked")

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {

            playMusic(songs[index + 1])
        }
    })



    //volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Settign volume to ", e.target.value, "/ 100")
        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume >0){
            document.querySelector(".volume>img ").src=document.querySelector(".volume>img ").src.replace("img/mute.svg","img/volume.svg")
        }
    })

    // add mute
    document.querySelector(".volume>img ").addEventListener("click", e => {
    //   console.log(e.target)
      if(e.target.src.includes("img/volume.svg")){
        e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg")
        currentsong.volume=0;
        document.querySelector(".range").getElementsByTagName("input")[0].value=0;

      }else{
        e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg")
        currentsong.volume=.10;
        document.querySelector(".range").getElementsByTagName("input")[0].value=10;
      }
    })


// Get the button element
// const loginBtn = document.querySelector('.loginbtn');

// // Attach a click event listener
// loginBtn.addEventListener('click', () => {
//   // Open the login page in a new tab
//   window.open('http://127.0.0.1:3002/index.html', '_blank');

//   // After the login page is opened, navigate to the home page
//   setTimeout(() => {
//     // Change the current URL without reloading the page
//     history.pushState({}, null, 'http://127.0.0.1:3002/index.html');

//     // Optionally, you can update the page title and other content here
//     document.title = 'Home Page';
//   }, 1000); // Wait for 1 second before navigating to the home page
// });

}
main()