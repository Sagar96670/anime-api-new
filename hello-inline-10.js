
//<![CDATA[
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    // Unique ID
    const urlId = urlParams.get('id');
    const targetType = urlParams.get('type'); 
    const seasonNum = urlParams.get('s');
    if (!urlId) return;

    async function fetchData() {
        const rawData = await BlakiteAPI.getData();
        if (rawData) findAndRender(rawData);
    }

    // *** FIX: Find by Unique ID Logic ***
    function findAndRender(data) {
        let item = null;
        // Using Key Based Lookup (Assuming urlId is the key)
        if (targetType === 'Movie' && data.movies && data.movies[urlId]) item = data.movies[urlId];
        else if (targetType === 'Series' && data.series && data.series[urlId]) item = data.series[urlId];
        else if (targetType === 'Drama' && data.dramas && data.dramas[urlId]) item = data.dramas[urlId];
        // Fallback: If not found by key, search by value (tmdbId)
        if (!item) {
             let dataset = (targetType === 'Movie' ? data.movies : (targetType === 'Series' ? data.series : data.dramas));
             if (dataset) item = Object.values(dataset).find(i => i.tmdbId == urlId);
        }
        if (item) renderInfoCard(item, targetType);
    }

    function renderInfoCard(item, type) {
        document.getElementById('api-info-card').style.display = 'block';
        // 1. Images
        const poster = (item.IMAGES && (item.IMAGES.poster || item.IMAGES.thumbnail)) || BLAKITE_CFG.defaultImg;
        const backdrop = (item.IMAGES && item.IMAGES.backdrop) || poster;
        document.getElementById('api-poster').src = poster;
        document.getElementById('api-poster').onerror = function() { this.src = BLAKITE_CFG.defaultImg; };
        document.getElementById('api-card-bg').style.backgroundImage = `url('${backdrop}')`;
        // 2. Title
        let displayTitle = item.title;
        if (type === 'Series' && seasonNum && !displayTitle.toLowerCase().includes('season')) {
             displayTitle += ` Season ${seasonNum}`;
        }
        document.getElementById('api-title').innerText = displayTitle;
        // 3. Rating
        let rawRating = (item.TMDB_DATA && (item.TMDB_DATA.rating || item.TMDB_DATA.vote_average)) || "0.0";
        let finalRating = parseFloat(rawRating).toFixed(1);
        if (isNaN(finalRating)) finalRating = "N/A";
        document.getElementById('api-rating').innerText = finalRating;
        // 4. Status Logic (Hide for Movie)
        const statusEl = document.getElementById('api-status');
        if (type === 'Movie') {
            statusEl.style.display = 'none'; // HIDE FOR MOVIE
        } else {
            statusEl.style.display = 'inline-block';
            let st = item.status || "Completed";
            statusEl.innerText = `Status: ${st}`;
        }
        // 5. Meta
        const lang = item.language || "SUB/DUB";
        const date = item.TMDB_DATA && item.TMDB_DATA.releaseDate ? item.TMDB_DATA.releaseDate.split('-')[0] : "202X";
        document.getElementById('api-lang').innerText = lang;
        document.getElementById('api-type').innerText = type;
        document.getElementById('api-date').innerText = date;
        // 6. Synopsis
        let desc = "No description available.";
        if (item.TMDB_DATA && item.TMDB_DATA.synopsis && item.TMDB_DATA.synopsis.length > 5) desc = item.TMDB_DATA.synopsis;
        else if (item.TMDB_DATA && item.TMDB_DATA.overview && item.TMDB_DATA.overview.length > 5) desc = item.TMDB_DATA.overview;
        else if (item.synopsis && item.synopsis.length > 5) desc = item.synopsis;
        const synEl = document.getElementById('api-synopsis');
        const btnEl = document.getElementById('read-more-btn');
        synEl.innerText = desc;
        if (desc.length > 250) {
            btnEl.style.display = 'inline-block';
            btnEl.onclick = function() {
                if (synEl.classList.contains('collapsed')) {
                    synEl.classList.remove('collapsed');
                    btnEl.innerText = 'Show Less';
                } else {
                    synEl.classList.add('collapsed');
                    btnEl.innerText = 'Read More';
                }
            };
        }
        // 7. Keywords
        const kwContainer = document.getElementById('api-keywords');
        let keywords = [];
        if (item.TMDB_DATA && item.TMDB_DATA.genres) keywords = item.TMDB_DATA.genres;
        else if (item.TMDB_DATA && item.TMDB_DATA.keywords) keywords = item.TMDB_DATA.keywords;
        if (keywords.length > 0) {
            let kwHtml = '';
            keywords.slice(0, 5).forEach(k => {
                let txt = k.split('&')[0]; 
                kwHtml += `<span class="keyword-pill">${txt}</span>`;
            });
            kwContainer.innerHTML = kwHtml;
        }
    }

    fetchData();
})();
//]]>
