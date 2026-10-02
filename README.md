# Avi Digital Scrapbook — Fixed

## Media files
Put both files in **public/assets/**:

```text
public/
  assets/
    intro.mp4
    our-song.mp3
```

The app also falls back to `/intro.mp4` and `/our-song.mp3` if you keep the files directly inside `public/`.

## Start
```bash
npm install
npm start
```
Then open http://localhost:3000

## Video voice
Tap **“Tap to play with sound”**. Mobile browsers require a user gesture before allowing autoplay with audio, so this button intentionally starts the video with its original voice.

## Background song
After the video finishes, tap **Open our story**. That user interaction starts `our-song.mp3` when the browser allows it. The music button in the top-right can pause/play it.
