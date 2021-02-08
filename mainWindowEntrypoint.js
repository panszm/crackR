import CrackrContext from './crackrContext.js';
const {ResultsIterator,cleanResults, isSolved} = require('./resultsAPI.js');
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = {};

window.onload = () => {
    document.querySelector("#myLocalIPs").textContent = "MyLocalIPs: "+getLocalIPs();
    cleanResults()
    let context = new CrackrContext("topButton","bottomButton","connectionDiv","connectionInput");
    
    document.querySelector("#topButton").onclick = ()=>handleTopButtonPressed(context)
    document.querySelector("#bottomButton").onclick = ()=>handleBottomButtonPressed(context)
}

function handleTopButtonPressed(context){
    let resIter = new ResultsIterator();
    let resultString = ""
    if(isSolved()){
        resultString = "solution found"
    }else{
        let i = 0;
        while(resIter.hasNext()){
            if (resIter.next()=='-1'){
                i++;
            }
        }
        resultString = i+" cells checked, solution yet to be found";
    }
    document.querySelector("#progressDescription").textContent = "Current Progress: "+resultString
    context.handleTopButtonPressed();
}

function handleBottomButtonPressed(context){
    context.handleBottomButtonPressed();
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