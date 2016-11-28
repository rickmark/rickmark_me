$(document).ready(function() {
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

});