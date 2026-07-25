const audio = document.getElementById("audio");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const albumEl = document.getElementById("album");
const coverEl = document.getElementById("cover");
const playlistEl = document.getElementById("playlist");
const statusEl = document.getElementById("status");
const categoriesEl = document.getElementById("categories");

let currentIndex = 0;
let SONGS = []; // { name, url }
let currentFolder = SONGS_FOLDER; // abhi j active folder
const metaCache = {};
const preloadCache = {}; // url -> hidden Audio object (browser cache warm-up)

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

// Next song ne background ma pehla thi j download karva mandi do,
// jethi jyare switch thaay tyare browser no cache thi j vagi jay -
// koi wait/lag nathi thato.
function preloadSong(index) {
  if (index < 0 || index >= SONGS.length) return;
  const song = SONGS[index];
  if (preloadCache[song.url]) return;

  const hiddenAudio = new Audio();
  hiddenAudio.preload = "auto";
  hiddenAudio.src = song.url;
  hiddenAudio.load();
  preloadCache[song.url] = hiddenAudio;

  // Metadata (title/artist/cover) pan pehla thi j read kari levi
  if (!metaCache[song.url]) {
    window.jsmediatags.read(song.url, {
      onSuccess: function (tag) {
        metaCache[song.url] = tag.tags;
      },
      onError: function () {
        // Chup chaap ignore - actual play thay tyare fari try thashe
      }
    });
  }
}

// GitHub API thi ek folder ni andar ni files/folders levi
async function fetchFolderContents(folderPath) {
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${folderPath}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("GitHub API response not ok: " + res.status);
  return res.json();
}

// song_list ni andar sub-folders (categories) shodhvi
async function fetchCategories() {
  if (!(GITHUB_OWNER && GITHUB_REPO)) return [];
  try {
    const items = await fetchFolderContents(SONGS_FOLDER);
    return items.filter(item => item.type === "dir").map(item => item.name);
  } catch (err) {
    console.log("Categories fetch karvama error:", err);
    return [];
  }
}

// Ek chokkas folder (category) ni andar ni song files levi
async function fetchSongsInFolder(folderPath) {
  if (GITHUB_OWNER && GITHUB_REPO) {
    try {
      const files = await fetchFolderContents(folderPath);
      const audioFiles = files.filter(f =>
        f.type === "file" && /\.(mp3|m4a|wav|ogg|flac)$/i.test(f.name)
      );
      if (audioFiles.length > 0) {
        return audioFiles.map(f => ({ name: f.name, url: f.download_url }));
      }
      setStatus("Aa folder ma koi song file na madi.");
      return [];
    } catch (err) {
      console.log("GitHub API thi songs fetch karvama error:", err);
      setStatus("Songs auto-load na thai shaki.");
      return [];
    }
  }

  // Local testing - manual fallback list use karo
  if (typeof MANUAL_FALLBACK !== "undefined" && MANUAL_FALLBACK.length > 0) {
    return MANUAL_FALLBACK.map(path => ({ name: path.split("/").pop(), url: path }));
  }

  setStatus("Koi song nathi madyu. GitHub Pages par deploy karo, ke config.js ma MANUAL_FALLBACK list bharo.");
  return [];
}

function buildCategoryUI(categories) {
  categoriesEl.innerHTML = "";
  categories.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = "category-btn";
    btn.addEventListener("click", () => selectCategory(name));
    categoriesEl.appendChild(btn);
  });
}

function highlightActiveCategory(name) {
  [...categoriesEl.children].forEach(btn => {
    btn.classList.toggle("active", btn.textContent === name);
  });
}

async function selectCategory(folderName) {
  currentFolder = `${SONGS_FOLDER}/${folderName}`;
  highlightActiveCategory(folderName);

  audio.pause();
  audio.removeAttribute("src");
  playlistEl.innerHTML = "";
  titleEl.textContent = "Loading...";
  artistEl.textContent = "";
  albumEl.textContent = "";
  coverEl.src = "default-cover.png";

  setStatus("Songs load thai rahi che...");
  SONGS = await fetchSongsInFolder(currentFolder);
  setStatus("");

  if (SONGS.length === 0) return;

  buildPlaylistUI();
  loadSong(0, false);
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
  audio.preload = "auto";
  if (autoplay) audio.play();
  highlightActive(index);

  titleEl.textContent = song.name;
  artistEl.textContent = "";
  albumEl.textContent = "";
  coverEl.src = "default-cover.png";

  if (metaCache[song.url]) {
    applyMeta(metaCache[song.url]);
  } else {
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

  // Preload have loadSong ma nathi thato - audio khareker
  // "playing" thay tyare j niche na listener thi thashe.
}

audio.addEventListener("ended", () => {
  if (SONGS.length === 0) return;
  const nextIndex = (currentIndex + 1) % SONGS.length;
  loadSong(nextIndex, true);
});

// Current song khareker chaalu thay (buffering puru thai gayu, actual
// playback shru thayu) tyare j aagad ni ek song preload karo. Aana thi
// user zadpthi songs skip kare to pan vadhare data waste nathi thato -
// step by step, ek pachi ek, j preload thashe.
audio.addEventListener("playing", () => {
  if (SONGS.length === 0) return;
  preloadSong((currentIndex + 1) % SONGS.length);
});

(async function init() {
  setStatus("Load thai rahyu che...");

  const categories = await fetchCategories();

  if (categories.length > 0) {
    // song_list ni andar sub-folders male che - category mode
    buildCategoryUI(categories);
    setStatus("");
    await selectCategory(categories[0]);
  } else {
    // Koi sub-folder nathi - juna rite direct song_list ni songs
    categoriesEl.style.display = "none";
    document.querySelector(".category-header").style.display = "none";
    currentFolder = SONGS_FOLDER;
    SONGS = await fetchSongsInFolder(SONGS_FOLDER);
    setStatus("");
    if (SONGS.length === 0) return;
    buildPlaylistUI();
    loadSong(0, false);
  }
})();
