const { Main } = require('electron');
const net = require('net');
const { server } = require('websocket');

const CONNECTION_PORT = 8090;

class MainConnector{
    constructor(ipcMain, webContents){
        this.ipcMain = ipcMain
        this.webContents = webContents;
        this.incomingConnections = [];
        this.outcomingConnection = null;

        this.server = net.createServer((socket)=>{
            this.incomingConnections.push(socket);
            this.updateConnections();

            socket.on('close',(err)=>{
                this.incomingConnections = this.incomingConnections.filter((conn)=>{return conn!=socket});
                this.updateConnections();
            })
            
            socket.pipe(socket);
        });
        this.startServer();

        ipcMain.handle('connectTo', (event,arg) => {
            this.connectTo(arg);
        })
    }

    executeCommand(command){
        this.webContents.executeJavaScript(command);
    }

    updateConnections(){
        let argIn = "";
        for(let socket of this.incomingConnections){
            argIn+=socket.address().address+"\n";
        }
        let argOut = "";
        if(this.outcomingConnection){
            argOut = this.outcomingConnection.address().address
        }
        console.log("Conns: Incoming:",argIn,"Outcoming:",argOut,"END")
    }

    startServer(){
        this.server.listen(CONNECTION_PORT,'0.0.0.0')
    }

    stopServer(){
        this.server.close();
        this.incomingConnections = [];
        this.outcomingConnection = null;
        this.updateConnections();
    }

    connectTo(targetIP){
        this.outcomingConnection = new net.Socket();
        this.outcomingConnection.connect(CONNECTION_PORT,targetIP,()=>{
            this.updateConnections();
        })
        this.outcomingConnection.on('data',(data)=>{
            console.log(data);
        });
        this.outcomingConnection.on('close',(err)=>{
            this.outcomingConnection = null;
            this.updateConnections();
        })
    }

    disconnectFrom(){
        this.outcomingConnection.close();
    }
}

module.exports = {MainConnector};