(function ($) {
    $('.article img:not(".not-gallery-item")').each(function () {
        // wrap images with link and add caption if possible
        if ($(this).parent('a').length === 0) {
            $(this).wrap('<a class="gallery-item" href="' + $(this).attr('src') + '"></a>');
            if (this.alt) {
                $(this).after('<div class="has-text-centered is-size-6 has-text-grey caption">' + this.alt + '</div>');
            }
        }
    });

    if (typeof (moment) === 'function') {
        $('.article-meta time').each(function () {
            $(this).text(moment($(this).attr('datetime')).fromNow());
        });
    }

    function adjustNavbar() {
        // thank
        // const navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
        var navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
        if ($(document).outerWidth() < navbarWidth) {
            $('.navbar-main .navbar-menu').addClass('is-flex-start');
        } else {
            $('.navbar-main .navbar-menu').removeClass('is-flex-start');
        }
    }
    adjustNavbar();
    $(window).resize(adjustNavbar);

    var $toc = $('#toc');
    if ($toc.length > 0) {
        var $mask = $('<div>');
        $mask.attr('id', 'toc-mask');

        $('body').append($mask);

        function toggleToc() {
            $toc.toggleClass('is-active');
            $mask.toggleClass('is-active');
        }

        $toc.on('click', toggleToc);
        $mask.on('click', toggleToc);
        $('.navbar-main .catalogue').on('click', toggleToc);
    }

    // 赞助二维码的显示隐藏-------------
    $('.donate-container .card-content').on('click', function () {
        const donate = this.querySelector('.buttons.is-centered');
        donate.style.overflow = "hidden";
        const height = donate.clientHeight;
        donate.style.height = height ? "0px" : '38.5px';
        donate.ontransitionend = () => donate.style.overflow = height ? "hidden" : "initial";
    });

    $('.donate-container .card-content a').on('click', e => {
        e.stopPropagation();
    });
    // --------------------

    // 全局搜索快捷键---------------
    window.onkeydown = (e) => {
        // command + k
        if (e.metaKey && e.key === 'k') {
            const searchElement = document.querySelector('a.navbar-item.search');
            searchElement && searchElement.click();
        }
    }
    // --------------
})(jQuery);
