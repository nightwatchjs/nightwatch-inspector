const tabID = chrome.devtools.inspectedWindow.tabId;
const exploreModeId = 'exploreMode';
const tryNightwatchCommandId = 'tryNightwatchCommand';
const nightwatchCommandId = 'nightwatchCommand';
const commandHistory = new Set();
let EXPLORE_MODE = false;
const portNumber = 8080;
let webSocket;

function connectWebSocket(port) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://localhost:${port}`);
    socket.onopen = () => {
      resolve(socket);
      console.log(`Hurray, Connected to Nightwatch Server localhost:${port}`);
      webSocket = socket;
    };
  
    socket.onclose = () => {
      console.log(`Disconnected from Nightwatch Server localhost:${port}`);
    };

    socket.onmessage = ((msg) => {
      const {result = null, error = null, executedCommand} = JSON.parse(msg.data);
      console.log(msg.data);
      document.getElementById('commandResult').textContent = result;
      if (!error && !commandHistory.has(executedCommand)) {
        addRowInCommand(executedCommand);
        commandHistory.add(executedCommand);
      }
    
      sendMessageToBackground('EXPLORE_MODE', true);
    });

    socket.onerror = (err) => {
      console.error(`WebSocket error: ${err}`);
      socket.close();

      if (port < portNumber + 100) {
        connectWebSocket(port + 1)
          .then(resolve)
          .catch(reject);
      }
    };
  });
}

connectWebSocket(portNumber)
  .then((socket) => {
    console.log(`WebSocket connected on port ${socket.url}`);
  })
  .catch((error) => {
    console.error(`WebSocket error: ${error}`);
  });

const backgroundPageConnection = chrome.runtime.connect({
  name: "Selector Playground"
});

//Establishing connention with background.js
sendMessageToBackground('INIT');

backgroundPageConnection.onMessage.addListener(function (message) {
  // Handle responses from the background page, if any
});

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  const {from, action, content} = msg;
  if (sender.tab.id === tabID && from === 'contentJS') {
    switch (action) {
      case 'selector':
        addRow(content);
        break;
    }
  }
});

document.getElementById(exploreModeId).addEventListener('click', clickOnExploreMode);
document.getElementById(tryNightwatchCommandId).addEventListener('click', tryNightwatchCommand);


function tryNightwatchCommand() {
  const nightwatchCommandElement = document.getElementById(nightwatchCommandId);
  const nightwatchCommand = nightwatchCommandElement.value;

  // setting explore mode false when trying out nightwatch commands
  sendMessageToBackground('EXPLORE_MODE', false);
  webSocket.send(nightwatchCommand);
}

function clickOnExploreMode(event) {
  const checkBox = event.target;
  sendMessageToBackground('EXPLORE_MODE', checkBox.checked);
}

document.querySelector('#nightwatchCommand').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const nightwatchCommandElement = document.getElementById('nightwatchCommand');
    webSocket.send(JSON.stringify(nightwatchCommandElement.value));
  }
});

function sendMessageToBackground(action = null, content = null) {
  backgroundPageConnection.postMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    action: action,
    content: content
  });
}

function getSelectorFromFirstCell(event) {
  const targetElement = event.target.parentElement.parentElement.firstElementChild;

  return targetElement.textContent;
}

function PosEnd(end) {
  var len = end.value.length;
  
  // Mostly for Web Browsers
  if (end.setSelectionRange) {
    end.focus();
    end.setSelectionRange(len, len);
  } else if (end.createTextRange) {
    var t = end.createTextRange();
    t.collapse(true);
    t.moveEnd('character', len);
    t.moveStart('character', len);
    t.select();
  }
}

function clickOnHighlight(event) {
  const selectorValue = getSelectorFromFirstCell(event);

  sendMessageToBackground('HIGHLIGHT_ELEMENT', selectorValue);
}

function clickOnCopy(event) {
  // Info: clipboard API not working. Using deprecated execCommand function
  const selectorValue = getSelectorFromFirstCell(event);
  const textarea = document.createElement("textarea");

  textarea.textContent = selectorValue;
  document.body.appendChild(textarea);
  textarea.select();

  document.execCommand('copy');
  document.body.removeChild(textarea);
}

//Add row to selector history
function addRow(selector) {
  const selectorTable = document.getElementById('selectorTable');
  const tbody = selectorTable.getElementsByTagName('tbody')[0];
  const newRow = tbody.insertRow(0);
  const timestamp = new Date().toLocaleString();
  
  const highlightButton = document.createElement('button');
  highlightButton.classList.add('button-default');
  highlightButton.appendChild(document.createTextNode('Highlight'));
  highlightButton.addEventListener('click', clickOnHighlight);
  
  const copyButton = document.createElement('button');
  copyButton.classList.add('button-default');
  copyButton.appendChild(document.createTextNode('Copy'));
  copyButton.addEventListener('click', clickOnCopy);
  
  var newCell = newRow.insertCell();
  newCell.style.width = '50%';
  newCell.appendChild(document.createTextNode(selector));
  
  newCell = newRow.insertCell();
  newCell.style.width = '25%';
  newCell.appendChild(document.createTextNode(timestamp));
  
  newCell = newRow.insertCell();
  newCell.style.width = '25%';
  newCell.appendChild(highlightButton);
  newCell.appendChild(copyButton);
}

//Add row to commands history
function addRowInCommand(command) {
  const selectorTable = document.getElementById('commandTable');
  selectorTable.value = command + '\r\n' + selectorTable.value;
}
