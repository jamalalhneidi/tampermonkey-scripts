// ==UserScript==
// @name         CF - Problems Links on Problem Pages
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add problems Links On Problem Pages
// @author       You
// @license      GPLv3
// @match        https://codeforces.com/contest/*
// @match        https://codeforces.com/problemset/problem/*
// @match        https://codeforces.com/problemset/gymProblem/*
// @match        https://codeforces.com/gym/*
// ==/UserScript==

const pathname = window.location.pathname;
const cache = {};
const VERDICT_COLOR = {
    AC: "rgb(64, 255, 64)",
    WA: "rgb(255, 0, 0)",
    NA: "#0d9aff",
};

const getUserHandle = () => {
    if (cache.userHandle) return cache.userHandle;
    return cache.userHandle = document.getElementById('header').querySelector("a[href^='/profile']").textContent;
}
const getContestNumber = () => {
    if (cache.contestNumber) return cache.contestNumber;
    let contestNumber;
    if (pathname.startsWith('/contest/')) contestNumber = pathname.split('/')[2];
    else if (pathname.startsWith('/problemset/')) contestNumber = pathname.split('/')[3];
    else if (pathname.startsWith('/gym')) contestNumber = pathname.split('/')[2];
    return cache.contestNumber = contestNumber;
}

const buildProblemUrl = (index) => {
    return `https://codeforces.com/${pathname.includes('gym') ? 'gym' : 'contest'}/${getContestNumber()}/problem/${index}`
}

const attachVerdict = async (problems) => {
    const problemsWithVerdicts = [...problems];
    const verdicts = {};
    for (const p of problems) {
        verdicts[p.index] = VERDICT_COLOR.NA;
    }
    const requestURL = `https://codeforces.com/api/contest.status?contestId=${getContestNumber()}&handle=${getUserHandle()}`;
    const response = await fetch(requestURL);
    let data = await response.json();
    if (data.status === 'OK') {
        data = data.result;
        for (const el of data) {
            const index = el.problem.index;
            if (verdicts[index] == VERDICT_COLOR.AC) continue;
            verdicts[index] = VERDICT_COLOR[el.verdict === 'OK' ? 'AC' : 'WA'];
        }
    }
    for (const p of problemsWithVerdicts) {
        p.verdict = verdicts[p.index];
    }
    return problemsWithVerdicts;
}

const fetchProblems = async (contestNumber) => {
    const requestURL = `https://codeforces.com/api/contest.standings?contestId=${contestNumber}&from=1&count=1`;
    const problems = [];
    try {
        const response = await fetch(requestURL);
        const data = await response.json();
        const problemsList = data.result.problems;
        if (data.status == "OK") {
            for (let i = 0; i < problemsList.length; i++) {
                const index = problemsList[i].index;
                const title = index + " - " + problemsList[i].name;
                const rating = problemsList[i].rating;
                const problemUrl = buildProblemUrl(index);
                problems.push({ index: index, url: problemUrl, title: title, rating: rating });
            }
        }
    }
    catch (e) {
    }
    return attachVerdict(problems);
}

const updateUI = (problems) => {
    let toInsert;
    toInsert = `
                <div class="roundbox sidebox" style="">
                    <div class="roundbox-lt">&nbsp;</div>
                    <div class="roundbox-rt">&nbsp;</div>
                    <div class="caption titled">→ Contest Problems
                        <i class="sidebar-caption-icon las la-angle-down" onclick="
                            if (this.classList.contains('la-angle-right')) {
                                document.getElementById('Tagblock').style.display = 'block';
                                this.classList.add('la-angle-down');
                                this.classList.remove('la-angle-right');
                            } else {
                                document.getElementById('Tagblock').style.display = 'none';
                                this.classList.add('la-angle-right');
                                this.classList.remove('la-angle-down');
                            }">
                        </i>
                        <div class="top-links"></div>
                    </div>
                    <div id="Tagblock" style="display: block;">
                    <div style="display: flex; margin: 8px auto; flex-wrap: wrap; justify-content: center; align-items: center; text-align: center;">
                `
    problems.forEach(e => {
        toInsert += `
                <span style="width:3em; margin: 2px; text-align: center; box-sizing: border-box;">
                    <a title="${e.title}" href="${e.url}" style="color:${e.verdict}">${e.index}</a>
                    <br><span class="small" title="Problem Rating">${e.rating == null ? '-' : e.rating}</span>
                </span>
                `
    });
    toInsert += '</div></div>'
    const getProblemBox = document.createElement("div");
    getProblemBox.innerHTML = toInsert;
    document.querySelector("#sidebar").prepend(getProblemBox);
}

(async function () {
    console.log("Adding a table of links of the current contest's problems")
    const contestNumber = getContestNumber();
    if (!contestNumber) return;
    const problems = await fetchProblems(contestNumber);
    if (!problems.length) return;
    updateUI(problems);
})();