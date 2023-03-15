/* eslint-disable no-undef */

let webSocket;
let words = [];
const portNumber = 10096;
const commandHistory = new Set();
const commandTableId = 'commandTable';

function connectWebSocket(port) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://localhost:${port}`);
    socket.onopen = () => {
      resolve(socket);
      document.getElementById('socket-connected').style.display = 'flex';
      document.getElementById('socket-disconnected').style.display = 'none';
      // eslint-disable-next-line no-console
      console.log(`Hurray, Connected to Nightwatch Server localhost:${port}`);
      socket.send('commandlist');
      webSocket = socket;
    };
  
    socket.onclose = () => {
      document.getElementById('socket-connected').style.display = 'none';
      document.getElementById('socket-disconnected').style.display = 'flex';
      // eslint-disable-next-line no-console
      console.log(`Disconnected from Nightwatch Server localhost:${port}`);
    };

    socket.onmessage = ((msg) => {
      const {result = null, error = null, executedCommand, commandList = []} = JSON.parse(msg.data);
      const commandResultElement = document.getElementById('commandResult');
      if (commandList.length) {
        words = [...commandList];
        
        return;
      }

      commandResultElement.textContent = typeof(result) === 'object' ? JSON.stringify(result) : result;
      if (!error && !commandHistory.has(executedCommand)) {
        addRowInCommand(executedCommand);
        commandHistory.add(executedCommand);
        commandResultElement.style.color = '#4e8865';
      } else if (error) {
        commandResultElement.style.color = '#B80D0D';
      }
    
      sendMessageToBackground('EXPLORE_MODE', true);
    });

    socket.onerror = (err) => {
      console.error(`WebSocket error: ${err}`);
      socket.close();

      connectWebSocket(port + 1)
        .then(resolve)
        .catch(reject);
    };
  });
}

//Add row to commands history
function addRowInCommand(command) {
  const selectorTable = document.getElementById(commandTableId);
  selectorTable.value += command + '\r\n';
}

connectWebSocket(portNumber)
  .then((socket) => {
    // eslint-disable-next-line no-console
    console.log(`WebSocket connected on port ${socket.url}`);
  })
  .catch((error) => {
    console.error(`WebSocket error: ${error}`);
  });

document.getElementById(commandTableId).addEventListener('click', function(event) {
  const commandHistory = event.target.value;
  copyToClipboard(commandHistory);
});
