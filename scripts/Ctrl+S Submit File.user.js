// ==UserScript==
// @name         Ctrl+S Submit File
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

const getInputs = ()=>{
    const els = document.getElementsByTagName('input');
    let file,submit;
    for(const el of els){
        if(el.type=='file')file=el;
        else if(el.type=='submit' && file){
            submit=el;
            break;
        }
    }
    return {file,submit};
};

(function() {
    'use strict';
    // Your code here...
    const {file, submit} = getInputs();
    if(!file) return;
    window.addEventListener('keydown', e => {
        if(e.key =='s' && e.ctrlKey){
            e.preventDefault();
            if(file.value)submit.click();
            else file.click();
        }
    });
})();