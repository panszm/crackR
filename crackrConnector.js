const {setVal, ResultsIterator} = require('./resultsAPI.js')
const { ipcRenderer } = require('electron')


class Connector{
    constructor(context){
        this.context = context;

        ipcRenderer.on('updateVal',(event,arg)=>{
            setVal(arg[0],arg[1]);
        })
        ipcRenderer.on('updateCell',(event,arg)=>{
            this.context.calculator.updateCell();
        })
        ipcRenderer.on('restartCalculations',(event,arg)=>{
            this.context.restartCalculations();
        })
        new ResultsIterator();
    }

    updateVals(index,value){
        ipcRenderer.invoke('updateVals', [index,value])
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

    cellResolved(index,value){
        ipcRenderer.invoke('cellResolved',[index,value])
    }

    updateTimestamp(timestamp){
        ipcRenderer.invoke('updateTimestamp',timestamp);
    }

}

export default Connector;