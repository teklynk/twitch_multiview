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
let chat_hidden = localStorage.getItem('chat_hidden') === 'true';

// Load chat only when requested and visible
const loadChat = (channel) => {
    if (chat_hidden) return;
    const pane = document.getElementById(`chat-pane-${channel}`);
    if (pane && !pane.innerHTML) pane.innerHTML = chat_object(channel);
};

function hide_chat() {
    chat_hidden = true;
    localStorage.setItem('chat_hidden', 'true');
    chatContainer.classList.add('d-none');
    // Remove all chat iframes to save resources when hidden
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.innerHTML = '';
    });
    window.optimizeSize();
}

function show_chat() {
    chat_hidden = false;
    localStorage.setItem('chat_hidden', 'false');
    chatContainer.classList.remove('d-none');
    // Reload the chat for the currently active tab
    const activeTab = chatTabs.querySelector('.nav-link.active');
    if (activeTab) {
        loadChat(activeTab.id.replace('tab-', ''));
    }
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
    const n = channels.length;
    if (n === 0) return;

    // Reset dimensions to allow the parent container to settle into its actual available space.
    // This prevents previous fixed widths from influencing the new calculation.
    videoContainer.style.width = '';
    videoContainer.style.flex = '1 1 auto';

    const parentEl = videoContainer.parentElement;
    if (!parentEl) return;

    const totalWidth = parentEl.clientWidth;
    const totalHeight = parentEl.clientHeight;

    // Measure the actual space occupied by the chat or use the default fallback
    const chatWidth = chat_hidden ? 0 : (chatContainer.offsetWidth || 340);
    const availableWidth = totalWidth - chatWidth;

    let bestWidth = 0;
    let bestHeight = 0;
    let bestCols = 1;

    for (let cols = 1; cols <= n; cols++) {
        const rows = Math.ceil(n / cols);
        const maxWidth = (availableWidth / cols) - 10;
        const maxHeight = (totalHeight / rows) - 10;

        let w, h;
        if (maxWidth * 9 / 16 <= maxHeight) {
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

    const finalW = Math.floor(bestWidth);
    const finalH = Math.floor(bestHeight);
    const containerWidth = (finalW + 10) * bestCols;

    videoContainer.style.width = containerWidth + "px";
    videoContainer.style.flex = "0 0 " + containerWidth + "px";

    document.querySelectorAll('.video-player').forEach(player => {
        player.style.width = finalW + "px";
        player.style.height = finalH + "px";
    });
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
    // Apply initial visibility preference
    if (chat_hidden) {
        chatContainer.classList.add('d-none');
    }

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

// Manage Channels Modal Logic
let modalChannels = [];

document.getElementById('manageModal')?.addEventListener('show.bs.modal', () => {
    modalChannels = [...channels];
    renderManageList();
});

function renderManageList() {
    const list = document.getElementById('manage-channel-list');
    if (!list) return;
    list.innerHTML = '';
    modalChannels.forEach((channel, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item bg-dark text-light d-flex justify-content-between align-items-center draggable-item';
        li.draggable = true;
        li.dataset.index = index;
        li.innerHTML = `
            <span><i class="fa-solid fa-grip-vertical me-2 text-secondary" style="cursor: move;"></i> ${channel}</span>
            <button class="btn btn-sm remove-channel-btn" data-index="${index}">
                <i class="fa-solid fa-trash text-danger"></i>
            </button>
        `;
        
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            li.classList.add('dragging');
        });
        li.addEventListener('dragover', (e) => e.preventDefault());
        li.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = e.dataTransfer.getData('text/plain');
            const toIndex = index;
            const movedItem = modalChannels.splice(fromIndex, 1)[0];
            modalChannels.splice(toIndex, 0, movedItem);
            renderManageList();
        });
        li.addEventListener('dragend', () => li.classList.remove('dragging'));
        list.appendChild(li);
    });
}

document.addEventListener('click', (e) => {
    if (e.target.closest('.remove-channel-btn')) {
        const index = e.target.closest('.remove-channel-btn').dataset.index;
        modalChannels.splice(index, 1);
        renderManageList();
    }
    if (e.target.id === 'add-channel-btn') {
        addChannelFromModal();
    }
});

document.getElementById('add-channel-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addChannelFromModal();
    }
});

function addChannelFromModal() {
    const input = document.getElementById('add-channel-input');
    const val = input.value.trim();
    if (val) {
        const newChannels = val.split(/[\s,]+/).filter(Boolean);
        modalChannels.push(...newChannels);
        input.value = '';
        renderManageList();
    }
}

document.getElementById('save-channels-btn')?.addEventListener('click', () => {
    const formatted = modalChannels.join(',');
    window.location.search = formatted ? '?channel=' + formatted : '';
});