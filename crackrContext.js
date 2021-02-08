import './crackrCalculator.js'
import Connector from './crackrConnector.js';
import Calculator from './crackrCalculator.js';

class Abstract_CrackrState {
    constructor(crackrContext){
        if(typeof(this)===Abstract_CrackrState){throw new Error("Can't create abstract class object")}
        this.context = crackrContext
    }

    refresh(topButtonText,connectionDivDisplay,bottomButtonText,connectionInputDisplay){
        this.context.topButton.textContent = topButtonText;
        this.context.connectionDiv.style.display = connectionDivDisplay;
        this.context.bottomButton.textContent = bottomButtonText;
        this.context.connectionInput.style.display = connectionInputDisplay
    }
    handleTopButtonPressed(){}
    handleBottomButtonPressed(){}
}

class IdleCrackrState extends Abstract_CrackrState{
    refresh(){
        super.refresh("Start Calculations","none","","none")
        require('./resultsAPI.js').cleanResults();
    }

    handleTopButtonPressed(){
        this.context.changeState(CalculatingCrackrState);
        this.context.calculator.startCalculation();
        this.context.connector.startServer();
    }
}

class CalculatingCrackrState extends Abstract_CrackrState{
    refresh(){
        super.refresh("Stop Calculations","block","Connect","block")
    }

    handleTopButtonPressed(){
        this.context.calculator.stopCalculation();
        this.context.connector.stopServer();
        this.context.changeState(IdleCrackrState);
    }

    handleBottomButtonPressed(){
        let ip = this.context.connectionInput.textContent;
        this.context.connector.tryToConnectToIP(ip);
    }
}

class CalculatingAndConnectedCrackrState extends Abstract_CrackrState{
    refresh(){
        super.refresh("Stop Calculations and Disconnect","block","Disconnect","none")
    }

    handleTopButtonPressed(){
        this.context.calculator.stopCalculation();
        this.context.connector.stopServer();
        this.context.changeState(IdleCrackrState);
    }

    handleBottomButtonPressed(){
        this.context.connector.disconnectOutcomingConnection();
        this.context.changeState(CalculatingCrackrState)
    }
}

class CrackrContext{
    constructor(topButtonId,bottomButtonId,connectionDivId,connectionInputId){
        this.topButton = document.querySelector('#'+topButtonId);
        this.bottomButton = document.querySelector('#'+bottomButtonId);
        this.connectionDiv = document.querySelector('#'+connectionDivId);
        this.connectionInput = document.querySelector('#'+connectionInputId);
        
        this.changeState(IdleCrackrState)
        this.refresh();
        this.initializeOperationObjects();
    }

    changeState(StateType){
        this.state = new StateType(this);
        this.refresh();
    }

    refresh(){
        this.state.refresh();
    }

    handleTopButtonPressed(){
        this.state.handleTopButtonPressed();
    }
    
    handleBottomButtonPressed(){
        this.state.handleBottomButtonPressed();
    }
    
    initializeOperationObjects(){
        this.connector = new Connector(this);
        this.calculator = new Calculator(this);
    }

    connectedOut(){
        this.changeState(CalculatingAndConnectedCrackrState)
        this.calculator.goOnline()
    }

    disconnectedOut(){
        if(typeof(this.state)===CalculatingAndConnectedCrackrState){
            this.changeState(CalculatingCrackrState)
        }
        this.calculator.goOffline();
    }

    exchangeResults(){
        this.connector.exchangeResults();
    }

    async isCellNotTaken(index){
        const result = await this.connector.isCellNotTaken(index);
        return result;
    }
}

export default CrackrContext;