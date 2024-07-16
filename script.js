// This code was written by ankyie: https://github.com/ankyie
console.log('Initiating script.js');
var PreviousSong = new Audio();
var CurrentSong = new Audio();
var NextSong = new Audio();
// let currFolder = "English";
let currFolder;
let songs;

async function getAlbum() {
    console.log("Getting Albums");
    let a = await fetch(`songs`);
    let resolve = await a.text();
    let div = document.createElement("div");
    div.innerHTML = resolve;
    let anchors = div.getElementsByTagName("a");
    let card_container = document.querySelector(".card-cont");
    for (let i = 0; i < anchors.length; i++) {
        let e = anchors[i].href;
        if (e.includes("/songs")) {
            let folder = e.split("/songs/")[1].split("/")[0];
            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();
            card_container.innerHTML = card_container.innerHTML + `<div data-folder=${folder} class="card flex bodrad">
            <div class="image-cont">
                <img class="image bodrad" src="songs/${folder}/cover.jpg" alt="image">
                <div class="hoverplay">
                    <img src="assets/black-play.svg" alt="play">
                </div>
            </div>
            <h2 class="titles">${response.title}</h2>
            <p class="description">${response.description}</p>
        </div>`
        }
    }

    //event listener to play any song from list
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async () => {
            currFolder = e.dataset.folder;
            await getSong(currFolder);
            playpause.querySelector("img").src = "assets/play.svg";
            document.querySelector(".completebar").style.width = "0%";
            document.querySelector(".circle").style.left = "0%";
        }
        )
    });
}

async function getSong(currFolder) {
    console.log(`${currFolder} has been loaded`);
    let a = await fetch(`songs/${currFolder}`);
    let resolve = await a.text();
    let div = document.createElement("div");
    div.innerHTML = resolve;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith(".mp3")) {
            let e = as[i].href;
            songs.push(e);
        }
    }
    // return songs;

    SendSongsToLib(songs);
    PreviousSong.src = `songs/${currFolder}/` + document.getElementsByClassName("song-name")[0].innerHTML;
    NextSong.src = `songs/${currFolder}/` + document.getElementsByClassName("song-name")[1].innerHTML;
    document.getElementsByClassName("list")[0].style.backgroundColor = "#3d3d3d";
    document.getElementsByClassName("playnow")[0].innerHTML = "Playing";
    Play_Music(decodeURI(songs[0]).split(`${currFolder}/`)[1], true);

    //event listener for library
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            Play_Music(e.getAttribute("name"));
        })
    })

    //updating time
    CurrentSong.addEventListener("timeupdate", () => {
        let CT = formatSecondsToMinutes(CurrentSong.currentTime);
        let CD = formatSecondsToMinutes(CurrentSong.duration);
        document.querySelector(".time").firstElementChild.innerHTML = `${CT}/${CD}`;
        document.querySelector(".circle").style.left = (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
        document.querySelector(".completebar").style.width = (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
        if (CurrentSong.currentTime == CurrentSong.duration) {
            if (CurrentSong.src == songs[songs.length - 1]) {
                CurrentSong.pause();
                playpause.querySelector("img").src = "assets/play.svg";
            }
            else {
                next.click();
            }
        }
    });
}

function SendSongsToLib(songs_arr) {
    document.querySelector(".songlist").innerHTML = " ";
    for (const i of songs_arr) {
        let songUL = document.createElement("li");
        let songname = i.split(`${currFolder}/`)[1].replaceAll("%20", " ");
        songUL.setAttribute("name", `${songname}`);
        songUL.setAttribute("class", "list flex align bodrad");
        songUL.innerHTML = `<div class="list-left flex align">
        <img class="white" src="assets/music.svg" alt="music">
        <div class="song-info">
            <div class="song-name">${songname}</div>
            <div class="song-artist">Ankur</div>
        </div>
    </div>
    <div class="list-right flex align">
        <div class="playnow">Play Now</div>
        <img class="white" src="assets/play.svg" alt="play">
    </div>`;
        document.querySelector(".songlist").append(songUL);
    }
}


function FindCurrentSongFromList(CurrentSong) {
    let currentIndex;
    for (let i = 0; i < document.querySelectorAll(".song-name").length; i++) {
        const e = document.querySelectorAll(".song-name")[i];
        if (decodeURI(CurrentSong.src).split(`/${currFolder}/`)[1] == e.innerHTML) {
            currentIndex = i;
            let Current_from_list = document.getElementsByClassName("list")[i];
            Current_from_list.style.backgroundColor = "#3d3d3d";
            document.getElementsByClassName("playnow")[i].innerHTML = "Playing";
        }
        else {
            document.getElementsByClassName("list")[i].style.backgroundColor = "#222222";
            document.getElementsByClassName("playnow")[i].innerHTML = "Play Now";
        }
    }

    //Set Previous Song src
    if (currentIndex > 0) {
        PreviousSong.src = `songs/${currFolder}/` + document.getElementsByClassName("song-name")[currentIndex - 1].innerHTML;
    }
    else {
        PreviousSong.src = `songs/${currFolder}/` + document.getElementsByClassName("song-name")[0].innerHTML;
    }

    //Set Next Song src
    if (currentIndex < document.getElementsByClassName("list").length - 1) {
        NextSong.src = `songs/${currFolder}/` + document.getElementsByClassName("song-name")[currentIndex + 1].innerHTML;
    }
    else {
        NextSong.src = `songs/${currFolder}/` + document.getElementsByClassName("song-name")[document.getElementsByClassName("list").length - 1].innerHTML;
    }
}

function formatSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);
    return minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
}

function Play_Music(song_name, pause = false) {
    // var audio = new Audio('songs/'+ song_name);
    // audio.play();
    let song_artist = "Ankur"
    CurrentSong.src = `songs/${currFolder}/` + song_name;
    FindCurrentSongFromList(CurrentSong);
    if (!pause) {
        CurrentSong.play();
        playpause.querySelector("img").src = "assets/pause.svg";
    }
    document.querySelector(".songname").children[0].innerHTML = song_name + " / ";
    document.querySelector(".songname").children[1].innerHTML = song_artist;
}

async function main() {
    await getAlbum();
    console.log("Albums are here");

    //listen to keyboard
    document.addEventListener("keydown", (event) => {
        if (event.key === " ") {
            playpause.click();
        }
    });


    // event listener for volume
    volumebar.addEventListener('input', () => {
        CurrentSong.volume = volumebar.value / 100;
        if (CurrentSong.volume <= 0.03) {
            document.querySelector(".volume-btn").src = "assets/volume-off.svg";
        }
        if (CurrentSong.volume > 0.03) {
            document.querySelector(".volume-btn").src = "assets/volume.svg";
        }
    });
    document.querySelector(".volume-btn").addEventListener('click', () => {
        if (volumebar.value > 3) {
            CurrentSong.volume = 0;
            volumebar.value = 0;
            document.querySelector(".volume-btn").src = "assets/volume-off.svg";
        }
        else {
            CurrentSong.volume = 1;
            volumebar.value = 100;
            document.querySelector(".volume-btn").src = "assets/volume.svg";
        }
    });

    //event listener for play pause
    playpause.addEventListener("click", () => {
        if (CurrentSong.paused) {
            CurrentSong.play();
            playpause.querySelector("img").src = "assets/pause.svg";
        } else {
            CurrentSong.pause();
            playpause.querySelector("img").src = "assets/play.svg";
        }
    })
    //event listener for previous
    previous.addEventListener("click", () => {
        if (PreviousSong.src != undefined) {
            CurrentSong.src = PreviousSong.src;
        }
        Play_Music(decodeURI(CurrentSong.src.split(`${currFolder}/`)[1]));
    })
    //event listener for next
    next.addEventListener("click", () => {
        if (NextSong.src != undefined) {
            CurrentSong.src = NextSong.src;
        }
        Play_Music(decodeURI(CurrentSong.src.split(`${currFolder}/`)[1]));
    })

    //event listener to seekbar
    document.querySelector(".playerbar").addEventListener("click", e => {
        let percent = (e.offsetX * 100) / document.querySelector(".playerbar").offsetWidth;
        document.querySelector(".completebar").style.width = percent + "%";
        document.querySelector(".circle").style.left = percent + "%";
        CurrentSong.currentTime = (CurrentSong.duration * percent) / 100;
    }
    )

    //event listener to open hamburger menu
    document.querySelector(".hamburger-menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    }
    )
    //event listener to close hamburger menu
    document.querySelector(".cancel").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    }
    )
    //event listener to close hamburger menu - method 2
    document.querySelector(".playlist-cont").addEventListener("click", (e) => {
        if (!e.target.closest(".left") && document.querySelector(".left").style.left == "0%") {
            document.querySelector(".cancel").click();
        }
    }
    )
}

main();