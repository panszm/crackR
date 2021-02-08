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
    const csv = loadFile('./results/data.csv').split('\n');
    for(let line of csv){
        line = line.trim();
        if(line!="" && line>=0){
            return line;
        }
    }
    return false;
}

function cleanResults(){
    const csv = loadFile('./results/data.csv').split('\n');
    for(let i=0;i<csv.length;i++){
        if(csv[i]<-1){
            setVal(i,"")
        }
    }
}

function getFirstUnresolved(){
    const csv = loadFile('./results/data.csv').split('\n');
    for(let i=0;i<csv.length;i++){
        if(csv[i]==""){
            return i;
        }
    }
    return csv.length;
}

module.exports = {setVal,getVal,isSolved,cleanResults,getFirstUnresolved};