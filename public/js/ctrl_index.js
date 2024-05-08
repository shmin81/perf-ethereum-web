function populateItemList() {
  let rParam = getUrlParams()
  //console.log(rParam.agent)
  if (rParam.agent == undefined || rParam.agent == null) {
    loadAgentJson()
  } else {
    loadAgentJson(rParam.agent)
  }
  // getStatus()
}

let agentsObj = null
async function loadAgentJson(selectedValue = 'perf_core') {
  agentsObj = await getAgentJson()
  //console.log(agentsObj)
  setSelectAgentList('agentList', agentsObj, selectedValue)
}

let selectAgents = null
function agentItemChange() {
  const itemList = document.getElementById('agentList')
  const selectedItem = itemList.value
  console.log(selectedItem)
  let found = false
  for (let i = 0; i < agentsObj.length; i++) {
    if (agentsObj[i].name == selectedItem) {
      console.log('selected', selectedItem, agentsObj[i])
      selectAgents = agentsObj[i]
      setAgensInfos(agentsObj[i])
      found = true
      break
    }
  }
  if (found == false) {
    console.log('need')
    selectAgents = null
    setAgensInfos(null)
  }
}

async function setSelectAgentList(listElementName, jsonObj, selectedValue) {
  console.log('setSelectAgentList', listElementName, jsonObj)
  const itemList = document.getElementById(listElementName)
  console.log(itemList)
  const option = document.createElement('option')
  option.selected = true
  option.value = null
  option.text = 'select'
  itemList.appendChild(option)
  for (let i = 0; i < jsonObj.length; i++) {
    const option = document.createElement('option')
    option.value = jsonObj[i].name
    option.text = jsonObj[i].name
    if (selectedValue == jsonObj[i].name) {
      option.selected = true
    }
    console.log('add', option)
    itemList.appendChild(option)
  }
  agentItemChange()
}

function setAgensInfos(resp) {
  console.log('setAgensInfos', resp)
  const log = document.getElementById('agentInfos')
  if (typeof resp == 'string') {
    log.innerHTML = resp
  } else {
    log.innerHTML = JSON.stringify(resp, null, 2)
  }
}

function goToSelectedAgent() {
  if (selectAgents == null) {
    alert('select agent')
    return
  }
  const itemList = document.getElementById('agentList')
  const selectedItem = itemList.value
  location.href = `prepare?agent=${selectedItem}`
}

async function getStatus() {
  console.log('getstatus')
  // msg = ''
  // setResponse(msg)
  if (selectAgents == null) {
    alert('select agent')
    return
  }
  let cnt = selectAgents.endpoints.length
  console.log('cnt', cnt)
  for (let i = 0; i < cnt; i++) {
    const apiUrl = `${selectAgents.endpoints[i]}/getStatus`
    console.log('apiUrl', apiUrl)
    await getJSON(apiUrl)
  }
}

async function exitAgent() {
  console.log('exitAgent')
  // msg = ''
  // setResponse(msg)
  if (selectAgents == null) {
    alert('select agent')
    return
  }
  let cnt = selectAgents.endpoints.length
  console.log('cnt', cnt)
  for (let i = 0; i < cnt; i++) {
    const apiUrl = `${selectAgents.endpoints[i]}/exit`
    console.log('apiUrl', apiUrl)
    await getJSON(apiUrl)
  }
}

// Call the function to populate the list when the page loads.
populateItemList()
