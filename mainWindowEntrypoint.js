import CrackrContext from './crackrContext.js';
const {ResultsIterator,cleanResults, isSolved} = require('./resultsAPI.js');
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = {};

window.onload = () => {
    cleanResults()
    let context = new CrackrContext("topButton");
    updateProgressInfo();
    document.querySelector("#topButton").onclick = ()=>handleTopButtonPressed(context)
}

function getProgressInfo(){
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
    return resultString;
}

function updateProgressInfo(){
    document.querySelector("#progressDescription").textContent = "Current Progress: "+getProgressInfo();
}

function handleTopButtonPressed(context){
    updateProgressInfo();
    context.handleTopButtonPressed();
}