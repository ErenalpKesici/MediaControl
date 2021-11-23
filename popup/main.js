chrome.storage.sync.get(['key'], function(result) {
    document.getElementById('myBody').setAttribute('style', 'background-color: ' + result.key);
});

function numeric(input){
    let output = "";
    for(let i=0;i<input.length;i++){
        if(input[i] < '0' || input[i] > '9')
            continue;
        output += input[i];
    }
    return parseInt(output);
}    
const btnAction = [];
const btnDirect = [];
const sldrVolume = [];
let j = 0;
let returnedTab;
function getTab(id){
    return new Promise(function(resolve, reject) {
        chrome.tabs.get(id, function(result){
            if(result == undefined)
                reject();
            else{
                returnedTab = result;
                resolve();
            }
        });
    });
}
function getInfo(id, site){
    return new Promise(function(resolve, reject) {
        if(site == 'youtube')
            chrome.tabs.executeScript(id, {code: "var video = document.getElementsByTagName('video')[0]; var arr = []; arr[0] = video.paused; arr[1] = document.querySelector('[property=\"og:image\"]').content; arr[2] = video.volume; arr;"}, function(result){
                if(result == undefined)
                    reject();
                else{
                    returnedInfo = String(result).split(',');
                    resolve();
                }
            });
        else if(site == 'twitch')
            chrome.tabs.executeScript(id, {code: "var video = document.getElementsByTagName('video')[0]; var arr = []; var t = document.getElementsByClassName('InjectLayout-sc-588ddc-0 hYROTF tw-image tw-image-avatar'); arr[0] = video.paused; arr[1] = t[t.length - 1].src; arr[2] = video.volume; arr;"}, function(result){
                if(result == undefined)
                    reject();
                else{
                    returnedInfo = String(result).split(',');
                    resolve();
                }
            });
    });
}
async function updateItem(id){
    await getTab(id);
    var actionButton = document.getElementById('btnAction' + returnedTab.id);
    var toggle = actionButton.classList.contains('play')?'Pause':'Play';
    actionButton.innerHTML = toggle;
    actionButton.classList = "";
    actionButton.classList.add(toggle == 'Play'?'play':'pause');
}
async function addItem(tab, site){
    await getInfo(tab.id, site);
    var div = document.createElement('div');
    div.setAttribute('style', 'margin-bottom: 8px; box-shadow: 5px -4px 30px; text-align: center; border-radius: 8px');
    var div1 = document.createElement('div');
    var div1Style = 'overflow: hidden; width: 70%; float: left';
    div1.setAttribute('style', 'background-image: url(\"'+returnedInfo[1]+'\"); background-repeat: no-repeat; background-size: 420px 50px;' + div1Style);
    var title;
    title = '<b style="font-size: 16; color: white; text-shadow: 4px 4px black; padding: 2px">'+tab.title+'</b>';
    div1.setAttribute('id', 'btnDirect'+tab.id);
    div1.innerHTML += title;
    var div2 = document.createElement('div');
    if(site == 'youtube')
        div2.setAttribute('style', 'width: 30%; float: right; background-color: red');
    if(site == 'twitch')
        div2.setAttribute('style', 'width: 30%; float: right; background-color: purple');
    if(returnedInfo[0] == "")
        return false; 
    if(returnedInfo[0] == 'true')
        htmlBtnAction = '<button id = "btnAction'+tab.id+'" class="play" style="margin: 2px">Play</button>';
    else
        htmlBtnAction = '<button id = "btnAction'+tab.id+'" class="pause" style="margin: 2px">Pause</button>';
    var htmlSldrVolume = '<input id="sldrVol'+tab.id+'" type="range" min="0" max="100" value="'+returnedInfo[2]*100+'"">'; 
    div2.innerHTML += htmlBtnAction;
    div2.innerHTML += htmlSldrVolume;
    div.append(div1);
    div.append(div2);               
    document.getElementById('myBody').appendChild(div);
    btnAction[j] = document.getElementById("btnAction"+tab.id);
    btnDirect[j] = document.getElementById("btnDirect"+tab.id);
    sldrVolume[j++] = document.getElementById("sldrVol"+tab.id);
    var interval;
    for(let i = 0;i<j;i++){
        let tabId = numeric(btnAction[i].id);
        btnAction[i].onclick = function(){
            if(btnAction[i].classList.contains('pause'))
                chrome.tabs.executeScript(tabId, {code: "document.getElementsByTagName('video')[0].pause();"});
            else 
                chrome.tabs.executeScript(tabId, {code: "document.getElementsByTagName('video')[0].play();"});
            updateItem(tabId);
        };
        btnDirect[i].onclick = function(){
            chrome.tabs.update(tabId, {selected: true});
        };
        sldrVolume[i].onchange = function(){
            chrome.tabs.executeScript(tabId, {code: "document.getElementsByTagName('video')[0].volume = "+(this.value/100)+';'});
        };  
    }
    return true;
}
chrome.tabs.query({}, async function(tabs){
    let nOfItems = 0;
    for(let i =0;i<tabs.length;i++){
        var youtube = (tabs[i].url.substring(0, 29) == "https://www.youtube.com/watch");
        var twitch = new URL(tabs[i].url).hostname == "www.twitch.tv";
        if(youtube || twitch)      {
            if(await addItem(tabs[i], youtube?'youtube':'twitch'))
                nOfItems++;
        }
    } 
    if(nOfItems == 0){
        var div = document.createElement('div');
        div.setAttribute('style', 'text-align: center')
        div.innerHTML = '<b>No media found</b>';
        document.getElementById('myBody').appendChild(div);
    }
});
