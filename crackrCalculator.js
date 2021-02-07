import * as resultsAPI from './resultsAPI.js'

// //a
// const HASH_BEING_CRACKED = "0cc175b9c0f1b6a831c399e269772661"

//aaaa
const HASH_BEING_CRACKED = "74b87337454200d4d33f80c4663dc5e5"

const CELL_SIZE = 2**24;
const STATES_ENUM = {"idle":-1, "calculating":0, "solutionFound":1, "awaitingResponse":2};

class Calculator{
    constructor(){
        this.state = STATES_ENUM.idle;
        this.currentCell = resultsAPI.getFirstUnresolved();
        this.currentIteration = 0;
    }

    updateCell(){
        this.currentCell = resultsAPI.getFirstUnresolved();
    }

    stopCalculation(){
        this.state = STATES_ENUM.idle;
    }

    startCalculationOffline(){
        this.state = STATES_ENUM.calculating;
        this.updateCell();
        executeAsync(()=>this.checkConditionForNextIteration(this));
    }


    checkConditionForNextIteration(self){
        if(self.state==STATES_ENUM.calculating && self.currentIteration<CELL_SIZE){
            executeAsync(()=>self.checkNextIteration(self));
        }else if(self.currentIteration>=CELL_SIZE){
            executeAsync(()=>self.finalizeCell(self))
        }
    }

    checkNextIteration(self){
        if(checkHash(BigInt(CELL_SIZE*self.currentCell+self.currentIteration))){
            resultsAPI.setVal(this.currentCell,BigInt(CELL_SIZE*self.currentCell+self.currentIteration));
            self.state = STATES_ENUM.solutionFound;
            alert("SOLUTION FOUND");
        }else{
            self.currentIteration++;
        }
        executeAsync(()=>self.checkConditionForNextIteration(self));
    }

    finalizeCell(self){
        resultsAPI.setVal(self.currentCell,"-1");
            if(self.state==STATES_ENUM.calculating){
                self.startCalculationOffline();
            }
    }
}

function executeAsync(func) {
    setTimeout(func, 0);
}

function checkHash(number){
    let key = decodeStringFromBigInt(number);
    if(HASH_BEING_CRACKED==CryptoJS.MD5(key)){
        return true;
    } 
    return false;
}

function decodeStringFromBigInt(number){
    // console.log(number)
    let key = ""
    while(number>0){
        let rest = number%BigInt(256)
        number-=rest
        number = number/BigInt(256)
        key += String.fromCharCode(Number(rest))
    }
    return key
}


export default Calculator;