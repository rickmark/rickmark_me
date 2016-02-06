// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

//= require_self


//= require 'jquery/dist/jquery'
//= require 'bootstrap/dist/js/bootstrap'
//= require 'jquery.easing/js/jquery.easing'
//= require 'jquery-validation/dist/jquery.validate'
//= require 'jquery.localScroll/jquery.localScroll'
//= require 'jquery.scrollTo/jquery.scrollTo'
//= require jquery.fitvids
//= require 'jquery.appear/jquery.appear'
//= require 'waypoints/lib/jquery.waypoints'
//= require 'OwlCarousel2/dist/owl.carousel'


Pace.on('hide', function() {
    $('#page-loader').delay(100).fadeOut(700);
});