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

audio.addEventListener('ended', () => {
    if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log(e));
    } else {
        // IMPORTANT: Appel synchrone de nextTrack pour conserver le geste utilisateur (mobile)
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
    const track = tracks[index];
    
    // Activer le mode échange pour ignorer les événements pause intermédiaires
    isSwapping = true;
    
    audio.pause();
    audio.src = track.url;
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
        // Appel DIRECT de play() sans setTimeout pour éviter le blocage iOS/Mobile en arrière-plan
        const p = audio.play();
        if (p !== undefined) {
            p.catch(e => {
                console.log("Lecture auto bloquée, tentative de secours...");
                // Secours uniquement si bloqué
                setTimeout(() => { if(isPlaying) audio.play(); }, 100);
            });
        }
    }
    
    // Désactiver le flag après que l'appel synchrone soit fini
    // On utilise un petit délai pour le flag uniquement, pas pour le play
    setTimeout(() => { isSwapping = false; }, 300);
}

function prevTrack() {
    if (tracks.length === 0) return;
    isPlaying = true;
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
}

function nextTrack(forcePlay = false) {
    if (tracks.length === 0) return;
    if (forcePlay) isPlaying = true;
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
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
            currentTrackIndex = 0;
        } else {
            tracks = [...tracks, ...newTracks];
        }
        renderPlaylist();
        isPlaying = true;
        loadTrack(currentTrackIndex);
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
                { src: 'images.png', sizes: '96x96', type: 'image/png' },
                { src: 'images.png', sizes: '128x128', type: 'image/png' },
                { src: 'images.png', sizes: '192x192', type: 'image/png' },
                { src: 'images.png', sizes: '256x256', type: 'image/png' },
                { src: 'images.png', sizes: '384x384', type: 'image/png' },
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
    }, 1500);
});
