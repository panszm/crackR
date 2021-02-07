import CrackrContext from './crackrContext.js';
import * as resultsAPI from './resultsAPI.js';
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

window.onload = () => {
    document.querySelector("#myLocalIP").textContent = "MyLocalIP: "+getLocalIP();
    resultsAPI.cleanResults()
    const context = new CrackrContext("topButton","bottomButton","connectionDiv","connectionInput");
}

function getLocalIP(){
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
}