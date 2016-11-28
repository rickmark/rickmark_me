$(document).ready(function() {
    /* Blog
     -----------------------------------------------------*/

// Post Carousel

    $(".post-carousel").owlCarousel({

        // Most important owl features
        items: false,
        itemsCustom: [[1600, 3], [991, 2], [0, 1]],
        itemsDesktop: false,
        itemsDesktopSmall: false,
        itemsTabletSmall: false,
        itemsMobile: false,
        singleItem: false,
        itemsScaleUp: false,
        slideSpeed: 600,
        paginationSpeed: 800,
        rewindSpeed: 1000,
        navigation: false,
        scrollPerPage: true,
        pagination: true,
        theme: "carousel-theme"

    });

    var owl = $(".owl-carousel").data('owlCarousel');

    $('.post-carousel-next').click(function () {
        owl.next();
        return false;
    });

    $('.post-carousel-prev').click(function () {
        owl.prev();
        return false;
    });

// Post Carousel

    $(".blog-slider").owlCarousel({

        // Most important owl features
        items: false,
        itemsCustom: false,
        itemsDesktop: false,
        itemsDesktopSmall: false,
        itemsTabletSmall: false,
        itemsMobile: false,
        singleItem: true,
        itemsScaleUp: false,
        slideSpeed: 600,
        paginationSpeed: 800,
        rewindSpeed: 1000,
        navigation: false,
        scrollPerPage: true,
        pagination: true,
        autoPlay: true,
        theme: "slider-theme"

    });
});