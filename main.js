var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken('BQC8gllSCys0VmsOrF2My8xANF-sBnOP14oGtqHc4Pmbkf-WUFsElAVa9RTglr9M6YJ17oelafub8geYjTCKTFD1zbL5ilmoCY_JtCHVH53304HgVRZa5NnmoUOos1jhUMv7mq1388oeN--WRcptDwXWLB3as6ND4UI1JvcHMSe48SGFM-DsV4SLRmdUoCO0Q3SpSXDnkGbuBdY8X2K6crJ2fhERgoJJyJFB904qwarHAmqtKi99tpK3oLcYL3XjODVE9bUmlHtqT9MrnEJUWqVa0Q-rZcLoT6EYgJgDpMQj')
function getPlaylists() {
    spotifyApi.getMySavedTracks('3ycq8xooerqm1uh76g455t0c8').then(function (result) {
        console.log(result);
        for (let i = 0; i < result.items.length; i++) {
            document.write(`<img src="${result.items[i].track.album.images[0].url}" title="${result.items[i].track.name}" onclick="createPlay('3ycq8xooerqm1uh76g455t0c8','${result.items[i].id}','${result.items[i].name}','tempo')">`)
        }
    })
}
async function sortPlaylist(id) {
    return getPlaylistWithTracks(id).then(async function (result) {
        console.log('***', result);
        const ret = result.items;
        while (result.next) {
            result = await getPlaylistWithTracks(id, result.offset + 50);
            ret.push(...result.items)
        }
        urn = await getFeatures(ret.map(t => t.track.id), ret.map(t => t.track))
        urn = urn.filter(x => x.track.type == 'track')
        songs = [];
        console.log(urn);
        songs = urn.map(function (x) { return { "name": x.track.id, "bpm": x.features.tempo } });
        songs = songs.sort((a, b) => a.bpm - b.bpm)
        ids = songs.map(x => x.name)
        console.log(ids);
        console.log(songs);
        return ids;
    })
}
async function createPlay(uid, pid, pname, param) {
    ids = await sortPlaylist(pid);
    ids = ids.map(x => `spotify:track:${x}`).reverse();
    spotifyApi.createPlaylist(uid, { name: `${pname} sorted by ${param}` }).then(function (result) {
        spotifyApi.addTracksToPlaylist(result.id, ids)
    })
}
getPlaylists();
async function getPlaylistWithTracks(id, offset = 0) {
    // return await spotifyApi.getPlaylistTracks(id, {
    //     offset: offset
    // });
    return await spotifyApi.getPlaylistTracks(id, { limit: 50, offset: offset });
}
async function getFeatures(ids, tracks) {

    songs = [];
    for (let i = 0; i < Math.ceil(ids.length / 50); i++) {

        const trackToAdd = (await spotifyApi.getAudioFeaturesForTracks(ids.slice(50 * i, 50 * (i + 1))));

        // Push the retreived tracks into the array
        trackToAdd.audio_features.forEach((item) => songs.push(item));
    }
    for (let i = 0; i < songs.length; i++) {
        songs[i] = { "features": songs[i], "track": tracks[i] }
    }
    return songs
}