import * as resultsAPI from './resultsAPI.js'
const { ipcRenderer } = require('electron')


class Connector{
    constructor(context){
        this.context = context;
        document.addEventListener('update-connections-out',(arg)=>{
            
        });
    }

    tryToConnectToIP(targetIP){
        ipcRenderer.invoke('connectTo', targetIP)
    }

    disconnectOutcomingConnection(){
        ipcRenderer.invoke('disconnectOut')
    }

    disconnectIncomingConnections(){

    }

}

export default Connector;