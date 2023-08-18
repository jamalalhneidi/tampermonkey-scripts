// ==UserScript==
// @name         Unsolved problems' rating
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  CF - Get rating for unsolved problems
// @author       You
// @match        https://codeforces.com/problemset*
// @exclude      https://codeforces.com/problemset/problem*
// @icon         
// @grant        none
// ==/UserScript==

let problems;

const init = async () => {
    if (problems) return;
    const url = `https://codeforces.com/api/problemset.problems`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status != "OK") return;
    problems = data.result.problems;
}


const getRating = async (contestId, index) => {
    const problem = problems.find(p => `${p.contestId}` === `${contestId}` && `${p.index}` === `${index}`);
    return problem?.rating;
}

const getRatingList = async (problemIds) => {
    const res = {};
    const regex = /(\d+)([A-Z]\d?)/;
    for (const text of problemIds) {
        if (!regex.test(text)) continue;
        const [_, contestId, index] = text.match(regex);
        const rating = await getRating(contestId, index);
        res[text] = rating;
    }
    return res;
}

const extractProblemIds = (rows) => {
    const res = []
    for (const row of rows) {
        res.push(row.cells[0].textContent);
    }
    res.shift();
    return res;
}

const updateUI = (rows, rating) => {
    rows[0].insertCell(-1).outerHTML = "<th>Rating</th>";
    for (let i = 1; i < rows.length; i++) {
        rows[i].insertCell(-1);
        rows[i].cells[3].textContent = rating[rows[i].cells[0].textContent];
    }
}

(async function () {
    'use strict';
    console.log('Getting rating for unsolved problems');
    await init();

    const table = document.querySelector('.rtable');
    const rows = table.firstElementChild.rows;
    const problemIds = extractProblemIds(rows);
    const rating = await getRatingList(problemIds);
    updateUI(rows, rating);

})();