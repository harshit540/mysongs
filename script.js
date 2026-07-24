const audio = document.getElementById("audio");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const albumEl = document.getElementById("album");
const coverEl = document.getElementById("cover");
const playlistEl = document.getElementById("playlist");
const statusEl = document.getElementById("status");

let currentIndex = 0;
let SONGS = []; // { name, url }
const metaCache = {};

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

async function fetchSongList() {
  // Case 1: GitHub Pages par hoy - GitHub API thi song_list folder ni files levi
  if (GITHUB_OWNER && GITHUB_REPO) {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SONGS_FOLDER}?ref=${GITHUB_BRANCH}`;
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("GitHub API response not ok: " + res.status);
      const files = await res.json();

      const audioFiles = files.filter(f =>
        f.type === "file" && /\.(mp3|m4a|wav|ogg|flac)$/i.test(f.name)
      );

      if (audioFiles.length > 0) {
        return audioFiles.map(f => ({ name: f.name, url: f.download_url }));
      }
      setStatus("song_list folder ma koi song file na madi.");
      return [];
    } catch (err) {
      console.log("GitHub API thi songs fetch karvama error:", err);
      setStatus("Songs auto-load na thai shaki. Neeche manual fallback check thai rahyu che...");
    }
  }

  // Case 2: Local testing - manual fallback list use karo
  if (typeof MANUAL_FALLBACK !== "undefined" && MANUAL_FALLBACK.length > 0) {
    return MANUAL_FALLBACK.map(path => ({ name: path.split("/").pop(), url: path }));
  }

  setStatus("Koi song nathi madyu. GitHub Pages par deploy karo, ke config.js ma MANUAL_FALLBACK list bharo.");
  return [];
}

function buildPlaylistUI() {
  playlistEl.innerHTML = "";
  SONGS.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = song.name;
    li.addEventListener("click", () => loadSong(index, true));
    playlistEl.appendChild(li);
  });
}

function highlightActive(index) {
  [...playlistEl.children].forEach((li, i) => {
    li.classList.toggle("active", i === index);
  });
}

function applyMeta(tags) {
  titleEl.textContent = tags.title || "Unknown Title";
  artistEl.textContent = tags.artist || "Unknown Artist";
  albumEl.textContent = tags.album || "";

  if (tags.picture) {
    const { data, format } = tags.picture;
    let base64String = "";
    for (let i = 0; i < data.length; i++) {
      base64String += String.fromCharCode(data[i]);
    }
    coverEl.src = `data:${format};base64,${window.btoa(base64String)}`;
  } else {
    coverEl.src = "default-cover.png";
  }
}

function loadSong(index, autoplay) {
  currentIndex = index;
  const song = SONGS[index];

  audio.src = song.url;
  if (autoplay) audio.play();
  highlightActive(index);

  titleEl.textContent = song.name;
  artistEl.textContent = "";
  albumEl.textContent = "";
  coverEl.src = "default-cover.png";

  if (metaCache[song.url]) {
    applyMeta(metaCache[song.url]);
    return;
  }

  window.jsmediatags.read(song.url, {
    onSuccess: function (tag) {
      metaCache[song.url] = tag.tags;
      if (currentIndex === index) applyMeta(tag.tags);
    },
    onError: function (error) {
      console.log("Metadata read karvama error (" + song.name + "):", error);
    }
  });
}

audio.addEventListener("ended", () => {
  if (SONGS.length === 0) return;
  const nextIndex = (currentIndex + 1) % SONGS.length;
  loadSong(nextIndex, true);
});

(async function init() {
  setStatus("Songs load thai rahi che...");
  SONGS = await fetchSongList();

  if (SONGS.length === 0) return;

  setStatus("");
  buildPlaylistUI();
  loadSong(0, false);
})();
