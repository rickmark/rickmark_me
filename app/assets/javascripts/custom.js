//= require_self
//= require 'GoogleMap-dark'
//= require portfolio
//= require contact_form
//= require blog
//= require animations

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

    var setWaypoint = function() {
        var sectionName = '#' + $(this.element).attr('id');
        var activeLink = $('.me-nav li.active');

        var newLink = $('li.menu-item a[href="' + sectionName + '"]');

        $(activeLink).removeClass('active');
        $(newLink).parent('li').addClass('active');
    };

    pageContentSection.waypoint(function (direction) {
        if (direction == 'down') {
            setWaypoint.bind(this)();
        }
    }, {offset: 1});

    pageContentSection.waypoint(function (direction) {
        if (direction == 'up') {
            setWaypoint.bind(this)();
        }
    }, {
        offset: function () {
            return -$(this.element).height() + 1;
        }
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


});

// Tooltip Initialize 
function tooltipIni() {
    $("[rel='tooltip']").tooltip();
}

// Popover Initialize 
function popoverIni() {
    $("[rel='popover']").popover();
}

