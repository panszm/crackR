const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = electron;

let mainWindow;
const express = require('express')
const port = 8080
const expressApp = express()
let displayServer;

app.on('ready', function(){
    mainWindow = new BrowserWindow({});
    //line below is for debug purpose only
    mainWindow.webContents.openDevTools()
    
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplateOFF);
    Menu.setApplicationMenu(mainMenu);
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