import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

const params = new URLSearchParams(window.location.search);
const channelsParam = params.get('channel');
const channels = channelsParam ? channelsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
const host = window.location.hostname;

function stream_object(name) {
    return `<iframe id="embed_${name}" src="https://player.twitch.tv/?muted=true&channel=${name}&parent=${host}" class="stream" allowfullscreen="true" width="100%" height="100%"></iframe>`;
}

function chat_object(name) {
    return `<iframe frameborder="0" scrolling="no" id="chat-${name}-embed" src="https://twitch.tv/embed/${name}/chat?parent=${host}&darkpopout" height="100%" width="100%"></iframe>`;
}

const videoContainer = document.getElementById('video-container');
const chatTabs = document.getElementById('chat-tabs');
const chatContent = document.getElementById('chat-content');
let setupContainer = document.getElementById('setup-container');
let chatContainer = document.getElementById('chat-container');
let channelInput = document.getElementById('channel-input');
let topNav = document.getElementById('top-nav');
let pageFooter = document.getElementById('page-footer');
let chat_hidden = false;

function hide_chat() {
    chat_hidden = true;
    chatContainer.classList.add('d-none');
    window.optimizeSize();
}

function show_chat() {
    chat_hidden = false;
    chatContainer.classList.remove('d-none');
    window.optimizeSize();
}

window.toggle_chat = function () {
    if (chat_hidden) {
        show_chat();
    } else {
        hide_chat();
    }
};

window.optimizeSize = function () {
    let n = channels.length;
    if (n === 0) return;

    let parentEl = videoContainer.parentElement;
    let totalWidth = parentEl.clientWidth;
    let totalHeight = parentEl.clientHeight;

    let bestWidth = 0;
    let bestHeight = 0;
    let bestCols = 1;

    for (let cols = 1; cols <= n; cols++) {
        let rows = Math.ceil(n / cols);
        let chatWidth = chatContainer.offsetWidth || 340;
        let availableWidth = chat_hidden ? totalWidth : totalWidth - chatWidth;
        let maxWidth = (availableWidth / cols) - 10;
        let maxHeight = (totalHeight / rows) - 10;

        let w, h;
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

    let finalW = Math.floor(bestWidth);
    let finalH = Math.floor(bestHeight);
    let containerWidth = (finalW + 10) * bestCols;

    videoContainer.style.width = containerWidth + "px";
    videoContainer.style.flex = "0 0 " + containerWidth + "px";

    let players = document.querySelectorAll('.video-player');
    for (let i = 0; i < players.length; i++) {
        players[i].style.width = finalW + "px";
        players[i].style.height = finalH + "px";
    }
};

window.startViewer = function () {
    let value = channelInput.value.trim();
    if (value) {
        let formatted = value.split(/[\s,]+/).filter(Boolean).join(',');
        window.location.search = '?channel=' + formatted;
    }
};

if (channels.length === 0) {
    chatContainer.classList.add('d-none');
    setupContainer.classList.remove('d-none');
    pageFooter.classList.remove('d-none');
    topNav.classList.add('d-none');
} else {
    // Load chat only when requested
    const loadChat = (channel) => {
        const pane = document.getElementById(`chat-pane-${channel}`);
        if (pane && !pane.innerHTML) pane.innerHTML = chat_object(channel);
    };

    for (let i = 0; i < channels.length; i++) {
        let channel = channels[i];
        let isActive = (i === 0);

        let playerDiv = document.createElement('div');
        playerDiv.id = 'player-' + channel;
        playerDiv.className = 'video-player m-1 ' + (isActive ? 'active-stream' : '');
        playerDiv.innerHTML = stream_object(channel);
        videoContainer.appendChild(playerDiv);

        let tabItem = document.createElement('li');
        tabItem.className = 'nav-item';
        tabItem.innerHTML = `<button class="nav-link ${isActive ? 'active' : ''}" 
            id="tab-${channel}" data-bs-toggle="tab" data-bs-target="#chat-pane-${channel}" 
            type="button">${channel}</button>`;
        chatTabs.appendChild(tabItem);

        let pane = document.createElement('div');
        pane.className = 'tab-pane' + (isActive ? ' show active' : '');
        pane.id = 'chat-pane-' + channel;
        chatContent.appendChild(pane);

        // Load the first chat immediately if it's active
        if (isActive) loadChat(channel);
    }

    chatTabs.addEventListener('shown.bs.tab', function (event) {
        const activeChannel = event.target.id.replace('tab-', '');
        
        // Lazy load the chat iframe only when the tab is clicked
        loadChat(activeChannel);

        document.querySelectorAll('.video-player').forEach(p => p.classList.remove('active-stream'));
        let activePlayer = document.getElementById('player-' + activeChannel);
        if (activePlayer) activePlayer.classList.add('active-stream');
    });
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(window.optimizeSize, 100);
});

window.optimizeSize();
setTimeout(window.optimizeSize, 500);