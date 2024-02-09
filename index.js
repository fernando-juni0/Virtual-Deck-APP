const { app, BrowserWindow,ipcMain,ipcRenderer } = require('electron');
const path = require('path');
const https = require('https');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const express = require('express');
const appExpress = express();
const loudness = require('loudness');
const functions = require('./functions')




//comando para aceitar os headers de requisicao da minha aplicacao web para que nao ocorra erros ao enviar um comando
appExpress.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://virtualdeck.fernandojunio.com.br');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, ngrok-skip-browser-warning');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});




//TODO criando a janela

let mainWindow;


async function createWindow() {
  let ngrok = await functions.installChocoAndNgrokEx();
  ngrok = ngrok.replace('https://','')
  if (ngrok.includes('ngrok.com/docs/secure-tunnels/ngrok-agent/reference/config/')) {
    ngrok = 'Erro ao abrir o servidor ngrok, provavelmente ja tem um dispositivo em uso!'
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon:'./public/img/fav-icon.ico',
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });
  mainWindow.maximize()
  mainWindow.loadFile('./views/index.html');
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('res-link', ngrok);
  });
}
app.whenReady().then(async()=>{
  await createWindow()
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});





//TODO servidor express


appExpress.get('/discord', (req, res) => {
  functions.openDiscord
  res.send('Discord aberto!');
});

appExpress.get('/chrome', (req, res) => {
  functions.execChrome
  res.send('Chrome aberto!');
});

appExpress.get('/twitch', (req, res) => {
  functions.openTwitch
  res.send('Chrome aberto!');
});

appExpress.get('/spotify', (req, res) => {
  functions.openSpotify
  res.send('Chrome aberto!');
});


appExpress.get('/',(req,res)=>{
  res.send('test')
})

appExpress.get('/ping',(req,res)=>{
  res.send('sucess')
})

appExpress.get('/volume/:add',(req,res)=>{
    functions.soundVolume(req.params.add)
    res.send('Volume alterado')
})

appExpress.get('/muted',(req,res)=>{
    functions.muteSound()
    res.send('muted ativo')
})






appExpress.get('/shortcutPers',(req,res)=>{
    functions.execShortcut(req.body.teclas)
    res.send('Atalho ativado')
})









appExpress.listen('8080', () => {
  console.log(`Servidor iniciado na porta 8080`);
});







