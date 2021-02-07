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
            socket.on('close',()=>{
                this.handleIncomingDisconnection(socket);
            });
            socket.on('end',()=>{
                this.handleIncomingDisconnection(socket);
            });
            socket.on('timeout',()=>{
                this.handleIncomingDisconnection(socket);
            });

            this.webContents.send('connectedIn','true');
            this.incomingConnections.push(socket);
            this.updateConnections();

            socket.pipe(socket);
        });
        this.startServer();

        ipcMain.handle('connectOut', (event,arg) => {
            this.connectTo(arg);
        })
        ipcMain.handle('disconnectOut',(event)=>{
            this.disconnectFrom();
        })
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
        console.log("Conns: Incoming:",argIn,"Outcoming:",argOut,"END")
        this.webContents.send('update-connections-out',argOut)
        this.webContents.send('update-connections-in',argIn)
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
        if(this.outcomingConnection!=null){
            this.outcomingConnection.destroy();
        }
        this.outcomingConnection = new net.Socket();
        this.outcomingConnection.connect(CONNECTION_PORT,targetIP,()=>{
            this.webContents.send('connectedOut','true');
            this.updateConnections();
        })
        this.outcomingConnection.on('data',(data)=>{
            console.log(data);
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

module.exports = {MainConnector};