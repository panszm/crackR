const {setVal, getFirstUnresolved, isSolved} = require('./resultsAPI.js');

// //a
// const HASH_BEING_CRACKED = "0cc175b9c0f1b6a831c399e269772661"

//aaaa
const HASH_BEING_CRACKED = "74b87337454200d4d33f80c4663dc5e5"

const CELL_SIZE = 2**24;
const STATES_ENUM = {"idle":-1, "calculating":0, "solutionFound":1, "calculatingAndConnected":2};

class Calculator{
    constructor(context){
        this.context = context;
        this.state = STATES_ENUM.idle;
        this.updateCell();
        this.currentIteration = 0;
        this.stopFlag = false;
    }

    updateCell(){
        this.currentCell = getFirstUnresolved();
    }

    stopCalculation(){
        this.state = STATES_ENUM.idle;
    }

    startCalculation(){
        if(this.state != STATES_ENUM.calculatingAndConnected){
            this.state = STATES_ENUM.calculating;
        }
        this.restartCalculation();
    }

    restartCalculation(){
        let func = async()=>{
            if(!isSolved()){
                this.updateCell();
                if(this.state == STATES_ENUM.calculatingAndConnected){
                    let isCellOK = await this.context.isCellNotTaken(this.currentCell);
                    console.log("IsCellOK:"+isCellOK);
                    if(!isCellOK.startsWith('true')){
                        setVal(this.currentCell,"-2");
                        this.restartCalculation();
                        return;
                    }
                }
                this.stopFlag = false;
                setVal(this.currentCell,"-2");
                executeAsync(()=>this.checkConditionForNextIteration(this));
            }else{
                alert("SOLUTION ALREADY FOUND");
            }
        }
        func();
    }

    goOnline(){
        if(this.state==STATES_ENUM.calculating){
            this.state = STATES_ENUM.calculatingAndConnected;
            this.stopFlag = true;
            this.updateCell()
            setVal(this.currentCell,"-2");
        }
        setTimeout(()=>this.startCalculation(),1000)
    }

    goOffline(){
        if(this.state==STATES_ENUM.calculatingAndConnected){
            this.state = STATES_ENUM.calculating;
        }
    }

    checkConditionForNextIteration(){
        if((this.state == STATES_ENUM.calculating || this.state == STATES_ENUM.calculatingAndConnected) && this.currentIteration<CELL_SIZE && !this.stopFlag){
            executeAsync(()=>this.checkNextIteration(this));
        }else if(this.currentIteration>=CELL_SIZE){
            executeAsync(()=>this.finalizeCell(this))
        }else if(this.stopFlag){
            setVal(this.currentCell,"");
        }
    }

    checkNextIteration(){
        if(checkHash(BigInt(CELL_SIZE*this.currentCell+this.currentIteration))){
            setVal(this.currentCell,BigInt(CELL_SIZE*this.currentCell+this.currentIteration));
            this.context.updateVals(this.currentCell,BigInt(CELL_SIZE*this.currentCell+this.currentIteration))
            this.state = STATES_ENUM.solutionFound;
            alert("SOLUTION FOUND");
        }else{
            this.currentIteration++;
        }
        executeAsync(()=>this.checkConditionForNextIteration());
    }

    finalizeCell(){
        setVal(this.currentCell,"-1");
        this.context.updateVals(this.currentCell,"-1")
        if(this.state==STATES_ENUM.calculating){
            this.restartCalculation();
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