import 'bootstrap/dist/js/bootstrap.bundle.min.js';

var params = new URLSearchParams(window.location.search);
var channelsParam = params.get('channel');
var channels = channelsParam ? channelsParam.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
var host = window.location.hostname;

function stream_object(name) {
    return '<iframe id="embed_' + name + '" src="https://player.twitch.tv/?muted=true&channel=' + name + '&parent=' + host + '" class="stream" allowfullscreen="true" width="100%" height="100%"></iframe>';
}

function chat_object(name) {
    return '<iframe frameborder="0" scrolling="no" id="chat-' + name + '-embed" src="https://twitch.tv/embed/' + name + '/chat?parent=' + host + '&darkpopout" height="100%" width="100%"></iframe>';
}

var videoContainer = document.getElementById('video-container');
var chatTabs = document.getElementById('chat-tabs');
var chatContent = document.getElementById('chat-content');
var setupContainer = document.getElementById('setup-container');
var chatContainer = document.getElementById('chat-container');
var channelInput = document.getElementById('channel-input');

window.optimizeSize = function () {
    var n = channels.length;
    if (n === 0) return;

    var parentEl = videoContainer.parentElement;
    var totalWidth = parentEl.clientWidth;
    var totalHeight = parentEl.clientHeight;

    var bestWidth = 0;
    var bestHeight = 0;
    var bestCols = 1;

    for (var cols = 1; cols <= n; cols++) {
        var rows = Math.ceil(n / cols);
        var availableWidth = totalWidth - 340;
        var maxWidth = (availableWidth / cols) - 10;
        var maxHeight = (totalHeight / rows) - 10;

        var w, h;
        if (maxWidth * 9 / 16 < maxHeight) {
            w = maxWidth;
            h = maxWidth * 9 / 16;
        } else {
            h = maxHeight;
            w = maxHeight * 16 / 9;
        }

        if (w > bestWidth) {
            bestWidth = w;
            bestHeight = h;
            bestCols = cols;
        }
    }

    var finalW = Math.floor(bestWidth);
    var finalH = Math.floor(bestHeight);
    var containerWidth = (finalW + 10) * bestCols;

    videoContainer.style.width = containerWidth + "px";
    videoContainer.style.flex = "0 0 " + containerWidth + "px";

    var players = document.querySelectorAll('.video-player');
    for (var i = 0; i < players.length; i++) {
        players[i].style.width = finalW + "px";
        players[i].style.height = finalH + "px";
    }
};

window.startViewer = function () {
    var value = channelInput.value.trim();
    if (value) {
        var formatted = value.split(/[\s,]+/).filter(Boolean).join(',');
        window.location.search = '?channel=' + formatted;
    }
};

if (channels.length === 0) {
    chatContainer.classList.add('d-none');
    setupContainer.classList.remove('d-none');
} else {
    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        var isActive = (i === 0);

        var playerDiv = document.createElement('div');
        playerDiv.id = 'player-' + channel;
        playerDiv.className = 'video-player m-1 ' + (isActive ? 'active-stream' : '');
        playerDiv.innerHTML = stream_object(channel);
        videoContainer.appendChild(playerDiv);

        var tabItem = document.createElement('li');
        tabItem.className = 'nav-item';
        tabItem.innerHTML = '<button class="nav-link ' + (isActive ? 'active' : '') + '" ' +
            'id="tab-' + channel + '" data-bs-toggle="tab" data-bs-target="#chat-pane-' + channel + '" ' +
            'type="button">' + channel + '</button>';
        chatTabs.appendChild(tabItem);

        var pane = document.createElement('div');
        pane.className = 'tab-pane' + (isActive ? ' show active' : '');
        pane.id = 'chat-pane-' + channel;
        pane.innerHTML = chat_object(channel);
        chatContent.appendChild(pane);
    }

    chatTabs.addEventListener('shown.bs.tab', function (event) {
        var players = document.querySelectorAll('.video-player');
        for (var j = 0; j < players.length; j++) {
            players[j].classList.remove('active-stream');
        }
        var activeChannel = event.target.id.replace('tab-', '');
        var activePlayer = document.getElementById('player-' + activeChannel);
        if (activePlayer) activePlayer.classList.add('active-stream');
    });
}

window.addEventListener('resize', window.optimizeSize);
window.optimizeSize();
setTimeout(window.optimizeSize, 500);