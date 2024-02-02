const rootElem = document.getElementById("root");
const searchWrapper = document.querySelector(".search-wrapper");
const searchInput = document.querySelector("#search-input");
const episodeNumber = document.querySelector(".episodes-numbers");
const inputWrapper = document.querySelector(".input-wrapper");
inputWrapper.appendChild(episodeNumber);
let episodeSelect = document.getElementById("episodeSelect");
const homePageBtn = document.querySelector(".btn");
const showDropDown = document.getElementById("showDropdown");

async function fetchShows() {
  await fetch("https://api.tvmaze.com/shows")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((show) => {
        const option = document.createElement("option");
        option.value = show.id;
        option.textContent = `ID-Number ${show.id} : ${show.name}`;
        showDropDown.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching shows:", error));
}

async function fetchEpisodes(currentShowsID) {
  try {
    const res = await fetch(
      `https://api.tvmaze.com/shows/${currentShowsID}/episodes`
    );
    if (!res.ok) {
      throw new Error("Could not fetch episodes data");
    } else {
      return res.json();
    }
  } catch (error) {
    console.error(error);
  }
}

// showDropDown.addEventListener("change", async function () {
//   clearRender();
//   makePageForEpisodes(showDropDown);
//   //console.log("Dropdown changed:", dropdown.value);
// });

//home page event listener,
homePageBtn.addEventListener("click", function () {
  getAllEpisodes().then((btnEpi) => {
    clearRender();
    makePageForEpisodes(btnEpi);
  });
});

// async function getAllEpisodes() {
//   const movieUrl = "";
//   const allEpisodes = await fetch(movieUrl).then((response) => {
//     return response.json();
//   });
//   return allEpisodes;
// }

let btnEpi = getAllEpisodes();
let totalEpisodes = 0;

searchInput.addEventListener("input", function () {
  const searchValue = searchInput.value;
  const filteredEpisodes = filterEpisodesBySearchTerm(searchValue);
  clearRender();
  makePageForEpisodes(filteredEpisodes);
});

// Populate the select element with episode titles
//drop down menu work last night
function getEpisodeTitleAndNumber() {
  getAllEpisodes().then((data) => {
    const allEpisodes = data;
    allEpisodes.forEach((episode) => {
      let option = document.createElement("option");
      option.text = ` Show ${episode.id} : ${episode.name}`;
      // option.text = episode.name;
      episodeSelect.appendChild(option);
    });
  });

  episodeSelect.addEventListener("change", async (epi) => {
    const allEpisodes = await getAllEpisodes();
    const colon = epi.target.value.indexOf(":");
    const episodeName = epi.target.value.slice(colon + 2);
    const filEpi = allEpisodes.filter(
      (episode) => episode.name === episodeName
    );
    clearRender();
    makePageForEpisodes(filEpi);

    const locateEpisode = filEpi.find((episode) => episode);
    const episodesID = locateEpisode.id;
    const currentShowsData = await fetchEpisodes(episodesID);
    clearRender();
    makePageForEpisodes(currentShowsData);

    currentShowsData.forEach((episode) => {
      const createOptions = document.createElement("option");
      createOptions.textContent = episode.name;
      showDropDown.appendChild(createOptions);
    });
  });
}

async function filterEpisodesBySearchTerm() {
  const allEpisodes = await getAllEpisodes();
  const lowerSearchTerm = searchInput.value.toLowerCase();

  const filteredEpisodes = allEpisodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(lowerSearchTerm) ||
      episode.summary.toLowerCase().includes(lowerSearchTerm)
  );
  clearRender();
  makePageForEpisodes(filteredEpisodes);

  episodeNumber.textContent = `Episodes Number ${filteredEpisodes.length}/${totalEpisodes}`;
  console.log(episodeNumber.textContent);
}

async function getAllEpisodes() {
  const movieUrl = "https://api.tvmaze.com/shows";
  const allEpisodes = await fetch(movieUrl).then((response) => {
    return response.json();
  });
  return allEpisodes;
}

function setup() {
  getAllEpisodes().then((data) => {
    const allEpisodes = data;
    totalEpisodes = allEpisodes.length;
    makePageForEpisodes(allEpisodes);
    getEpisodeTitleAndNumber();
  });
}

function createClassAndElement(tag, className) {
  const element = document.createElement(tag);
  if (className) {
    element.classList.add(className);
  }
  return element;
}

function makePageForEpisodes(episodeList) {
  for (let i = 0; i < episodeList.length; i++) {
    const card = createClassAndElement("div", "title-div");
    rootElem.appendChild(card);

    const seasonName = episodeList[i].name;
    const seasonNumber = episodeList[i].number;
    const convertSeasonNumberToStr = String(seasonNumber).padStart(2, "0");

    const convertSeasonToStr = String(episodeList[i].season).padStart(2, "0");
    const episodeCode = `${seasonName} S${convertSeasonToStr}-E${convertSeasonNumberToStr}`;

    const season = createClassAndElement("h1", "title");
    season.textContent = episodeCode;
    card.appendChild(season);

    const imgElement = createClassAndElement("img");
    imgElement.setAttribute("src", episodeList[i].image.medium);
    card.appendChild(imgElement);

    const summary = createClassAndElement("h4");
    summary.innerHTML = episodeList[i].summary;
    card.appendChild(summary);
  }
}

const footerWrapper = createClassAndElement("div", "footer-wrapper");
document.body.append(footerWrapper);
const footer = createClassAndElement("footer");
footer.textContent = "this is a domo footer";
footerWrapper.appendChild(footer);

function clearRender() {
  document.querySelectorAll(".title-div").forEach((div) => {
    div.remove();
  });
}

window.onload = setup;
