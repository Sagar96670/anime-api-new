
//<![CDATA[
function runGlobalSEO() {
    const urlP = new URLSearchParams(window.location.search);
    const uId = urlP.get('id'), uType = urlP.get('type');
    const uS = urlP.get('s') || "1", uE = urlP.get('episode') || "1";

    if (!uId || !uType) return;

    const cache = localStorage.getItem("blakite_v7_categories");
    if (!cache) return;

    try {
        const parsed = JSON.parse(cache).data;
        let item = null;
        const ds = uType === 'Movie' ? parsed.movies : (uType === 'Series' ? parsed.series : parsed.dramas);
        if (ds) item = ds[uId] || Object.values(ds).find(i => i.tmdbId == uId);

        if (item) {
            // CLEAN TITLE: Removed extra "Hindi Dubbed" from here
            let sTitle = item.title;
            if (uType !== 'Movie') {
                if (!sTitle.toLowerCase().includes('season')) sTitle += " Season " + uS;
                sTitle += " Episode " + uE;
            }

            let sDesc = item.TMDB_DATA?.synopsis || item.TMDB_DATA?.overview || item.synopsis || "Watch " + sTitle + " online.";
            let sImg = item.IMAGES?.backdrop || item.IMAGES?.poster;

            // Browser Tab
            document.title = "Watch: " + sTitle;

            // Direct DOM Injection
            const metaMaps = {
                'og-title': sTitle,
                'twitter-title': sTitle,
                'og-desc': sDesc.substring(0, 160),
                'meta-desc': sDesc.substring(0, 160),
                'og-image': sImg,
                'twitter-image': sImg
            };

            Object.keys(metaMaps).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.setAttribute('content', metaMaps[id]);
            });

            console.log("SEO SUCCESS: " + sTitle);
        }
    } catch (e) { console.log("SEO Sync Pending..."); }
}
document.addEventListener('DOMContentLoaded', runGlobalSEO);
window.addEventListener('load', runGlobalSEO);
//]]>
