// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require twitter/bootstrap
//= require bootstrap-datepicker
//= require_tree .

( function() {
    function setBrowser() {
        $('body').attr( 'browser', 
                        navigator.userAgent.match( /Chrome/ ) ? 'chrome'
                        : navigator.userAgent.match( /Firefox/ ) ? 'firefox'
                        : navigator.userAgent.match( /MSIE|Trident/ ) ? 'ie'
                        : 'unknown' )
    }
    
    $( setBrowser )
    $(document).on( 'page:load', setBrowser )

    function showMessages() {
        $.each( ['#notice', '#alert'], function( index, type ) {
            if( $(type).text().length > 0 && $(type).text() != 'You are already signed in.' ) {
                $(type).removeClass( 'hide' )
            }
        } )
    }
    
    $( showMessages )
    $(document).on( 'page:load', showMessages )
} )()
