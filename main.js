import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const params = new URLSearchParams(window.location.search);
const channelsParam = params.get('channel');
const channels = channelsParam ? channelsParam.split(',').map(s => s.trim()) : [];
const host = window.location.hostname;

const videoContainer = document.getElementById('video-container');
const chatTabs = document.getElementById('chat-tabs');
const chatContent = document.getElementById('chat-content');

function optimizeSize() {
    const n = channels.length;
    if (n === 0) return;

    const width = videoContainer.clientWidth;
    const height = videoContainer.clientHeight;

    let bestWidth = 0;
    let bestHeight = 0;

    // Find the best grid configuration (perRow x numRows)
    for (let perRow = 1; perRow <= n; perRow++) {
        const numRows = Math.ceil(n / perRow);
        let maxWidth = Math.floor(width / perRow) - 10; // Account for margins
        let maxHeight = Math.floor(height / numRows) - 10;

        // Maintain 16:9 ratio
        if (maxWidth * (9 / 16) < maxHeight) {
            maxHeight = maxWidth * (9 / 16);
        } else {
            maxWidth = maxHeight * (16 / 9);
        }

        if (maxWidth > bestWidth) {
            bestWidth = maxWidth;
            bestHeight = maxHeight;
        }
    }

    document.querySelectorAll('.video-player').forEach(el => {
        el.style.width = `${Math.floor(bestWidth)}px`;
        el.style.height = `${Math.floor(bestHeight)}px`;
    });
}

channels.forEach((channel, index) => {
    const isActive = index === 0;

    const playerDiv = document.createElement('div');
    playerDiv.className = 'video-player';
    playerDiv.innerHTML = `<iframe 
        src="https://player.twitch.tv/?channel=${channel}&parent=${host}&muted=true" 
        height="720" width="1280" allowfullscreen></iframe>`;
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

// Handle layout resizing
window.addEventListener('resize', optimizeSize);
// Execute once layout has settled
setTimeout(optimizeSize, 200);