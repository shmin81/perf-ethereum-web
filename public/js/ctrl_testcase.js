
let selectedAgentEndpoint = 'http://localhost:10050'
let agentEndpointsSize = 0
let agentEndpointList = []

let agentGroupName = ''
let testcaseName = ''
function populateItemList() {
  //clearAllLogs()
  let rParam = getUrlParams()
  //console.log(rParam)
  agentGroupName = rParam.agent
  testcaseName = rParam.test
  loadAgentJson(rParam.agent)
  enableTestCase()
  // getStatus()
  setTimeout(getAllAgentStatus, 1000)
  setTimeout(btnAutoOrManualChange, 2000)
}

const itemList = document.getElementById('agentList')
function agentItemChange() {
  selectedAgentEndpoint = itemList.value
  console.log('target agent:', selectedAgentEndpoint)
}

function enableTestCase() {
  let disableItems = ['erc20', 'sto', 'docu']
  if (testcaseName.startsWith('erc20')) {
    enableItem = 'erc20'
  } else if (testcaseName.startsWith('sto')) {
    enableItem = 'sto'
  } else if (testcaseName.startsWith('docu')) {
    enableItem = 'docu'
  } else {
    enableItem = 'native'
  }
  for (let item of disableItems) {
    if (item != enableItem) {
      //console.log('disable', item)
      const itemRow = document.getElementById(item)
      itemRow.innerHTML = ''
    }
  }
}

// ..
async function loadAgentJson(agentName) {
  //console.log('agentName', agentName)
  const element = document.getElementById('agentGroupName')
  element.innerHTML = `<span><b>[ ${agentName} - ${testcaseName} ]</b></span>`

  const obj = await getAgentJson()
  //console.log(obj)
  let selectedAgentEndpoints = []
  for (idx in obj) {
    if (obj[idx].name == agentName) {
      selectedAgentEndpoints = obj[idx].endpoints
      agentEndpointsSize = selectedAgentEndpoints.length
      break
    }
  }
  // console.log('selectedAgentEndpoints', selectedAgentEndpoints)
  setSelectList('agentList', selectedAgentEndpoints)
}

// refresh list
async function setSelectList(listElementName, jsonObj, selectedValue = '') {
 // console.log('setSelectList', listElementName, jsonObj)
  const targetItemList = document.getElementById(listElementName)
  //console.log('before', itemList)
  targetItemList.options.length = 0
  agentEndpointList = []
  //console.log('inited', itemList)
  for (let i = 0; i < jsonObj.length; i++) {
    const option = document.createElement('option')
    option.value = jsonObj[i]
    option.text = jsonObj[i]
    if (selectedValue == jsonObj[i]) {
      option.selected = true
    }
    targetItemList.appendChild(option)
    agentEndpointList.push(jsonObj[i])
  }
  //console.log('updated', itemList)
  if (listElementName == 'agentList') {
    selectedAgentEndpoint = targetItemList.value
    console.log('target agent:', selectedAgentEndpoint)
  }
}

// 'Selected Status' button
async function getStatus() {
  const apiUrl = `${selectedAgentEndpoint}/getStatus/${testcaseName}`
  initAgentReqRes()
  let resp = await getJSON(apiUrl)
  updateAgentReqRes(0, resp) // 실제로는 0이 아닐수도 있지만...
}

// 'All Agent Status' button
async function getAllAgentStatus() {
  sendAllAgentsGet(`getStatus/${testcaseName}`)
}

async function sendAllAgentsGet(queryStr, skipResp = false) {
  if (skipResp == false) initAgentReqRes()
  let respDatas = []
  for (let i = 0; i < agentEndpointsSize; i++) {
    //let _agentApi = itemList.options[i].value
    let _agentApi = agentEndpointList[i]
    const apiUrl = `${_agentApi}/${queryStr}`
    //console.log('agent[', i, ']:', apiUrl)
    let resp = await getJSON(apiUrl, skipResp)
    if (agentEndpointsSize > 1) {
      respDatas.push(`\n [ ${i} ] =====================================`)
    }
    respDatas.push(resp)
    if (skipResp == false) updateAgentReqRes(i, resp)
  }
  return respDatas
}

function sendAllAgentsGetAsync(queryStr, btnId) {
  document.getElementById(btnId).disabled = true
  initAgentReqRes()
  for (let i = 0; i < agentEndpointsSize; i++) {
    //let _agentApi = itemList.options[i].value
    let _agentApi = agentEndpointList[i]
    const apiUrl = `${_agentApi}/${queryStr}`
    //console.log('agent[', i, ']:', apiUrl)
    getJSON(apiUrl).then((resp) => {
      updateAgentReqRes(resp.agentIdx, resp)
      document.getElementById(btnId).disabled = false
    })
  }
}

async function sendAllAgentsPost(queryStr) {
  initAgentReqRes()
  let respDatas = []
  for (let i = 0; i < agentEndpointsSize; i++) {
    //let _agentApi = itemList.options[i].value
    let _agentApi = agentEndpointList[i]
    const apiUrl = `${_agentApi}/${queryStr}`
    //console.log('agent[', i, ']:', apiUrl)
    let resp = await postJSON(apiUrl)
    if (agentEndpointsSize > 1) {
      respDatas.push(`\n [ ${i} ] =====================================`)
    }
    respDatas.push(resp)
    updateAgentReqRes(i, resp)
  }
  return respDatas
}

function initAgentReqRes() {
  for (let i = 0; i < agentEndpointsSize; i++) {
    document.getElementById(`agent${i}`).innerHTML = `<span style="color:blue">agent${i}: ...</span>`
  }
}

function updateAgentReqRes(_idx, _resp) {
  if (_idx == undefined) {
    _idx = 0 //???
  }
  let _style = 'color:red; font-weight:bold'
  let _respMsg = _resp.message
  if (_resp.result == true) {
    _style = 'color:blue'
    if (_respMsg == undefined || _respMsg == null) {
      _respMsg = 'success'
    }
  }
  document.getElementById(`agent${_idx}`).innerHTML = `<span style="${_style}">agent${_idx}: ${_respMsg}</span>`
}

function setTestcase() {
  if (testcaseName) {
    disableAndEnableById('btnTestcase1', 3000)
    let queryUrl = `setTestCase/${encodeURIComponent(testcaseName)}`
    sendAllAgentsPost(queryUrl)
  } else {
    alert('Please select an item from the list.')
  }
}

function setNewTestcase() {
  if (testcaseName) {
    disableAndEnableById('btnTestcase2', 3000)
    let queryUrl = `setNewTestCase/${encodeURIComponent(testcaseName)}`
    sendAllAgentsPost(queryUrl)
  } else {
    alert('Please select an item from the list.')
  }
}

async function sendDeploy() {
  disableAndEnableById('btnDeploy', 3000)
  initAgentReqRes()
  let i = 0
  let _agentApi = itemList.options[i].value
  const apiUrl = `${_agentApi}/send/deploy`
  let deployResp = await postJSON(apiUrl)
  updateAgentReqRes(i, deployResp)
  if (deployResp.result != true) {
    return
  }
  //deployResp.contractAddress
  //deployResp.transactionHash
  let queryStr = `${testcaseName}/${deployResp.contractAddress}/${deployResp.transactionHash}`

  for (i = 1; i < agentEndpointsSize; i++) {
    _agentApi = itemList.options[i].value
    const apiUrl = `${_agentApi}/setContract/${queryStr}`
    //console.log('agent[', i, ']:', apiUrl)
    let resp = await postJSON(apiUrl)
    updateAgentReqRes(i, resp)
  }
}

function enableById(targetId, waitMilliSeconds) {
  setTimeout(() => {
    document.getElementById(targetId).disabled = false
  }, waitMilliSeconds)
}

function disableAndEnableById(targetId, waitMilliSeconds) {
  document.getElementById(targetId).disabled = true
  setTimeout(() => {
    document.getElementById(targetId).disabled = false
  }, waitMilliSeconds)
}

async function getLatestTxReceipt() {
  sendAllAgentsGet('send/latestTxReceipt')
}

async function sendMsgVerify() {
  sendAllAgentsGetAsync('message/verify', 'btnMsgVerify')
}

async function sendMsgResult() {
  document.getElementById('btnMsgResult').disabled = true
  const apiUrl = `${selectedAgentEndpoint}/message/result`
  let resp = await getJSON(apiUrl)
  enableById('btnMsgResult', 1000)
  //document.getElementById('btnMsgResult').disabled = false
}

function btnAllOrOneChange() {
  if (document.getElementById('btnAllOrOne').checked) {
    document.getElementById('lblAllOrOne').innerText = 'All'
  }
  else {
    document.getElementById('lblAllOrOne').innerText = 'Selected'
  }
}

function btnAgentOrControllerChange() {
  if (document.getElementById('btnAgentOrController').checked) {
    document.getElementById('lblAgentOrController').innerText = 'Agent'
  }
  else {
    document.getElementById('lblAgentOrController').innerText = 'Controller'
  }
}

function getKeyword() {
  let apiKeywordStr = document.getElementById('apiKeyword').value
  apiKeywordStr = apiKeywordStr.trim()
  if (apiKeywordStr.startsWith('/')){
    apiKeywordStr = apiKeywordStr.slice(1)
  }
  if (apiKeywordStr.length < 3) {
    return ''
  }
  if (document.getElementById('btnAgentOrController').checked) {
    apiKeywordStr = 'send/' + apiKeywordStr
  }
  return apiKeywordStr
}
async function sendGetKeyword() {
  let reskeyword = getKeyword()
  if (reskeyword == '') return
  disableAndEnableById('btnSendGetKeyword', 1000)
  if (document.getElementById('btnAllOrOne').checked) {
    sendAllAgentsGet(reskeyword)
  }
  else {
    const apiUrl = `${selectedAgentEndpoint}/${reskeyword}`
    await getJSON(apiUrl)
  }
}

async function sendPostKeyword() {
  let reskeyword = getKeyword()
  if (reskeyword == '') return
  disableAndEnableById('btnSendPostKeyword', 1000)
  if (document.getElementById('btnAllOrOne').checked) {
    sendAllAgentsPost(reskeyword)
  }
  else {
    const apiUrl = `${selectedAgentEndpoint}/${reskeyword}`
    await postJSON(apiUrl)
  }
}

async function sendPrepare1() {
  document.getElementById('btnPrepare1').disabled = true
  const apiUrl = `${selectedAgentEndpoint}/send/prepare`
  let resp = await postJSON(apiUrl)
  enableById('btnPrepare1', 1000)
}

async function sendPrepareEachNode() {
  // document.getElementById('btnPrepare2').disabled = true
  // const apiUrl = `${apiEndpoint}/send/prepare`
  // let resp = await postJSON(apiUrl)
  // enableById('btnPrepare2', 1000)
  disableAndEnableById('btnPrepare2', 3000)
  sendAllAgentsPost('send/prepareEachNode')
}

async function sendTransfer() {
  sendAllAgentsPost('send/transfer')
}

async function getAccounts() {
  sendAllAgentsGet('send/accounts')
}

async function sendIssue() {
  sendAllAgentsPost('send/issue')
}

async function createDocument() {
  sendAllAgentsPost('send/createDocument')
}

async function getDocuments() {
  sendAllAgentsGet('send/getDocuments')
}

let IsRunning=false
let timerTxpoolId=null
let averageCntMax=6
let timerInterval=333
async function chkTxpool() {
  if (IsRunning) {
    document.getElementById('txpoolCtrl').innerHTML ='Start TxPool'
    IsRunning = false
    clearInterval(timerTxpoolId)
    document.getElementById('txpoolStatus').innerHTML = ''
  }
  else {
    document.getElementById('txpoolCtrl').innerHTML ='<b>Stop TxPool</b>'
    try {
      let response = await fetch(`${selectedAgentEndpoint}/message/blockInterval`)
      let result = await response.json()
      //console.log('blockInterval', result)
      if (result.result == false) {
        throw Error(result)
      }
      if (result.blockInterval < 3) {
        averageCntMax = result.blockInterval * 3
        timerInterval=333
      }
      else {
        averageCntMax = result.blockInterval * 2
        timerInterval=500
      }
      //console.log(`blockInterval: ${result.blockInterval}s -> ${timerInterval}ms, ${averageCntMax}`)
      IsRunning = true
      averageIdx = averageCntMax
      timerTxpoolId = setInterval(routineTxpool, timerInterval)
    } catch (error) {
      chkTxpool()
      console.error(queryTxpoolStr, 'Error:', error)
    }
  }
}

let txPoolSize = 0
let txSum = 0
let txCnt = 0
let minTx = 100000
let maxTx = 0
let averageIdx=0
const queryTxpoolStr = 'message/txpool'
const txpoolStatusObj = document.getElementById('txpoolStatus')
async function routineTxpool() {
  try {
    txSum = 0
    for (let i = 0; i < agentEndpointsSize; i++) {
      //let _agentApi = itemList.options[i].value
      let _agentApi = agentEndpointList[i]
      let apiUrl = `${_agentApi}/${queryTxpoolStr}`
      //console.log('agent[', i, ']:', apiUrl)
      let response = await fetch(apiUrl)
      let result = await response.json()
      //console.log(result)
      if (result.result == true) {
        if (txPoolSize == 0) {
          txPoolSize = result.txpool.maxSize
        }
        txSum += result.txCount
        if (minTx > result.txCount) minTx = result.txCount
        if (maxTx < result.txCount) maxTx = result.txCount
      }
    }
    let txCntNow = (txSum/agentEndpointsSize).toFixed()
    // high average
    txCnt = txCntNow > txCnt ? txCntNow : txCnt
    if (++averageIdx >= averageCntMax) {
      txpoolStatusObj.innerHTML = `<span>txpool: ${txCnt} / ${txPoolSize} (min: ${minTx}, max: ${maxTx})</span>`

      txCnt = maxTx = averageIdx = 0
      minTx = 100000
    }
  } catch (error) {
    chkTxpool()
    console.error(queryTxpoolStr, 'Error:', error)
  }
}

// Call the function to populate the list when the page loads.
populateItemList()
