const {setVal, ResultsIterator} = require('./resultsAPI.js')
const { ipcRenderer } = require('electron')


class Connector{
    constructor(context){
        this.context = context;
        
        ipcRenderer.on('connectedOut',(event,arg)=>{
            this.context.connectedOut();
        })
        ipcRenderer.on('disconnectedOut',(event,arg)=>{
            this.context.disconnectedOut();
        })
        ipcRenderer.on('updateVal',(event,arg)=>{
            setVal(arg[0],arg[1]);
        })
        ipcRenderer.on('updateCell',(event,arg)=>{
            this.context.calculator.updateCell();
        })
        new ResultsIterator();
    }

    tryToConnectToIP(targetIP){
        ipcRenderer.invoke('connectOut', targetIP);
    }

    disconnectOutcomingConnection(){
        ipcRenderer.invoke('disconnectOut');
    }

    updateVals(row,val){
        ipcRenderer.invoke('updateVals', [row,val])
    }

    startServer(){
        ipcRenderer.invoke('startServer');
    }

    stopServer(){
        ipcRenderer.invoke('stopServer');
    }

    isCellNotTaken(index){
        const result = ipcRenderer.invoke('isCellNotTaken',index);
        return result;
    }

}

export default Connector;