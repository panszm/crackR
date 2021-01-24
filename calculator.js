function executeAsync(func) {
    setTimeout(func, 0);
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

function reloadProgress(){
    const csv = loadFile('./results/data.csv').split('\n');
    let i = 0;
    let index = 0;
    let completed = false;
    for(line of csv){
        line = line.trim()
        if (line>0 && line!=""){
            completed = true;
            i = line
            break;
        }else if(line==-1){
            i=i+1;
        }else if (line==-2 || line==-3){
            postReq("http://localhost/modifyrow.php?index="+index+"&val=0")
        }
        index++;
    }
    if(completed){
        document.querySelector('#progress').textContent = "Current Progress: SOLUTION FOUND -> "+i;
        FOUND = true;
    }else{
        document.querySelector('#progress').textContent = "Current Progress: SOLUTION NOT FOUND, "+i+" * 2^24 combinations checked so far";
    }
}

//////Wheeling logic

const CELL_SIZE = 2**10;

//kjbadskjbsdabkjdsadsasda
const SOLUTION = "63d24b2a0b43b893e00369bf9f3ebbfa"

let my_id = ""
let FOUND = false;
let current_cell = 0;
let current_iter = 0;
let stopped = false;

let to_other;
let to_me = []

var peer = new Peer();

peer.on('open', function(id) {
    my_id = id;
    document.querySelector("#my_id").textContent = "My_id: "+id
  });

  peer.on('connection', function(conn) {
        to_me.push(conn);
        conn.on('close', function() { 
            to_me = to_me.filter(item => item !== conn);
            refreshNet();
         });
        refreshNet();
        conn.on('data', function(data) {
            message = JSON.parse(data);
            console.log('Received', message);
            switch(message.name){
                case "meta":
                    if(data.id != my_id){
                        conn.send(getMetaResponse());
                        if(to_other!=null){
                            to_other.send(JSON.stringify(message))
                        }
                        for(element of to_me){
                            if(element!=conn){
                                element.send(JSON.stringify(message))
                            }
                        }
                        processMetaData(message);
                    }
                    break;
                case "metar":
                    processMetaData(message);
                    break;
                case "ask":
                    value = getVal(message.index)
                    if(value!=-2 && value!=-1 && (value<=0 || value=="")){
                        setVal(message.index,-2)
                        response = {
                            name: "askr",
                            index: message.index,
                            permission: true
                        }
                        conn.send(JSON.stringify(response))
                    }else{
                        response = {
                            name: "askr",
                            index: message.index,
                            permission: false
                        }
                        conn.send(JSON.stringify(response))
                    }
                    break;
                case "askr":
                    if(message.permission){
                        current_cell=message.index;
                        executeAsync(goOverCell);
                    }else{
                        setVal(message.index,-2);
                        askPermission(getNextCell());
                    }
                    break;
          }
          });
            conn.send(getMetaData());
    });

function connect(){
    document.querySelector("#button_connect").style.display = "none";
    document.querySelector("#connection_input").style.display = "none";
    document.querySelector("#button_disconnect").style.display = "block";
    var conn = peer.connect(document.querySelector("#connection_input").textContent);
    conn.on('open', function() {
        refreshNet();
        conn.on('data', function(data) {
          message = JSON.parse(data);
          console.log('Received', message);
          switch(message.name){
                case "meta":
                    if(data.id != my_id){
                        conn.send(getMetaResponse());
                        if(to_other!=null){
                            to_other.send(JSON.stringify(message))
                        }
                        for(element of to_me){
                            if(element!=conn){
                                element.send(JSON.stringify(message))
                            }
                        }
                        processMetaData(message);
                    }
                    break;
                case "metar":
                    processMetaData(message);
                    break;
                case "ask":
                    value = getVal(message.index)
                    if(value!=-2 && value!=-1 && (value<=0 || value=="")){
                        setVal(message.index,-2)
                        response = {
                            name: "askr",
                            index: message.index,
                            permission: true
                        }
                        conn.send(JSON.stringify(response))
                    }else{
                        response = {
                            name: "askr",
                            index: message.index,
                            permission: false
                        }
                        conn.send(JSON.stringify(response))
                    }
                    break;
                case "askr":
                    if(message.permission){
                        current_cell=message.index;
                        executeAsync(goOverCell);
                    }else{
                        setVal(message.index,-2);
                        askPermission(getNextCell());
                    }
                    break;
          }
        });
        conn.send(getMetaData());
      });
    conn.on('close', function() {
        to_other = null;
        refreshNet();
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
    let index = 0;
    let completed = false;
    for(line of csv){
        line = line.trim()
        if (line>0 && line!=""){
            completed = true;
            i = line;
            break;
        }else if(line==-1 && i>=0){
            i=i+1;
        }else if(i>=0){
            i = -index-1;
        }
        index+=1;
    }
    if(completed){
        FOUND = true;
    }else{
        if(i<0){
            return -i-1;
        }
        return i;
    }
}

function askPermission(index){
    console.log("Asking for permission: "+index)
    if(to_other!=null){
        askPermissionSingle(to_other,index);
    }
    for(conn of to_me){
        askPermissionSingle(conn,index);
    }
    if(to_other==null && to_me.length==0){
        current_cell=index
        executeAsync(goOverCell)
    }
}

function askPermissionSingle(conn,index){
    result = {
        name: "ask",
        index: index
    }
    conn.send(JSON.stringify(result));
}

function update(){
    let data = getMetaData();
    if(to_other!=null){
        to_other.send(data);
    }
    for(pee of to_me){
        pee.send(data);
    }
}

function goOverCell(){
    if(current_iter<CELL_SIZE && !FOUND && !stopped){
        goOverFunc()
        executeAsync(goOverCell)
        console.log(BigInt(current_cell*CELL_SIZE+current_iter))
    }else{
        update();
        if(!FOUND){
            setVal(current_cell,-1);
            current_iter = 0;
            askPermission(getNextCell());
        }
    }
}

function goOverFunc(){
    checkHash(BigInt(current_cell*CELL_SIZE+current_iter))
    current_iter+=1;
}

function checkHash(number){
    key = ""
    while(number>0){
        rest = number%BigInt(256)
        number-=rest
        number = number/BigInt(256)
        key += String.fromCharCode(Number(rest))
    }
    if(SOLUTION==CryptoJS.MD5(key)){
        solutionFound(key);
        FOUND = true
        return;
    } 
}

function solutionFound(x){
    console.log("Found Solution!: "+x);
    setVal(current_cell,""+BigInt(current_cell*CELL_SIZE+current_iter));
    disconnect();
    stopped_calc();
    reloadProgress();
}

function refreshNet(){
    if( to_other != null){document.querySelector("#to_other").textContent = to_other.peer;}else{document.querySelector("#to_other").textContent = "";}
    let conn_content = "";
    for(conn of to_me){
        conn_content += conn.peer+"\n";
    }
    document.querySelector("#to_me").textContent = conn_content;
}

function processMetaData(data){
    if(data.solved!=""){
        FOUND = true;
        setVal(0,data.solved);
    }else{
        for(let i = 0;i<=data.empty_offset;i++){
            if(!data.unchecked.includes(i)){
                setVal(i,-1)
            }
        }
    }
}

function getMetaData(){
    const csv = loadFile('./results/data.csv').split('\n');
    let solved = ""
    let empty_offset = csv.length-1;
    let unchecked = [];
    let index = 0;
    for(line of csv){
        line = line.trim()
        if (line>0 && line!=""){
            solved = line;
        }else if(line!=-1){
            unchecked.push(index);
        }
        index++;
    }
    result = {
        id: my_id,
        name: "meta",
        solved: solved,
        empty_offset: empty_offset,
        unchecked: unchecked
    }
    return JSON.stringify(result);
}

function getMetaResponse(){
    const csv = loadFile('./results/data.csv').split('\n');
    let solved = ""
    let empty_offset = csv.length-1;
    let unchecked = [];
    let index = 0;
    for(line of csv){
        line = line.trim()
        if (line>0 && line!=""){
            solved = line;
        }else if(line!=-1){
            unchecked.push(index);
        }
        index++;
    }
    result = {
        id: my_id,
        name: "metar",
        solved: solved,
        empty_offset: empty_offset,
        unchecked: unchecked
    }
    return JSON.stringify(result);
}

////////Start/Stop
function started_calc(){
    document.querySelector("#button_calc_start").style.display = "none";
    document.querySelector("#button_calc_stop").style.display = "block";
    document.querySelector('#progress').style.display = "none";
    document.querySelector('#connection_div').style.display = "block";
    stopped = false;

    askPermission(getNextCell())
}
function stopped_calc(){
    document.querySelector("#button_calc_start").style.display = "block";
    document.querySelector("#button_calc_stop").style.display = "none";
    document.querySelector('#connection_div').style.display = "none";
    stopped = true;
    reloadProgress();
    document.querySelector('#progress').style.display = "block";
}
