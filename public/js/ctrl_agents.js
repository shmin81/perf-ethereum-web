let apiEndpoint = 'http://localhost:10050'
let agentEndpointsSize = 0

let agentGroupName = ''
function populateItemList() {
  //clearAllLogs()
  let rParam = getUrlParams()
  //console.log(rParam)
  agentGroupName = rParam.agent
  loadAgentJson(rParam.agent)

  setTimeout(getStatus, 500)
}

const itemList = document.getElementById('agentList')
function agentItemChange() {
  apiEndpoint = itemList.value
  console.log('target agent:', apiEndpoint)
}

// ..
async function loadAgentJson(agentName) {
  //console.log('agentName', agentName)
  const element = document.getElementById('agentGroupName')
  element.innerHTML = `<span><b>[ ${agentName} ]</b></span>`

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
  // 텍스트 출력
  // console.log('selectedAgentEndpoints', selectedAgentEndpoints)
  setSelectList('agentList', selectedAgentEndpoints)
}

// refresh list
async function setSelectList(listElementName, jsonObj, selectedValue = '') {
  //console.log('setSelectList', listElementName, jsonObj)
  const targetItemList = document.getElementById(listElementName)
  //clear array
  targetItemList.options.length = 0
  for (let i = 0; i < jsonObj.length; i++) {
    const option = document.createElement('option')
    option.value = jsonObj[i]
    option.text = jsonObj[i]
    if (selectedValue == jsonObj[i]) {
      option.selected = true
    }
    targetItemList.appendChild(option)
  }
  //console.log('updated', itemList)
  if (listElementName == 'agentList') {
    apiEndpoint = targetItemList.value
    console.log('target agent:', apiEndpoint)
  }
}

// 'Selected Status' button
async function getStatus() {
  const apiUrl = `${apiEndpoint}/getStatus`
  initAgentReqRes()
  let resp = await getJSON(apiUrl)
  updateAgentReqRes(0, resp) // 실제로는 0이 아닐수도 있지만...
  if (resp.result == true) {
    document.getElementById('nowEndpoint').innerText = resp.config.endpointfile
    document.getElementById('nowAccount').innerText = resp.config.accountfile

    getTestcases()
    getEndpoints(resp.config.endpointfile)
    getAccounts(resp.config.accountfile)
  }
}

// 'All Agent Status' button
async function getAllAgentStatus() {
  sendAllAgentsGet('getStatus')
}

async function sendAllAgentsGet(queryStr, skipResp = false) {
  if (skipResp == false) initAgentReqRes()
  let respDatas = []
  for (let i = 0; i < agentEndpointsSize; i++) {
    let _agentApi = itemList.options[i].value
    //console.log('agent[', i, ']:', _agentApi)
    const apiUrl = `${_agentApi}/${queryStr}`
    let resp = await getJSON(apiUrl, skipResp)
    if (agentEndpointsSize > 1) {
      respDatas.push(`\n [ ${i} ] =====================================`)
    }
    respDatas.push(resp)
    if (skipResp == false) updateAgentReqRes(i, resp)
  }
  return respDatas
}

async function sendAllAgentsPost(queryStr) {
  initAgentReqRes()
  let respDatas = []
  for (let i = 0; i < agentEndpointsSize; i++) {
    let _agentApi = itemList.options[i].value
    //console.log('agent[', i, ']:', _agentApi)
    const apiUrl = `${_agentApi}/${queryStr}`
    let resp = await postJSON(apiUrl)
    respDatas.push(resp)
    updateAgentReqRes(i, resp)
  }
  return respDatas
}

function initAgentReqRes() {
  for (let i = 0; i < agentEndpointsSize; i++) {
    document.getElementById(`agent${i}`).innerHTML = `<span style="color:blue">agent${i}: ready</span>`
  }
}

function updateAgentReqRes(_idx, _resp) {
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

async function getTestcases(selectedValue = 'erc20perf') {
  let resp = await getJSON(`${apiEndpoint}/getTestcaseList`)
  if (resp.result == true) {
    setSelectList('testcaseList', resp.files, selectedValue)
  }
}

async function getEndpoints(selectedValue = '') {
  let resp = await getJSON(`${apiEndpoint}/getEndpointFiles`)
  if (resp.result == true) {
    setSelectList('endpointsList', resp.files, selectedValue)
  }
}

async function getAccounts(selectedValue = '') {
  let resp = await getJSON(`${apiEndpoint}/getAccountsFiles`)
  if (resp.result == true) {
    setSelectList('accountsList', resp.files, selectedValue)
  }
}

function setEndpoints() {
  const selectedItem = document.getElementById('endpointsList').value
  if (selectedItem) {
    //const apiUrl = `${apiEndpoint}/setEndpointFile/${encodeURIComponent(selectedItem)}`
    //postJSON(apiUrl)
    sendAllAgentsPost(`setEndpointFile/${encodeURIComponent(selectedItem)}`)
  } else {
    alert('Please select an item from the list.')
  }
}

async function setAccounts() {
  const selectedItem = document.getElementById('accountsList').value
  if (selectedItem) {
    //const apiUrl = `${apiEndpoint}/setAccountsFile/${encodeURIComponent(selectedItem)}`
    //postJSON(apiUrl)
    await sendAllAgentsPost(`setAccountsFile/${encodeURIComponent(selectedItem)}`)
    await updateAccountList(selectedItem)
  } else {
    alert('Please select an item from the list.')
  }
}

async function updateAccountList(accountfilename) {
  let tmpStr = accountfilename.substring(9)
  let tmplth = tmpStr.length - 5
  //console.log(`${tmpStr} -> ${tmplth}`)
  tmpStr = tmpStr.substring(0, tmplth)
  let accNumStr = parseInt(tmpStr)
  //console.log(`account nums: ${accNumStr}`)
  const agentMax = Math.floor(accNumStr / agentEndpointsSize)

  for (let i = 0; i < agentEndpointsSize; i++) {
    let _agentApi = itemList.options[i].value
    let startIdx = i * agentMax
    const apiUrl = `${_agentApi}/setTestOptions/${i}/${startIdx}/${agentMax}`
    //console.log('agent[', i, ']:', apiUrl)
    let resp = await postJSON(apiUrl)
    if (resp.result == true) {
      document.getElementById(`agent${i}`).innerText = `agent${i}:seccess`
    } else {
      document.getElementById(`agent${i}`).innerText = `agent${i}:${resp.message}`
    }
  }
}

function setTestcase() {
  const selectedItem = document.getElementById('testcaseList').value
  if (selectedItem) {
    //const apiUrl = `${apiEndpoint}/setTestCase/${encodeURIComponent(selectedItem)}`
    //postJSON(apiUrl)
    sendAllAgentsPost(`setTestCase/${encodeURIComponent(selectedItem)}`)
  } else {
    alert('Please select an item from the list.')
  }
}

function setNewTestcase() {
  const selectedItem = document.getElementById('testcaseList').value
  if (selectedItem) {
    //const apiUrl = `${apiEndpoint}/setNewTestCase/${encodeURIComponent(selectedItem)}`
    //postJSON(apiUrl)
    sendAllAgentsPost(`setNewTestCase/${encodeURIComponent(selectedItem)}`)
  } else {
    alert('Please select an item from the list.')
  }
}

function goToSelectedAgent() {
  if (agentGroupName == null || agentGroupName == '') {
    alert('unknown agent')
    return
  }
  const selectedItem = document.getElementById('testcaseList').value
  location.href = `testcase?agent=${agentGroupName}&test=${selectedItem}`
}

function removeOldLogs() {
  sendAllAgentsGet('message/removeLogs')
}

// Call the function to populate the list when the page loads.
populateItemList()
