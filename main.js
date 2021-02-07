const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

const {MainConnector}  = require("./mainConnection.js");
let connector;

let mainWindow;
const express = require('express')
const port = 8080
const phpPort = 80;
const expressApp = express()
const expressAppPHP = express()
let displayServer;
let phpServer;

var phpExpress = require('php-express')({
    binPath: 'php'
  });
  
expressAppPHP.set('views', './results');
expressAppPHP.engine('php', phpExpress.engine);
expressAppPHP.set('view engine', 'php');

expressAppPHP.all(/.+\.php$/, phpExpress.router);

expressAppPHP.get('/modifyrow.php', (req, res) => {
    res.sendFile(path.join(__dirname+'/modifyrow.php'));
})

phpServer = expressAppPHP.listen(phpPort, () => {})

app.on('ready', function(){
    mainWindow = new BrowserWindow({webPreferences: {
        nodeIntegration: true
    }});
    
    //debug purpose only
    mainWindow.webContents.openDevTools()
    
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))
    
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplateOFF);
    Menu.setApplicationMenu(mainMenu);

   connector = new MainConnector(ipcMain,mainWindow.webContents);
});

expressApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/results/index.html'));
})

expressApp.get('/data.csv', (req, res) => {
    res.sendFile(path.join(__dirname+'/results/data.csv'));
})

const mainMenuTemplateOFF = [
    {
        label: 'Results',
        submenu:[
            {
                label: 'Display through HTTP',
                click: function(){
                    displayServer = expressApp.listen(port, () => {
                    })
                    const mainMenu = Menu.buildFromTemplate(mainMenuTemplateON);
                    Menu.setApplicationMenu(mainMenu);
                }
            }
        ]
    }
]

const mainMenuTemplateON = [
    {
        label: 'Results',
        submenu:[
            {
                label: 'Stop HTTP display',
                click: function(){
                    displayServer.close();
                    const mainMenu = Menu.buildFromTemplate(mainMenuTemplateOFF);
                    Menu.setApplicationMenu(mainMenu);
                }
            }
        ]
    }
]