# My Songs Player (Auto-detect version)

## Kai rite kaam kare che

Aa version ma **koi code change nathi karvo padto**. Bas tamari song files
(`.mp3`, `.m4a`, `.wav`, `.ogg`, `.flac` - kai pan chalse) `song_list`
folder ni andar nakho, ane website automatic e badhi songs detect karine
playlist ma batavse.

Aa kai rite thai che: website GitHub na public API thi runtime par
`song_list` folder ni file-list pucche che (owner/repo automatic
`username.github.io` URL parthi nikadi levaay che) - etle koi manual
list rakhvani jaroor nathi.

## Steps

1. GitHub repo banavo, aa badhi files (`index.html`, `style.css`,
   `script.js`, `config.js`, `default-cover.png`, `song_list` folder)
   upload kari do.

2. `song_list` folder ni andar tamari badhi songs nakho - jetli
   pan songs nakhso etli badhi automatic dekhaay jashe.

3. Repo Settings > Pages ma jaine branch select karo (`main` ke jem
   pan tamari default branch hoy), save karo.

4. Link male pachi (`username.github.io/repo-name`) website kholo -
   badhi songs playlist ma dekhaase, click karo etle vagse.

## Navi song umervi hoy tyare

Bas file `song_list` folder ma nakho ane website refresh karo -
badas! Koi code touch nathi karvano.

## Dhyan rakhva jevu

- `config.js` ma `GITHUB_BRANCH` default `"main"` set kareli che -
  jo tamari repo ni default branch `master` hoy to e ek line badlo.
- Aa GitHub na public API nu unauthenticated rate limit vapre che
  (~60 requests/hour per IP) - personal use mate koi problem nai
  aave, pan bahu vaar refresh karso to thoda time mate limit
  aavi shake.
- Local par (double-click thi file kholine) test karso to auto-detect
  kaam nai kare (e fakt `.github.io` domain par kaam kare che) -
  local testing mate `config.js` ni andar `MANUAL_FALLBACK` list ma
  path lakhi shako.
