
//<![CDATA[
(function() {
    // API config aur SERVER_URL ab BLAKITE_CFG se aayega
    let p_id='', p_season='', p_totalEps=0, p_currentEp=1, p_isMovie=false, p_seasonList=[];
    let p_title='', p_img='';

    async function initPlayerSystem() {
        const params = new URLSearchParams(window.location.search);
        const urlId   = params.get('id');
        const type    = params.get('type');
        const season  = params.get('s');
        const epParam = params.get('episode');
        if(epParam) p_currentEp = parseInt(epParam);

        // ENG MODE: Anikoto API + MegaPlay embeds
        if(isEng() || params.get('src') === 'anikoto') {
            await initEngPlayer(params);
            if(window.hideSitePreloader) setTimeout(window.hideSitePreloader, 50);
            return;
        }

        if(!urlId || !type) {
            const container = document.getElementById('dynamic-stream-area');
            if(container) container.innerHTML = "<h3 style='color:#fff; text-align:center; padding:20px;'>Please select content from Home.</h3>";
            return;
        }

        // Seedha Global API se data fetch
        const rawData = await BlakiteAPI.getData();

        if(rawData) {
            processAndInject(rawData, urlId, type, season);
        } else {
            const container = document.getElementById('dynamic-stream-area');
            if(container) container.innerHTML = "<h3 style='color:#fff; text-align:center; padding:20px;'>Failed to load stream data.</h3>";
        }
        if(window.hideSitePreloader) setTimeout(window.hideSitePreloader, 50);
    }

    function processAndInject(data, id, type, season) {
        let animeItem  = null;
        let displayTitle = "Unknown";
        let displayDesc  = "";
        // Global Default image fallback
        let displayImg   = BLAKITE_CFG.defaultImg || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg/s1600/default.jpg";

        if(data) {
            if(type === 'Movie'  && data.movies && data.movies[id])  animeItem = data.movies[id];
            else if(type === 'Series' && data.series && data.series[id]) animeItem = data.series[id];
            else if(type === 'Drama'  && data.dramas && data.dramas[id]) animeItem = data.dramas[id];
        }

        p_id       = id;
        p_season   = season || "1";
        p_isMovie  = (type === 'Movie');
        p_seasonList = [];
        p_totalEps   = 0;

        if(animeItem) {
            // SEO update
            if(typeof updateGlobalSEO === 'function') {
                updateGlobalSEO(animeItem, type, p_season, p_currentEp);
            }

            displayTitle = animeItem.title || "Unknown";

            // IMAGES null safe with default fallback
            if(animeItem.IMAGES) {
                displayImg = animeItem.IMAGES.poster || animeItem.IMAGES.backdrop || displayImg;
            }

            // Description
            if(animeItem.TMDB_DATA && animeItem.TMDB_DATA.synopsis && animeItem.TMDB_DATA.synopsis.length > 5) {
                displayDesc = animeItem.TMDB_DATA.synopsis;
            } else if(animeItem.TMDB_DATA && animeItem.TMDB_DATA.overview && animeItem.TMDB_DATA.overview.length > 5) {
                displayDesc = animeItem.TMDB_DATA.overview;
            }

            if(!p_isMovie && animeItem.seasons) {
                p_seasonList = Object.keys(animeItem.seasons).sort((a, b) => Number(a) - Number(b));

                // Agar URL mein di gayi season exist nahi karti to pehli season lo
                if(!animeItem.seasons[p_season] && p_seasonList.length > 0) {
                    p_season = p_seasonList[0];
                }

                // FIX: episodes object nahi hai ab, totalEpisodes use karo
                if(animeItem.seasons[p_season]) {
                    p_totalEps = animeItem.seasons[p_season].totalEpisodes || 0;
                }
            } else if(p_isMovie) {
                p_totalEps = 1;
            }

            if(!p_isMovie && !displayTitle.toLowerCase().includes('season') && p_season) {
                displayTitle += ` Season ${p_season}`;
            }
        }

        p_title = displayTitle;
        p_img   = displayImg;
        document.title = "Watch: " + displayTitle;

        const container = document.getElementById('dynamic-stream-area');
        if(!container) return;
        container.removeAttribute('style');
        renderPlayerUI(container);
        loadStream();

        const breadcrumbTitle = document.querySelector('.breadcrumb strong');
        if(breadcrumbTitle) breadcrumbTitle.innerText = displayTitle;

        const infoTitle = document.querySelector('#info .info .title');
        if(infoTitle) infoTitle.innerText = displayTitle;
    }

    function renderPlayerUI(container) {
        let seasonsHTML = '';
        if(!p_isMovie && p_seasonList.length > 1) {
            let btns = '';
            p_seasonList.forEach(s => {
                const url = new URL(window.location.href);
                url.searchParams.set("s", s);
                url.searchParams.set("episode", 1);
                const activeClass = (s == p_season) ? "active-season" : "";
                btns += `<a href="${url.toString()}" class="season-btn ${activeClass}">Season ${s}</a>`;
            });
            seasonsHTML = `<div class="season-scroller-box"><span class="season-label">Select Season</span><div class="seasons-list">${btns}</div></div>`;
        }

        let epHTML = '';
        if(!p_isMovie && p_totalEps > 0) {
            for(let i = 1; i <= p_totalEps; i++) {
                const url = new URL(window.location.href);
                url.searchParams.set("episode", i);
                const active = (i === p_currentEp) ? "active2" : "";
                epHTML += `<a href="${url.toString()}" class="episode-button2 ${active}">${i}</a>`;
            }
        }

        container.innerHTML = `
        <div class="player-wrapper2">
            <div class="player-container2">
                <iframe id="mainIframe" allowfullscreen scrolling="no" sandbox="allow-scripts allow-same-origin allow-fullscreen" style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
            </div>
            <div class="controls-area">
                <div class="current-episode2">
                    <p>Playing: <span>${p_isMovie ? "Full Movie" : `Season ${p_season} - Episode ${p_currentEp}`}</span></p>
                </div>
                <div class="action-buttons2">
                    <a href="https://t.me/helloanime0" target="_blank" class="action-button2" style="text-decoration: none; color: inherit;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg> Join Telegram
                    </a>
                    <button class="action-button2" onclick="openDownload()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg> Download
                    </button>
                </div>
            </div>
            ${(!p_isMovie && p_totalEps > 0) ? `
            <div class="episode-buttons-container2">
                ${seasonsHTML}
                <div class="episodes-title2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <line x1="8" x2="16" y1="12" y2="12"></line>
                        <line x1="12" x2="12" y1="8" y2="16"></line>
                    </svg> Episodes
                </div>
                <div class="episode-buttons2">${epHTML}</div>
            </div>` : ""}
        </div>`;
    }

    function loadStream() {
        const iframe = document.getElementById("mainIframe");
        if(!iframe) return;

        // BLAKITE_CFG.serverUrl use kiya gaya hai embed link ke liye
        const src = p_isMovie
            ? `${BLAKITE_CFG.serverUrl}embed/${p_id}`
            : `${BLAKITE_CFG.serverUrl}embed/${p_id}/${p_season}-${p_currentEp}`;
        iframe.src = src;

        // History save
        let history = JSON.parse(localStorage.getItem('blakite_history') || '[]');
        history = history.filter(h => h.id !== p_id);
        history.unshift({
            id:           p_id,
            title:        p_title,
            img:          p_img,
            link:         window.location.href,
            progressText: p_isMovie ? 'Movie' : `S${p_season}-E${p_currentEp}`,
            timestamp:    Date.now()
        });
        if(history.length > 10) history.pop();
        localStorage.setItem('blakite_history', JSON.stringify(history));
    }

    window.openDownload = function() {
        // BLAKITE_CFG.serverUrl use kiya gaya hai download link ke liye
        const url = p_isMovie
            ? `${BLAKITE_CFG.serverUrl}download/${p_id}`
            : `${BLAKITE_CFG.serverUrl}download/${p_id}/${p_season}-${p_currentEp}`;
        window.open(url, "_blank");
    };

    // ===== ENG MODE PLAYER (Anikoto API + MegaPlay embeds) =====
    async function initEngPlayer(params) {
        const urlId = params.get('id');
        const container = document.getElementById('dynamic-stream-area');
        if(!urlId) {
            if(container) container.innerHTML = "<h3 style='color:#fff; text-align:center; padding:20px;'>Please select content from Home.</h3>";
            return;
        }

        p_currentEp = parseInt(params.get('episode')) || 1;
        if(container) container.innerHTML = "<div style='color:#fff; text-align:center; padding:50px;'><div class='gold-loader'></div></div>";

        let payload;
        try {
            payload = await AnikotoAPI.getSeries(urlId);
        } catch(e) {
            if(container) container.innerHTML = "<h3 style='color:#fff; text-align:center; padding:20px;'>Failed to load Anikoto series.</h3>";
            return;
        }

        const anime = (payload && payload.anime) || {};
        const episodes = (payload && Array.isArray(payload.episodes))
            ? payload.episodes.slice().sort(function(a, b) { return Number(a.number || 0) - Number(b.number || 0); })
            : [];

        const title = anime.title || 'Unknown';
        const poster = anime.poster || BLAKITE_CFG.defaultImg;
        const desc = anime.description || '';

        p_id       = urlId;
        p_isMovie  = false;
        p_season   = '1';
        p_seasonList = [];
        p_totalEps = episodes.length;
        p_title    = title;
        p_img      = poster;
        document.title = "Watch: " + title;

        if(typeof updateGlobalSEO === 'function') {
            try { updateGlobalSEO(anime, 'Series', '1', p_currentEp); } catch(e) {}
        }

        if(container) container.removeAttribute('style');
        renderEngPlayerUI(container, title, episodes);
        loadEngStream(episodes);

        // History save - ENG mode me bhi Continue Watching ke liye
        try {
            let history = JSON.parse(localStorage.getItem('blakite_history') || '[]');
            history = history.filter(h => h.id !== p_id);
            history.unshift({
                id:           p_id,
                title:        title,
                img:          poster,
                link:         window.location.href,
                progressText: 'Episode ' + p_currentEp,
                timestamp:    Date.now()
            });
            if(history.length > 10) history.pop();
            localStorage.setItem('blakite_history', JSON.stringify(history));
            if(window.dispatchEvent) window.dispatchEvent(new Event('history-updated'));
        } catch(e) {}

        const breadcrumbTitle = document.querySelector('.breadcrumb strong');
        if(breadcrumbTitle) breadcrumbTitle.innerText = title;
        const infoTitle = document.querySelector('#info .info .title');
        if(infoTitle) infoTitle.innerText = title;

        // Info card fill
        const posterEl = document.getElementById('api-poster');
        if(posterEl) posterEl.src = poster;
        const apiTitle = document.getElementById('api-title');
        if(apiTitle) apiTitle.innerText = title;
        const apiSyn = document.getElementById('api-synopsis');
        if(apiSyn) apiSyn.innerText = desc;
        const apiRat = document.getElementById('api-rating');
        if(apiRat) apiRat.innerText = String(anime.score || anime.rating || '0');
        const apiStatus = document.getElementById('api-status');
        if(apiStatus) apiStatus.innerText = 'Status: ' + (anime.status || 'Unknown');
        const apiLang = document.getElementById('api-lang');
        if(apiLang) apiLang.innerText = (anime.season || '') + ' / ' + (anime.year || '');
        const apiType = document.getElementById('api-type');
        if(apiType) apiType.innerText = 'Anime';
        const apiDate = document.getElementById('api-date');
        if(apiDate) apiDate.innerText = String(anime.year || '');
        const apiKeywords = document.getElementById('api-keywords');
        if(apiKeywords && anime.terms_by_type && Array.isArray(anime.terms_by_type.genre)) {
            apiKeywords.innerHTML = anime.terms_by_type.genre.map(function(g) {
                return "<span class='keyword-chip'>" + g + "</span>";
            }).join('');
        }
        const infoCard = document.getElementById('api-info-card');
        if(infoCard) infoCard.style.display = '';
    }

    function engAvailableLang(episodes) {
        const hasSub = episodes.some(function(e) { return e.embed_url && e.embed_url.sub; });
        const hasDub = episodes.some(function(e) { return e.embed_url && e.embed_url.dub; });
        let cur = window._engLang === 'dub' ? 'dub' : 'sub';
        if(cur === 'dub' && !hasDub) cur = 'sub';
        if(cur === 'sub' && !hasSub) cur = 'dub';
        window._engLang = cur;
        return { hasSub: hasSub, hasDub: hasDub };
    }

    function engFiltered(episodes) {
        const lang = window._engLang === 'dub' ? 'dub' : 'sub';
        return episodes.filter(function(e) { return e.embed_url && e.embed_url[lang]; });
    }

    function engRenderEpButtons(episodes) {
        const view = engFiltered(episodes);
        let epHTML = '';
        view.forEach(function(ep) {
            const active = (Number(ep.number) === p_currentEp) ? 'active2' : '';
            const url = new URL(window.location.href);
            url.searchParams.set('episode', ep.number);
            epHTML += `<a href="${url.toString()}" class="episode-button2 ${active}">${ep.number}</a>`;
        });
        const box = document.querySelector('#dynamic-stream-area .episode-buttons2');
        if(box) box.innerHTML = epHTML;
        const playing = document.querySelector('#dynamic-stream-area .current-episode2 span');
        if(playing) playing.textContent = p_isMovie ? 'Full Movie' : 'Episode ' + p_currentEp;
    }

    function renderEngPlayerUI(container, title, episodes) {
        const langs = engAvailableLang(episodes);

        let langHTML = '';
        if(langs.hasSub || langs.hasDub) {
            langHTML = `<div class="lang-switch-box">
                <span class="season-label">Audio</span>
                <div class="lang-switch-btns">
                    ${langs.hasSub ? `<button type="button" class="season-btn lang-sw-btn${window._engLang === 'sub' ? ' active-season' : ''}" data-lang-btn="sub">SUB</button>` : ''}
                    ${langs.hasDub ? `<button type="button" class="season-btn lang-sw-btn${window._engLang === 'dub' ? ' active-season' : ''}" data-lang-btn="dub">DUB</button>` : ''}
                </div>
            </div>`;
        }

        const view = engFiltered(episodes);
        if(view.length > 0 && view.every(function(e) { return Number(e.number) !== p_currentEp; })) {
            p_currentEp = Number(view[0].number);
        }
        let epHTML = '';
        view.forEach(function(ep) {
            const active = (Number(ep.number) === p_currentEp) ? 'active2' : '';
            const url = new URL(window.location.href);
            url.searchParams.set('episode', ep.number);
            epHTML += `<a href="${url.toString()}" class="episode-button2 ${active}">${ep.number}</a>`;
        });

        container.innerHTML = `
        <div class="player-wrapper2">
            <div class="player-container2">
                <iframe id="mainIframe" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen scrolling="no" src="about:blank" style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
            </div>
            <div class="controls-area">
                <div class="current-episode2">
                    <p>Playing: <span>${p_isMovie ? "Full Movie" : `Episode ${p_currentEp}`}</span></p>
                </div>
                <div class="action-buttons2">
                    <a href="https://t.me/helloanime0" target="_blank" class="action-button2" style="text-decoration: none; color: inherit;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg> Join Telegram
                    </a>
                </div>
            </div>
            <div class="episode-buttons-container2">
                ${langHTML}
                <div class="episodes-title2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <line x1="8" x2="16" y1="12" y2="12"></line>
                        <line x1="12" x2="12" y1="8" y2="16"></line>
                    </svg> Episodes
                </div>
                <div class="episode-buttons2">${epHTML}</div>
            </div>
        </div>`;

        container.querySelectorAll('.lang-sw-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                window._engLang = btn.getAttribute('data-lang-btn');
                btn.parentNode.querySelectorAll('.lang-sw-btn').forEach(function(b) { b.classList.remove('active-season'); });
                btn.classList.add('active-season');
                const v = engFiltered(episodes);
                if(v.length > 0 && v.every(function(e) { return Number(e.number) !== p_currentEp; })) {
                    p_currentEp = Number(v[0].number);
                }
                engRenderEpButtons(episodes);
                loadEngStream(episodes);
            });
        });
    }

    function loadEngStream(episodes) {
        const iframe = document.getElementById("mainIframe");
        if(!iframe) return;
        const view = engFiltered(episodes);
        const ep = view.find(function(e) { return Number(e.number) === p_currentEp; }) || view[0];
        let src = 'about:blank';
        if(ep && ep.embed_url) {
            src = window._engLang === 'dub'
                ? (ep.embed_url.dub || ep.embed_url.sub || 'about:blank')
                : (ep.embed_url.sub || ep.embed_url.dub || 'about:blank');
        }
        iframe.src = src;
    }

    // DOMContentLoaded se safe execution
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayerSystem);
    } else {
        initPlayerSystem();
    }
})();
//]]>
