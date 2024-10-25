let moviesContainer = document.querySelector(".moviesContainer");
let navPlayList = document.querySelector(".playList");
let playListContainer = document.querySelector(".playListContainer");
let search = document.querySelector(".search");
let form = document.querySelector(".form");
let home = document.querySelector(".home");
let tv = document.querySelector(".tv");
let headerPlayList = document.querySelector(".playList");
let tvContainer = document.querySelector(".tvContainer");
let episodesContainer = document.querySelector(".episodesContainer");
let allMovies = [];
let originalOrderOfMovies = [];
let allShows = [];
let originalOrderOfShows = [];
let playList = [];
let header = document.querySelector(".header");
let darkMode = document.querySelector(".darkMode");
let lightMode = document.querySelector(".lightMode");
function clearContainers() {
  moviesContainer.innerHTML = "";
  playListContainer.innerHTML = "";
  tvContainer.innerHTML = "";
  episodesContainer.innerHTML = "";
}

async function getMovies() {
  allMovies = [];

  // Fetch discover movies
  await fetch("https://api.themoviedb.org/3/discover/movie?api_key=ae80d73c7502091cf2ec432b7a4594fb")
      .then((response) => response.json())
      .then((data) => {
          allMovies = allMovies.concat(data.results); 
          originalOrderOfMovies = allMovies.slice();
          renderMovies(data.results);
      })
      .catch((error) => {
          console.error('Error fetching discover movies:', error);
      });

  // Fetch top rated movies
  await fetch("https://api.themoviedb.org/3/movie/top_rated?api_key=ae80d73c7502091cf2ec432b7a4594fb")
      .then((response) => response.json())
      .then((data) => {
          allMovies = allMovies.concat(data.results);
          originalOrderOfMovies = allMovies.slice();
          renderMovies(data.results);
      })
      .catch((error) => {
          console.error('Error fetching top rated movies:', error);
      });

  // Fetch upcoming movies
  await fetch("https://api.themoviedb.org/3/movie/upcoming?api_key=ae80d73c7502091cf2ec432b7a4594fb")
      .then((response) => response.json())
      .then((data) => {
          allMovies = allMovies.concat(data.results);
          originalOrderOfMovies = allMovies.slice();
          renderMovies(data.results);
      })
      .catch((error) => {
          console.error('Error fetching upcoming movies:', error);
      });
}


// Render movies
function renderMovies(movies) {
  movies.forEach((movie) => {
    const { original_title, poster_path, id } = movie;
    let div = document.createElement("div");
    div.classList.add("movie");

    let content = document.createElement("div");
    content.classList.add("content");
    let movieTitle = document.createElement("h6");
    movieTitle.innerHTML = original_title;
    content.appendChild(movieTitle);

    let watchlist = document.createElement("div");
    watchlist.classList.add("watchList");
    let li = document.createElement("li");
    // Check if the movie is in sessionStorage to set the correct icon
    if (sessionStorage.getItem(movie.id)) {
      li.classList.add("fa-solid", "fa-check");
    } else {
      li.classList.add("fa-solid", "fa-plus");
    }
    li.style.color = "black";
    watchlist.appendChild(li);
    content.appendChild(watchlist);

    let poster = document.createElement("img");
    poster.src = `https://image.tmdb.org/t/p/w500${poster_path}`;
    poster.alt = original_title;

    div.appendChild(poster);
    div.appendChild(content);
    moviesContainer.appendChild(div);

    poster.onclick = () => displayMovieDetails(movie);
    watchlist.onclick = () => {
      handlePlayList({ id, original_title, poster_path, type: "movie" }, li);
    };
  });
}

// Display movie details
function displayMovieDetails(movie) {
  clearContainers();
  const {
    original_title,
    poster_path,
    vote_average,
    overview,
    release_date,
    id,
  } = movie;

  let detailsContainer = document.createElement("div");
  detailsContainer.classList.add("detailsContainer");

  let castContainer = document.createElement("div");

  // Poster Div
  let poster = document.createElement("div");
  poster.classList.add("JSmovie");
  let img = document.createElement("img");
  img.classList.add("JSimg");
  img.src = `https://image.tmdb.org/t/p/w500${poster_path}`;
  img.alt = original_title;
  poster.appendChild(img);

  // Content Div
  let content = document.createElement("div");
  content.classList.add("detailsContent");
  let title = document.createElement("h4");
  title.innerHTML = original_title;
  content.appendChild(title);
  let rate = document.createElement("h4");
  rate.innerHTML = `Rating: ${vote_average}`;
  content.appendChild(rate);
  rate.style.marginBottom = "15px";

  let releaseDate = document.createElement("p");
  releaseDate.innerHTML = `Released Date: ${release_date}`;
  content.appendChild(releaseDate);
  releaseDate.style.marginBottom = "15px";

  let overview2 = document.createElement("p");
  overview2.style.maxWidth = "80%";
  overview2.innerHTML = overview;
  content.appendChild(overview2);
  overview2.style.marginBottom = "15px";

  detailsContainer.appendChild(poster);
  detailsContainer.appendChild(content);

  // Movie Trailer
  fetch(
    `https://api.themoviedb.org/3/movie/${id}/videos?api_key=ae80d73c7502091cf2ec432b7a4594fb`
  )
    .then((response) => response.json())
    .then((videoData) => {
      const trailer = videoData.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );
      let trailerUrl = trailer
        ? `https://www.youtube.com/embed/${trailer.key}`
        : null;

      if (trailerUrl) {
        let iframe = document.createElement("iframe");
        iframe.classList.add("trailer");
        iframe.src = trailerUrl;
        iframe.style.border = "none";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        content.appendChild(iframe);
      }
    })
    .catch((error) => {
      console.error("Error fetching trailer:", error);
    });

  let topBilledCast = document.createElement("h4");
  topBilledCast.classList.add("topBilledCast");
  topBilledCast.innerHTML = "Top Billed Cast";
  castContainer.appendChild(topBilledCast);

  // Movie Billed Cast
  fetch(
    `https://api.themoviedb.org/3/movie/${id}/credits?api_key=ae80d73c7502091cf2ec432b7a4594fb`
  )
    .then((response) => response.json())
    .then((billedCast) => {
      let casts = billedCast.cast.slice(0, 7);
      let actors = document.createElement("div");
      actors.classList.add("actorsContainer");
      casts.forEach((cast) => {
        let div = document.createElement("div");
        div.classList.add("cast");
        let castImg = document.createElement("img");
        castImg.src = `https://image.tmdb.org/t/p/w500${cast.profile_path}`;
        castImg.alt = cast.name;

        let castName = document.createElement("h4");
        castName.innerHTML = cast.name;
        castName.style.color = "black";

        div.appendChild(castName);
        div.appendChild(castImg);
        actors.appendChild(div);
      });
      castContainer.appendChild(actors);
    });
  moviesContainer.appendChild(detailsContainer);
  moviesContainer.appendChild(castContainer);
}

// Load movies
home.onclick = () => {
  clearContainers();
  search.value = "";
  getMovies();
};

async function TVSeries() {
  allShows = [];

  // Fetch top rated TV series
  await fetch("https://api.themoviedb.org/3/tv/top_rated?api_key=ae80d73c7502091cf2ec432b7a4594fb")
      .then((response) => response.json())
      .then((data) => {
          allShows = allShows.concat(data.results); 
          originalOrderOfShows = allShows.slice();
          renderTVSeries(data.results);
      })
      .catch((error) => {
          console.error('Error fetching top rated TV series:', error);
      });

  // Fetch on the air TV series
  await fetch("https://api.themoviedb.org/3/tv/on_the_air?api_key=ae80d73c7502091cf2ec432b7a4594fb")
      .then((response) => response.json())
      .then((data) => {
          allShows = allShows.concat(data.results); 
          originalOrderOfShows = allShows.slice();
          renderTVSeries(data.results);
      })
      .catch((error) => {
          console.error('Error fetching on the air TV series:', error);
      });

  // Fetch popular TV series
  await fetch("https://api.themoviedb.org/3/tv/popular?api_key=ae80d73c7502091cf2ec432b7a4594fb")
      .then((response) => response.json())
      .then((data) => {
          allShows = allShows.concat(data.results); 
          originalOrderOfShows = allShows.slice();
          renderTVSeries(data.results);
      })
      .catch((error) => {
          console.error('Error fetching popular TV series:', error);
      });
}


function renderTVSeries(series) {
  series.forEach((tvShow) => {
    const { id, original_name, poster_path } = tvShow;
    let div = document.createElement("div");
    div.classList.add("tvShow");

    let content = document.createElement("div");
    content.classList.add("content");
    let tvTitle = document.createElement("h6");
    tvTitle.innerHTML = original_name;
    content.appendChild(tvTitle);

    let poster = document.createElement("img");
    poster.src = `https://image.tmdb.org/t/p/w500${poster_path}`;
    poster.alt = original_name;

    let watchlist = document.createElement("div");
    watchlist.classList.add("watchList");
    let li = document.createElement("i");

    if (sessionStorage.getItem(id)) {
      li.classList.add("fa-solid", "fa-check");
    } else {
      li.classList.add("fa-solid", "fa-plus");
    }

    li.style.color = "black";
    li.onclick = () =>
      handlePlayList({ id, original_name, poster_path, type: "tvShow" }, li);

    watchlist.appendChild(li);
    content.appendChild(watchlist);
    div.appendChild(poster);
    div.appendChild(content);
    tvContainer.appendChild(div);

    poster.onclick = () => displayTVShowDetails(tvShow);
  });
}

function displayTVShowDetails(tvShow) {
  clearContainers();
  const { name, poster_path, vote_average, overview, first_air_date, id } =
    tvShow;

  let detailsContainer = document.createElement("div");
  detailsContainer.classList.add("detailsContainer");
  let seasonsContainer = document.createElement("div");
  seasonsContainer.classList.add("seasonsContainer");
  let castContainer = document.createElement("div");

  // Poster Div
  let poster = document.createElement("div");
  poster.classList.add("JSmovie");
  let img = document.createElement("img");
  img.classList.add("JSimg");
  img.src = `https://image.tmdb.org/t/p/w500${poster_path}`;
  img.alt = name;
  poster.appendChild(img);

  // Content Div
  let content = document.createElement("div");
  content.classList.add("detailsContent");
  let title = document.createElement("h4");
  title.innerHTML = name;
  content.appendChild(title);

  let rate = document.createElement("h4");
  rate.innerHTML = `Rating: ${vote_average}`;
  content.appendChild(rate);
  rate.style.marginBottom = "15px";

  let releaseDate = document.createElement("p");
  releaseDate.innerHTML = `Released Date: ${first_air_date}`;
  content.appendChild(releaseDate);
  releaseDate.style.marginBottom = "15px";

  let overview2 = document.createElement("p");
  overview2.style.maxWidth = "80%";
  overview2.innerHTML = overview;
  content.appendChild(overview2);
  overview2.style.marginBottom = "15px";

  detailsContainer.appendChild(poster);
  detailsContainer.appendChild(content);

  // TV Show Trailer
  fetch(
    `https://api.themoviedb.org/3/tv/${id}/videos?api_key=ae80d73c7502091cf2ec432b7a4594fb`
  )
    .then((response) => response.json())
    .then((videoData) => {
      const trailer = videoData.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );
      let trailerUrl = trailer
        ? `https://www.youtube.com/embed/${trailer.key}`
        : null;

      if (trailerUrl) {
        let iframe = document.createElement("iframe");
        iframe.classList.add("trailer");
        iframe.src = trailerUrl;
        iframe.style.border = "none";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        content.appendChild(iframe);
      }
    })
    .catch((error) => {
      console.error("Error fetching trailer:", error);
    });

  let topBilledCast = document.createElement("h4");
  topBilledCast.classList.add("topBilledCast");
  topBilledCast.innerHTML = "Top Billed Cast";
  castContainer.appendChild(topBilledCast);

  // Fetch TV show details and all its seasons
  fetch(
    `https://api.themoviedb.org/3/tv/${id}?api_key=ae80d73c7502091cf2ec432b7a4594fb`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      const seasons = data.seasons;
      const { id } = data;
      console.log(id);

      for (let i = 0; i < seasons.length; i++) {
        // There Is Season 0 and contains nothing

        const { name, poster_path } = seasons[i];

        let div = document.createElement("div");
        div.classList.add("movie");

        let seasonTitle = document.createElement("h4");
        seasonTitle.innerHTML = name;

        let seasonImg = document.createElement("img");
        seasonImg.src = `https://image.tmdb.org/t/p/w500${poster_path}`;
        seasonImg.alt = name;

        // Append Title and Image to the Card
        div.appendChild(seasonTitle);
        div.appendChild(seasonImg);
        // when Click on Season Show The Episodes
        div.onclick = () => {
          fetch(
            `https://api.themoviedb.org/3/tv/${id}/season/${i}?api_key=ae80d73c7502091cf2ec432b7a4594fb`
          )
            .then((response) => response.json())
            .then((data) => {
              let episodes = data.episodes;
              console.log(episodes);
              tvContainer.innerHTML = "";
              episodesContainer.innerHTML = "";
              let close = document.createElement("li");
              close.classList.add("fa-solid", "fa-xmark", "close");
              episodesContainer.appendChild(close);
              close.onclick = () => {
                episodesContainer.innerHTML = "";
                displayTVShowDetails(tvShow);
              };
              episodes.forEach((episode) => {
                const { name } = episode;
                let div = document.createElement("div");
                div.classList.add("movie");

                let episodeTitle = document.createElement("h6");
                episodeTitle.innerHTML = name;

                let seasonImg = document.createElement("img");
                seasonImg.src = `https://image.tmdb.org/t/p/w500${poster_path}`;
                div.appendChild(episodeTitle);
                div.appendChild(seasonImg);
                episodesContainer.appendChild(div);
              });
            })
            .catch((error) => console.error("Error fetching episodes:", error));
        };
        seasonsContainer.appendChild(div);
      }
    })
    .catch((error) => console.error("Error fetching seasons:", error));
  // TV Show Billed Cast
  fetch(
    `https://api.themoviedb.org/3/tv/${id}/credits?api_key=ae80d73c7502091cf2ec432b7a4594fb`
  )
    .then((response) => response.json())
    .then((billedCast) => {
      let casts = billedCast.cast.slice(0, 7);
      let actors = document.createElement("div");
      actors.classList.add("actorsContainer");
      casts.forEach((cast) => {
        let div = document.createElement("div");
        div.classList.add("cast");
        let castImg = document.createElement("img");
        castImg.src = `https://image.tmdb.org/t/p/w500${cast.profile_path}`;
        castImg.alt = cast.name;

        let castName = document.createElement("h4");
        castName.innerHTML = cast.name;
        castName.style.color = "black";

        div.appendChild(castName);
        div.appendChild(castImg);
        actors.appendChild(div);
      });
      castContainer.appendChild(actors);
    });

  tvContainer.appendChild(detailsContainer);
  tvContainer.appendChild(seasonsContainer);
  tvContainer.appendChild(castContainer);
}

tv.onclick = () => {
  clearContainers();
  search.value = "";
  TVSeries();
};

// Add or remove an item (movie or TV show) from the playlist
function handlePlayList(item, li) {
  const itemIndex = playList.findIndex(({ id }) => id === item.id);

  if (itemIndex === -1) {
    Swal.fire({
      title: "Added!",
      icon: "success",
      confirmButtonText: "OK",
    });
    playList.push(item);
    li.classList.remove("fa-plus");
    li.classList.add("fa-check");
    sessionStorage.setItem(item.id, "added");
  } else {
    Swal.fire({
      title: "Removed!",
      icon: "warning",
      confirmButtonText: "OK",
    });
    playList.splice(itemIndex, 1);
    li.classList.remove("fa-check");
    li.classList.add("fa-plus");
    sessionStorage.removeItem(item.id);
    renderPlayList();
  }

  sessionStorage.setItem("playList", JSON.stringify(playList));
}

function setWatchListIcon(li, id) {
  if (sessionStorage.getItem(id)) {
    li.classList.add("fa-solid", "fa-check");
  } else {
    li.classList.add("fa-solid", "fa-plus");
  }
}

// Render the playlist
function renderPlayList() {
  clearContainers();
  playList.forEach((item) => {
    const { id, original_title, original_name, poster_path, type } = item;
    let title = original_title || original_name;
    let div = document.createElement("div");
    div.classList.add(type === "movie" ? "movie" : "tvShow");

    let content = document.createElement("div");
    content.classList.add("content");
    let mediaTitle = document.createElement("h6");
    mediaTitle.innerHTML = title;
    content.appendChild(mediaTitle);

    let watchlist = document.createElement("div");
    watchlist.classList.add("watchList");
    let li = document.createElement("li");
    setWatchListIcon(li, id);

    li.style.color = "black";
    watchlist.appendChild(li);
    content.appendChild(watchlist);

    let poster = document.createElement("img");
    poster.src = `https://image.tmdb.org/t/p/w500${poster_path}`;
    poster.alt = title;

    div.appendChild(poster);
    div.appendChild(content);

    watchlist.onclick = () => handlePlayList(item, li);
    playListContainer.appendChild(div);
  });
}
navPlayList.onclick = () => {
  search.value = "";
  renderPlayList();
};

let searchResult = document.querySelector(".searchResult");

function searchForMoviesAndShows(searchInput) {
  clearContainers();

  // Filter movies and TV shows
  let filteredMovies = allMovies.filter((movie) =>
    movie.original_title.toLowerCase().includes(searchInput.toLowerCase())
  );

  let filteredTvShows = allShows.filter((tvShow) =>
    tvShow.original_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Render and append results
  if (filteredMovies.length) {
    searchResult.appendChild(renderMovies(filteredMovies));
  }

  if (filteredTvShows.length) {
    searchResult.appendChild(renderTVSeries(filteredTvShows));
  }
}

search.oninput = () => {
  let searchInput = search.value.trim();
  if (searchInput) {
    searchForMoviesAndShows(searchInput);
  } else {
    clearContainers();
    renderMovies(originalOrderOfMovies);
  }
};

darkMode.onclick = () => {
  toggleDarkMode(true);
};

lightMode.onclick = () => {
  toggleDarkMode(false);
};

let toggler = document.querySelector(".navbar-toggler-icon");
// Function to toggle dark/light mode
function toggleDarkMode(isDark) {
  if (isDark) {
    darkMode.classList.add("none");
    lightMode.classList.remove("none");
    header.style.backgroundColor = "#1c1124";
    header.style.color = "#fff";
    document.body.style.backgroundColor = "#1c1124";
    document.body.style.color = "#fff";
    home.style.color = "#fff";
    tv.style.color = "#fff";
    headerPlayList.style.color = "#fff";
    search.style.border = "2px solid #007bff";
    toggler.style.backgroundImage = `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E")`;
    localStorage.setItem("theme", "dark");
  } else {
    darkMode.classList.remove("none");
    lightMode.classList.add("none");
    header.style.backgroundColor = "#fff";
    header.style.color = "#000";
    document.body.style.backgroundColor = "#fff";
    document.body.style.color = "#000";
    home.style.color = "#000";
    tv.style.color = "#000";
    headerPlayList.style.color = "#000";
    search.style.border = "2px solid #000";
    toggler.style.backgroundImage = `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E")`;
    localStorage.setItem("theme", "light");
  }
}

// Function to apply saved styles on page load
function applySavedStyles() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    toggleDarkMode(true);
  } else {
    toggleDarkMode(false);
  }
}

window.onload = () => {
  getMovies();
  applySavedStyles();
  const savedPlayList = sessionStorage.getItem("playList");
  if (savedPlayList) {
    playList = JSON.parse(savedPlayList);
    playList.forEach((movie) => {
      sessionStorage.setItem(movie.id, "added"); // Store the movie
    });
  }
};
