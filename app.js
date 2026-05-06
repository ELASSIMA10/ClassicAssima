const audio = document.getElementById('mainAudio');
let isPlaying = false;
let currentTrackIndex = 0;
let isLooping = false;
let isSwapping = false;

// Configuration des pistes
let tracks = [
    { name: "Medina d'Alger", url: "Medina d'alger.mp3", isFile: false },
    { name: "El Assima - Defra دفرة", url: "El Assima - Defra دفرة - Abdelghani Yaddaden.mp3", isFile: false },
    { name: "أرفد صباطك و أمشي - EL ASSIMA", url: "أرفد صباطك و أمشي - EL ASSIMA.mp3", isFile: false },
    { name: "El Assima – بالاتحاد عاليين", url: "El Assima – بالاتحاد عاليين.mp4", isFile: false }
];

const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loopBtn = document.getElementById('loopBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const albumArtContainer = document.querySelector('.album-art-container');
const audioUpload = document.getElementById('audioUpload');
const playlistEl = document.getElementById('playlist');

const playSvg = '<path d="M8 5v14l11-7z"/>';
const pauseSvg = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

function togglePlay() {
    if (tracks.length === 0) return;
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(e => console.log("Play failed:", e));
    }
}

audio.addEventListener('play', () => {
    isSwapping = false; 
    isPlaying = true;
    playIcon.innerHTML = pauseSvg;
    albumArtContainer.classList.add('playing');
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
    }
});

audio.addEventListener('pause', () => {
    if (isSwapping) return;
    isPlaying = false;
    playIcon.innerHTML = playSvg;
    albumArtContainer.classList.remove('playing');
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
});

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    progressBar.max = audio.duration;
});

// Événement de fin de chanson
audio.addEventListener('ended', () => {
    console.log("Fin de la chanson détectée");
    if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log(e));
    } else {
        // IMPORTANT: Appel DIRECT sans setTimeout pour conserver le privilège de lecture sur mobile
        nextTrack(true);
    }
});

progressBar.addEventListener('input', (e) => {
    const time = e.target.value;
    audio.currentTime = time;
    currentTimeEl.textContent = formatTime(time);
});

function updateProgress() {
    const { duration, currentTime } = audio;
    if (isNaN(duration)) return;
    progressBar.value = currentTime;
    currentTimeEl.textContent = formatTime(currentTime);
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function renderPlaylist() {
    playlistEl.innerHTML = '';
    if (tracks.length === 0) {
        playlistEl.innerHTML = '<li class="playlist-empty">Aucune musique chargée</li>';
        return;
    }
    tracks.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = track.name;
        if (index === currentTrackIndex) li.classList.add('active');
        li.addEventListener('click', () => {
            currentTrackIndex = index;
            isPlaying = true;
            loadTrack(currentTrackIndex);
        });
        playlistEl.appendChild(li);
    });
}

function loadTrack(index) {
    if (tracks.length === 0) return;
    
    // S'assurer que l'index est valide
    if (index >= tracks.length) index = 0;
    if (index < 0) index = tracks.length - 1;
    
    currentTrackIndex = index;
    const track = tracks[index];
    
    console.log("Changement vers la piste:", index, track.name);
    
    isSwapping = true;
    audio.pause();
    
    // Nettoyer l'ancienne source si nécessaire
    audio.src = "";
    audio.removeAttribute("src");
    audio.load();
    
    // Charger la nouvelle source
    audio.src = track.url;
    if (isPlaying) audio.autoplay = true;
    audio.load();
    
    trackTitle.textContent = track.name; 
    trackArtist.textContent = "CLASS1C El Assima";
    
    updateMediaSession();
    
    // UI Playlist
    const items = playlistEl.querySelectorAll('li');
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
            if(item.scrollIntoView) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });

    if (isPlaying) {
        // Forcer la lecture
        audio.play().catch(e => {
            console.log("Echec lecture auto, tentative retardée...");
            setTimeout(() => { if(isPlaying) audio.play(); }, 500);
        });
    }
}

function prevTrack() {
    if (tracks.length === 0) return;
    isPlaying = true;
    let nextIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(nextIndex);
}

function nextTrack(forcePlay = false) {
    if (tracks.length === 0) return;
    if (forcePlay) isPlaying = true;
    let nextIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(nextIndex);
}

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', () => nextTrack(true));

loopBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    loopBtn.style.opacity = isLooping ? '1' : '0.5';
    loopBtn.style.color = isLooping ? '#f43f5e' : '';
});

audioUpload.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
        const newTracks = newFiles.map(file => ({
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: URL.createObjectURL(file),
            isFile: true
        }));
        if (tracks.length === 1 && !tracks[0].isFile && tracks[0].url === "Medina d'alger.mp3") {
            tracks = [...newTracks];
        } else {
            tracks = [...tracks, ...newTracks];
        }
        renderPlaylist();
        isPlaying = true;
        loadTrack(tracks.length - newTracks.length);
    }
});

function updateMediaSession() {
    if ('mediaSession' in navigator) {
        const track = tracks[currentTrackIndex];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.name,
            artist: "CLASS1C El Assima",
            album: "El Assima Collection",
            artwork: [
                { src: 'images.png', sizes: '512x512', type: 'image/png' },
            ]
        });
        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack(true));
    }
}

renderPlaylist();
loadTrack(0);

// Autoplay au chargement
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!isPlaying) {
            audio.play().then(() => { isPlaying = true; }).catch(() => {
                const start = () => {
                    isPlaying = true;
                    loadTrack(currentTrackIndex);
                    document.removeEventListener('click', start);
                    document.removeEventListener('touchstart', start);
                };
                document.addEventListener('click', start);
                document.addEventListener('touchstart', start);
            });
        }
    }, 2000);
});
