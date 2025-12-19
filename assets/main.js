// Main JS for main.php wrapper
(function(){
    'use strict';

    function safe(fn){
        try{ fn(); }catch(e){ console.warn('main.js caught error:', e); }
    }

    // Run after DOM ready
    document.addEventListener('DOMContentLoaded', function(){
        safe(function(){
            // ensure Bootstrap's collapse toggler aria states are correct (no-op if bootstrap not present)
            var toggler = document.querySelector('.navbar-toggler');
            if (toggler){
                toggler.addEventListener('click', function(){
                    try{
                        toggler.classList.toggle('collapsed');
                    }catch(e){}
                });
            }

            // Improve mobile nav usability: close navbar when link clicked
            var navLinks = document.querySelectorAll('.navbar-collapse .nav-link');
            navLinks.forEach(function(link){
                link.addEventListener('click', function(){
                    var collapse = document.querySelector('.navbar-collapse');
                    if (collapse && collapse.classList.contains('show')){
                        // Use Bootstrap collapse if available
                        try{
                            var bsCollapse = bootstrap.Collapse.getInstance(collapse);
                            if (!bsCollapse){ bsCollapse = new bootstrap.Collapse(collapse); }
                            bsCollapse.hide();
                        }catch(e){
                            collapse.classList.remove('show');
                        }
                    }
                });
            });

            // Simple layout resize handler to adjust body padding if navbar height changes
            var navbar = document.querySelector('.navbar');
            function updateBodyPadding(){
                if (!navbar) return;
                var h = navbar.getBoundingClientRect().height;
                document.body.style.paddingTop = (h + 8) + 'px';
            }
            updateBodyPadding();
            window.addEventListener('resize', function(){ safe(updateBodyPadding); });

            // Tiny accessibility: add skip link if not present
            if (!document.querySelector('.skip-link')){
                var a = document.createElement('a');
                a.href = '#maincontent';
                a.className = 'skip-link';
                a.style.cssText = 'position:absolute;left:-999px;top:auto;width:1px;height:1px;overflow:hidden;';
                a.textContent = 'Skip to content';
                a.addEventListener('focus', function(){ a.style.left = '8px'; a.style.top = '8px'; a.style.background = '#fff'; a.style.padding = '8px'; a.style.zIndex = 9999; a.style.border = '1px solid #ccc'; });
                a.addEventListener('blur', function(){ a.style.left = '-999px'; a.style.top = 'auto'; });
                document.body.insertBefore(a, document.body.firstChild);
            }
        });
    });
})();
