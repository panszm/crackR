const e = require("express");

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

function reloadProgress(){
    const csv = loadFile('./results/data.csv').split('\n');
    let i = 0;
    let completed = false;
    for(line of csv){
        line = line.trim()
        if (line>0 && line!=""){
            completed = true;
            i = line
            break;
        }else if(line==0){
            i=i+1;
        }
    }
    if(completed){
        document.querySelector('#progress').textContent = "Current Progress: SOLUTION FOUND -> "+i;
        FOUND = true;
    }else{
        document.querySelector('#progress').textContent = "Current Progress: SOLUTION NOT FOUND, "+i+" * 2^24 combinations checked so far";
    }
}

//////Wheeling logic

const CELL_SIZE = 2**24;
const SOLUTION = "7fc56270e7a70fa81a5935b72eacbe29"
let FOUND = false;
let current_cell = 0;
let current_iter = 0;

let to_other;
let to_me = []

var peer = new Peer();

peer.on('open', function(id) {
    document.querySelector("#my_id").textContent = "My_id: "+id
  });

  peer.on('connection', function(conn) {
        to_me.push(conn);
        conn.on('close', function() { 
            to_me = to_me.filter(item => item !== conn)
         });
        refreshNet();
    });

function executeAsync(func) {
    setTimeout(func, 0);
}

function connect(){
    document.querySelector("#button_connect").style.display = "none";
    document.querySelector("#connection_input").style.display = "none";
    document.querySelector("#button_disconnect").style.display = "block";
    var conn = peer.connect(document.querySelector("#connection_input").textContent);
    conn.on('open', function() {
        // Receive messages
        conn.on('data', function(data) {
          console.log('Received', data);
        });
        refreshNet();
      });
    conn.on('close', function() {
        to_other = null;
    });  
    to_other = conn;
}

function disconnect(){
    document.querySelector("#button_connect").style.display = "block";
    document.querySelector("#connection_input").style.display = "block";
    document.querySelector("#button_disconnect").style.display = "none";
    to_other.close();
    for(item of to_me){
        item.close();
    }
}

function getNextCell(){
    const csv = loadFile('./results/data.csv').split('\n');
    let i = 0;
    let completed = false;
    for(line of csv){
        line = line.trim()
        if (line>0 && line!=""){
            completed = true;
            i = line
            break;
        }else{
            i=i+1;
        }
    }
    if(completed){
        FOUND = true;
    }else{
        return i;
    }
}

function checkHash(number){
    key = ""
    while(number>0){
        rest = number%256
        number-=rest
        number = number/256
        key += String.fromCharCode(rest)
        if(SOLUTION==CryptoJS.MD5(key)){
            solutionFound(key);
            FOUND = true
            return;
        } 
    }
    console.log(key);
}

function solutionFound(x){
    console.log("Found Solution!: "+x);
}

function refreshNet(){
    if( to_other != null){document.querySelector("#to_other").textContent = to_other.peer}
    let conn_content = "";
    for(conn of to_me){
        conn_content += conn.peer+"\n";
    }
    document.querySelector("#to_other").textContent = conn_content;
}

////////Start/Stop
function started_calc(){
    document.querySelector("#button_calc_start").style.display = "none";
    document.querySelector("#button_calc_stop").style.display = "block";
    document.querySelector('#progress').style.display = "none";
    document.querySelector('#connection_div').style.display = "block";
}
function stopped_calc(){
    document.querySelector("#button_calc_start").style.display = "block";
    document.querySelector("#button_calc_stop").style.display = "none";
    document.querySelector('#connection_div').style.display = "none";
    reloadProgress();
    document.querySelector('#progress').style.display = "block";
}
