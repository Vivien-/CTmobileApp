// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])
		.config(function($stateProvider, $urlRouterProvider) {
				$stateProvider
						.state('home', {
								url: '/home',
								templateUrl: 'home.html'
						})
						.state('display', {
								url: '/display',
								templateUrl: 'display.html'
						});
				$urlRouterProvider.otherwise('/home');  
		})
    .controller('mapCtrl', function($scope) {
				var map;
				map = new google.maps.Map(document.getElementById('map'), {
						center: {lat: 44.8357953, lng: -0.5735781},
						zoom: 14
				});

		})
		.controller('myCtrl', function($scope, $interval) {
				var colors = [];

				function makeColorGradient() {
						for(var i = 0; i <= 100; i++) {
								var h = 120 - i * 120/100;
								colors[i] = "hsl("+h+", 80%, 70%)";
						}
				}

				makeColorGradient();

				function httpGetAsync(theUrl, callback) {
						var xmlHttp = new XMLHttpRequest();
						xmlHttp.onreadystatechange = function() { 
								if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
										callback(xmlHttp.responseText);
						}
						xmlHttp.open("GET", theUrl, true); // true for asynchronous which we want
						xmlHttp.send(null);
				}

				function getTrainData(json) {
						return json.content;
				}

				function getContext(json) {
						return json.context;
				}

				function createCars(json) {
						var minOccupation = 100;
						var best;
						if(!wrapperCreated) {
								buildWrappers(json);
								wrapperCreated = true;
						}
						setOccupation(json);
				}

				function buildWrappers(json) {
						for(var i = 0; i < json.length; i++) {
								var node = document.createElement("span");
								node.className = "button";
								node.id = json[i].id;
								if(typeof json[i].best != "undefined") {
										node.className += " best";
								}
								document.getElementById("train-display").appendChild(node);
						}
				}

				function setOccupation(json) {
						for(var i = 0; i < json.length; i++) {
								var node = document.getElementById(json[i].id);
								node.style.backgroundColor = colors[parseInt(json[i].occupation)];
								node.innerHTML = json[i].occupation + "%";
						}
				}

				function createContext(context) {
						document.getElementById("left").innerHTML = "Direction: " + context.left;
						document.getElementById("right").innerHTML = "Direction: " +  context.right;
				}

				function drawInterface(response) {
						var json = JSON.parse(response);
						var trainData = getTrainData(json);
						var context = getContext(json);
						if(!wrapperCreated)
								createContext(context);
						createCars(trainData);
				}

				var wrapperCreated = false;


				var k = 0;
				function updateView() {
						httpGetAsync("/datas_"+ (k%3) +".txt", drawInterface);
						k++;
				}
				
				
				var button = document.getElementById("refresh");
				button.addEventListener("click",function(e){
						updateView();
				},false);
				$interval(updateView, 5000);
				updateView();
		})
		.run(function($ionicPlatform) {
				$ionicPlatform.ready(function() {
						if(window.cordova && window.cordova.plugins.Keyboard) {
								// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
								// for form inputs)
								cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

								// Don't remove this line unless you know what you are doing. It stops the viewport
								// from snapping when text inputs are focused. Ionic handles this internally for
								// a much nicer keyboard experience.
								cordova.plugins.Keyboard.disableScroll(true);
						}
						if(window.StatusBar) {
								StatusBar.styleDefault();
						}
				});
		})
