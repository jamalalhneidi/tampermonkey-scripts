// ==UserScript==
// @name         AtCoder - Enhancer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Hover tasks tab for a dropdown menu of problems. Hover results tab to show dropdown menu.
// @author       You
// @match        https://atcoder.jp/contests/*
// @require      file:\\wsl$\Ubuntu\root\tampermonkey-scripts\scripts\AtCoder - Enhancer.js
// ==/UserScript==

const contestId = location.pathname.match(/^\/contests\/([^/]+)/)?.[1];

const fetchProblems = async () => {
    const res = await fetch(`https://atcoder.jp/contests/${contestId}/tasks`);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const tableBody = doc.getElementsByTagName('table')[0].childNodes[3];
    const list = [];
    for (const el of tableBody.children) {
        list.push({
            name: `${el.children[0].textContent} - ${el.children[1].textContent}`,
            url: el.children[0].children[0].href,
        });
    }
    return list;
};

const setupListeners = (el) => {
    el.addEventListener('mouseover', () => {
        el.classList.add('open');
    });
    el.addEventListener('mouseout', () => {
        el.classList.remove('open');
    });
};

const setupResultsHover = (el) => {
    setupListeners(el);
};

const setupTasksHover = async (el) => {
    const caret = document.createElement('span');
    caret.classList.add('caret');
    el.childNodes[0].appendChild(caret);
    const problems = await fetchProblems();
    const ul = document.createElement('ul');
    ul.classList.add('dropdown-menu');
    for (const { name, url } of problems) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = name;
        a.href = url;
        li.appendChild(a);
        ul.appendChild(li);
    }
    el.appendChild(ul);
    setupListeners(el);
};

(function () {
    'use strict';
    console.log('AtCoder Enhancer');
    if (!contestId) return;
    const tabs = document.getElementById('contest-nav-tabs').childNodes[3];
    const results = tabs.childNodes[9];
    const tasks = tabs.childNodes[3];
    if (!results) return;
    setupTasksHover(tasks);
    setupResultsHover(results);
})();
