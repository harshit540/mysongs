// ==========================================================
// Aa file GitHub Pages par tamaru repo auto-detect kare che,
// jethi song_list folder ni andar ni files GitHub API thi
// automatic fetch thai jay - koi manual list rakhvani jaroor nathi.
//
// Jo tame local par test karo (double-click / live-server) to
// GITHUB_OWNER ane GITHUB_REPO khali "" j rahese - tyare niche
// no niche apel MANUAL_FALLBACK list use thashe (testing mate).
// ==========================================================

let GITHUB_OWNER = "";
let GITHUB_REPO = "";
const GITHUB_BRANCH = "main"; // jo tamari default branch "master" hoy to badlo
const SONGS_FOLDER = "song_list";

// username.github.io par hosted hoy to hostname ane path thi
// owner/repo automatic nikadi levaay che
const host = window.location.hostname; // e.g. harshit540.github.io
const pathParts = window.location.pathname.split("/").filter(Boolean); // e.g. ["repo-name"]

if (host.endsWith(".github.io")) {
  GITHUB_OWNER = host.replace(".github.io", "");
  // Project page (username.github.io/repo-name/) hoy to path no pehlo part j repo name
  // User page (username.github.io) hoy to repo naam "username.github.io" j hoy che
  GITHUB_REPO = pathParts.length > 0 ? pathParts[0] : `${GITHUB_OWNER}.github.io`;
}

// Local testing mate fallback list (optional) - production ma use nathi thati
const MANUAL_FALLBACK = [
  // "song_list/song1.mp3",
  // "song_list/song2.m4a",
];
