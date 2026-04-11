import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const params = new URLSearchParams(window.location.search);
const channelsParam = params.get('channel');
const channels = channelsParam ? channelsParam.split(',').map(s => s.trim()) : [];
const host = window.location.hostname;

const videoContainer = document.getElementById('video-container');
const chatTabs = document.getElementById('chat-tabs');
const chatContent = document.getElementById('chat-content');

// Helper to handle staggering and layout pauses
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

if (channels.length === 0) {
    videoContainer.innerHTML = '<div class="p-4">No channels specified. Add <code>?channel=name1,name2</code> to the URL.</div>';
}

async function initMultiView() {
    // 1. Build the UI shell immediately
    channels.forEach((channel, index) => {
        const isActive = index === 0;

        // Video Container
        const playerDiv = document.createElement('div');
        playerDiv.id = `container-${channel}`;
        playerDiv.className = 'video-player m-2';
        videoContainer.appendChild(playerDiv);

        // Chat Tab
        const tabItem = document.createElement('li');
        tabItem.className = 'nav-item';
        tabItem.innerHTML = `
            <button class="nav-link ${isActive ? 'active' : ''}" 
                    id="tab-${channel}" 
                    data-bs-toggle="tab" 
                    data-bs-target="#chat-pane-${channel}" 
                    type="button"
                    onclick="window.loadChat('${channel}')">${channel}</button>
        `;
        chatTabs.appendChild(tabItem);

        // Chat Pane (Empty)
        const pane = document.createElement('div');
        pane.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
        pane.id = `chat-pane-${channel}`;
        chatContent.appendChild(pane);
    });

    // 2. Define global helper to lazy-load chat
    window.loadChat = (channel) => {
        const pane = document.getElementById(`chat-pane-${channel}`);
        if (pane && !pane.querySelector('iframe')) {
            pane.innerHTML = `<iframe src="https://www.twitch.tv/embed/${channel}/chat?parent=${host}&darkpopout" 
                                      height="100%" width="100%"></iframe>`;
        }
    };

    // Load the first chat immediately
    if (channels.length > 0) loadChat(channels[0]);

    // 3. Inject Video Iframes with absolute size calculation
    for (const channel of channels) {
        const container = document.getElementById(`container-${channel}`);
        if (!container) continue;

        // Calculate actual pixel dimensions to satisfy "Style Visibility" check
        const rect = container.getBoundingClientRect();
        const width = Math.floor(rect.width) || 400;
        const height = Math.floor(rect.height) || 225;

        const iframe = document.createElement('iframe');
        iframe.setAttribute('width', width);
        iframe.setAttribute('height', height);
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        // 1. Append to DOM empty first so it gains a physical size in the layout
        container.appendChild(iframe);

        // 2. Wait for a browser paint cycle
        await wait(500);
        
        // 3. Set the source. Parameter order: muted -> autoplay -> channel -> parent
        iframe.src = `https://player.twitch.tv/?muted=true&autoplay=true&channel=${channel}&parent=${host}`;

        // 4. Stagger loads (3s) to prevent GQL/Passport rate-limiting (429 errors)
        await wait(3000);
    }
}

initMultiView();