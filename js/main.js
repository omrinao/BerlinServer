var app = angular.module('myApp', ["ngRoute"]);

jQuery(function ($) {

  //Initiat WOW JS
  new WOW().init();

  $(".navbar-collapse a").on('click', function () {
    $(".navbar-collapse.collapse").removeClass('in');
  });

  // portfolio filter
  $(window).on('load', function () {
    'use strict';
    var $portfolio_selectors = $('.portfolio-filter >li>a');
    var $portfolio = $('.portfolio-items');
    $portfolio.isotope({
      itemSelector: '.portfolio-item',
      layoutMode: 'fitRows'
    });

    $portfolio_selectors.on('click', function () {
      $portfolio_selectors.removeClass('active');
      $(this).addClass('active');
      var selector = $(this).attr('data-filter');
      $portfolio.isotope({
        filter: selector
      });
      return false;
    });
  });


  //Pretty Photo
  $("a[rel^='prettyPhoto']").prettyPhoto({
    social_tools: false
  });

  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('.scrollup').fadeIn();
    } else {
      $('.scrollup').fadeOut();
    }
  });
  $('.scrollup').click(function () {
    $("html, body").animate({
      scrollTop: 0
    }, 1000);
    return false;
  });

});



// config routes
app.config(['$routeProvider', function($routeProvider)  {
  $routeProvider

      // homepage
      .when('/', {
        templateUrl : '../pages/constIndex.html',
        controller : 'welcomeController'
      })

      // poi
      .when('/poi', {
          templateUrl: '../pages/poi.html',
          controller : 'poiController'
      })

      // register
      .when('/register', {
        templateUrl: '../pages/register.html',
        controller : 'registerController'
    })

    // login
    .when('/login', {
      templateUrl: '../pages/login.html',
      controller : 'loginController'
    })
    // savedPoi
    .when('/poiSaved', {
      templateUrl: '../pages/poiSaved.html',
      controller : 'poiSavedController'
    })

}]);