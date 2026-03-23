<!-- options.html -->
<!DOCTYPE html>
<html>
<head>
<title>Gentle Reader Settings</title>
<link rel="stylesheet" href="popup.css">
</head>
<body>
<h2>✨ Gentle Reader Settings</h2>
<div class="setting">
<label>Voice:</label>
<select id="voice-select">
<option value="en-US-Wavenet-C">Wavenet-C (Motherly, Warm)</option>
<option value="en-US-Neural2-C">Neural2-C (Slightly Crisper)</option>
</select>
</div>

<div class="setting">
<label>Highlight Color:</label>
<input type="color" id="highlight-color" value="#FFD54F">
</div>

<div class="setting">
<label>Speaking Rate:</label>
<input type="range" id="rate-slider" min="0.7" max="1.3" step="0.05" value="0.92">
<span id="rate-value">0.92</span>
</div>

<div class="setting">
<label>API Key:</label>
<input type="password" id="api-key" placeholder="Enter Google Cloud API key">
<button id="save-btn">Save</button>
</div>

<p style="font-size:0.85em; color:#666; margin-top:20px;">
💡 Get a free API key at <a href="https://console.cloud.google.com/ai-speech" target="_blank">Google Cloud Speech-to-Text</a>. Enable "Cloud Text-to-Speech API".
</p>

<script src="options.js"></script>
</body>
</html>
