
// Global configuration
let currentServer = 'ruby';
let isBlakite = true; // Set to true to make BlakiteAPI primary, false for Ruby primary

// Server URLs
const serverUrls = {
  ruby: "https://rubyvidhub.com/",
  blakite: "https://blakiteapi.xyz/"
};

// Global variables for different modes
let isNewDivMode = false; // New BlakiteAPI div format
let tmdbId = '';
let season = '';
let totalEpisodes = 0;
let currentEpisode = 1;
let isMovie = false;

// Initialize the player when DOM is fully loaded
function initializePlayer() {
  // Check for new div format first
  const newContainer = document.getElementById("blakiteapi");
  const oldContainer = document.getElementById("videoPlayerContainer2");

  let container;

  if (newContainer) {
    // New BlakiteAPI format
    isNewDivMode = true;
    container = newContainer;

    // Extract data from new format
    tmdbId = newContainer.getAttribute('data-tmdb');
    season = newContainer.getAttribute('data-season');
    let apiEpisodes = parseInt(newContainer.getAttribute('data-episodes')) || 0;

    if (!tmdbId) {
      console.error("Missing data-tmdb attribute");
      return;
    }

    // Detect if it's a movie or TV series
    isMovie = !season || !apiEpisodes;

    // Calculate total episodes - use maximum between API episodes and episodeData episodes
    if (!isMovie) {
      let episodeDataCount = 0;
      if (typeof episodeData !== 'undefined') {
        // Count valid episodes in episodeData
        episodeDataCount = Object.keys(episodeData).filter(ep => {
          const episodeNum = parseInt(ep);
          return !isNaN(episodeNum) && episodeNum > 0;
        }).length;
      }

      // Use the maximum count between API and episodeData
      totalEpisodes = Math.max(apiEpisodes, episodeDataCount);
      console.log(`API Episodes: ${apiEpisodes}, EpisodeData Episodes: ${episodeDataCount}, Total: ${totalEpisodes}`);
    }

    if (!isMovie) {
      // Get episode from URL for TV series
      const urlParams = new URLSearchParams(window.location.search);
      const episodeParam = urlParams.get('episode');
      if (episodeParam && episodeParam >= 1 && episodeParam <= totalEpisodes) {
        currentEpisode = parseInt(episodeParam);
      }
    }

  } else if (oldContainer) {
    // Old format with episodeData
    isNewDivMode = false;
    container = oldContainer;
  } else {
    console.error("No valid container found");
    return;
  }

  // Set primary server based on isBlakite setting
  if (isNewDivMode && isBlakite) {
    currentServer = 'blakite';
  } else {
    currentServer = 'ruby';
  }

  renderPlayer(container);

  // Setup event listeners
  const commentButton = document.getElementById('commentButton2');
  if (commentButton) {
    commentButton.addEventListener('click', function() {
      location.href = '#comment';
    });
  }

  // Load initial content
  if (isNewDivMode) {
    loadNewFormatVideo();
  } else {
    loadOldFormatVideo();
  }
}

// Render player UI
function renderPlayer(container) {
  container.innerHTML = `
    <div class="player-wrapper2">
      <div class="player-container2" id="playerContainer2">
        <iframe 
  id="videoIframe2" 
  allowfullscreen
  frameborder="0"
  marginwidth="0"
  marginheight="0"
  scrolling="no"
  sandbox="allow-scripts allow-same-origin allow-fullscreen"
  style="position:absolute;top:0;left:0;width:100%;height:100%;">
</iframe>
      </div>

      <div class="controls-area">
        <div class="current-episode2">
          <p>Currently Playing: <span id="currentEp2">${isNewDivMode ? (isMovie ? 'Movie' : `Episode ${currentEpisode}`) : 'Episode 1'}</span></p>
        </div>

        <div class="server-toggle" id="serverToggleContainer">
          <div class="server-buttons" id="serverButtons">
            <!-- Server buttons will be dynamically added here -->
          </div>
        </div>

        <div class="action-buttons2">
          <button class="action-button2" id="commentButton2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Comment
          </button>
          <button class="action-button2" id="downloadButton" onclick="openDownloadPopup2()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
        </div>
      </div>

      ${(isNewDivMode && isMovie) ? '' : `
        <div class="episode-buttons-container2">
          <div class="episodes-title2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <line x1="8" x2="16" y1="12" y2="12"></line>
              <line x1="12" x2="12" y1="8" y2="16"></line>
            </svg>
            Episodes
          </div>
          <div class="episode-buttons2" id="episodeButtons2"></div>
        </div>
      `}
    </div>
  `;

  setupServerButtons();
  if (!isNewDivMode || !isMovie) {
    setupEpisodeButtons();
  }
}

// Setup server buttons with toggle style
function setupServerButtons() {
  const serverButtons = document.getElementById('serverButtons');
  if (!serverButtons) return;

  serverButtons.innerHTML = '';

  // Determine available servers based on current episode
  let availableServers = [];

  if (isNewDivMode) {
    const apiEpisodes = parseInt(document.getElementById("blakiteapi").getAttribute('data-episodes')) || 0;
    const currentEp = isMovie ? '1' : currentEpisode.toString();

    // Check if current episode is available on BlakiteAPI
    const hasBlakiteEpisode = isMovie || currentEpisode <= apiEpisodes;

    // Check if current episode is available on Ruby (has EID)
    const hasRubyEpisode = typeof episodeData !== 'undefined' && 
                          episodeData[currentEp] && 
                          episodeData[currentEp].EID;

    // Add servers based on availability for current episode
    if (hasBlakiteEpisode) {
      availableServers.push('blakite');
    }
    if (hasRubyEpisode) {
      availableServers.push('ruby');
    }

    // If current episode is beyond API limit, only show Ruby
    if (currentEpisode > apiEpisodes && hasRubyEpisode) {
      availableServers = ['ruby'];
    }

  } else {
    // Old format - check episodeData
    if (typeof episodeData !== 'undefined') {
      const episode = getEpisodeFromURL2() || Object.keys(episodeData)[0];
      const episodeInfo = episodeData[episode];
      if (episodeInfo) {
        if (episodeInfo.EID) availableServers.push('ruby');
      }
    }
  }

  // If no servers detected, default to primary
  if (availableServers.length === 0) {
    availableServers.push(isBlakite ? 'blakite' : 'ruby');
  }

  // Auto-select Ruby if current episode is not available on Blakite
  if (isNewDivMode && !isMovie) {
    const apiEpisodes = parseInt(document.getElementById("blakiteapi").getAttribute('data-episodes')) || 0;
    if (currentEpisode > apiEpisodes && availableServers.includes('ruby')) {
      currentServer = 'ruby';
    }
  }

  // Create server buttons
  availableServers.forEach(server => {
    const button = document.createElement('button');
    button.id = server + 'Server';
    button.className = 'server-button';
    if (server === currentServer) button.classList.add('active');
    button.onclick = function() { changeServer(server); };

    // Set button content
    let iconSVG, serverName;

    if (server === 'ruby') {
      iconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
      serverName = 'Ruby (Ads Free)';
    } else {
      iconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon></svg>';
      serverName = 'Hello Anime Server';
    }

    button.innerHTML = `${iconSVG} ${serverName}`;
    serverButtons.appendChild(button);
  });

  // Show/hide server toggle based on available servers
  const serverToggle = document.getElementById('serverToggleContainer');
  if (serverToggle) {
    serverToggle.style.display = availableServers.length > 1 ? 'flex' : 'none';
  }

  // Ensure current server is available
  if (!availableServers.includes(currentServer)) {
    currentServer = availableServers[0];
  }
}

// Change server
function changeServer(server) {
  currentServer = server;

  // Update active button
  document.querySelectorAll('.server-button').forEach(btn => {
    btn.classList.remove('active');
  });

  const activeButton = document.getElementById(server + 'Server');
  if (activeButton) activeButton.classList.add('active');

  // Reload content with new server
  if (isNewDivMode) {
    loadNewFormatVideo();
  } else {
    loadOldFormatVideo();
  }
}

// Load video for new format (BlakiteAPI)
function loadNewFormatVideo() {
  const videoIframe = document.getElementById('videoIframe2');
  if (!videoIframe) return;

  let videoUrl = '';

  if (currentServer === 'blakite') {
    // BlakiteAPI URL formation
    if (isMovie) {
      videoUrl = `${serverUrls.blakite}embed/${tmdbId}`;
    } else {
      videoUrl = `${serverUrls.blakite}embed/${tmdbId}/${season}-${currentEpisode}`;
    }
  } else if (currentServer === 'ruby') {
    // Ruby server (requires EID from episodeData)
    if (typeof episodeData !== 'undefined') {
      const currentEp = isMovie ? '1' : currentEpisode.toString();
      const episodeInfo = episodeData[currentEp];
      if (episodeInfo && episodeInfo.EID) {
        videoUrl = `${serverUrls.ruby}embed-${episodeInfo.EID}.html?streamrurucy=true`;
      }
    }
  }

  if (videoUrl) {
    videoIframe.src = videoUrl;
    console.log("Loading video URL:", videoUrl);
  } else {
    console.error("No valid video URL generated");
  }
}

// Load video for old format (episodeData)
function loadOldFormatVideo() {
  const episode = getEpisodeFromURL2();
  if (!episodeData || !episodeData[episode]) {
    console.error("Episode data not found for episode:", episode);
    return;
  }

  const videoIframe = document.getElementById('videoIframe2');
  if (!videoIframe) return;

  const episodeInfo = episodeData[episode];
  let videoUrl = '';

  if (currentServer === 'ruby' && episodeInfo.EID) {
    videoUrl = `${serverUrls.ruby}embed-${episodeInfo.EID}.html?streamrurucy=true`;
  }

  if (videoUrl) {
    videoIframe.src = videoUrl;
    console.log("Loading video URL:", videoUrl);

    // Update UI
    const currentEpElement = document.getElementById('currentEp2');
    if (currentEpElement) {
      currentEpElement.textContent = isNaN(parseInt(episode)) ? episode : "Episode " + episode;
    }

    highlightSelectedEpisode2(episode);
  } else {
    console.error("No valid video source found for episode:", episode);
  }
}

// Get current episode from URL (old format)
function getEpisodeFromURL2() {
  if (isNewDivMode) return currentEpisode.toString();

  let params = new URLSearchParams(window.location.search);
  let episode = params.get('episode');

  if (episode && typeof episodeData !== 'undefined' && episodeData[episode]) {
    return episode;
  }

  // Default to first episode
  return typeof episodeData !== 'undefined' ? Object.keys(episodeData)[0] : '1';
}

// Change episode
function changeEpisode2(ep) {
  if (isNewDivMode) {
    // New format
    if (isMovie) return;

    currentEpisode = parseInt(ep);

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('episode', ep);
    window.history.replaceState({}, '', url);

    // Update UI
    const currentEpElement = document.getElementById('currentEp2');
    if (currentEpElement) {
      currentEpElement.textContent = `Episode ${currentEpisode}`;
    }

    // Update server buttons based on new episode
    setupServerButtons();

    highlightSelectedEpisode2(ep.toString());
    loadNewFormatVideo();
  } else {
    // Old format
    window.location.href = `${window.location.pathname}?episode=${ep}`;
  }
}

// Setup episode buttons
function setupEpisodeButtons() {
  const episodeButtons = document.getElementById('episodeButtons2');
  if (!episodeButtons) return;

  episodeButtons.innerHTML = '';

  if (isNewDivMode && !isMovie) {
    // New format - show all episodes based on maximum available
    for (let i = 1; i <= totalEpisodes; i++) {
      const btn = document.createElement('button');
      btn.className = "episode-button2";
      btn.innerText = i.toString();
      btn.dataset.episode = i.toString();
      btn.onclick = function() { changeEpisode2(i); };
      episodeButtons.appendChild(btn);
    }
    highlightSelectedEpisode2(currentEpisode.toString());
  } else if (!isNewDivMode && typeof episodeData !== 'undefined') {
    // Old format - use episodeData
    Object.keys(episodeData).forEach(ep => {
      const btn = document.createElement('button');
      btn.className = "episode-button2";
      btn.innerText = isNaN(parseInt(ep)) ? ep : ep;
      btn.dataset.episode = ep;
      btn.onclick = function() { changeEpisode2(ep); };
      episodeButtons.appendChild(btn);
    });

    const currentEp = getEpisodeFromURL2();
    highlightSelectedEpisode2(currentEp);
  }
}

// Highlight selected episode
function highlightSelectedEpisode2(ep) {
  document.querySelectorAll('.episode-button2').forEach(btn => {
    btn.classList.remove('active2');
    if (btn.dataset.episode === ep.toString()) {
      btn.classList.add('active2');
    }
  });
}

// Open download popup
function openDownloadPopup2() {
  let downloadUrl = '';

  if (isNewDivMode) {
    // New format download - check current server
    if (currentServer === 'blakite') {
      // BlakiteAPI download
      if (isMovie) {
        downloadUrl = `${serverUrls.blakite}stream/${tmdbId}`;
      } else {
        downloadUrl = `${serverUrls.blakite}stream/${tmdbId}/${season}-${currentEpisode}`;
      }
      window.open(downloadUrl, '_blank');
    } else if (currentServer === 'ruby') {
      // Ruby download (requires EID)
      if (typeof episodeData !== 'undefined') {
        const currentEp = isMovie ? '1' : currentEpisode.toString();
        const episodeInfo = episodeData[currentEp];
        if (episodeInfo && episodeInfo.EID) {
          const animeName = extractAnimeNameFromURL2(window.location.href);
          const slug = generateSlug2(animeName, 1, currentEp);
          downloadUrl = `https://blakitehindifandubbed.blogspot.com?slug=${encodeURIComponent(slug)}&eid=${episodeInfo.EID}`;
          window.location.href = downloadUrl;
        } else {
          alert('Download not available for this episode');
        }
      } else {
        alert('Download not available for this episode');
      }
    }
  } else {
    // Old format download
    const ep = getEpisodeFromURL2();
    const eid = episodeData[ep]?.EID;
    if (!eid) {
      alert('Download not available for this episode');
      return;
    }

    const animeName = extractAnimeNameFromURL2(window.location.href);
    const slug = generateSlug2(animeName, 1, ep);
    downloadUrl = `https://blakitehindifandubbed.blogspot.com?slug=${encodeURIComponent(slug)}&eid=${eid}`;
    window.location.href = downloadUrl;
  }
}

// Extract anime name from URL
function extractAnimeNameFromURL2(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    if (pathParts.length >= 4) {
      return pathParts[3].replace('.html', '').replace(/-/g, ' ');
    }
  } catch(e) {
    console.error('Error extracting anime name:', e);
  }
  return 'Anime';
}

// Generate slug
function generateSlug2(animeName, season, episode) {
  const animeSlug = animeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const seasonFormatted = 's' + String(season).padStart(2, '0');

  let episodeFormatted;
  if (isNaN(episode)) {
    episodeFormatted = episode.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  } else {
    episodeFormatted = 'e' + String(episode).padStart(2, '0');
  }

  return `${animeSlug}-${seasonFormatted}-${episodeFormatted}`;
}

// Check container existence
function checkAndInitialize() {
  const newContainer = document.getElementById("blakiteapi");
  const oldContainer = document.getElementById("videoPlayerContainer2");

  if (!newContainer && !oldContainer) {
    console.error("No valid container found. Make sure there's an element with id 'blakiteapi' or 'videoPlayerContainer2'");
    return false;
  }
  return true;
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM fully loaded");
  if (checkAndInitialize()) {
    initializePlayer();
  }
});

// Also try immediate initialization
if (document.readyState === "complete" || document.readyState === "interactive") {
  console.log("Document already loaded, initializing player");
  setTimeout(function() {
    if (checkAndInitialize()) {
      initializePlayer();
    }
  }, 100);
}
