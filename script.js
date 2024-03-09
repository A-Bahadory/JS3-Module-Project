const rootElem = document.querySelector(".layout");
const titleElem = document.querySelector("#title");
const searchWrapper = document.querySelector(".search-wrapper");
const searchInput = document.querySelector("#search-input");
const episodeNumber = document.querySelector(".episodes-numbers");
const homePageBtn = document.querySelector(".btn");
const showDropDown = document.getElementById("showDropdown");
const episodeDropDown = document.getElementById("episodes-dropdown");
episodeDropDown.style.display = "None";
let allShows;
let episodesForShow;
let showingEpisodes = false;
let titlePass = "";

async function getAllShows() {
  const movieUrl = "https://api.tvmaze.com/shows";
  const data = await fetch(movieUrl).then((response) => {
    return response.json();
  });
  return data;
}
//
async function setup() {
  getAllShows().then((data) => {
    allShows = data;
    populateShowDropdown(data);
    totalEpisodes = allShows.length;
    makeShowCards(allShows);
    footerRender();
    searchShowsInputEventListener();
    filterShowsBySearchTerm();
  });
}
homePageBtn.addEventListener("click", function () {
  titleElem.textContent = "";
  rootElem.removeAttribute("id");
  clearCards();
  showDropDown.style.display = "Block";
  episodeDropDown.style.display = "None";
  showDropDown.value = "default";
  makeShowCards(allShows);
  searchShowsInputEventListener();
  filterShowsBySearchTerm();
});

function populateShowDropdown(data) {
  const selectShowOption = createClassAndElement("option", "");
  selectShowOption.setAttribute("value", "default");
  selectShowOption.textContent = "---";
  showDropDown.appendChild(selectShowOption);

  data.forEach((show) => {
    let option = createClassAndElement("option", "");
    option.value = show.id;
    option.textContent = `ID-Number ${show.id} : ${show.name}`;
    showDropDown.appendChild(option);
  });

  showDropDown.addEventListener("change", async (e) => {
    if (e.target.value === selectShowOption.textContent) {
      clearCards();
      setup();
    } else {
      const showId = e.target.value;
      fetchEpisodes(showId).then((episodes) => {
        showingEpisodes = true;
        episodesForShow = episodes;
        rootElem.setAttribute("id", "root");
        clearCards();
        episodeDropDown.innerHTML = "";
        makeEpisodeCards(episodesForShow);
        filterShowsBySearchTerm();
        searchEpisodesFilter();
        episodeDropDownFilter(episodes);
        showDropDown.style.display = "None";
        episodeDropDown.style.display = "Block";
      });
    }
  });
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

function searchShowsInputEventListener() {
  searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value;
    const filteredShows = filterShowsBySearchTerm(searchValue);
    clearCards();
    makeShowCards(filteredShows);
  });
}

function searchEpisodesFilter() {
  searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value;
    const filteredEpisodes = filterEpisodesBySearchTerm(searchValue);
    clearCards();
    makeEpisodeCards(filteredEpisodes);
  });
}

function episodeDropDownFilter(episodes) {
  episodeDropDown.addEventListener("input", function (e) {
    e = e.target.value;
    const selectEpisodeUpToDash = e.lastIndexOf("-");
    const removePaddingFromEpisode = e.slice(0, selectEpisodeUpToDash - 5);
    const filterEpisode = episodes.filter(
      (episode) => episode.name === removePaddingFromEpisode
    );
    clearCards();
    makeEpisodeCards(filterEpisode);
  });
}

function getEpisodeTitleAndNumber() {
  getAllShows().then((data) => {
    const allEpisodes = data;
    allEpisodes.forEach((episode) => {
      let option = createClassAndElement("option");
      option.text = ` Show ${episode.id} : ${episode.name}`;
      episodeSelect.appendChild(option);
    });
  });
  episodeSelect.addEventListener("change", async (epi) => {
    const colon = epi.target.value.indexOf(":");
    const episodeName = epi.target.value.slice(colon + 2);
    const filEpi = episodesForShow.filter(
      (episode) => episode.name === episodeName
    );

    clearCards();
    makeEpisodeCards(filEpi);
    const locateEpisode = filEpi.find((episode) => episode);
    const episodesID = locateEpisode.id;
    episodesForShow = await fetchEpisodes(episodesID);
    clearCards();
    makeEpisodeCards(episodesForShow);
    episodesForShow.forEach((episode) => {
      const createOptions = document.createElement("option");
      createOptions.textContent = episode.name;
      showDropDown.appendChild(createOptions);
    });
  });
}

function filterShowsBySearchTerm() {
  const lowerSearchTerm = searchInput.value.toLowerCase();
  const filteredShows = allShows.filter(
    (show) =>
      show.name.toLowerCase().includes(lowerSearchTerm) ||
      show.summary.toLowerCase().includes(lowerSearchTerm) ||
      show.status.toLowerCase().includes(lowerSearchTerm)
  );
  episodeNumber.textContent = `Shows Number ${filteredShows.length}/${allShows.length}`;

  return filteredShows;
}

function filterEpisodesBySearchTerm() {
  const lowerSearchTerm = searchInput.value.toLowerCase();
  const filteredEpisodes = episodesForShow.filter(
    (episode) =>
      episode.name.toLowerCase().includes(lowerSearchTerm) ||
      episode.summary.toLowerCase().includes(lowerSearchTerm)
  );
  episodeNumber.textContent = `Episodes Number ${filteredEpisodes.length}/${episodesForShow.length}`;
  return filteredEpisodes;
}

function createClassAndElement(tag, className) {
  const element = document.createElement(tag);
  if (className) {
    element.classList.add(className);
  }
  return element;
}

function makeEpisodeCards(episodeList) {
  // titleElem.removeChild();
  titleElem.textContent = titlePass;
  titleElem.className = "title-pass";
  for (let i = 0; i < episodeList.length; i++) {
    const card = createClassAndElement("div", "card-div");
    rootElem.appendChild(card);
    const seasonName = episodeList[i].name;
    const seasonNumber = episodeList[i].number ?? "";
    const convertSeasonNumberToStr = String(seasonNumber).padStart(2, "0");
    const convertSeasonToStr = String(episodeList[i].season).padStart(2, "0");
    const episodeCode = `${seasonName} S${convertSeasonToStr} - E${convertSeasonNumberToStr}`;
    // dropdown stuff
    const option = createClassAndElement("option");
    option.textContent = episodeCode;
    episodeDropDown.appendChild(option);
    //end of dd
    const season = createClassAndElement("h1", "title");
    season.textContent = episodeCode;
    const seasonNameAncTag = createClassAndElement("a", "title");
    seasonNameAncTag.href = episodeList[i].url;
    seasonNameAncTag.appendChild(season);
    card.appendChild(seasonNameAncTag);

    const imgElement = createClassAndElement("img");
    imgElement.setAttribute("src", episodeList[i].image.medium);

    const aTag = createClassAndElement("a", "img");
    aTag.href = episodeList[i].url;
    aTag.appendChild(imgElement);
    card.appendChild(aTag);
    const summary = createClassAndElement("h4");
    summary.innerHTML = episodeList[i].summary;
    card.appendChild(summary);
  }
}

function makeShowCards(showList) {
  titlePass = "";
  for (let i = 0; i < showList.length; i++) {
    const showItem = showList[i];
    const card = createClassAndElement("div", "card-div");
    rootElem.appendChild(card);
    const titleWrapper = createClassAndElement("div", "title-wrapper");
    card.appendChild(titleWrapper);
    const showName = showItem.name;
    const show = createClassAndElement("h1", "title");
    const titleAnTag = createClassAndElement("a", "title");
    titleAnTag.href = showList[i].url;
    show.textContent = showName;
    const showRatingAndStatus = createClassAndElement("h2");
    showRatingAndStatus.textContent = `${showItem.rating.average} ⭐️ /Show${showItem.status}`;
    titleWrapper.appendChild(showRatingAndStatus);
    const showRuntimeAndGenres = createClassAndElement("h3");
    showRuntimeAndGenres.textContent = `${showItem.genres}/ Minutes: ${showItem.runtime}`;
    titleWrapper.appendChild(showRuntimeAndGenres);
    titleAnTag.appendChild(show);
    titleWrapper.appendChild(titleAnTag);
    const imgElement = createClassAndElement("img");
    imgElement.setAttribute("src", showItem.image.medium);
    card.appendChild(imgElement);
    imgElement.addEventListener("click", async function () {
      titlePass = showName;
      const showId = showItem.id;
      fetchEpisodes(showId).then((episodes) => {
        showingEpisodes = true;
        episodesForShow = episodes;
        rootElem.setAttribute("id", "root");
        showDropDown.style.display = "None";
        clearCards();
        makeEpisodeCards(episodesForShow);
        searchEpisodesFilter();
      });
    });
    const summary = createClassAndElement("h4");
    summary.innerHTML =
      showItem.summary.length > 150
        ? showItem.summary.slice(0, 150) + " ...."
        : showItem.summary;
    card.appendChild(summary);
  }
}

async function footerRender() {
  const footerWrapper = createClassAndElement("div", "footer-wrapper");
  document.body.append(footerWrapper);

  const header1 = document.createElement("h1");
  const footerAnTag = document.createElement("a");
  footerAnTag.href = "https://www.tvmaze.com/";
  footerAnTag.textContent = "TVMAZE";
  header1.appendChild(footerAnTag);

  footerWrapper.appendChild(header1);
}

function clearCards() {
  rootElem.innerHTML = "";
}

window.onload = setup;
