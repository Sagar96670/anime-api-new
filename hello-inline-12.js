
//<![CDATA[
(function() {
    // API aur caching ab Global Script (BlakiteAPI) handle karega
    const REL_LIMIT = 18;

    const urlParams  = new URLSearchParams(window.location.search);
    const currentId  = urlParams.get('id');
    const currentType = urlParams.get('type');

    if(!currentId || !currentType) {
        const el = document.getElementById('related-grid-content');
        if(el) el.style.display = 'none';
        return;
    }

    async function initRelated() {
        // Seedha global API function se data le rahe hain
        const rawData = await BlakiteAPI.getData();

        if(rawData) {
            processRelated(rawData);
        } else {
            const el = document.getElementById('related-grid-content');
            if(el) el.innerHTML = '<div style="color:#666; width:100%; text-align:center;">Failed to load related content.</div>';
        }
    }

    function processRelated(data) {
        let sourceList = [];
        if(currentType === 'Movie'  && data.movies) sourceList = Object.entries(data.movies).map(([k,v]) => ({id:k, ...v, type:'Movie'}));
        else if(currentType === 'Series' && data.series) sourceList = Object.entries(data.series).map(([k,v]) => ({id:k, ...v, type:'Series'}));
        else if(currentType === 'Drama'  && data.dramas) sourceList = Object.entries(data.dramas).map(([k,v]) => ({id:k, ...v, type:'Drama'}));

        let filtered = sourceList.filter(item => item.id !== currentId);
        filtered.sort(() => Math.random() - 0.5);
        // REL_LIMIT use kiya hai yahan
        renderRelatedGrid(filtered.slice(0, REL_LIMIT));
    }

    function mapLanguage(rawLang) {
        if(!rawLang) return 'Sub/Dub';
        const l = rawLang.toLowerCase();
        if(l.includes('fan') && l.includes('dub')) return 'FanDub';
        if(l === 'org') return 'ORG';
        if(l.includes('english') && l.includes('dub')) return 'EngDub';
        if(l.includes('english') && l.includes('sub')) return 'EngSub';
        if(l.includes('hindi')   && l.includes('dub')) return 'HinDub';
        return 'Sub/Dub';
    }

    function renderRelatedGrid(items) {
        const container = document.getElementById('related-grid-content');
        if(!container) return;

        if(items.length === 0) {
            container.innerHTML = '<div style="color:#666; width:100%; text-align:center;">No related content available.</div>';
            return;
        }

        let html = '';
        const baseUrl = window.location.origin;

        items.forEach(item => {
            let title = item.title || "Unknown";

            // FIX: IMAGES null safe + Global Default Image fallback
            let img = '';
            if(item.IMAGES) {
                img = item.IMAGES.poster || item.IMAGES.backdrop || BLAKITE_CFG.defaultImg || '';
            }

            // BLAKITE_CFG se watchBase le rahe hain
            let link      = `${baseUrl}${BLAKITE_CFG.watchBase}?type=${item.type}&id=${item.id}`;
            let badgeText = item.type === 'Movie' ? 'Movie' : 'Series';
            let status    = 'Ongoing';

            if(item.type === 'Series' || item.type === 'Drama') {
                if(item.seasons && Object.keys(item.seasons).length > 0) {
                    // Sort karke pehli season lo
                    const sortedKeys = Object.keys(item.seasons).sort((a, b) => Number(a) - Number(b));
                    const sKey   = sortedKeys[0];
                    const season = item.seasons[sKey];
                    const sNum   = season.seasonNumber;

                    // FIX: totalEpisodes use karo, episodes object nahi hai ab
                    const epCount = season.totalEpisodes || 0;
                    badgeText = `S${sNum}-EP${epCount}`;

                    if(!title.toLowerCase().includes('season')) {
                        title += ` Season ${sNum}`;
                    }
                    link += `&s=${sNum}&ep=1`;

                    // FIX: status season se seedha uthao
                    status = season.status || 'Ongoing';
                }
            } else {
                // Movie
                status    = 'Released';
                badgeText = 'Full Movie';
            }

            let langBadge = mapLanguage(item.language);
            let stClass   = status === 'Completed' ? 'st-cmp' : (status === 'Released' ? 'st-rel' : 'st-ong');

            html += `
            <a class="rel-item" href="${link}" title="${title}">
                <div class="rel-poster">
                    <img src="${img}" loading="lazy" alt="${title}">
                    <div class="rel-status ${stClass}">${status}</div>
                    <div class="rel-badges">
                        <span class="rel-badge-ep">${badgeText}</span>
                        <span class="rel-badge-lang">${langBadge}</span>
                    </div>
                </div>
                <div class="rel-title">${title}</div>
            </a>`;
        });

        container.innerHTML = html;
    }

    initRelated();
})();
//]]>
