import CrackrContext from './crackrContext.js';
import * as resultsAPI from './resultsAPI.js';
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = {};

window.onload = () => {
    document.querySelector("#myLocalIPs").textContent = "MyLocalIPs: "+getLocalIPs();
    resultsAPI.cleanResults()
    const context = new CrackrContext("topButton","bottomButton","connectionDiv","connectionInput");
}

function getLocalIPs(){
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return JSON.stringify(results);
}