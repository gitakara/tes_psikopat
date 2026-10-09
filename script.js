// --- LOAD SEMUA FILE SVG SEBAGAI GAMBAR ---
const svgAssets = {};
const svgFiles = {
    track: 'track.svg',
    trolley: 'trolley.svg',
    you: 'you.svg',
    youPull: 'you-pull.svg',
    oneGuy: 'one-guy.svg',
    fiveGuys: 'five-guys.svg',
    richGuy: 'rich-guy.svg',
    cat: 'cat.svg'
};

let loadedCount = 0;
const totalAssets = Object.keys(svgFiles).length;

for (let key in svgFiles) {
    svgAssets[key] = new Image();
    svgAssets[key].src = svgFiles[key];
    svgAssets[key].onload = () => {
        loadedCount++;
        if (loadedCount === totalAssets) {
            drawScene();
        }
    };
}

// --- DATA LEVEL GAME ---
const levels = [
    {
        title: "Tingkat 1: Dilema Klasik",
        desc: "Waduh! Kereta maut sedang meluncur menuju 5 orang. Kamu bisa menarik tuas untuk membelokkan kereta ke jalur lain, yang akan menabrak 1 orang saja. Apa yang akan kamu lakukan?",
        targetTop: "oneGuy",
        targetBottom: "fiveGuys",
        pullPct: 68
    },
    {
        title: "Tingkat 2: Abang Bakso Favorit",
        desc: "Kereta mengarah ke 5 orang asing. Jika kamu menarik tuas, kereta berpindah menabrak 1 Abang Bakso langgananmu yang cuma dia satu-satunya yang tahu racikan resep kuah gurih kesukaanmu.",
        targetTop: "richGuy",
        targetBottom: "fiveGuys",
        pullPct: 42
    },
    {
        title: "Tingkat 3: Si Kucing Oranye",
        desc: "Kereta meluncur ke 5 orang yang suka buang sampah sembarangan di sungai. Jika kamu tarik tuas, kereta menabrak 1 Kucing Oranye (Oyabun) yang sedang santuy rebahan di rel.",
        targetTop: "cat",
        targetBottom: "fiveGuys",
        pullPct: 29
    },
    {
        title: "Tingkat 4: Konser & Calo",
        desc: "Kereta meluncur menuju 5 penonton konser yang desak-desakan. Jika kamu menarik tuas, kereta menabrak 1 Calo Tiket yang memegang tiket VIP festival musik impianmu.",
        targetTop: "richGuy",
        targetBottom: "fiveGuys",
        pullPct: 77
    },
    {
        title: "Tingkat 5: Dilema 1 vs 1",
        desc: "Kereta mengarah ke 1 orang kaya bermobil mewah. Jika kamu menarik tuas, kereta berbelok menabrak 1 orang biasa.",
        targetTop: "oneGuy",
        targetBottom: "richGuy",
        pullPct: 53
    }
];

let currentLevel = 0;
let isAudioMuted = false;
let isMusicOff = false;
let isLeverPulled = false;
let trolleyPos = 0;
let isAnimating = false;
let animId = null;

// Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (isAudioMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'click') {
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        } else if (type === 'clack') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        }
    } catch(e){}
}

function toggleSound() {
    isAudioMuted = !isAudioMuted;
    document.getElementById('muteBtn').innerText = isAudioMuted ? "Unmute" : "Mute";
}

function toggleAudio() {
    isMusicOff = !isMusicOff;
    document.getElementById('musicBtn').innerText = isMusicOff ? "Nyalakan Musik" : "Matikan Musik";
}

// --- CANVAS RENDER ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Gambar Track SVG
    if (svgAssets.track.complete) {
        ctx.drawImage(svgAssets.track, 20, 20, 710, 340);
    }

    // 2. Gambar Karakter "KAMU" (Tergantung Tuas Ditarik/Belum)
    let youImg = isLeverPulled ? svgAssets.youPull : svgAssets.you;
    let px = 150, py = 210; // Ubah nilai ini jika mau menggeser posisi KAMU
    if (youImg && youImg.complete) {
        ctx.drawImage(youImg, px, py, 140, 140);
    }

    // Teks Label "KAMU"
    ctx.font = 'bold 20px "Comic Neue", cursive';
    ctx.fillStyle = '#000000';
    ctx.fillText("KAMU", px - 10, py + 30);

    // 3. Gambar Target di Rel Atas dan Rel Bawah
    const lvl = levels[currentLevel];
    if (lvl) {
        // Target Atas
        let topImg = svgAssets[lvl.targetTop];
        if (topImg && topImg.complete) {
            let w = lvl.targetTop === 'cat' ? 90 : 100;
            let h = lvl.targetTop === 'cat' ? 70 : 100;
            ctx.drawImage(topImg, 510, 30, w, h);
        }

        // Target Bawah
        let bottomImg = svgAssets[lvl.targetBottom];
        if (bottomImg && bottomImg.complete) {
            let w = lvl.targetBottom === 'fiveGuys' ? 160 : 100;
            let h = lvl.targetBottom === 'fiveGuys' ? 120 : 100;
            ctx.drawImage(bottomImg, 460, 210, w, h);
        }
    }

   // 4. Gambar Kereta Trolley SVG
    let tx, ty;

    // BISA DIUBAH: Pengatur offset tinggi global (tambah angka untuk menurunkan, kurangi untuk menaikkan)
    const offsetY = -40; 

    if (!isLeverPulled) {
        // Jalur Lurus / Bawah
        tx = 20 + trolleyPos * 460;
        ty = (10 + offsetY) + trolleyPos * 200; 
    } else {
        // Jalur Membelok / Atas
        if (trolleyPos < 0.40) {
            // Fase 1: Berjalan di rel utama sebelum belokan
            tx = 10 + trolleyPos * 460;
            ty = (10 + offsetY) + trolleyPos * 200;
        } else {
            // Fase 2: Belok menanjak ke rel atas
            let progress = (trolleyPos - 0.40) / 0.60;
            tx = 204 + progress * 310;
            ty = (90 + offsetY) - progress * 45;
        }
    }

    if (svgAssets.trolley.complete) {
        ctx.drawImage(svgAssets.trolley, tx, ty, 180, 130);
    }
}

function loadLevel(idx) {
    if (idx >= levels.length) {
        showEndScreen();
        return;
    }

    currentLevel = idx;
    const lvl = levels[idx];

    document.getElementById('levelTitle').innerText = lvl.title;
    document.getElementById('descriptionBox').innerText = lvl.desc;

    document.getElementById('actionArea').style.display = 'flex';
    document.getElementById('resultPanel').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';

    isLeverPulled = false;
    trolleyPos = 0;
    isAnimating = false;

    drawScene();
}

function makeChoice(pull) {
    if (isAnimating) return;

    playSound('click');
    isLeverPulled = pull;
    isAnimating = true;

    let startTime = null;
    const duration = 1200;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        let elapsed = timestamp - startTime;
        trolleyPos = Math.min(elapsed / duration, 0.88);

        drawScene();

        if (elapsed < duration) {
            animId = requestAnimationFrame(animate);
        } else {
            playSound('clack');
            isAnimating = false;
            showResults(pull);
        }
    }

    animId = requestAnimationFrame(animate);
}

function showResults(pulled) {
    const lvl = levels[currentLevel];
    document.getElementById('actionArea').style.display = 'none';
    document.getElementById('resultPanel').style.display = 'flex';

    let pullPct = lvl.pullPct;
    let skipPct = 100 - pullPct;

    document.getElementById('barPull').style.width = pullPct + '%';
    document.getElementById('barPull').innerText = pullPct + '%';

    document.getElementById('barSkip').style.width = skipPct + '%';
    document.getElementById('barSkip').innerText = skipPct + '%';

    let chosenText = pulled ? "menarik tuas" : "biarkan saja";
    let matchPct = pulled ? pullPct : skipPct;

    document.getElementById('statsText').innerText = 
        `${matchPct}% pemain lain juga memilih ${chosenText}.`;
}

function nextLevel() {
    playSound('click');
    loadLevel(currentLevel + 1);
}

function showEndScreen() {
    document.getElementById('levelTitle').innerText = "Selesai!";
    document.getElementById('descriptionBox').style.display = 'none';
    document.getElementById('actionArea').style.display = 'none';
    document.getElementById('resultPanel').style.display = 'none';
    document.getElementById('endScreen').style.display = 'flex';
}

function restartGame() {
    playSound('click');
    document.getElementById('descriptionBox').style.display = 'flex';
    loadLevel(0);
}

window.onload = () => {
    loadLevel(0);
};