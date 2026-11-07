
//<![CDATA[
document.addEventListener('DOMContentLoaded', async function() {
    const searchInputs = document.querySelectorAll('input[name="q"], .search-input, #search-input, #cari');
    if(searchInputs.length === 0) return;
    const input = searchInputs[0]; 

    const dropdown = document.createElement('div');
    dropdown.id = 'blakite-search-results';

    if(input.parentNode.style.position !== 'relative') {
        input.parentNode.style.position = 'relative';
    }
    input.parentNode.appendChild(dropdown);

    let searchCache = [];

    // --- GLOBAL SYNC --- 
    // Ab BlakiteAPI global script se automatically data aur cache manage karega
    const rawData = await BlakiteAPI.getData();
    if(rawData) {
        processSearchData(rawData);
    }

    function processSearchData(data) {
        if(!data) return;
        const process = (obj, type) => {
            if(!obj) return;
            Object.entries(obj).forEach(([key, val]) => {
                if(val.seasons && Object.keys(val.seasons).length > 0) {
                    Object.values(val.seasons).forEach(sea => addSearchItem(val, type, sea, key));
                } else {
                    addSearchItem(val, type, null, key);
                }
            });
        };
        process(data.movies, 'Movie');
        process(data.series, 'Series');
        process(data.dramas, 'Drama');
    }

    function addSearchItem(source, type, seasonObj = null, uniqueKey) {
        let title = source.title;
        // Global Config se fallback default image layega
        let img = source.IMAGES?.thumbnail || source.IMAGES?.poster || BLAKITE_CFG.defaultImg;
        let seasonParam = '';

        if(seasonObj) {
            title = `${source.title} Season ${seasonObj.seasonNumber}`;
            seasonParam = `&s=${seasonObj.seasonNumber}`;
        }

        let baseUrl = window.location.origin; 
        // Global Config se Watch URL base dynamically sync
        let fullLink = `${baseUrl}${BLAKITE_CFG.watchBase}?type=${type}&id=${uniqueKey}${seasonParam}`;

        searchCache.push({
            title: title,
            normTitle: BlakiteAPI.normalize(title), // Global Normalize Function Use Kiya
            img: img,
            url: fullLink,
            meta: `${type} &#8226; ${source.language || 'Unknown'}`
        });
    }

    input.addEventListener('input', function(e) {
        const rawQuery = e.target.value;
        const q = BlakiteAPI.normalize(rawQuery); // Global Normalize Function Use Kiya

        dropdown.innerHTML = '';
        if(q.length < 2) {
            dropdown.classList.remove('active');
            return;
        }

        // Fuzzy Matching: Compare normalized input with normalized DB title
        const matches = searchCache.filter(item => item.normTitle.includes(q)).slice(0, 8);

        if(matches.length > 0) {
            matches.forEach(item => {
                dropdown.innerHTML += `
                <a href="${item.url}" class="search-item">
                    <img src="${item.img}" class="s-thumb" loading="lazy">
                    <div class="s-info">
                        <div class="s-title">${item.title}</div>
                        <div class="s-meta">${item.meta}</div>
                    </div>
                </a>`;
            });
            dropdown.classList.add('active');
        } else {
            dropdown.classList.remove('active');
        }
    });

    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});
//]]>
