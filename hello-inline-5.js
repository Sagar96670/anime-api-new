
//<![CDATA[
// ==========================================
// BLAKITE GLOBAL CONFIGURATION & API MANAGER
// ==========================================
const BLAKITE_CFG = {
    apiUrl: "https://blakiteapi.xyz/api/getAllAnime.php",
    serverUrl: "https://blakiteapi.xyz/",
    cacheKey: "blakite_v7_categories",
    cacheTime: 1 * 60 * 60 * 1000, // 1 Hour
    watchBase: "/2026/09/streaming.html",
    searchBase: "/search",
    defaultImg: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg21Z4vB2uQcnmrceyGGdvsabOsnq_8Iq1HECnYgXgLxW-DfWteNXCB3Ggrhtyl_hVhCsKKn9U7Rm2JhBpXy7QnI8SdfN7SdG7pSlwGOsVee-MNSWSErGrkdEqyPXbFChtWmd_jRublpr40/w300-h225-p-k-no-nu/dagruel-no-image.png"
};

const BlakiteAPI = {
    dataPromise: null,

    getData: async function() {
        if (this.dataPromise) return this.dataPromise;

        this.dataPromise = new Promise(async (resolve) => {
            const cached = localStorage.getItem(BLAKITE_CFG.cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.ts < BLAKITE_CFG.cacheTime) {
                    return resolve(parsed.data);
                }
            }

            try {
                const req = await fetch(BLAKITE_CFG.apiUrl);
                const res = await req.json();
                if (res.success) {
                    localStorage.setItem(BLAKITE_CFG.cacheKey, JSON.stringify({ ts: Date.now(), data: res.data }));
                    resolve(res.data);
                } else {
                    resolve(null);
                }
            } catch (e) {
                console.error("Blakite API Error:", e);
                resolve(null);
            }
        });

        return this.dataPromise;
    },

    normalize: function(str) {
        return str ? str.toLowerCase().replace(/[^a-z0-9]/g, '').trim() : "";
    }
};
//]]>
