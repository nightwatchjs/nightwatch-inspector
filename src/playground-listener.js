const archiver = require('archiver');
const path = require('path');
const vm = require('vm');
const {WebSocketServer} = require('ws');

module.exports = class SelectorPlaygroundServer {
  constructor() {
    this.finishCallback = null;
    this.portNumber = 8080;
  }

  getNightwatchCommands(api, commandList) {
    commandList.push('browser');
    commandList.push(...Object.keys(api));
    commandList.push(...Object.keys(api.assert));
    commandList.push(...Object.keys(api.expect));
    commandList.push(...Object.keys(api.verify));
    commandList.push(...Object.keys(api.ensure));
  }

  setClient(client) {
    this.client = client;
  }

  setDebuggability(Debuggability) {
    this.Debuggability = Debuggability;
  }

  addExtensionInChromeOption(crxBuffer) {
    const chromeOptions = this.client.settings.desiredCapabilities['goog:chromeOptions'];
    
    this.client.settings.desiredCapabilities['goog:chromeOptions'] = {
      ...chromeOptions,
      extensions: [crxBuffer]
    };
  }

  isErrorObject(err) {
    return err instanceof Error || Object.prototype.toString.call(err) === '[object Error]'
  }

  startServer() {
    this._wss = new WebSocketServer({port: this.portNumber});

    this._wss.on('error', (error) => {
      this.handleSocketError(error);
    });
  
    this._wss.on('listening', () => {
      console.log(`WebSocket server is listening on port ${this.portNumber}`);
    });

    this._wss.on('connection', (ws) => {
      ws.on('message', async (data) => {
        if (data.toString() === 'commandlist') {
          const commandList = [];
          this.getNightwatchCommands(this.client.api, commandList);
          ws.send(JSON.stringify({
            commandList: commandList
          }));

          return;
        }

        
        this.Debuggability.debugMode = true;
        const isES6AsyncTestcase = this.client.isES6AsyncTestcase;
        this.client.isES6AsyncTestcase = true;
  
        const context = {browser: this.client.api};
        const assert = context.browser.assert;
        vm.createContext(context);
        
        let result;
        let error;
        try {
          const message = data.toString();
          console.log('Executed from browser : ', message);
          
          result = await vm.runInContext(message, context);
        } catch (err) {
          result = err;
        }

        if (this.isErrorObject(result)) {
          result = result.message;
          error = true;
        }

        ws.send(JSON.stringify({
          result: result,
          error: error,
          executedCommand: data.toString()
        }));

        this.client.isES6AsyncTestcase = isES6AsyncTestcase;
        this.Debuggability.debugMode = false;
      });
    });
  }

  handleSocketError(e) {
    if (e.code === 'EADDRINUSE') {
      console.warn(`Port ${this.portNumber} is already in use. Trying the next available port.`);
      this.portNumber++;
    } else {
      console.error(`Could not start WebSocket server on port ${this.portNumber}: ${e.message}`);
    }

    this.initSocket();
  }

  initSocket() {
    try {
      this.startServer();
    } catch (e) {
      this.handleSocketError(e);
    }
  }

  async createExtension () {
    const crxBuffer = await this.packExtension();
    this.addExtensionInChromeOption(crxBuffer);
  }

  loadContents () {
    return new Promise(function(resolve, reject) {
      const archive = archiver('zip');
      let contents = Buffer.from('');

      archive.on('error', reject);

      archive.on('data', function(buf) {
        contents = Buffer.concat([contents, buf]);
      });

      archive.on('finish', function() {
        resolve(contents);
      });

      const playgroundPath = path.join(__dirname, 'extension');

      archive
        .glob('**', {
          cwd: playgroundPath,
          matchBase: true,
          ignore: ['*.pem', '.git', '*.crx']
        })
        .finalize();
    });
  }

  async packExtension() {
    const packP = [
      this.loadContents()
    ];

    const outputs = await Promise.all(packP);
    const extension = outputs[0].toString('base64');

    return extension;
  }

  outputPreview(cmd, context) {
    if (cmd.includes('(')) {
      return;
    }

    const cmdArray = cmd.split('.');
    try {
      return Object.keys(context.browser).find(key => key.includes(cmdArray[1]));
    } catch (err) {
      return;
    }
  }

  get nwsocket() {
    return this._wss;
  }

  closeSocket(err) {
    if (this.finishCallback) {
      this.finishCallback(err);
    }

    this.nwsocket.close();
  }
};
