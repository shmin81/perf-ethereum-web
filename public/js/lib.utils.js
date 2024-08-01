function getUrlParams() {
  let params = {}
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
    params[key] = value
  })
  return params
}

function gotoTargetNetwork() {
  let rParam = getUrlParams()
  location.href = `/?agent=${rParam.agent}`
}

function gotoTestcaseAndSetting() {
  let rParam = getUrlParams()
  location.href = `prepare?agent=${rParam.agent}`
}

async function getAgentJson() {
  const data = await fetch('assets/agent.json')
  //console.log(data)
  // JSON으로 해석
  return await data.json()
}

async function getJSON(_url, skipResp = false) {
  //exports.getJSON = async function (_url, skipResp = false) {
  let msg = `\nsend(get)... ${_url}\n`
  try {
    const response = await fetch(_url)
    const result = await response.json()
    if (skipResp && result.result == true) {
      //msg += `resp... ok\n`
      //console.log('Success:', _url, '(GET)', result)
    } else {
      msg += `resp... ${JSON.stringify(result, null, 2)}\n`
      setResponse(msg)
    }
    //setResponse(msg)
    //console.log('Success:', result)
    return result
  } catch (error) {
    console.error('Error:', error)
    msg += `err... ${JSON.stringify(error, null, 2)}\n`
    setResponse(msg)
    return { result: false, errorMsg: error }
  }
}

async function postJSON(url, data = { a: 1 }) {
  //exports.postJSON = async function (url, data = { a: 1 }) {
  let msg = `\nsend(post)... ${url}\n`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    msg += `resp... ${JSON.stringify(result, null, 2)}\n`
    setResponse(msg)
    //console.log('Success:', result)
    return result
  } catch (error) {
    console.error('Error:', error)
    msg += `err... ${JSON.stringify(error, null, 2)}\n`
    setResponse(msg)
    return { result: false, errorMsg: error }
  }
}

// =========================================

const respLog = document.getElementById('resplog')
function setResponse(resp) {
  if (typeof resp == 'string') {
    respLog.innerHTML += resp
  } else {
    respLog.innerHTML += JSON.stringify(resp, null, 2)
  }
  respLog.scrollTop = respLog.scrollHeight
}

const agentlogObj = document.getElementById('agentlog')
function updateLog(idx, resp) {
  if (typeof resp == 'string') {
    agentlogObj.innerHTML += `[${idx}] ${resp}`
  } else {
    agentlogObj.innerHTML += `[${idx}] ${JSON.stringify(resp, null, 2)}`
  }
  agentlogObj.scrollTop = agentlogObj.scrollHeight
}

function clearAgentLog() {
  agentlogObj.innerHTML = ''
}

function clearAllLogs() {
  respLog.innerHTML = ''
  clearAgentLog()
}

let timerLogsId = null
function btnAutoOrManualChange() {
  if (document.getElementById('btnAutoOrManual').checked) {
    document.getElementById('lblAutoOrManual').innerText = 'Auto'
    document.getElementById('btnGetLogs').disabled = true
    timerLogsId = setInterval(getAgentLog, 3000)
    getAgentLog()
  } else {
    document.getElementById('lblAutoOrManual').innerText = 'Manual'
    document.getElementById('btnGetLogs').disabled = false
    clearInterval(timerLogsId)
  }
}

async function getAgentLog() {
  try {
    let resps = await sendAllAgentsGet('message/log', true)
    let cnt = resps.length
    for (let i = 0; i < cnt; i++) {
      let resp = resps[i]
      if (resp.result == true) {
        for (let msg of resp.log) {
          updateLog(i, msg)
        }
      }
    }
  } catch (error) {
    document.getElementById('btnAutoOrManual').checked = false
    btnAutoOrManualChange()
    console.error('logs', 'Error:', error)
  }
}
