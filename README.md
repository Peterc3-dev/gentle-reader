# Gentle Reader

A Chrome extension that reads highlighted text aloud using Google Cloud's Wavenet voice with synchronized word highlighting.

## Features

- **Highlight any text** on any webpage, right-click, and select "Gentle Reader: Read Aloud"
- **Google Cloud Wavenet-C voice** tuned for a warm, gentle reading tone
- **Word-by-word highlighting** with a soft glow animation as text is spoken
- **Configurable**: voice selection, highlight color, speaking rate
- **Secure**: API key stored locally in Chrome storage

## Install

1. Clone this repo
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select this directory

## Setup

1. Get a Google Cloud API key with the **Cloud Text-to-Speech API** enabled
2. Open the extension options page and enter your API key
3. Highlight text on any page, right-click, and choose **Gentle Reader: Read Aloud**

## Tech Stack

- Manifest V3 Chrome Extension
- Google Cloud Text-to-Speech API (Wavenet)
- SSML with timepoint-based word highlighting
- Vanilla JavaScript, no build step
