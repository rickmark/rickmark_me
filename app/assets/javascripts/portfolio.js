$(document).ready(function() {

    /* Portfolio
     -----------------------------------------------------*/

    // Ajax Project Details

    var toLoad;

    function showNewContent() {
        $('.project-content').slideUp(700, function () {
            $('.project-content').slideDown(700, function () {
                $.waypoints('refresh');
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

});