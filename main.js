var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken('BQBaDmZe32iAy0y4ak8CLvmVCX9U5eTQNPjDsHXMGeWNPJIBe4SEYfFQGtIi3LONSrKoDWfc4cXk6VbyvaUhC-wqnPlLzYetwqhgbicljagGPwusBNTP5mvcIP4zwdoz-kQH6AlNrVkEr66bA3wyiLprPi-WA3vjAWEqRjePwjDFSKhfMlJ86Uljy68JJYFTG1Yfjd__z2WWlgLBGIZj0bDFnSFhQ9vz3G9_THeYVbMKTIvjmDyRfAc7zhFhuHZtewbxevBAtQzCyT-jTrxvolFaAVLXdjAxLgpIB6m-nLStCo1thYQf1S-OhULACIuYHFkVRTnE80C7');
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