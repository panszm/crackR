import './crackrCalculator.js'
import Connector from './crackrConnector.js';
import Calculator from './crackrCalculator.js';

class Abstract_CrackrState {
    constructor(crackrContext){
        if(typeof(this)===Abstract_CrackrState){throw new Error("Can't create abstract class object")}
        this.context = crackrContext
    }

    refresh(topButtonText,gearDisplay){
        this.context.topButton.textContent = topButtonText;
        document.querySelector("#gear").style.display = gearDisplay;
    }
    handleTopButtonPressed(){}
    handleBottomButtonPressed(){}
}

class IdleCrackrState extends Abstract_CrackrState{
    refresh(){
        super.refresh("Start Calculations","none")
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
        super.refresh("Stop Calculations","block")
    }

    handleTopButtonPressed(){
        this.context.calculator.stopCalculation();
        this.context.connector.stopServer();
        this.context.changeState(IdleCrackrState);
    }
}

class CrackrContext{
    constructor(topButtonId){
        this.topButton = document.querySelector('#'+topButtonId);
        
        this.changeState(IdleCrackrState)
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
        this.refresh()
        this.state.handleTopButtonPressed();
    }
    
    initializeOperationObjects(){
        this.connector = new Connector(this);
        this.calculator = new Calculator(this);
    }

    connected(){
        this.calculator.goOnline()
    }

    disconnected(){
        this.calculator.goOffline();
    }

    isCellNotTaken(index){
        const result = this.connector.isCellNotTaken(index);
        return result;
    }
}

export default CrackrContext;