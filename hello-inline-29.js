
/* ===== HEADER NAV DROPDOWN MENU ===== */
try { (function() {
    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }
    ready(function() {
        var menu = document.getElementById('menu');
        var toggle = document.getElementById('navMenuToggle');
        var panel = document.getElementById('navMenuPanel');
        if(!menu || !toggle || !panel) return;

        function openMenu()  { menu.classList.add('open');  toggle.setAttribute('aria-expanded', 'true'); }
        function closeMenu() { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
        function isOpen()    { return menu.classList.contains('open'); }

        toggle.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            isOpen() ? closeMenu() : openMenu();
        });
        var closeBtn = document.getElementById('navMenuClose');
        if(closeBtn) closeBtn.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation(); closeMenu();
        });
        document.addEventListener('click', function(e) {
            if(isOpen() && !menu.contains(e.target)) closeMenu();
        });
        document.addEventListener('keydown', function(e) {
            if(e.key === 'Escape' && isOpen()) closeMenu();
        });

        panel.querySelectorAll('.nav-menu-link').forEach(function(link) {
            link.addEventListener('click', function(e) {
                var action = link.getAttribute('data-menu-action');
                if(!action) { closeMenu(); return; }
                e.preventDefault();
                closeMenu();
                if(action === 'home') window.location.href = '/';
                else window.location.href = '/?section=' + action;
            });
        });
    });
})(); } catch(e) { console.error("[Nav Menu]", e); }

/* ===== RANDOM ANIME BUTTON ===== */
(function() {
    var btn = document.getElementById('randomBtn');
    if(!btn) return;
    btn.addEventListener('click', async function() {
        if(btn.dataset.loading) return;
        btn.dataset.loading = '1';
        try {
            var data = await BlakiteAPI.getData();
            if(!data) throw new Error('No data');
            var pool = [];
            [['movies', 'Movie'], ['series', 'Series'], ['dramas', 'Drama']].forEach(function(pair) {
                if(data[pair[0]]) Object.keys(data[pair[0]]).forEach(function(key) { pool.push({ type: pair[1], id: key }); });
            });
            if(pool.length === 0) { delete btn.dataset.loading; return; }
            var pick = pool[Math.floor(Math.random() * pool.length)];
            var link = window.location.origin + BLAKITE_CFG.watchBase + '?type=' + encodeURIComponent(pick.type) + '&id=' + encodeURIComponent(pick.id);
            window.location.href = link;
        } catch(e) {
            console.error('[Random] failed:', e);
            delete btn.dataset.loading;
        }
    });
})();
