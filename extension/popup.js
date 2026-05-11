const BACKEND_URL = "https://api.notturaai.xyz";
const REGISTER_URL = "https://nottura.ai/register"; // placeholder until domain is live

let mediaRecorder = null;
let audioChunks = [];
let captureStream = null;
let timerInterval = null;
let secondsElapsed = 0;
let totalBytes = 0;
let analyser = null;
let animFrameId = null;
let currentApiKey = null;

// Elements
const statusDot = document.getElementById("status-dot");
const statusLabel = document.getElementById("status-label");
const footerText = document.getElementById("footer-text");
const waveformWrap = document.getElementById("waveform-wrap");
const canvas = document.getElementById("waveform");
const ctx2d = canvas.getContext("2d");

const states = {
  auth:       document.getElementById("state-auth"),
  idle:       document.getElementById("state-idle"),
  recording:  document.getElementById("state-recording"),
  processing: document.getElementById("state-processing"),
  done:       document.getElementById("state-done"),
  error:      document.getElementById("state-error"),
};

// ── Boot ──────────────────────────────────────────────────────────────────────

chrome.storage.local.get(["api_key"], ({ api_key }) => {
  if (api_key) {
    currentApiKey = api_key;
    showState("idle");
    setStatus("", "STANDBY");
    setFooter("READY");
    loadUserInfo();
  } else {
    showState("auth");
    setStatus("", "STANDBY");
    setFooter("AUTH REQUIRED");
  }
});

async function loadUserInfo() {
  try {
    const res = await fetch(`${BACKEND_URL}/me`, {
      headers: { "x-api-key": currentApiKey },
    });
    if (!res.ok) {
      chrome.storage.local.remove("api_key");
      currentApiKey = null;
      showState("auth");
      setFooter("SESSION EXPIRED");
      return;
    }
    const data = await res.json();
    setFooter(`${data.minutes_remaining} MIN LEFT`);
    if (data.email) drawAvatar(data.email);
  } catch (_) {}
}

function drawAvatar(email) {
  const avatarCanvas = document.getElementById("user-avatar");
  const initial = (email[0] || "?").toUpperCase();
  const size = avatarCanvas.width;
  const ac = avatarCanvas.getContext("2d");

  ac.clearRect(0, 0, size, size);

  // Background
  ac.fillStyle = "#0d0d10";
  ac.beginPath();
  ac.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ac.fill();

  // Subtle cyan radial glow
  const grd = ac.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  grd.addColorStop(0, "rgba(0,229,255,0.12)");
  grd.addColorStop(1, "rgba(0,229,255,0)");
  ac.fillStyle = grd;
  ac.beginPath();
  ac.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ac.fill();

  // Initial
  ac.fillStyle = "#00e5ff";
  ac.font = `700 ${Math.round(size * 0.46)}px 'Rajdhani', sans-serif`;
  ac.textAlign = "center";
  ac.textBaseline = "middle";
  ac.shadowColor = "#00e5ff";
  ac.shadowBlur = 8;
  ac.fillText(initial, size / 2, size / 2 + 1);

  avatarCanvas.classList.remove("hidden");
}

// ── Auth screen ───────────────────────────────────────────────────────────────

document.getElementById("link-register").href = REGISTER_URL;

document.getElementById("btn-save-key").addEventListener("click", async () => {
  const key = document.getElementById("api-key-input").value.trim();
  if (!key.startsWith("nttr_")) {
    document.getElementById("api-key-input").style.borderColor = "var(--red)";
    return;
  }

  // Validate key against backend
  try {
    const res = await fetch(`${BACKEND_URL}/me`, {
      headers: { "x-api-key": key },
    });
    if (!res.ok) {
      document.getElementById("api-key-input").style.borderColor = "var(--red)";
      setFooter("INVALID KEY");
      return;
    }
    const data = await res.json();
    currentApiKey = key;
    chrome.storage.local.set({ api_key: key });
    showState("idle");
    setStatus("", "STANDBY");
    setFooter(`${data.minutes_remaining} MIN LEFT`);
    if (data.email) drawAvatar(data.email);
  } catch (err) {
    setFooter("CANNOT REACH SERVER");
  }
});

// ── State machine ─────────────────────────────────────────────────────────────

function setStatus(mode, label) {
  statusDot.className = "status-dot " + (mode || "");
  statusLabel.className = "status-label " + (mode || "");
  statusLabel.textContent = label;
}

function showState(name) {
  Object.entries(states).forEach(([key, el]) => {
    el.classList.toggle("hidden", key !== name);
  });
}

function setFooter(text) {
  footerText.textContent = text;
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function startTimer() {
  secondsElapsed = 0;
  totalBytes = 0;
  renderTimer();
  timerInterval = setInterval(() => {
    secondsElapsed++;
    renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function renderTimer() {
  const m = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
  const s = String(secondsElapsed % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${m}:${s}`;
  document.getElementById("rec-size").textContent = formatBytes(totalBytes);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// ── Waveform ──────────────────────────────────────────────────────────────────

function startWaveform(stream) {
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);
  waveformWrap.classList.add("visible");
  drawWaveform();
}

function drawWaveform() {
  animFrameId = requestAnimationFrame(drawWaveform);
  const w = canvas.width, h = canvas.height;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArray);
  ctx2d.clearRect(0, 0, w, h);

  ctx2d.strokeStyle = "rgba(0,229,255,0.08)";
  ctx2d.lineWidth = 1;
  ctx2d.beginPath();
  ctx2d.moveTo(0, h / 2);
  ctx2d.lineTo(w, h / 2);
  ctx2d.stroke();

  const gradient = ctx2d.createLinearGradient(0, 0, w, 0);
  gradient.addColorStop(0,   "rgba(0,229,255,0)");
  gradient.addColorStop(0.1, "rgba(0,229,255,0.9)");
  gradient.addColorStop(0.9, "rgba(0,229,255,0.9)");
  gradient.addColorStop(1,   "rgba(0,229,255,0)");

  ctx2d.strokeStyle = gradient;
  ctx2d.lineWidth = 1.5;
  ctx2d.shadowColor = "#00e5ff";
  ctx2d.shadowBlur = 6;
  ctx2d.beginPath();

  const sliceWidth = w / dataArray.length;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const y = (dataArray[i] / 128.0 * h) / 2;
    i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
    x += sliceWidth;
  }
  ctx2d.stroke();
  ctx2d.shadowBlur = 0;
}

function stopWaveform() {
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  waveformWrap.classList.remove("visible");
  analyser = null;
}

// ── Capture ───────────────────────────────────────────────────────────────────

document.getElementById("btn-start").addEventListener("click", async () => {
  setFooter("REQUESTING TAB AUDIO...");
  try {
    captureStream = await new Promise((resolve, reject) => {
      chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else if (!stream) reject(new Error("No audio stream. Is a video playing?"));
        else resolve(stream);
      });
    });

    audioChunks = [];
    mediaRecorder = new MediaRecorder(captureStream, { mimeType: "audio/webm" });
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) { audioChunks.push(e.data); totalBytes += e.data.size; }
    };
    mediaRecorder.start(1000);
    startTimer();
    startWaveform(captureStream);
    showState("recording");
    setStatus("active", "RECORDING");
    setFooter("CAPTURING AUDIO STREAM");
  } catch (err) {
    showError(err.message);
  }
});

document.getElementById("btn-stop").addEventListener("click", () => {
  if (!mediaRecorder) return;
  mediaRecorder.onstop = async () => {
    stopTimer();
    stopWaveform();
    captureStream.getTracks().forEach((t) => t.stop());
    showState("processing");
    setStatus("busy", "PROCESSING");
    await sendToBackend(new Blob(audioChunks, { type: "audio/webm" }));
  };
  mediaRecorder.stop();
});

// ── Processing steps ──────────────────────────────────────────────────────────

function setStep(n) {
  const labels = { 1: "TRANSCRIPTION", 2: "STRUCTURE", 3: "RENDER" };
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`proc-step-${i}`);
    if (i < n) { el.className = "proc-step done-step"; el.textContent = ""; }
    else if (i === n) { el.className = "proc-step"; el.textContent = "···"; }
    else { el.className = "proc-step inactive"; el.textContent = "···"; }
  }
  setFooter(labels[n] + "...");
}

// ── Backend call ──────────────────────────────────────────────────────────────

async function sendToBackend(audioBlob) {
  try {
    setStep(1);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.title) formData.append("title", tab.title);

    setStep(2);
    const response = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      headers: { "x-api-key": currentApiKey },
      body: formData,
    });

    setStep(3);
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail);
    }

    const pdfBlob = await response.blob();
    const url = URL.createObjectURL(pdfBlob);
    document.getElementById("download-link").href = url;
    showState("done");
    setStatus("done", "COMPLETE");
    setFooter("PDF READY");
    loadUserInfo(); // refresh minutes remaining
  } catch (err) {
    showError(err.message);
  }
}

// ── Error + reset ─────────────────────────────────────────────────────────────

function showError(message) {
  document.getElementById("error-text").textContent = message.toUpperCase();
  showState("error");
  setStatus("error", "FAULT");
  setFooter("SEE ERROR");
}

function reset() {
  audioChunks = [];
  mediaRecorder = null;
  captureStream = null;
  totalBytes = 0;
  stopTimer();
  stopWaveform();
  showState("idle");
  setStatus("", "STANDBY");
  loadUserInfo();
}

document.getElementById("btn-reset").addEventListener("click", reset);
document.getElementById("btn-reset-error").addEventListener("click", reset);
