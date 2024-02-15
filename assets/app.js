let server_ip = localStorage.getItem('host')
const ws = new ReconnectingWebSocket(`wss://${server_ip}/run`)
const media_queries = window.matchMedia('(max-width: 760px)')
const box_left = document.querySelector('.box-left')
const box_right = document.querySelector('.box-right')
const th_mobile = document.querySelector('#th-mobile')
const bar_a = document.querySelectorAll('.bar-a')
const tab_name = document.querySelector('#tab-name')
const tab_icon_1 = document.querySelector('#tab-icon-1')
const tab_icon_2 = document.querySelector('#tab-icon-2')
const all_data_list = document.querySelector('#all-data-list')
const overlay_div = document.querySelector('.overlay')
const profile_form = document.querySelector('#profile-form')
const server_form = document.querySelector('#server-form')
const snippets_form = document.querySelector('#snippets-form')
const edit_server = document.querySelector('#edit-server-form')
const edit_snippets = document.querySelector('#edit-snippets-form')
const form_status = document.querySelectorAll('.form-status')
const rbs_term = document.querySelector('.rbs-terminal')
const terminal_name = document.querySelector('#terminal-name')
const terminal_form = document.querySelector('#terminal-form')
const terminal_ul = document.querySelector('#terminal-data-list')
const terminal_input = document.querySelector('#terminal-cmd-input')
const terminal_console = document.querySelector("#console-mid")
const terminal_submit = document.querySelector('#terminal-submit')
const search_input = document.querySelector('#search-input')
const search_form = document.querySelector('#search-form')
const search_snippet = document.querySelector('#search-snippet')
const hidden_profile = document.querySelector('.hidden-profile')
const hidden_add = document.querySelector('.hidden-add')
const bar_input_terminal = document.querySelector('.terminal-input')
let mouse_drag = false
let profile_clicked = false
let server_clicked = false
let snippets_clicked = false
let edit_server_clicked = false
let edit_snippets_clicked = false
let terminal_clicked = false
let search_clicked = false
let hidden_clicked = false
let username = localStorage.getItem('username')
let api_key = localStorage.getItem('key')
let terminal = null
let terminal_host = null
let terminal_cmd = null
let initialX = null
let initialY = null
let all_msg = []
let server_data = {}
let snippets_data = {}

function chkInput(e) {
    if (e.keyCode == 13 && !e.shiftKey) startRun()
}

function closeForm() {
    profile_clicked = false
    server_clicked = false
    snippets_clicked = false
    edit_server_clicked = false
    edit_snippets_clicked = false
    terminal_clicked = false
    search_clicked = false
    hidden_clicked = false
    profile_form.style.display = 'none'
    server_form.style.display = 'none'
    snippets_form.style.display = 'none'
    edit_server.style.display = 'none'
    edit_snippets.style.display = 'none'
    terminal_form.style.display = 'none'
    overlay_div.style.display = 'none'
    search_form.style.display = 'none'
    hidden_profile.style.display = 'none'
    overlay_div.style.background = ''
    form_status.forEach(function(val) {
        val.innerHTML = ''
    })
}

function setColorBtn() {
    if (!terminal_input.value) {
        terminal_submit.style.background = ''
    } else {
        terminal_submit.style.background = '#7289da'
    }
    terminal_input.style.height = '5px'
    terminal_input.style.height = terminal_input.scrollHeight + 'px'
}

function fetchData(path, url, token) {
    const xhr = new XMLHttpRequest()
    try {
        xhr.open('GET', `https://${server_ip}/${path}?url=${url}&token=${token}&key=${api_key}`, false)
        xhr.send()
        if (xhr.status === 200) return xhr.responseText
    } catch {}
    return null
}

function getData(url) {
    const token = localStorage.getItem(`${url}_token`)
    const api_url = localStorage.getItem(`${url}_url`)
    if (!api_url) return {}
    const res = localStorage.getItem(url)
    if (!res || res === '{}') {
        const data = fetchData(url, api_url, token)
        if (!data || data === '404: Not Found') return {}
        const items = data.split('\n\n')
        const result = {}
        for (const item of items) {
            const row = item.split('\n')
            let n = ''
            let h = ''
            for (const r of row) {
                if (r === '') continue
                if (r.includes('# ')) {
                    n = r.replace('# ', '')
                } else {
                    h += `${r}\n`
                }
            }
            if (!(`${url}_data` in result)) result[`${url}_data`] = []
            if (url === 'snippets') {
                result[`${url}_data`].push({name: n, cmd: h})
            } else {
                result[`${url}_data`].push({name: n, host: h})
            }
        }
        localStorage.setItem(url, JSON.stringify(result))
        return result
    }
    return JSON.parse(res)
}

function terminalServer(e) {
    bar_input_terminal.style.display = ''
    terminal_host = []
    let s_name = e.querySelector('p').innerHTML
    if (Object.keys(server_data).length > 0) {
        let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        terminal_name.innerHTML = s_name
        if (data.length > 0) {
            for (let row of data) {
                if (row.name === s_name) {
                    terminal_host.push(row.host)
                    break
                }
            }
        }
    }
    if (media_queries.matches) {
        box_left.style.display = 'none'
        box_right.style.margin = '0'
    }
    if (history.state !== '1')  history.pushState('1', null, '#ssh')
    history.replaceState('1', null, '#terminal')
    terminal_console.innerHTML = ''
    terminal_input.value = ''
    if (terminal !== null) {
        terminal.dispose()
        rbs_term.style.marginLeft = ''
        rbs_term.style.marginRight = ''
    }
    setColorBtn()
}

function sshClient(e, el) {
    e.stopPropagation()
    bar_input_terminal.style.display = 'none'
    terminal_console.innerHTML = ''
    terminal_input.value = ''
    terminal_host = []
    let s_name = el.parentNode.querySelector('p').innerHTML
    if (Object.keys(server_data).length > 0) {
        let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        terminal_name.innerHTML = s_name
        if (data.length > 0) {
            for (let row of data) {
                if (row.name === s_name) {
                    terminal_host.push(row.host)
                    break
                }
            }
        }
    }
    if (media_queries.matches) {
        box_left.style.display = 'none'
        box_right.style.margin = '0'
    }
    if (history.state !== '1') history.pushState('1', null, '#ssh')
    history.replaceState('1', null, '#terminal')
    let c = terminal_host[0].split('\n')[0]
    let hlup = c.split('||')
    let hl = hlup[1].split(':')
    let h = hl[0]
    let l = hl[1]
    let up = hlup[0].split(':')
    let u = up[0]
    let p = up[1]
    if (media_queries.matches) {
        rbs_term.style.marginLeft = '0'
        rbs_term.style.marginRight = '0'
    }
    fetch(`https://${server_ip}:8443/term`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            host: h,
            port: parseInt(l),
            user: u,
            pwd: p
        })
    })
    .then(resp => resp.json())
    .then(term => {
        const attachAddon = new AttachAddon.AttachAddon(
            new WebSocket(`wss://${server_ip}:8443/term/${term.id}/data`),
            { bidirectional: true }
        )
        const fitAddon = new FitAddon.FitAddon()
        const webLinksAddon = new WebLinksAddon.WebLinksAddon()
        if (media_queries.matches) {
            terminal = new Terminal({
                'fontFamily': 'monospace',
                'fontSize': 8,
                'rows': 40,
            })
        } else {
            terminal = new Terminal({
                'fontFamily': 'monospace',
                'fontSize': 12,
                'rows': 40,
            })
        }
        terminal.setOption('theme', {
            background: '#36393f',
        });
        terminal.loadAddon(webLinksAddon)
        terminal.loadAddon(fitAddon)
        terminal.loadAddon(attachAddon)
        terminal.open(rbs_term);
        terminal.onResize(({cols, rows}) => {
            fetch(`https://${server_ip}:8080/term/${term.id}/windowsize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'cols': cols, 'rows': rows})
            })
        })
        fitAddon.fit()
        terminal.focus()
        function debounce(f, timeout){
            let t
            return (...args) => {
                clearTimeout(t)
                t = setTimeout(() => { f.apply(this, args); }, timeout)
            }
        }
        window.addEventListener('resize', debounce(() => {
            try {
                fitAddon.fit()
                terminal.focus()
            } catch(e) {}
        }, 250))
    })
    .catch(err => console.error(err))
}

function sshHtml() {
    if (Object.keys(server_data).length > 0) {
        let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        let html_data = ''
        if (data.length > 0) {
            data.forEach(function(value) {
                html_data += `<li><div class="wrap" onclick="terminalServer(this)"><i class="fa fa-television" aria-hidden="true" onclick="sshClient(event, this)"></i><p class="name">${value.name}</p></div></li>`
            })
        } else {html_data += '<li></li>'}
        return html_data
    }
    return '<li></li>'
}

function serverHtml() {
    if (Object.keys(server_data).length > 0) {
        let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        let html_data = ''
        if (data.length > 0) {
            data.forEach(function(value) {
                html_data += `<li><div class="wrap" onclick="editServer(this)"><i class="fa fa-cloud" aria-hidden="true"></i><p class="name">${value.name}</p></div></li>`
            })
        } else {html_data += '<li></li>'}
        return html_data
    }
    return '<li></li>'
}

function snippetsHtml() {
    if (Object.keys(snippets_data).length > 0) {
        let data = snippets_data.snippets_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        let html_data = ''
        if (data.length > 0) {
            data.forEach(function(value) {
                html_data += `<li><div class="wrap" onclick="editSnippets(this)"><i class="fa fa-file-code-o" aria-hidden="true"></i><p class="name">${value.name}</p></div></li>`
            })
        } else {html_data += '<li></li>'}
        return html_data
    }
    return '<li></li>'
}

function updatePage() {
    server_data = getData('server')
    snippets_data = getData('snippets')
    document.querySelector('#profile-name').innerHTML = username
    all_data_list.innerHTML = sshHtml()
}

function editServer(e) {
    edit_server_clicked = true
    edit_server_custom = e
    let s_name = e.querySelector('p').innerHTML
    if (Object.keys(server_data).length > 0) {
        let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        let input = edit_server.querySelectorAll('input')
        let text_area = edit_server.querySelector('textarea')
        if (data.length > 0) {
            for (let row of data) {
                if (row.name === s_name) {
                    input[0].value = row.name
                    text_area.value = row.host
                    break
                }
            }
        }
    }
    overlay_div.style.display = 'flex'
    edit_server.style.display = 'inline-block'
    if (history.state !== '2') history.pushState('2', null, '#server')
    history.replaceState('2', null, '#editserver')
}

function editSnippets(e) {
    edit_snippets_clicked = true
    edit_snippets_custom = e
    let s_name = e.querySelector('p').innerHTML
    if (Object.keys(snippets_data).length > 0) {
        let data = snippets_data.snippets_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        let input = edit_snippets.querySelectorAll('input')
        let text_area = edit_snippets.querySelector('textarea')
        if (data.length > 0) {
            for (let row of data) {
                if (row.name === s_name) {
                    input[0].value = row.name
                    text_area.value = row.cmd
                    break
                }
            }
        }
    }
    overlay_div.style.display = 'flex'
    edit_snippets.style.display = 'inline-block'
    if (history.state !== '2') history.pushState('2', null, '#snippet')
    history.replaceState('2', null, '#editsnippet')
}

function postData(url, e) {
    const formData = new FormData(e)
    if (url === 'update_profile') {
        username = formData.get('profile-input-name')
        api_key = formData.get('profile-input-key')
        server_ip = formData.get('profile-input-host')
        localStorage.setItem('username', username)
        localStorage.setItem('key', api_key)
        localStorage.setItem('host', server_ip)
        document.querySelector('#profile-name').innerHTML = username
    } else if (url === 'update_server' || url === 'edit_server') {
        localStorage.setItem('server_token', formData.get('server-input-header'))
        localStorage.setItem('server_url', formData.get('server-input-host'))
        localStorage.removeItem('server')
        server_data = getData('server')
        all_data_list.innerHTML = serverHtml()
    } else {
        localStorage.setItem('snippets_token', formData.get('snippets-input-header'))
        localStorage.setItem('snippets_url', formData.get('cmd'))
        localStorage.removeItem('snippets')
        snippets_data = getData('snippets')
        all_data_list.innerHTML = snippetsHtml()
    }
    history.back()
    e.reset()
    return
}

function screenSize(e) {
    if (!e.matches) {
        box_left.style.display = ''
        box_right.style.margin = ''
        terminal_input.addEventListener('keydown', chkInput)
    } else {
        terminal_input.removeEventListener('keydown', chkInput)
    }
}

function logOut() {
    localStorage.removeItem('username')
    localStorage.removeItem('key')
    localStorage.removeItem('host')
    window.location.replace('./index.html')
}

function openLogOut() {
    hidden_clicked = true
    overlay_div.style.display = 'flex'
    overlay_div.style.background = 'transparent'
    hidden_profile.style.display = 'inline-block'
    if (tab_name.innerHTML === 'SSH DATA') {
        if (history.state !== '2')  history.pushState('2', null, '#ssh')
    } else if (tab_name.innerHTML === 'SERVER DATA') {
        if (history.state !== '2') history.pushState('2', null, '#server')
    } else {
        if (history.state !== '2') history.pushState('2', null, '#snippet')
    }
    history.replaceState('2', null, '#profilemobile')
}

function openSearch() {
    search_clicked = true
    overlay_div.style.display = 'flex'
    search_form.style.width = '100%'
    search_form.style.display = 'inline-block'
    if (tab_name.innerHTML === 'SSH DATA') {
        if (history.state !== '1') history.pushState('1', null, '#ssh')
    } else if (tab_name.innerHTML === 'SERVER DATA') {
        if (history.state !== '2') history.pushState('2', null, '#server')
    } else {
        if (history.state !== '2') history.pushState('2', null, '#snippet')
    }
    history.replaceState('2', null, '#searchmobile')
}

function openSettings() {
    profile_clicked = true
    document.querySelector('#profile-input-name').value = username
    document.querySelector('#profile-input-key').value = api_key
    document.querySelector('#profile-input-host').value = server_ip
    overlay_div.style.display = 'flex'
    profile_form.style.display = 'inline-block'
    if (tab_name.innerHTML === 'SSH DATA') {
        if (history.state !== '2') history.pushState('2', null, '#ssh')
    } else if (tab_name.innerHTML === 'SERVER DATA') {
        if (history.state !== '2') history.pushState('2', null, '#server')
    } else {
        if (history.state !== '2') history.pushState('2', null, '#snippet')
    }
    history.replaceState('2', null, '#profile')
}

function openBar(e) {
    for (let i = 0; i < bar_a.length; i++) {
        bar_a[i].setAttribute('class', 'bar-a')
    }
    e.setAttribute('class', 'bar-a active')
    const title = e.getAttribute('title')
    tab_name.innerHTML = title.toUpperCase() + ' DATA'
    if (title === 'ssh') {
        tab_icon_1.style.display = 'inline-block'
        tab_icon_2.style.display = 'none'
        all_data_list.innerHTML = sshHtml()
        if (media_queries.matches) hidden_add.style.display = 'none'
        if (history.state == '1') history.back()
        if (history.state == '2') history.go(-2)
    } else if (title === 'server') {
        tab_icon_1.style.display = 'none'
        tab_icon_2.style.display = 'inline-block'
        all_data_list.innerHTML = serverHtml()
        if (media_queries.matches) hidden_add.style.display = 'inline-block'
        if (history.state !== '1') history.pushState('1', null, '#ssh')
        history.replaceState('1', null, '#server')
    } else if (title === 'snippets') {
        tab_icon_1.style.display = 'none'
        tab_icon_2.style.display = 'inline-block'
        all_data_list.innerHTML = snippetsHtml()
        if (media_queries.matches)  hidden_add.style.display = 'inline-block'
        if (history.state !== '1') history.pushState('1', null, '#ssh')
        history.replaceState('1', null, '#snippet')
    }
}

function searchData() {
    let input = search_input.value
    let html_data = ''
    if (tab_name.innerHTML === 'SSH DATA') {
        if (Object.keys(server_data).length > 0) {
            let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            if (data.length > 0) {
                data.forEach(function(value) {
                    let r = value.name.toLowerCase()
                    if (r.includes(input.toLowerCase())) {
                        html_data += `<li><div class="wrap" onclick="terminalServer(this)"><i class="fa fa-television" aria-hidden="true" onclick="sshClient(event, this)"></i><p class="name">${value.name}</p></div></li>`
                    }
                })
            }
        }
        if (html_data === '') {
            html_data += '<li><div class="wrap"><p class="name">' + input.toUpperCase() + ' NOT FOUND</p></div></li>'
        }
        all_data_list.innerHTML = html_data
    } else if (tab_name.innerHTML === 'SERVER DATA') {
        if (Object.keys(server_data).length > 0) {
            let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            if (data.length > 0) {
                data.forEach(function(value) {
                    let r = value.name.toLowerCase()
                    if (r.includes(input.toLowerCase())) {
                        html_data += `<li><div class="wrap" onclick="editServer(this)"><i class="fa fa-cloud" aria-hidden="true"></i><p class="name">${value.name}</p></div></li>`
                    }
                })
            }
        }
        if (html_data === '') {
            html_data += '<li><div class="wrap"><p class="name">' + input.toUpperCase() + ' NOT FOUND</p></div></li>'
        }
        all_data_list.innerHTML = html_data
    } else if (tab_name.innerHTML === 'SNIPPETS DATA') {
        if (Object.keys(snippets_data).length > 0) {
            let data = snippets_data.snippets_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            if (data.length > 0) {
                data.forEach(function(value) {
                    let r = value.name.toLowerCase()
                    if (r.includes(input.toLowerCase())) {
                        html_data += `<li><div class="wrap" onclick="editSnippets(this)"><i class="fa fa-file-code-o" aria-hidden="true"></i><p class="name">${value.name}</p></div></li>`
                    }
                })
            }
        }
        if (html_data === '') {
            html_data += '<li><div class="wrap"><p class="name">' + input.toUpperCase() + ' NOT FOUND</p></div></li>'
        }  
        all_data_list.innerHTML = html_data
    }
    search_input.value = ''
    return
}

function getSnippets(e) {
    terminal_cmd = []
    let s_name = e.querySelector('p').innerHTML
    if (Object.keys(snippets_data).length > 0) {
        let data = snippets_data.snippets_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        if (data.length > 0) {
            for (let row of data) {
                if (row.name === s_name) {
                    terminal_cmd = row.cmd.split('\n')
                    break
                }
            }
        }
    }
    terminal_cmd = terminal_cmd.filter((e) => {return e})
    terminal_input.value = terminal_cmd.join('\n')
    setColorBtn()
    history.back()
}

function terminalSnippets() {
    terminal_clicked = true
    let html_data = ''
    if (Object.keys(snippets_data).length > 0) {
        let data = snippets_data.snippets_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        if (data.length > 0) {
            data.forEach(function(value) {
                html_data += `<li onclick="getSnippets(this)"><p>${value.name}</p><i class="fa fa-file-code-o" aria-hidden="true"></i></li>`
            })
        } else {html_data += '<li></li>'}
    }
    terminal_ul.innerHTML = html_data
    overlay_div.style.display = 'flex'
    terminal_form.style.display = 'inline-block'
    if (history.state !== '5') history.pushState('5', null, '#terminal')
    history.replaceState('5', null, '#terminalsnippet')
}

function searchSnippet() {
    let input = search_snippet.value
    let html_data = ''
    if (Object.keys(snippets_data).length > 0) {
        let data = snippets_data.snippets_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        if (data.length > 0) {
            data.forEach(function(value) {
                let r = value.name.toLowerCase()
                if (r.includes(input.toLowerCase())) {
                    html_data += `<li onclick="getSnippets(this)"><p>${value.name}</p><i class="fa fa-file-code-o" aria-hidden="true"></i></li>`
                }
            })
        }
    }
    if (html_data === '') {
        html_data += '<li><p>' + input.toUpperCase() + ' NOT FOUND</p><i class="fa fa-file-code-o" aria-hidden="true"></i></li>'
    }
    terminal_ul.innerHTML = html_data
    search_snippet.value = ''
    return
}

function updateScroll() {
    rbs_term.scrollTop = rbs_term.scrollHeight
}

function printText(text, stat) {
    if (stat === 'green') {
        terminal_console.innerHTML += "<pre style='color:#35fe60;'>"+text+"</pre>"
        updateScroll()
    } else if (stat === 'red') {
        terminal_console.innerHTML += "<pre style='color:#fe2f2f;'>"+text+"</pre>"
        updateScroll()
    } else if (stat === 'yellow') {
        terminal_console.innerHTML += "<pre style='color:#ffeb3b;'>"+text+"</pre>"
        updateScroll()
    } else if (stat === 'blue') {
        if (text === 'All job Done!') {
            let d = new Date()
            let h = d.getHours()
            let m = d.getMinutes()
            let s = d.getSeconds()
            terminal_console.innerHTML += '<div class="separator">'+h+':'+m+':'+s+'</div>'
        } else {
            terminal_console.innerHTML += "<pre style='color:#07a3ee;'>"+text+"</pre>"
        }
        updateScroll()
    } else {
        terminal_console.innerHTML += "<pre style='color:#d000f4;'>"+text+"</pre>"
        updateScroll()
    }
}

function startRun() {
    terminal_input.disabled = true
    terminal_submit.style.cursor = 'not-allowed'
    terminal_submit.setAttribute('onclick', '')
    let host_data
    cmd_data = terminal_input.value
    if (terminal_host) {
        host_data = terminal_host.join('\n')
        if (cmd_data === 'clear') {
            terminal_input.value = ''
            setColorBtn()
            terminal_console.innerHTML = ''
            terminal_input.disabled = false
            terminal_submit.style.cursor = 'pointer'
            terminal_submit.setAttribute('onclick','startRun()')
        } else if (cmd_data && host_data) {
            terminal_input.value = ''
            setColorBtn()
            terminal_console.innerHTML += "<pre style='color:#07a3ee;'>Running...</pre>"
            updateScroll()
            let msg = JSON.stringify({cfg: host_data, cmd: cmd_data, key: api_key})
            if (ws.readyState == 1) {
                ws.send(msg)
            } else {
                all_msg.push(msg)
                terminal_input.disabled = false
                terminal_submit.style.cursor = 'pointer'
                terminal_submit.setAttribute('onclick','startRun()')
                terminal_console.innerHTML += "<pre style='color:#ffeb3b;'>Reconnecting...</pre>"
            }
        } else {
            terminal_input.disabled = false
            terminal_submit.style.cursor = 'pointer'
            terminal_submit.setAttribute('onclick','startRun()')
            terminal_console.innerHTML += "<pre style='color:#fe2f2f;'>NO SNIPPETS LOADED!</pre>"
        }
    } else {
        terminal_input.disabled = false
        terminal_submit.style.cursor = 'pointer'
        terminal_submit.setAttribute('onclick','startRun()')
        terminal_console.innerHTML += "<pre style='color:#fe2f2f;'>NO SERVER LOADED!</pre>"
    }
}

function mobileSettings() {
    closeForm()
    openSettings()
}

function mobileLogout() {
    closeForm()
    logOut()
}

function mobileSearch(e) {
    let input = e.querySelector('#search-input-form')
    let html_data = '';
    if (tab_name.innerHTML === 'SSH DATA') {
        if (Object.keys(server_data).length > 0) {
            let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            if (data.length > 0) {
                data.forEach(function(value) {
                    let r = value.name.toLowerCase()
                    if (r.includes(input.value.toLowerCase())) {
                        html_data += `<li><div class="wrap" onclick="terminalServer(this)"><i class="fa fa-television" aria-hidden="true" onclick="sshClient(event, this)"></i><p class="name">${value.name}</p></div></li>`
                    }
                })
            }
        }
        if (html_data === '') {
            html_data += '<li><div class="wrap"><p class="name">' + input.value.toUpperCase() + ' NOT FOUND</p></div></li>'
        }
        all_data_list.innerHTML = html_data
    } else if (tab_name.innerHTML === 'SERVER DATA') {
        if (Object.keys(server_data).length > 0) {
            let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            if (data.length > 0) {
                data.forEach(function(value) {
                    let r = value.name.toLowerCase()
                    if (r.includes(input.value.toLowerCase())) {
                        html_data += `<li><div class="wrap" onclick="editServer(this)"><i class="fa fa-cloud" aria-hidden="true"></i><p class="name">${value.name}</p></div></li>`
                    }
                })
            }
        }
        if (html_data === '') {
            html_data += '<li><div class="wrap"><p class="name">' + input.value.toUpperCase() + ' NOT FOUND</p></div></li>'
        }
        all_data_list.innerHTML = html_data
    } else if (tab_name.innerHTML === 'SNIPPETS DATA') {
        if (Object.keys(snippets_data).length > 0) {
            let data = snippets_data.snippets_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            if (data.length > 0) {
                data.forEach(function(value) {
                    let r = value.name.toLowerCase()
                    if (r.includes(input.value.toLowerCase())) {
                        html_data += `<li><div class="wrap" onclick="editSnippets(this)"><i class="fa fa-file-code-o" aria-hidden="true"></i><p class="name">${value.name}</p></div></li>`
                    }
                })
            }
        }
        if (html_data === '') {
            html_data += '<li><div class="wrap"><p class="name">' + input.value.toUpperCase() + ' NOT FOUND</p></div></li>'
        }  
        all_data_list.innerHTML = html_data
    }
    closeForm()
    e.reset()
    return
}

th_mobile.onclick = function () {
    history.back()
}

overlay_div.addEventListener('mousedown', () => drag = false)
overlay_div.addEventListener('mousemove', () => drag = true)
overlay_div.addEventListener('mouseup', (e) => {
    if (!drag) {
        if (profile_clicked) {
            let profile_element = profile_form.contains(e.target)
            if (!profile_element) history.back()
        }
        if (server_clicked) {
            let server_element = server_form.contains(e.target);
            if (!server_element) history.back()
        }
        if (snippets_clicked) {
            let snippets_element = snippets_form.contains(e.target)
            if (!snippets_element) history.back()
        }
        if (edit_server_clicked) {
            let edit_server_element = edit_server.contains(e.target)
            if (!edit_server_element) history.back()
        }
        if (edit_snippets_clicked) {
            let edit_snippets_element = edit_snippets.contains(e.target)
            if (!edit_snippets_element) history.back()
        }
        if (terminal_clicked) {
            let terminal_element = terminal_form.contains(e.target)
            if (!terminal_element) history.back()
        }
        if (search_clicked) {
            let search_element = search_form.contains(e.target)
            if (!search_element) history.back()
        }
        if (hidden_clicked) {
            let hidden_element = hidden_profile.contains(e.target)
            if (!hidden_element) history.back()
        }
    }
})

tab_icon_2.addEventListener('click', function(e) {
    if (tab_name.innerHTML === 'SERVER DATA') {
        server_clicked = true
        overlay_div.style.display = 'flex'
        server_form.style.display = 'inline-block'
        const token = localStorage.getItem('server_token')
        const data = localStorage.getItem('server_url')
        if (token) document.querySelector('#server-input-header').value = token
        if (data) document.querySelector('#server-input-host').value = data
        if (history.state !== '2') history.pushState('2', null, '#server')
        history.replaceState('2', null, '#addserver')
    } else {
        snippets_clicked = true
        overlay_div.style.display = 'flex'
        snippets_form.style.display = 'inline-block'
        const token = localStorage.getItem('snippets_token')
        const data = localStorage.getItem('snippets_url')
        if (token) document.querySelector('#snippets-input-header').value = token
        if (data) document.querySelector('#cmd').value = data
        if (history.state !== '2') history.pushState('2', null, '#snippet')
        history.replaceState('2', null, '#addsnippet')
    }
})

hidden_add.addEventListener('click', function(e) {
    tab_icon_2.click()
})

search_input.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        e.preventDefault()
        searchData()
    }
})

search_snippet.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        e.preventDefault()
        searchSnippet()
    }
})

screenSize(media_queries)
media_queries.addListener(screenSize)
updatePage()

ws.onopen = function () {
    while (all_msg.length > 0) ws.send(all_msg.pop())
}

ws.onmessage = function (evt) {
    if (evt.data !== 'ping') {
        data = evt.data.split(';;;')
        stat = data[0]
        text = data[1].trim()
        printText(text, stat)
        if (text === 'All job Done!') {
            terminal_input.disabled = false
            terminal_submit.style.cursor = 'pointer'
            terminal_submit.setAttribute('onclick','startRun()')
        }
    }
}

window.setInterval(function() {
    if (ws.readyState == 1) ws.send('pong')
}, 1000)

window.addEventListener('offline', () => {
    location.reload()
})

window.onhashchange = function () {
    for (let i = 0; i < bar_a.length; i++) {
        bar_a[i].setAttribute('class', 'bar-a')
    }
    if (location.hash === '#server') {
        closeForm()
        bar_a[1].setAttribute('class', 'bar-a active')
        tab_name.innerHTML = 'SERVER DATA'
        tab_icon_1.style.display = 'none'
        tab_icon_2.style.display = 'inline-block'
        all_data_list.innerHTML = serverHtml()
        if (media_queries.matches) hidden_add.style.display = 'inline-block'
        if (history.state !== '1') history.pushState('1', null, '#ssh')
        history.replaceState('1', null, '#server')
    } else if (location.hash === '#snippet') {
        closeForm()
        bar_a[2].setAttribute('class', 'bar-a active')
        tab_name.innerHTML = 'SNIPPETS DATA'
        tab_icon_1.style.display = 'none'
        tab_icon_2.style.display = 'inline-block'
        all_data_list.innerHTML = snippetsHtml()
        if (media_queries.matches) hidden_add.style.display = 'inline-block'
        if (history.state !== '1') history.pushState('1', null, '#ssh')
        history.replaceState('1', null, '#snippet')
    } else if (location.hash === '#terminal') {
        closeForm()
        if (media_queries.matches) {
            box_left.style.display = 'none'
            box_right.style.margin = '0'
        }
    } else if (location.hash === '#terminalsnippet') {
        closeForm()
        terminalSnippets()
    } else if (location.hash === '#addserver') {
        tab_icon_2.click()
    } else if (location.hash === '#editserver') {
        edit_server_clicked = true
        let s_name = edit_server_custom.querySelector('p').innerHTML
        if (Object.keys(server_data).length > 0) {
            let data = server_data.server_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            let input = edit_server.querySelectorAll('input')
            let text_area = edit_server.querySelector('textarea')
            if (data.length > 0) {
                for (let row of data) {
                    if (row.name === s_name) {
                        input[0].value = row.name
                        text_area.value = row.host
                        break
                    }
                }
            }
        }
        overlay_div.style.display = 'flex'
        edit_server.style.display = 'inline-block'
        if (history.state !== '2') history.pushState('2', null, '#server')
        history.replaceState('2', null, '#editserver')
    } else if (location.hash === '#addsnippet') {
        tab_icon_2.click()
    } else if (location.hash === '#editsnippet') {
        edit_snippets_clicked = true
        let s_name = edit_snippets_custom.querySelector('p').innerHTML
        if (Object.keys(snippets_data).length > 0) {
            let data = snippets_data.snippets_data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            let input = edit_snippets.querySelectorAll('input')
            let text_area = edit_snippets.querySelector('textarea')
            if (data.length > 0) {
                for (let row of data) {
                    if (row.name === s_name) {
                        input[0].value = row.name
                        text_area.value = row.cmd
                        break
                    }
                }
            }
        }
        overlay_div.style.display = 'flex'
        edit_snippets.style.display = 'inline-block'
        if (history.state !== '2') history.pushState('2', null, '#snippet')
        history.replaceState('2', null, '#editsnippet')
    } else if (location.hash === '#profile') {
        closeForm()
        openSettings()
    } else if(location.hash === '#profilemobile') {
        closeForm()
        openLogOut()
    } else if(location.hash === '#searchmobile') {
        closeForm()
        openSearch()
    } else {
        closeForm()
        bar_a[0].setAttribute('class', 'bar-a active')
        tab_name.innerHTML = 'SSH DATA'
        tab_icon_1.style.display = 'inline-block'
        tab_icon_2.style.display = 'none'
        all_data_list.innerHTML = sshHtml()
        if (media_queries.matches) {
            hidden_add.style.display = 'none'
            box_left.style.display = ''
            box_right.style.margin = ''
        }
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('assets/sw.js')
    })
}
