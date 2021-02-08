class ResultsIterator{
    constructor(){
        const csv = loadFile('./results/data.csv').split('\n');
        this.emptyIndexes = [];
        this.elements = this.extractRows(csv);
        this.indexes = Object.keys(this.elements);
        this.currentIterator = 0;
    }

    restartIterator(){
        this.currentIterator = 0;
    }

    getCurrentRowIndex(){
        if(this.currentIterator>=this.indexes.length){
            return this.indexes.length-1;
        }
        return this.indexes[this.currentIterator];
    }

    getFirstEmpty(){
        if(this.emptyIndexes.length>0){
            return this.emptyIndexes[0];
        }else{
            return this.indexes.length;
        }
    }

    hasNext(){
        if(this.currentIterator>=this.indexes.length){
            return false;
        }
        return true;
    }

    next(){
        if(this.hasNext()){
            let result = this.elements[this.indexes[this.currentIterator]];
            this.currentIterator++;
            return result;
        }
        return false;
    }

    getExact(index){
        if(this.indexes.includes(index)){
            return this.elements[index];
        }
        return false;
    }

    extractRows(csv){
        let result = {};
        let indexIterator = 0;
        for(let line of csv){
            line = line.trim();
            if(line.length>0){
                result[indexIterator] = line;
            }else{
                this.emptyIndexes.push(indexIterator);
            }
            indexIterator++;
        }
        return result;
    }
}

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}

function postReq(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", filePath, false);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }       
    return result;
}

function setVal(row,val){
    postReq("http://localhost/modifyrow.php?index="+row+"&val="+val)
}

function getVal(row){
    const csv = loadFile('./results/data.csv').split('\n');
    return csv[row].trim();
}

function isSolved(){
    let resIter = new ResultsIterator();
    while(resIter.hasNext()){
        let curr_elem = resIter.next();
        if(curr_elem>=0){
            return curr_elem;
        }
    }
}

function cleanResults(){
    let resIter = new ResultsIterator();
    while(resIter.hasNext()){
        if(resIter.next()<-1){
            setVal(resIter.getCurrentRowIndex(),"")
        }
    }
}

function getFirstUnresolved(){
    let resIter = new ResultsIterator();
    return resIter.getFirstEmpty();
}

module.exports = {ResultsIterator,setVal,getVal,isSolved,cleanResults,getFirstUnresolved};