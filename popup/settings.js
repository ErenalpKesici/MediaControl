colorSelected = document.getElementById('colorPicker');
chrome.storage.sync.get(['key'], function(result) {
    document.getElementById('myBody').setAttribute('style', 'background-color: ' + result.key); 
    colorSelected.setAttribute('value', result.key);
});
colorSelected.onchange= function(){
    chrome.storage.sync.set({key: colorSelected.value}, function() {});
    document.getElementById('myBody').setAttribute('style', 'background-color: ' + colorSelected.value);
};