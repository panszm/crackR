const CONNECTION_PORT = 8090;
const dgram = require('dgram');

class MainConnector{
    constructor(ipcMain, webContents){
        this.ipcMain = ipcMain
        this.webContents = webContents;

        this.localIP = getLocalIP();
    
        this.waitingForPermission = false;
        this.lastResponse = null;
        this.currentTimestamp = Number.MAX_SAFE_INTEGER;

        ipcMain.handle('isCellNotTaken',async(event,arg)=>{
            const result = await this.askIfCellAvailable(arg);
            return result;
        })
        ipcMain.handle('startServer', (event,arg) => {
            this.startServer();
        })
        ipcMain.handle('stopServer', (event,arg) => {
            this.stopServer();
        })
        ipcMain.handle('cellResolved', (event,arg)=>{
            this.sendMessage("Resolved "+arg[0]+" "+arg[1]);
        })
        ipcMain.handle('updateTimestamp', (event,arg)=>{
            this.currentTimestamp = arg;
        })
        setInterval(()=>{
            this.sendBusyPacket();
        },60*1000);
    }

    sendBusyPacket(){
        let current_cell = getFirstMinusTwo();
        if(current_cell!=-1){
            this.sendMessage("Having "+current_cell+" "+this.currentTimestamp)
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async askIfCellAvailable(index){
        this.waitingForPermission = true;
        this.lastResponse = index;
        this.sendMessage("MayI "+index);
        for(let i = 0;i<50;i++){
            await this.sleep(200)
            if(!this.waitingForPermission){this.lastResponse=null;return false;}
        }
        this.lastResponse = null;
        return true;
    }

    respondIfCellAvailable(index){
        let value = getValFromResults(index);
        value = value.trim("\n");
        if(value<0){
            return false;
        }
        return true;
    }

    startServer(){
        this.client = dgram.createSocket("udp4");
        this.client.on('listening', () => {
            let address = this.client.address();
            console.log('UDP Client listening on ' + address.address + ":" + address.port);
            this.client.setBroadcast(true);
        });
        this.client.on('message', (message, rinfo) => {
            console.log('Message from: ' + rinfo.address + ':' + rinfo.port +' - ' + message);
            this.handleMessage(message,rinfo);
        });
        this.client.bind(CONNECTION_PORT);

        this.sendMessage("Hello "+getFirstNonMinusOne())
    }

    stopServer(){
        this.client.close();
    }

    sendMessage(message){
        this.client.send(message, 0, message.length, CONNECTION_PORT, "192.168.15.255");
    }

    handleMessage(message,rinfo){
        if(rinfo.address!=this.localIP){
            message = ""+message;
            let args = message.split(" ");
            switch(args[0]){
                case "Hello":
                    let firstNotMinusOne = getFirstNonMinusOne();
                    if(args[1]>firstNotMinusOne){
                        for(let i=0;i<args[1];i++){
                            this.webContents.send('updateVal',[i,"-1"]);
                        }
                        this.webContents.send('restartCalculations','true')
                    }else if(args[1]<firstNotMinusOne){
                        this.sendMessage("Hello "+firstNotMinusOne)
                    }
                    break;
                case "MayI":
                    if(getValFromResults(arg[1])=='-2'){
                        this.sendMessage("Nope "+arg[1]);
                    }
                    break;
                case "Nope":
                    if(arg[1]==this.lastResponse){
                        this.waitingForPermission = false;
                    }
                    break;
                case "Resolved":
                    this.webContents.send('updateVal',[arg[1],arg[2]]);
                    break;
                case "Having":
                    let current_cell = getFirstMinusTwo();
                    if(arg[1]==current_cell){
                        if(arg[2]<this.currentTimestamp){
                            this.webContents.send('updateVal',[current_cell,"-3"]);
                            this.webContents.send('restartCalculations','true')
                        }else{
                            this.sendBusyPacket();
                        }
                    }
                    break;
            }
        }
    }
}

function getValFromResults(index){
    fs = require('fs')
    result = fs.readFileSync('./results/data.csv', 'utf8').split('\n');
    if(result.length<=index){
        return "";
    }
    return result[index];
}

function getFirstNonMinusOne(){
    fs = require('fs')
    result = fs.readFileSync('./results/data.csv', 'utf8').split('\n');
    let i = 0;
    for(let line of result){
        if(line.startsWith("-1")){
            i++;
        }else{
            break;
        }
    }
    return i;
}

function getFirstMinusTwo(){
    fs = require('fs')
    result = fs.readFileSync('./results/data.csv', 'utf8').split('\n');
    let i = 0;
    for(let line of result){
        if(line.startsWith("-2")){
            return i;
        }
        i++;
    }
    return -1;
}

function getLocalIP(){
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if(net.address.startsWith("192.168.15.")){
                    return net.address;
                }
            }
        }
    }
    return "";
}

module.exports = {MainConnector};