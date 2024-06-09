// ==UserScript==
// @name         Ctrl+S Submit File
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  CTRL+S Submit File
// @author       You
// @match        https://*.codeforces.com/*
// @match        https://atcoder.jp/*
// @grant        none
// @require      file:\\wsl$\Ubuntu\root\tampermonkey-scripts\scripts\CF & AtCoder - Ctrl+S Submit File.js
// ==/UserScript==

const CODEFORCES = 'codeforces';
const ATCODER = 'atcoder';

const hostname = window.location.hostname;

const getCodeforcesControls = () => ({
    file: document.getElementsByName('sourceFile')[0],
    submit: document.getElementById('sidebarSubmitButton'),
});

const getAtcoderControls = () => ({
    file: document.getElementById('input-open-file'),
    submit: document.getElementById('submit'),
});

const getControls = () => {
    if (hostname.includes(CODEFORCES)) return getCodeforcesControls();
    else if (hostname.includes(ATCODER)) return getAtcoderControls();
    return { file: null, submit: null };
};

(function () {
    'use strict';
    const { file, submit } = getControls();
    if (!file) return;
    window.addEventListener('keydown', (e) => {
        if (e.key == 's' && e.ctrlKey) {
            e.preventDefault();
            if (!file.value) {
                file.click();
                return;
            }
            if (hostname.includes(CODEFORCES)) return submit.click();
            if (!document.getElementsByClassName('ace_layer ace_text-layer')[0].childNodes[0].childElementCount) {
                file.value = '';
                file.click();
            } else submit.click();
        }
    });
})();
