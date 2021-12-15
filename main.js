var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken('BQCqOEEPxByx_EMN3KhoZNhHCA1Vl9oVLpDSvzZRamZ-x1NR49_mbMKhXpu1NqsjUAMb0jyCNZV4MNI6ShDXpfRtIa4V5mv3ekGIn0zuCd-fx6wrssRtOxMDs8OU4uvLAyKYZVs0hOo2v_CcCWzYcUn-Swa9eaUkpeekDDNDVXiQWyXOBj1yDPxFd6QVWrBrEK-AsDc1H38a7QruCkk3AgriQoZX-2DzBu6VGDRwuMXasq5s_JrSOyUWSIpkTihwQftMiDUuhrkPmMVQC5Y52zpXK5c_Il85IPBHr5INVuzJ')
function getPlaylists() {
    spotifyApi.getUserPlaylists('3ycq8xooerqm1uh76g455t0c8').then(function (result) {
        console.log(result);
        for(let i = 0; i < result.items.length;i++){
            document.write(`<img src="${result.items[i].images[0].url}" title="${result.items[i].name}" onclick="createPlay('3ycq8xooerqm1uh76g455t0c8','${result.items[i].id}','${result.items[i].name}','tempo')">`)
        }
    })
}
async function sortPlaylist(id){
  return  getPlaylistWithTracks(id).then(async function (result) {
        console.log('***', result);
        const ret = result.items;
        while (result.next) {
            result = await getPlaylistWithTracks(id, result.offset + 50);
            ret.push(...result.items)
        }
        urn = await getFeatures(ret.map(t => t.track.id), ret.map(t => t.track))
        urn = urn.filter(x=>x.track.type=='track')
        songs = [];
        console.log(urn);
        songs = urn.map(function(x){return {"name":x.track.id,"bpm":x.features.tempo}});
        songs=songs.sort((a,b)=>a.bpm-b.bpm)
        ids = songs.map(x=>x.name)
        console.log(ids);   
        console.log(songs);
return ids;
})}
async function createPlay(uid,pid,pname,param){
    ids = await sortPlaylist(pid);
    ids = ids.map(x=>`spotify:track:${x}`).reverse();
    spotifyApi.createPlaylist(uid,{name:`${pname} sorted by ${param}`}).then(function(result){
        spotifyApi.addTracksToPlaylist(result.id,ids)
    })
}
getPlaylists();
async function getPlaylistWithTracks(id, offset = 0) {
    // return await spotifyApi.getPlaylistTracks(id, {
    //     offset: offset
    // });
    return await spotifyApi.getPlaylistTracks(id,{ limit: 50, offset: offset });
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