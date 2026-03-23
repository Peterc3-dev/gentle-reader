// content.js
let currentHighlightSpan = null;
let audioElement = null;
let cleanupTimeout = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startReading") {
    readAloud(request.text, request.apiKey);
  } else if (request.action === "stopReading") {
    stopReading();
  } else if (request.action === "showApiKeyPrompt") {
    showApiKeyPrompt();
  }
});

async function readAloud(text, apiKey) {
  stopReading(); // Clean up previous session

  // Wrap each word in <span class="gr-word"> for highlighting
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordSpans = words.map((word, i) =>
    `<span class="gr-word" data-index="${i}">${word}</span>`
  );
  const container = document.createElement('div');
  container.className = 'gr-container';
  container.innerHTML = wordSpans.join(' ');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '0';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  try {
    // Request SSML + timepoints from Google Cloud TTS
    const ssml = `<speak>${words.map(w => `<mark name="w${w.replace(/[^a-zA-Z0-9]/g, '')}"/>${w}`).join(' ')}</speak>`;
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { ssml },
          voice: { languageCode: 'en-US', name: 'en-US-Wavenet-C' },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.92,   // Slightly slower for warmth
            pitch: -1.0           // Softer, lower pitch (more maternal)
          },
          enableTimePointing: true
        })
      }
    );

    const json = await response.json();
    if (json.error) throw new Error(json.error.message);

    const audioUrl = `data:audio/mp3;base64,${json.audioContent}`;
    const timepoints = json.timepoints || [];

    // Play audio
    audioElement = new Audio(audioUrl);
    audioElement.volume = 0.7;

    // Highlight words on timepoint
    const wordMap = {};
    timepoints.forEach(tp => {
      const match = tp.markName.match(/^w([a-zA-Z0-9]+)$/);
      if (match) {
        const cleanWord = match[1];
        // Find first matching span by index or word (robust fallback)
        const idx = Array.from(container.children).findIndex(el =>
          el.textContent.startsWith(cleanWord) && !el.classList.contains('gr-highlight')
        );
        if (idx !== -1) wordMap[idx] = tp.timeSeconds;
      }
    });

    // Sort timepoints by time
    const sortedIndices = Object.entries(wordMap)
      .sort((a, b) => a[1] - b[1])
      .map(([idx]) => parseInt(idx));

    // Start playback + highlight
    audioElement.addEventListener('play', () => {
      let i = 0;
      const highlightNext = () => {
        if (i >= sortedIndices.length) return;
        const idx = sortedIndices[i];
        const span = container.children[idx];
        if (span) {
          span.classList.add('gr-highlight');
          if (currentHighlightSpan) currentHighlightSpan.classList.remove('gr-highlight');
          currentHighlightSpan = span;
        }
        i++;
        setTimeout(highlightNext, 150); // ~150ms per word (adjustable)
      };
      highlightNext();
    });

    audioElement.addEventListener('ended', stopReading);
    audioElement.addEventListener('pause', stopReading);
    audioElement.play().catch(e => console.warn("Audio play failed:", e));

    // Cleanup after 10s idle
    cleanupTimeout = setTimeout(() => {
      if (audioElement?.paused) stopReading();
    }, 10000);

  } catch (err) {
    console.error("TTS Error:", err);
    alert("❌ Failed to read aloud. Please check your Google Cloud API key.");
    stopReading();
  }
}

function stopReading() {
  if (cleanupTimeout) clearTimeout(cleanupTimeout);
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
  if (currentHighlightSpan) {
    currentHighlightSpan.classList.remove('gr-highlight');
    currentHighlightSpan = null;
  }
  const container = document.querySelector('.gr-container');
  if (container) container.remove();
}

function showApiKeyPrompt() {
  const div = document.createElement('div');
  div.innerHTML = `
    <div style="
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000; max-width: 400px; font-family: sans-serif;
    ">
      <h3>🔑 API Key Required</h3>
      <p>To use the gentle Wavenet-C voice, please enter your Google Cloud API key:</p>
      <input id="api-key-input" type="password" placeholder="Enter key..." style="width:100%; padding:8px; margin:8px 0; border:1px solid #ccc; border-radius:4px;">
      <button id="save-key-btn" style="background:#4CAF50; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">Save & Retry</button>
      <p style="font-size:0.8em; color:#666; margin-top:10px;">
        🔒 Keys are stored encrypted in Chrome storage. Never sent to third parties.
      </p>
    </div>
  `;
  document.body.appendChild(div);

  document.getElementById('save-key-btn').onclick = async () => {
    const key = document.getElementById('api-key-input').value.trim();
    if (key) {
      await chrome.storage.local.set({ apiKey: key });
      div.remove();
      // Retry reading
      const selection = window.getSelection().toString().trim();
      if (selection) {
        chrome.runtime.sendMessage({
          action: "startReading",
          text: selection,
          apiKey: key
        });
      }
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') div.remove();
  });
}
