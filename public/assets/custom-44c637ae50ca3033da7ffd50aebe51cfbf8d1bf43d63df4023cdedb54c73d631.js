


$(document).ready(function () {

    "use strict";

    /* Setting Sizes
     -----------------------------------------------------*/

    function setSizes() {

        /* General */
        var logoContent = $('.logo-content');
        logoContent.css({'margin-top': '-' + (logoContent.height() / 2) + 'px'});

        /* Profile */
        $('#profile').css({'height': ($(window).height()) + 'px'});
        var profileContent = $('.profile-content');
        profileContent.css({'margin-top': '-' + (profileContent.height() / 2) + 'px'});

        /* Portfolio */
        var projectInfo = $('.project-info');
        projectInfo.css({'margin-top': '-' + (projectInfo.height() / 2) + 'px'});

        /* Contact */
        $('#contact, .contact-content').css({'min-height': ($(window).height()) + 'px'});

    }

    setSizes();
    $(window).resize(function () {
        setSizes();
        checkPhotos();
    });

    /* Navigation
     -----------------------------------------------------*/
    var pageContentSection = $('#page-content section');

    pageContentSection.waypoint(function (direction) {
        if (direction == 'down') {

            var sectionName = '#' + $(this).attr('id');
            var menuLink = $('.me-nav li').children('a').attr('href');
            var activeLink = $('.me-nav li.active');

            var newLink = $('li.menu-item a[href="' + sectionName + '"]');

            $(activeLink).removeClass('active');
            $(newLink).parent('li').addClass('active');

        }
    }, {offset: 1});

    pageContentSection.waypoint(function (direction) {
        if (direction == 'up') {

            var sectionName = '#' + $(this).attr('id');
            var menuLink = $('.me-nav li').children('a').attr('href');
            var activeLink = $('.me-nav li.active');

            var newLink = $('li.menu-item a[href="' + sectionName + '"]');

            $(activeLink).removeClass('active');
            $(newLink).parent('li').addClass('active');

        }
    }, {
        offset: function () {
            return -$(this.element).height() + 1;
        }
    });

    /* Resume
     -----------------------------------------------------*/

    var resumeBox = $('.dimmed-effect .resume-box');
    resumeBox.mouseenter(function () {
        resumeBox.not(this).each(function () {
            $(this).addClass('disable');
        });
    });

    resumeBox.mouseleave(function () {
        resumeBox.each(function () {
            $(this).removeClass('disable');
        });
    });

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

    /* Portfolio
     -----------------------------------------------------*/

    // Ajax Project Details

    var toLoad;

    function showNewContent() {
        $('.project-content').slideUp(700, function () {
            $('.project-content').slideDown(700, function () {
                $.waypoints('refresh')
            });
        });
    }

    function loadContent() {
        $('.project-content').load(toLoad, showNewContent());
    }

    $('.ajax-portfolio-link').click(function () {
        toLoad = $(this).attr('href');
        loadContent();
        $('html, body').animate({scrollTop: $('.project-content').position().top}, 700);
        return false;
    });


    /* Smooth Scrolling
     -----------------------------------------------------*/

    $.localScroll({});

    /* Contact
     -----------------------------------------------------*/

    $('#contact-form-holder').addClass('form-hidden');
    $('.contact-form-trigger').click(function () {
        var contactFormHolder = $('#contact-form-holder');
        if (contactFormHolder.hasClass('form-hidden')) {
            contactFormHolder.removeClass('form-hidden').addClass('form-visible');
            $('.contact-form-trigger').addClass('active');
        } else if (contactFormHolder.hasClass('form-visible')) {
            contactFormHolder.removeClass('form-visible').addClass('form-hidden');
            $('.contact-form-trigger').removeClass('active');
        }
    });

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
            jQuery(this).addClass('slide-in-top-animation')
        });
    });

    $('.slide-in-bottom').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('slide-in-bottom-animation')
        });
    });

    $('.zoom-in').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('zoom-in-animation')
        });
    });

    $('.zoom-out').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('zoom-out-animation')
        });
    });

    $('.bounce-in').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('bounce-in-animation')
        });
    });

    $('.flip-in').appear(function () {
        jQuery(this).each(function () {
            jQuery(this).addClass('flip-in-animation')
        });
    });

    /* Alpha Setting
     -----------------------------------------------------*/

    var editableAlpha = $('.editable-alpha');
    editableAlpha.css({
        'opacity': (editableAlpha.attr('data-alpha') / 100)
    });

    /* Check photos
     -----------------------------------------------------*/

    function checkPhotos() {
        if ($('#profile-bg img, .page-title-bg img, .blog-slide-photo img').height() < $('#profile-bg img, .page-title-bg img, .blog-slide-photo img').parent().height()) {
            $('#profile-bg img, .page-title-bg img, .blog-slide-photo img').removeClass('too-slim');
            $('#profile-bg img, .page-title-bg img, .blog-slide-photo img').addClass('too-short');
        }
        if ($('#profile-bg img, .page-title-bg img, .blog-slide-photo img').width() < $('#profile-bg img, .page-title-bg img, .blog-slide-photo img').parent().width()) {
            $('#profile-bg img, .page-title-bg img, .blog-slide-photo img').removeClass('too-short');
            $('#profile-bg img, .page-title-bg img, .blog-slide-photo img').addClass('too-slim');
        }
    }

    checkPhotos();

    /* Responsive Videos
     -----------------------------------------------------*/

    $(function () {
        $('body').fitVids();
    });

    /* Contact Form
     -----------------------------------------------------*/

    var $contactForm = $('#contact-form');

    $contactForm.validate({
        rules: {
            name: {
                required: true,
                minlength: 1
            },
            email: {
                required: true,
                email: true
            },
            message: {
                required: true,
                minlength: 10
            }
        },
        messages: {
            name: {
                required: "Please enter your name."
            },
            email: {
                required: "Please enter your email address."
            },
            message: {
                required: "Please enter a message."
            }
        }
    });

    // Send the email
    $contactForm.submit(function () {
        var $success = '<strong>Success!</strong> Your message was sent.';
        var $error = '<strong>Error!</strong> Your message was not sent - try again later...';
        var response;
        if ($contactForm.valid()) {
            $.ajax({
                type: "POST",
                url: "contact",
                data: $(this).serialize(),
                success: function (msg) {
                    if (msg === 'SEND') {
                        response = '<div class="alert alert-success">' + $success + '</div>';
                    }
                    else {
                        response = '<div class="alert alert-warning">' + $error + '</div>';
                    }
                    $(".alert-error,.alert-success").remove();
                    $contactForm.prepend(response);
                }
            });
            return false;
        }
        return false;
    });

});

// Tooltip Initialize 
function tooltipIni() {
    $("[rel='tooltip']").tooltip();
}

// Popover Initialize 
function popoverIni() {
    $("[rel='popover']").popover();
}

;
$(document).ready(function () {

    /* Google Map
     -----------------------------------------------------*/

    function mapInitialize() {

        var mapDark = [
            {
                "stylers": [
                    {
                        "hue": "#ff1a00"
                    },
                    {
                        "invert_lightness": true
                    },
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 33
                    },
                    {
                        "gamma": 0.5
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#2D333C"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            }
        ];

        var mapLight = [
            {
                "featureType": "landscape",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "stylers": [
                    {
                        "hue": "#00aaff"
                    },
                    {
                        "saturation": -100
                    },
                    {
                        "gamma": 2.15
                    },
                    {
                        "lightness": 12
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "lightness": 24
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "lightness": 57
                    }
                ]
            }
        ]

        var element = document.getElementById('google-map');

        var yourLatitude = element.getAttribute('data-latitude');
        var yourLongitude = element.getAttribute('data-longitude');

        var myOptions = {
            zoom: 13,
            center: new google.maps.LatLng(yourLatitude, yourLongitude - 0.05),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            scaleControl: false,
            draggable: false,
            scrollwheel: false,
            streetViewControl: false,
            styles: mapDark
        };

        var map = new google.maps.Map(element, myOptions);

        var image = '/images/my-location.png';
        var myLatLng = new google.maps.LatLng(yourLatitude, yourLongitude);
        var myLocation = new google.maps.Marker({
            position: myLatLng,
            map: map,
            icon: image
        });

    }

    google.maps.event.addDomListener(window, 'load', mapInitialize);

});
