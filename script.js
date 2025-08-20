console.log("lets write java script");
let songs;
let currfolder;
let currsong = new Audio();
function secondsToMinSec(sec) {
  sec = Math.floor(sec); // round down to nearest whole second
  let minutes = Math.floor(sec / 60);
  let seconds = sec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  //show all songs to the playlist

  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `
      <li>
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Badshah</div>
                </div>
                <div class="playnow">
                  <span>playnow</span>
                  <img class="invert" src="plav.svg" alt="">
                </div>
                
              </li>  
      `;
  }
  //attach an event listner to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}
const playmusic = (track, pause = false) => {
  //  let audio = new Audio("/songs/" + track)
  currsong.src = `/${currfolder}/` + track;

  if (!pause) {
    currsong.play();
    play.src = "pause.svg";
  }

  play.src = "pause.svg";
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayalbumbs() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");

  let cardcontainer = document.querySelector(".cardcontainer");

  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      // ensure it’s a subfolder, not just /songs
      let pathParts = e.pathname.split("/").filter(Boolean);
      let folder = pathParts[pathParts.length - 1];

      // Skip if folder is literally "songs"
      if (folder.toLowerCase() === "songs") return;

      try {
        let res = await fetch(
          `http://127.0.0.1:5500/songs/${folder}/info.json`
        );

        if (!res.ok) {
          console.warn(`No info.json found for folder: ${folder}`);
          return;
        }

        let response = await res.json();
        console.log(response);
        cardcontainer.innerHTML =
          cardcontainer.innerHTML +
          `<div data-folder="${folder}" class="card">
              <div class="play">
                <div
                  style="
                    width: 50px;
                    height: 50px;
                    background-color: rgb(102 255 13);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                  >
                    <path
                      d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                      fill="#000"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
      } catch (err) {
        console.error(`Error loading ${folder}:`, err);
      }
    }
  }
  //load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0]);
    });
  });
}
async function main() {
  // get all the list
  await getsongs("songs/ncs");

  playmusic(songs[0], true);

  //display all the albumbs on the page
  displayalbumbs();

  // attach an event listner to play , next and previous
  play.addEventListener("click", () => {
    if (currsong.paused) {
      currsong.play();
      play.src = "pause.svg";
    } else {
      currsong.pause();
      play.src = "plav.svg";
    }
  });

  //listen for time update event
  currsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinSec(
      currsong.currentTime
    )}/${secondsToMinSec(currsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currsong.currentTime / currsong.duration) * 100 + "%";
  });

  // add event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currsong.currentTime = (currsong.duration * percent) / 100;
  });
  // add an event listner for hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add an event listner for closebutton

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  // Previous button
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  // Next button
  next.addEventListener("click", () => {
    let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });
  // and an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currsong.volume = parseFloat(e.target.value) / 100;
  });
  // add event listner to mut ethe track

  document.querySelector(".volume>img").addEventListener("click" , e=>{
    console.log(e.target)
    if(e.target.src.includes("volume.svg")){
      e.target.src = e.target.src.replace("volume.svg" , "mute.svg")
      currsong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
      e.target.src = e.target.src.replace("mute.svg" , "volume.svg")
      currsong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  })



}
main();
