
//<![CDATA[
/* ===== HIN/ENG TOGGLE + ANIKOTO API (Eng Mode) ===== */
function isEng() {
    return (localStorage.getItem('site_lang') || 'hindi') === 'english';
}

window.hideSitePreloader = function() {
    var el = document.getElementById('site-preloader');
    if(el) el.classList.add('hide');
};
(function() {
    var fail = setTimeout(function() { window.hideSitePreloader(); }, 30000);
    window.addEventListener('load', function() { clearTimeout(fail); window.hideSitePreloader(); });
})();

const ANIKOTO_CFG = {
    apiUrl: "/anikoto/",
    seriesKey: "anikoto_series_v1_",
    cacheTtl: 30 * 60 * 1000
};

const AnikotoAPI = (function() {
    function readCache(key, ttl) {
        try {
            const o = JSON.parse(localStorage.getItem(key) || 'null');
            if(o && Date.now() - o.ts < ttl) return o.value;
        } catch(e) {}
        return null;
    }
    function writeCache(key, value) {
        try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), value: value })); } catch(e) {}
    }
    async function fetchJson(url) {
        const res = await fetch(url);
        if(!res.ok) throw new Error('Anikoto HTTP ' + res.status);
        return res.json();
    }
    async function getSeries(id) {
        const key = ANIKOTO_CFG.seriesKey + id;
        const cached = readCache(key, ANIKOTO_CFG.cacheTtl);
        if(cached) return cached;
        const json = await fetchJson(ANIKOTO_CFG.apiUrl + 'series/' + encodeURIComponent(id));
        const payload = (json && json.data) ? json.data : null;
        if(!payload) throw new Error('Empty Anikoto series');
        writeCache(key, payload);
        return payload;
    }
    return { getSeries: getSeries };
})();

(function() {
    function applyLang() {
        const cur = isEng() ? 'english' : 'hindi';
        document.querySelectorAll('#langToggle .lang-opt').forEach(function(o) {
            o.classList.toggle('active', (o.getAttribute('data-lang') || '') === cur);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyLang);
    else applyLang();

    document.addEventListener('click', function(e) {
        const opt = e.target && e.target.closest ? e.target.closest('#langToggle .lang-opt') : null;
        if(!opt) return;
        const target = opt.getAttribute('data-lang');
        if(!target) return;
        const cur = isEng() ? 'english' : 'hindi';
        if(target !== cur) {
            localStorage.setItem('site_lang', target);
            window.location.reload();
        }
    });
})();
//]]>
