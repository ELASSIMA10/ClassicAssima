const audio = new Audio();
let isPlaying = false;
let currentTrackIndex = 0;

// Nous avons maintenant un format d'objet pour gérer les pistes par défaut et celles chargées
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
        let playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Erreur de lecture: ", error);
                if(tracks[currentTrackIndex].url === "Medina d'alger.mp3") {
                    alert("Le fichier \"Medina d'alger.mp3\" est introuvable. Veuillez utiliser le bouton 'Ajouter des musiques'.");
                }
            });
        }
    }
}

audio.addEventListener('play', () => {
    isPlaying = true;
    playIcon.innerHTML = pauseSvg;
    albumArtContainer.classList.add('playing');
});

audio.addEventListener('pause', () => {
    isPlaying = false;
    playIcon.innerHTML = playSvg;
    albumArtContainer.classList.remove('playing');
});

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    progressBar.max = audio.duration;
});
audio.addEventListener('ended', nextTrack);

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
        
        if (index === currentTrackIndex) {
            li.classList.add('active');
        }
        
        li.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            if (!isPlaying) togglePlay();
        });
        
        playlistEl.appendChild(li);
    });
}

function loadTrack(index) {
    if (tracks.length === 0) return;
    
    const track = tracks[index];
    
    audio.src = track.url;
    trackTitle.textContent = track.name; 
    trackArtist.textContent = "CLASS1C El Assima";
    
    // Update active class in playlist
    const items = playlistEl.querySelectorAll('li');
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
            if(item.scrollIntoView) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            item.classList.remove('active');
        }
    });
    
    if (isPlaying) {
        audio.play().catch(e => console.log(e));
    }
}

function prevTrack() {
    if (tracks.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    if(isPlaying) audio.play().catch(e=>console.log(e));
}

function nextTrack() {
    if (tracks.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    if(isPlaying) audio.play().catch(e=>console.log(e));
}

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);

audioUpload.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
        
        const newTracks = newFiles.map(file => ({
            name: file.name.replace(/\.[^/.]+$/, ""),
            url: URL.createObjectURL(file),
            isFile: true
        }));
        
        // Retirer la chanson par défaut si l'utilisateur ajoute ses propres musiques et qu'elle n'était qu'un exemple
        if (tracks.length === 1 && !tracks[0].isFile && tracks[0].url === "Medina d'alger.mp3") {
            tracks = [...newTracks];
            currentTrackIndex = 0;
        } else {
            tracks = [...tracks, ...newTracks];
        }
        
        renderPlaylist();
        loadTrack(currentTrackIndex);
        
        if (!isPlaying) {
            audio.play().catch(e=>console.log(e));
        }
    }
});

// Initialisation au chargement
renderPlaylist();
loadTrack(0);
