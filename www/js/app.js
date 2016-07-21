// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'angucomplete-alt'])
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
		.factory('choice', function($rootScope) {
				var authorization = {};
				
    		return {
        		getAuthObject: function () {
        				return authorization;
        		},
        		setAuthObject: function (authObject) {
            		authorization = authObject;
        		}
        };
		})
		.factory('getDatasService', function($http) {
				var _KEY = "8PVVD8CAA8";
				return {
						getLine: function(id) {
								return $http.get("/data/lineGeometry?id=" + id);
						},
						getStops: function(lineId) {
								return $http.get("/data/stationsPosition?id=" + lineId);
						},
						getVehicle: function(lineId, sens) {
								return $http.get("/data/getVehicle?id=" + lineId + "&sens=" + sens);								
						}
				}
		})
		.factory('drawInformations', function($http) {
				function getTramInformation(infos) {
						var p = '<div class="button-bar"><span class="button" id="car-2" style="background-color: rgb(240, 195, 117);">68%</span><span class="button" id="car-1" style="background-color: rgb(240, 173, 117);">77%</span><span class="button" id="car-3" style="background-color: rgb(179, 240, 117);">25%</span><span class="button best" id="car-4" style="background-color: rgb(117, 240, 117);">0%</span><span class="button" id="car-5" style="background-color: rgb(146, 240, 117);">11%</span><span class="button" id="car-6" style="background-color: rgb(240, 218, 117);">59%</span></div>';
						
						var label = getLabel(infos);
						var nextStop = getNextStop(infos);
						var speedinfo = getSpeedInfo(infos);
						var content = '<div class="info-div-tram">'+
								'<h1 style="font-size: 20px; margin: 0;">Direction '+ infos.TERMINUS.__text +'</h1>'+
								nextStop + "<br>" +
								label + "<br>" +
								speedinfo + "<br>" +
								p + "<br>" +
								'</div>'
						return content;
				}

				function secondsToString(seconds)	{
						var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
						var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
						return numminutes + "m " + numseconds + "s";
				}
				
				return {
						markerTrams : [],
						drawMarkersTrams: function(datas_complete, style, map) {
								var copyMarkerTrams = this.markerTrams;
								this.markerTrams = [];
								
								var datas = datas_complete.vehicules;
								for(var i = 0; i < datas.length; ++i) {
										var positionLatLng = {lat: datas[i].lat, lng: datas[i].lng};
										
										var lateTime = datas[i].timing;
										var _text = "<span class='infospan' style='color:red;'> En retard de " + secondsToString(lateTime) + "</span>";
										if(lateTime < 0) 
												_text = "<span class='infospan' style='color:green;'> En avance de " + secondsToString(Math.abs(lateTime)) + "</span>";
										else if (lateTime == 0)
												_text = "<span class='infospan' style='color:blue;'> Vehicule à l'heure</span>";
										
										var contentString = '<h1 style="font-size: 20px; margin: 0;">Direction '+ datas_complete.name +'</h1>'+
												'<span class="infospan">Prochain arret: ' + datas[i].next + "</span><br>" +
												_text + "<br>" +
												'<span class="infospan">Vitesse: ' + datas[i].speed + "km/h</span><br>" +
												'</div>';

										var marker = new google.maps.Marker({
												position: positionLatLng,
												map: map,
												icon: {url: style, scaledSize: new google.maps.Size(40,40) }
										});
										
										marker.info = new google.maps.InfoWindow({
												content:  contentString
										});
										
										google.maps.event.addListener(marker, 'click', function() {  
												var marker_map = this.getMap();
												this.info.open(marker_map, this);	// If you call open() without passing a marker (this), the InfoWindow position will suck.
										});
										
										this.markerTrams.push(marker);
								}
								for (var i = 0; i < copyMarkerTrams.length; i++) 
										copyMarkerTrams[i].setMap(null);
						},
						drawMarkersStops: function(datas, style, map) {
								for(var i = 0; i < datas.length; ++i) {
										var contentString = '<div class="info-div-stop">'+
												'<h1 style="font-size: 20px; margin: 0;">Station '+ datas[i].name +'</h1>'+
												'</div>';

										var marker = new google.maps.Marker({
												position: {lat: parseFloat(datas[i].lat), lng: parseFloat(datas[i].lng)} ,
												map: map,
												icon: {url: style, anchor: new google.maps.Point(7,7), scaledSize: new google.maps.Size(14,14)}
										});

										marker.info = new google.maps.InfoWindow({
												content:  contentString
										});
										
										google.maps.event.addListener(marker, 'click', function() {  
												var marker_map = this.getMap();
												this.info.open(marker_map, this);	// If you call open() without passing a marker (this), the InfoWindow position will suck.

										});

								}
						},
						drawLines: function(datas, map) {
								var options = {
										strokeColor: 'violet',
										strokeOpacity: 1.0,
										strokeWeight: 3,
										map: map
								};

								for(var i = 0; i < datas.length; i++) {
										var current_stop = datas[i];
										var current_line = new google.maps.Polyline(options);
										var path = [];
										for(var j = 0; j < current_stop.length; j++) {
												path.push(current_stop[j]);
										}
										current_line.setPath(path);
								}
						}
				};
		})
		.controller('homeCtrl', function($scope, choice) {
				$scope.currentChoice = choice;
				$scope.currentChoice.line = null;
				$scope.currentChoice.direction = null;
				$scope.currentChoice.station = null;
				$scope.inputDirection = true;
				$scope.inputStation = true;
				$scope.cantSearch = true;

				$scope.resetLine = function(){
						$scope.$broadcast('angucomplete-alt:clearInput', 'd');
						$scope.$broadcast('angucomplete-alt:clearInput', 's');
						$scope.inputDirection = true;
						$scope.inputStation = true;
						$scope.cantSearch = true;
						$scope.currentChoice.line = null;
				}
				
				$scope.lineSelected = function(selected){
						if(selected != undefined){
								$scope.currentChoice.line = selected.originalObject;
								$scope.inputDirection = false;
						}
				}

				$scope.resetDirection = function(){
						$scope.$broadcast('angucomplete-alt:clearInput', 's');
						$scope.inputStation = true;
						$scope.cantSearch = true;
						$scope.currentChoice.direction = null;
				}

				$scope.directionSelected = function(selected){
						if(selected != undefined){
								$scope.inputStation = false;
								$scope.currentChoice.direction = selected.originalObject;
						}	
				}
				
				$scope.resetStation = function(){
						$scope.cantSearch = true;
						$scope.currentChoice.station = null;
				}

				$scope.stationSelected = function(selected){
						if(selected != undefined){
								$scope.cantSearch = false;
								$scope.currentChoice.station = selected.originalObject;
						}
				}

				$scope.directionFormat = function(str){
						return {q:str, line:$scope.currentChoice.line.id};
				}
				
				$scope.stationFormat = function(str){
						return {q:str, line:$scope.currentChoice.line.id};
				}
		})
    .controller('mapCtrl', function($scope, $interval, getDatasService, drawInformations, choice) {
    		$scope.currentChoice = choice;
				var _TRAM = $scope.currentChoice.line.id;
				var _SENS = $scope.currentChoice.direction.id == 1 ? 'ALLER' : 'RETOUR';
				//var _STOP = 404;
				var _STATION = $scope.currentChoice.station;
				var geop = new GeoPoint(Number(_STATION.lat), Number(_STATION.lng));
				var boundingCoordinates = geop.boundingCoordinates(3,true);
				var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(boundingCoordinates[0]["_degLat"],boundingCoordinates[0]["_degLon"]), new google.maps.LatLng(boundingCoordinates[1]["_degLat"],boundingCoordinates[1]["_degLon"])); 
				var icon_stop = "img/line-stop.png";
				var icon_tram = "img/tram-marker-icon.png";
					
				var map;
				map = new google.maps.Map(document.getElementById('map'), {
						center: {lat: Number(_STATION.lat), lng: Number(_STATION.lng)},
						//zoom: 14
				});
				map.fitBounds(bounds);
				getDatasService.getStops(_TRAM).then(
						function(answer) {
								var ans = answer.data.results;
								drawInformations.drawMarkersStops(ans, icon_stop, map);
						});

				getDatasService.getLine(_TRAM).then(
						function(answer) {
								drawInformations.drawLines(answer.data.results, map);
						});
				
				getDatasService.getVehicle(_TRAM, _SENS).then(
						function(answer) {
								var ans = answer.data.results;
								drawInformations.drawMarkersTrams(ans, icon_tram, map);								
						});

				$interval(function() { 
						getDatasService.getVehicle(_TRAM, _SENS).then(
						function(answer) {
								var ans = answer.data.results;
								drawInformations.drawMarkersTrams(ans, icon_tram, map);								
						});	
				}, 10000);		
		})
		.controller('myCtrl', function($scope, $interval, $timeout) {
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
						document.getElementById("loaderWrapper").style.display = 'none';
						document.getElementById("train-display").style.display = 'inline-flex';						
				}

				var wrapperCreated = false;

				var k = 0;
				function updateView() {
						document.getElementById("train-display").style.display = 'none';
						document.getElementById("loaderWrapper").style.display = 'block';
						$timeout(function() { httpGetAsync("/datas_"+ (k%3) +".txt", drawInterface);}, 1500);

						k++;
				}
				
				
				var button = document.getElementById("refresh");
				button.addEventListener("click",function(e){
						updateView();
				},false);
				$interval(updateView, 15000);
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
		


