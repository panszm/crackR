const net = require('net');

const CONNECTION_PORT = 8090;

class MainConnector{
    constructor(ipcMain, webContents){
        this.ipcMain = ipcMain
        this.webContents = webContents;
        this.incomingConnections = [];
        this.outcomingConnection = null;
        this.waitingForPermission = false;
        this.lastResponse = null;

        this.server = net.createServer((socket)=>{
            socket.on('close',()=>{
                this.handleIncomingDisconnection(socket);
            });
            socket.on('end',()=>{
                this.handleIncomingDisconnection(socket);
            });
            socket.on('timeout',()=>{
                this.handleIncomingDisconnection(socket);
            });

            socket.on('data',(data)=>{
                data = data.toString("utf-8")
                let args = data.split(" ");
                switch(args[0]){
                    case "cellAvailability":
                        let response = this.respondIfCellAvailable(args[1])
                        socket.write("cellAvailabilityResponse "+response);
                        break;
                    case "cellAvailabilityResponse":
                        this.lastResponse = args[1];
                        this.waitingForPermission = false;
                        break;
                }
            })

            this.webContents.send('connectedIn','true');
            this.incomingConnections.push(socket);
            this.updateConnections();

            socket.pipe(socket);
        });

        ipcMain.handle('connectOut', (event,arg) => {
            this.connectTo(arg);
        })
        ipcMain.handle('disconnectOut',(event)=>{
            this.disconnectFrom();
        })
        ipcMain.handle('startServer',(event)=>{
            this.startServer();
        })
        ipcMain.handle('stopServer',(event)=>{
            this.stopServer();
        })
        ipcMain.handle('isCellNotTaken',async(event,arg)=>{
            const result = await this.askIfCellAvailable(arg);
            return result;
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

    async respondIfCellAvailable(index){
        let value = getValFromResults(index);
        if(value == "-1" || value=="-2"){
            return false;
        }
        if(this.outcomingConnection){
            const result = await this.askIfCellAvailable(index);
            return result;
        }
        return true;
    }

    handleIncomingDisconnection(socket){
        this.webContents.send('disconnectedIn','true');
        this.incomingConnections = this.incomingConnections.filter((conn)=>{return conn!=socket});
        this.updateConnections();
    }

    executeCommand(command){
        this.webContents.executeJavaScript(command);
    }

    updateConnections(){
        let argIn = "";
        for(let socket of this.incomingConnections){
            argIn+=socket.remoteAddress+"\n";
        }
        let argOut = "";
        if(this.outcomingConnection){
            argOut = this.outcomingConnection.remoteAddress
        }
        this.webContents.send('update-connections-out',argOut)
        this.webContents.send('update-connections-in',argIn)
    }

    startServer(){
        this.server.listen(CONNECTION_PORT,'0.0.0.0')
    }

    stopServer(){
        this.server.close();
        for(let conn of this.incomingConnections){
            conn.destroy();
        }
        if(this.outcomingConnection){
            this.outcomingConnection.destroy();
        }
        this.incomingConnections = [];
        this.outcomingConnection = null;
        this.updateConnections();
    }

    connectTo(targetIP){
        if(this.outcomingConnection!=null){
            this.outcomingConnection.destroy();
        }
        this.outcomingConnection = new net.Socket();
        this.outcomingConnection.connect(CONNECTION_PORT,targetIP,()=>{
            this.webContents.send('connectedOut','true');
            this.updateConnections();
        })
        this.outcomingConnection.on('data',(data)=>{
            data = data.toString("utf-8")
            let args = data.split(" ");
            switch(args[0]){
                case "cellAvailability":
                    this.outcomingConnection.write("cellAvailabilityResponse "+this.respondIfCellAvailable(args[1]));
                    break;
                case "cellAvailabilityResponse":
                    console.log(args)
                    this.lastResponse = args[1];
                    this.waitingForPermission = false;
                    break;
            }
        });
        this.outcomingConnection.on('close',(err)=>{
            this.webContents.send('disconnectedOut','true');
            this.outcomingConnection = null;
            this.updateConnections();
        })
    }

    disconnectFrom(){
        if(this.outcomingConnection){
            this.outcomingConnection.destroy();
        }
    }
}
fs = require('fs')

function getValFromResults(index){
    result = fs.readFileSync('./results/data.csv', 'utf8').split('\n');
    if(result.length<=index){
        return "";
    }
    return result[index];
}

module.exports = {MainConnector};