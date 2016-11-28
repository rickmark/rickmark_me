$(document).ready(function() {

    /* Animations
     -----------------------------------------------------*/

    jQuery('.animated').appear();

    $('.fade-in').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('fade-in-animation')
        });
    });

    $('.fade-in-left').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('fade-in-left-animation')
        });
    });

    $('.fade-in-right').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('fade-in-right-animation')
        });
    });

    $('.slide-in-left').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('slide-in-left-animation')
        });
    });

    $('.slide-in-right').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('slide-in-right-animation')
        });
    });

    $('.slide-in-top').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('slide-in-top-animation');
        });
    });

    $('.slide-in-bottom').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('slide-in-bottom-animation');
        });
    });

    $('.zoom-in').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('zoom-in-animation');
        });
    });

    $('.zoom-out').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('zoom-out-animation');
        });
    });

    $('.bounce-in').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('bounce-in-animation');
        });
    });

    $('.flip-in').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('flip-in-animation');
        });
    });
});