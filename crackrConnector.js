import * as resultsAPI from './resultsAPI.js'
const { ipcRenderer } = require('electron')


class Connector{
    constructor(context){
        this.context = context;
        ipcRenderer.on('update-connections-out',(event,arg)=>{
            document.querySelector('#connections_from_peer').textContent = arg;
        });
        ipcRenderer.on('update-connections-in',(event,arg)=>{
            document.querySelector('#connections_to_peer').textContent = arg;
        });
        ipcRenderer.on('connectedOut',(event,arg)=>{
            this.context.connectedOut();
        })
        ipcRenderer.on('disconnectedOut',(event,arg)=>{
            this.context.disconnectedOut();
        })
        ipcRenderer.on('connectedIn',(event,arg)=>{
            
        })
        ipcRenderer.on('disconnectedIn',(event,arg)=>{
            
        })
    }

    tryToConnectToIP(targetIP){
        ipcRenderer.invoke('connectOut', targetIP);
    }

    disconnectOutcomingConnection(){
        ipcRenderer.invoke('disconnectOut');
    }

    disconnectIncomingConnections(){

    }

    startServer(){
        ipcRenderer.invoke('startServer');
    }

    stopServer(){
        ipcRenderer.invoke('stopServer');
    }

    exchangeResults(){

    }

    async isCellNotTaken(index){
        const result = await ipcRenderer.invoke('isCellNotTaken',index);
        return result;
    }

}

export default Connector;