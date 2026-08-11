const fileInput = document.getElementById("fileInput");
const playPauseBtn = document.getElementById("playPauseBtn");
const stopBtn = document.getElementById("stopBtn");
const tempoRange = document.getElementById("tempoRange");
const tempoValue = document.getElementById("tempoValue");
const trackSelect = document.getElementById("trackSelect");
const alphaTabElement = document.getElementById("alphaTab");
const statusMessage = document.getElementById("statusMessage");

let api = null;
let currentHighlight = [];

const settings = {
  player: {
    enablePlayer: true,

    // Включаем настоящий курсор alphaTab
    enableCursor: false,

    soundFont:
      "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.3.0/dist/soundfont/sonivox.sf2",
  },

  display: {
    resources: {
      fontDirectory:
        "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.3.0/dist/font/",
    },
  },
};

function setStatus(text, type = "") {
  statusMessage.textContent = text;

  statusMessage.className = "status-message";

  if (type) statusMessage.classList.add(type);
}

try {
  if (typeof alphaTab === "undefined")
    throw new Error("alphaTab не загрузился");

  api = new alphaTab.AlphaTabApi(alphaTabElement, settings);

  cursor = document.createElement("div");

  cursor.className = "songsterr-cursor";

  alphaTabElement.appendChild(cursor);

  setStatus("Система готова. Откройте GP файл", "success");
} catch (error) {
  console.error(error);

  setStatus(error.message, "error");
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setStatus(`Загрузка ${file.name}`, "success");

  const reader = new FileReader();

  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);

    api.load(data);
  };

  reader.readAsArrayBuffer(file);
});

if (api) {
  api.scoreLoaded.on((score) => {
    setStatus(`Загружено: ${score.title || "Без названия"}`, "success");

    playPauseBtn.disabled = false;

    stopBtn.disabled = false;

    tempoRange.disabled = false;

    trackSelect.disabled = false;

    trackSelect.innerHTML = "";

    score.tracks.forEach((track) => {
      const option = document.createElement("option");

      option.value = track.index;

      option.textContent = track.name || `Дорожка ${track.index + 1}`;

      trackSelect.appendChild(option);
    });
  });

  api.playerStateChanged.on((state) => {
    if (state === 1) playPauseBtn.textContent = "Pause";
    else playPauseBtn.textContent = "Play";
  });
}

playPauseBtn.onclick = () => {
  if (api) api.playPause();
};

stopBtn.onclick = () => {
  if (api) api.stop();
};

trackSelect.onchange = (e) => {
  const track = api.score.tracks[parseInt(e.target.value)];

  if (track) api.renderTracks([track]);
};

tempoRange.oninput = (e) => {
  const value = e.target.value;

  tempoValue.textContent = value + "%";

  if (api) api.playbackSpeed = value / 100;
};

if (api) {
  api.playerPositionChanged.on((position) => {
    if (!api.score) return;

    const beat = api.tickCache?.getBeatAtTick(position.currentTick);

    if (!beat) return;

    const bounds = api.getBounds(beat);

    if (bounds) {
      cursor.style.left = bounds.x + "px";

      cursor.style.top = bounds.y + "px";

      cursor.style.height = bounds.height + "px";

      cursor.style.display = "block";
    }
  });

  api.playedBeatChanged.on((beat) => {
    // убираем старую подсветку

    currentHighlight.forEach((note) => {
      note.classList.remove("playing-note");
    });

    currentHighlight = [];

    if (!beat) return;

    beat.notes.forEach((note) => {
      const elements = document.querySelectorAll(`[data-note-id="${note.id}"]`);

      elements.forEach((el) => {
        el.classList.add("playing-note");

        currentHighlight.push(el);
      });
    });
  });

  api.playerStateChanged.on((state) => {
    if (state !== 1) {
      cursor.style.display = "none";
    }
  });
}
