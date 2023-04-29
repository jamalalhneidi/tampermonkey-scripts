// ==UserScript==
// @name         Video Speed Hotkeys
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Shift + . to increase speed. Shift + , to decrease speed
// @author       You
// @match        *://*/*
// @exclude      https://www.youtube.com/*
// @grant        none
// ==/UserScript==

const DELTA = 0.25;
const NOTI_ID = 'custom-playback-noti';
let speed = 1;
const getVideos = () => Array.from(document.getElementsByTagName('video'));
const syncSpeed = (videos) => {
    if (videos.every(v => v.playbackRate === speed)) return true;
    videos.forEach(v => v.playbackRate = speed);
    return false;
}
const increaseSpeed = (videos) => {
    const synced = syncSpeed(videos);
    if (synced) {
        speed += DELTA;
        videos.forEach(v => { v.playbackRate = speed });
    }
    notify();
};
const decreaseSpeed = (videos) => {
    const synced = syncSpeed(videos);
    if (synced) {
        if (speed - DELTA <= 0) return;
        speed -= DELTA;
    }
    videos.forEach(v => { v.playbackRate = speed });
    notify();
};
let timeout = null;
const notify = () => {
    let notiEl;
    if (timeout) {
        clearTimeout(timeout);
        notiEl = document.getElementById(NOTI_ID);
    } else {
        notiEl = document.createElement('span');
        notiEl.setAttribute('id', NOTI_ID);
        notiEl.style.position = 'fixed';
        notiEl.style.top = '50%';
        notiEl.style.left = '50%';
        notiEl.style.backgroundColor = 'rgba(128, 128, 128, 0.5)';
        notiEl.style.padding = '8px';
        notiEl.style.borderRadius = '50%';
        notiEl.style.zIndex = '9999';
        document.body.appendChild(notiEl);
    }
    notiEl.textContent = `${speed}x`;
    timeout = setTimeout(() => {
        document.body.removeChild(notiEl);
        timeout = null
    }, 500)
}
(function () {
    'use strict';
    // Your code here...
    console.log('Attaching custom video playback speed hotkeys.');
    const listener = (e) => {
        if (!e.shiftKey) return;
        const videos = getVideos();
        if (!videos.length) return;
        if (e.key === '>') increaseSpeed(videos);
        else if (e.key === '<') decreaseSpeed(videos);
    };
    window.addEventListener('keydown', listener);
})();