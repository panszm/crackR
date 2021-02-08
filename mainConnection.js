const CONNECTION_PORT = 8090;
const dgram = require('dgram');

// this.webContents.send('connectedIn','true');
        // ipcMain.handle('connectOut', (event,arg) => {
        //     this.connectTo(arg);
        // })

class MainConnector{
    constructor(ipcMain, webContents){
        this.ipcMain = ipcMain
        this.webContents = webContents;
    
        this.waitingForPermission = false;
        this.lastResponse = null;

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
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async askIfCellAvailable(index){
        if(this.outcomingConnection){
            this.waitingForPermission = true;
            this.outcomingConnection.write("cellAvailability "+index);
            for(let i = 0;i<50;i++){
                await this.sleep(200)
                if(!this.waitingForPermission){return this.lastResponse;}
            }
        }
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
        });
        this.client.bind(CONNECTION_PORT);

        var message = "Some bytes";
        this.client.send(message, 0, message.length, CONNECTION_PORT, "192.168.15.255");
    }

    stopServer(){
        this.client.close();
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

module.exports = {MainConnector};