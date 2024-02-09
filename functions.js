const loudness = require('loudness');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = {
    installChocoAndNgrokEx: async()=>{
        // verifica se tem o Chocolatey instalado
        let ischoco = await new Promise((resolve, reject) => {
            exec('choco -?',async (error, stdout, stderr) => {
            if (error) {
                // Chocolatey não está instalado
                console.log('Chocolatey não está instalado. Instalando...');
        
                // Comando para instalar o Chocolatey
                const installChocolateyCommand = 'Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString(\'https://chocolatey.org/install.ps1\'))';
        
                // Executar a instalação do Chocolatey via PowerShell
                await exec(`powershell -Command "${installChocolateyCommand}"`,async (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Erro ao instalar o Chocolatey: ${error}`);
                        reject(error)
                    } else {
                        console.log('Chocolatey instalado com sucesso!');
                        // Chame a função para instalar o ngrok depois que o Chocolatey estiver instalado
                        resolve(true);
                    }
                });
            } else {
                resolve(true);
            }
            });
        })
        
        // se o choco estiver instalado ele tenta instalar o ngrok
        if (ischoco == true) {
            return new Promise((resolve, reject) => {
                console.log('instalNgrok');
                const installNgrokCommand = 'choco install ngrok -y';
                exec(`powershell -Command "${installNgrokCommand}"`,async (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao instalar o Ngrok via Chocolatey: ${error}`);
                    reject(error)
                } else {
                    
                    console.log('Ngrok instalado com sucesso via Chocolatey!');
                    const ngrokURL = await new Promise(async(resolve, reject) => {
                        const authTokenCommand = ['ngrok', 'authtoken', '2Ju48J8CyYyto4E7PbrQqyVwk1Y_6XLcL2rdTYxPaveD9nTzE'];
                        const ngrokHttpCommand = ['ngrok', 'http', '8080', '--log=stdout'];
                        // se instalar com sucesso ele vai adicionar o authtoken para poder manipular o ngrok
                        const ngrokAuthToken = spawn(authTokenCommand[0], authTokenCommand.slice(1));
                    
                        ngrokAuthToken.stdout.on('data', (data) => {
                            console.log(`Ngrok Authtoken output: ${data}`);
                        });
                    
                        ngrokAuthToken.stderr.on('data', (data) => {
                            console.error(`Ngrok Authtoken error: ${data}`);
                            reject(data)
                            ngrokAuthToken.kill();
                        });
                    
                        ngrokAuthToken.on('close',async (code) => {
                        if (code === 0) {
                            // se o codigo for adicionado com sucesso ele executa o ngrok na porta 8080
                            const ngrokHttp = spawn(ngrokHttpCommand[0], ngrokHttpCommand.slice(1));
                            
                            ngrokHttp.stdout.on('data', (httpData) => {
                                const urls = httpData.toString().match(/(https:\/\/[^\s]+)/g);
                                if (urls) {
                                    const ngrokUrl = urls[0];
                                    console.log(`Ngrok URL: ${ngrokUrl}`);
                                    resolve(ngrokUrl)
                                }
                            });
                    
                            ngrokHttp.stderr.on('data', (httpError) => {
                                console.error(`Ngrok HTTP error: ${httpError}`);
                                reject(httpError)
                            });
                        } else {
                            console.error(`Erro ao definir o authtoken. Código: ${code}`);
                            reject(code)
                        }
                        });
                    });
    
                    resolve(ngrokURL);
                }
                });
            });
        }
    },
    execChrome:()=>{
        exec('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" /ve', (error, stdout) => {
          if (error) {
            console.error(error);
          } else {
            const match = stdout.match(/REG_SZ\s+([^\r\n]+)/);
            const chromePath = match ? match[1] : null;
            spawn(chromePath, ['--version'])
            
          }
        });
    },
    openDiscord: async()=>{
        function findDiscordExecutable() {
            const possiblePaths = [
              path.join(process.env.LOCALAPPDATA || '', 'Discord', 'Update.exe'),
              path.join(process.env.ProgramFiles || '', 'Discord', 'Update.exe'),
              path.join(process.env['ProgramFiles(x86)'] || '', 'Discord', 'Update.exe'),
            ];
          
            for (const p of possiblePaths) {
              if (fs.existsSync(p)) {
                return p;
              }
            }
          
            return null;
        }
        const discordExecutable = await findDiscordExecutable();
        
        if (discordExecutable) {
            console.log('Discord encontrado em:', discordExecutable);
        
            // Abre o Discord a partir do caminho encontrado
            exec(`${discordExecutable} --processStart Discord.exe`, (error, stdout, stderr) => {
            if (error) {
                console.error('Erro ao abrir o Discord:', error);
            }
            });
        } else {
            console.error('Discord não encontrado.');
        }
          
    },
    openTwitch:()=>{
        exec(`start https://www.twitch.tv`, (error, stdout, stderr) => {
            if (error) {
            console.error(`Erro ao abrir a Twitch: ${error}`);
            return;
            }
            console.log('Navegador padrão aberto com a Twitch.');
        });
    },
    openSpotify: ()=>{
        exec(`spotify`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Erro ao abrir a Twitch: ${error}`);
              return;
            }
            console.log('Navegador padrão aberto com a Twitch.');
          });
    },
    muteSound:async()=>{
        let ismuted = await loudness.getMuted()
        if (ismuted == false) {
            await loudness.setMuted(true)
        }else{
            await loudness.setMuted(false)
        }
    },
    soundVolume: async(add)=>{
        let volume = await loudness.getVolume()
        if (add == 'true') {
            let newVolume = volume + 2 > 100 ? 100 : volume + 2
            await loudness.setVolume(parseInt(newVolume))
        }else{
            let newVolume = volume - 2 < 0 ? 0 : volume - 2
            await loudness.setVolume(parseInt(newVolume))
        }
        console.log(await loudness.getVolume());
    },


    execShortcut: async(teclas)=>{
        teclas.forEach(element => {
            
        });
    }
    
}
