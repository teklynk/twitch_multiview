import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const params = new URLSearchParams(window.location.search);
const channelsParam = params.get('channel');
const channels = channelsParam ? channelsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
const host = window.location.hostname;

const videoContainer = document.getElementById('video-container');
const chatTabs = document.getElementById('chat-tabs');
const chatContent = document.getElementById('chat-content');
const setupContainer = document.getElementById('setup-container');
const chatContainer = document.getElementById('chat-container');
const channelInput = document.getElementById('channel-input');
const goButton = document.getElementById('go-button');

function optimizeSize() {
    const n = channels.length;
    if (n === 0) return;

    const parent = videoContainer.parentElement;
    const totalWidth = parent.clientWidth;
    const totalHeight = parent.clientHeight;

    let bestWidth = 0;
    let bestHeight = 0;
    let bestCols = 1;

    // Find the largest 16:9 rectangle size that fits N items in the available space
    for (let cols = 1; cols <= n; cols++) {
        const rows = Math.ceil(n / cols);
        // Reserve at least 340px for chat (standard Twitch sidebar width)
        const availableWidth = totalWidth - 340;
        const maxWidth = (availableWidth / cols) - 10; 
        const maxHeight = (totalHeight / rows) - 10;

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

    const finalW = Math.floor(bestWidth);
    const finalH = Math.floor(bestHeight);

    // Set video container width to perfectly fit the grid
    const containerWidth = (finalW + 10) * bestCols;
    videoContainer.style.flex = `0 0 ${containerWidth}px`;
    videoContainer.style.width = `${containerWidth}px`;

    document.querySelectorAll('.video-player').forEach(p => {
        p.style.width = `${finalW}px`;
        p.style.height = `${finalH}px`;
    });
}

if (channels.length === 0) {
    chatContainer.classList.add('d-none');
    setupContainer.classList.remove('d-none');

    const startViewer = () => {
        const value = channelInput.value.trim();
        if (value) {
            // Split by space, comma, or both, filter out empty results, and join with commas
            const formatted = value.split(/[\s,]+/).filter(Boolean).join(',');
            window.location.search = `?channel=${formatted}`;
        }
    };

    goButton.addEventListener('click', startViewer);
    channelInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') startViewer();
    });
} else {
    channels.forEach((channel, index) => {
        const isActive = index === 0;

        const playerDiv = document.createElement('div');
        playerDiv.id = `player-${channel}`;
        playerDiv.className = `video-player m-1 ${isActive ? 'active-stream' : ''}`;
        playerDiv.innerHTML = `<iframe 
            src="https://player.twitch.tv/?muted=true&autoplay=true&channel=${channel}&parent=${host}" 
            height="100%" width="100%" allow="autoplay; fullscreen" allowfullscreen="true"></iframe>`;
        videoContainer.appendChild(playerDiv);

        const tabItem = document.createElement('li');
        tabItem.className = 'nav-item';
        tabItem.innerHTML = `
            <button class="nav-link ${isActive ? 'active' : ''}" 
                    id="tab-${channel}" data-bs-toggle="tab" data-bs-target="#chat-pane-${channel}" 
                    type="button">${channel}</button>`;
        chatTabs.appendChild(tabItem);

        const pane = document.createElement('div');
        pane.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
        pane.id = `chat-pane-${channel}`;
        pane.innerHTML = `<iframe src="https://www.twitch.tv/embed/${channel}/chat?parent=${host}&darkpopout" height="100%" width="100%"></iframe>`;
        chatContent.appendChild(pane);
    });

    chatTabs.addEventListener('shown.bs.tab', (event) => {
        document.querySelectorAll('.video-player').forEach(p => p.classList.remove('active-stream'));
        const channel = event.target.id.replace('tab-', '');
        const activePlayer = document.getElementById(`player-${channel}`);
        if (activePlayer) activePlayer.classList.add('active-stream');
    });
}

window.addEventListener('resize', optimizeSize);
// Execute optimization after the browser has rendered the initial layout
setTimeout(optimizeSize, 100);