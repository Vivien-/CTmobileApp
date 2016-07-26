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
				//var serveur_ip = "http://192.168.1.13:8080";
				var serveur_ip = ""; // à changer pour l'ip du serveur (ex celle du dessu) pour tester sur un device 
				return {
						getLine: function(id) {
								return $http.get(serveur_ip + "/data/lineGeometry?id=" + id);
						},
						getStops: function(lineId) {
								return $http.get(serveur_ip + "/data/stationsPosition?id=" + lineId);
						},
						getVehicle: function(lineId, sens) {
								return $http.get(serveur_ip + "/data/getVehicle?id=" + lineId + "&sens=" + sens);								
						}/*,
						getStationInformation: function(lineId, stationId) {
								return $http.get("/data/stationInformation?lineId=" + lineId + "&stationId=" + stationId);
						}*/
				}
		})
		.factory('drawInformations', function($http, getDatasService) {
				function secondsToString(seconds)	{
						var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
						var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
						return numminutes + "m " + numseconds + "s";
				}
				
				return {
						markerTrams : [],
						drawMarkersTrams: function(datas_complete, style, lineId, map) {
								//var copyMarkerTrams = this.markerTrams;
								//this.markerTrams = [];
								for (var i = 0; i < this.markerTrams.length; i++) 
										this.markerTrams[i].setMap(null);
								this.markerTrams = [];
								var datas = datas_complete.vehicules;
								
								for(var i = 0; i < datas.length; ++i) {
										var positionLatLng = {lat: datas[i].lat, lng: datas[i].lng};

										var lateTime = datas[i].timing;
										var color = "red";
										var _text = "<span class='infospan' style='color:red;'> En retard de " + secondsToString(lateTime) + "</span>";
										if(lateTime < 0) {
												_text = "<span class='infospan' style='color:green;'> En avance de " + secondsToString(Math.abs(lateTime)) + "</span>";
												color = "green";
										}	else if (lateTime == 0) {
												_text = "<span class='infospan' style='color:blue;'> Vehicule à l'heure</span>";
												color = "blue";
										}
										
										var contentString = '<h2 style="font-size: 20px; margin: 0;">Direction '+ datas_complete.name +'</h2>'+
												_text + "<br>" +
												'<span class="infospan">Vitesse: ' + datas[i].speed + "km/h</span><br>" +
												'</div>';

										var marker = new google.maps.Marker({
												position: positionLatLng,
												map: map,
												optimized: false,
												zIndex:99999999,
												icon: {url: style, scaledSize: new google.maps.Size(40,40), anchor: new google.maps.Point(20,20) }
										});

										var arrow = {
												path: 'M8 16 L4 0 L0 16 Z',
												strokeColor: color,
												fillColor: color,
												fillOpacity: 1,
												rotation: parseInt(datas[i].orientation),
												anchor: new google.maps.Point(4,27)
										};
										
										var marker_arrow = new google.maps.Marker({
												position: positionLatLng,
												map: map,
												optimized: false,
												zIndex:99999999,
												icon: arrow
										});
										
										marker.info = new google.maps.InfoWindow({
												content:  contentString
										});
										
										google.maps.event.addListener(marker, 'click', function() {  
												var marker_map = this.getMap();
												this.info.open(marker_map, this);	// If you call open() without passing a marker (this), the InfoWindow position will suck.
										});
										
										this.markerTrams.push(marker);
										this.markerTrams.push(marker_arrow);
								}
								
						},
						drawMarkersStops: function(datas, station_selected_id, map) {
								for(var i = 0; i < datas.length; ++i) {
										var contentString = '<div class="info-div-stop">'+
												'<h2 style="font-size: 20px; margin: 0;">Station '+ datas[i].name +'</h2>'+
												'</div>';

										var style = {url: "img/map_station.png", anchor: new google.maps.Point(7,7), scaledSize: new google.maps.Size(14,14)};
										if(station_selected_id == datas[i].id)
												style = {url: "img/map_station_highlight.png", anchor: new google.maps.Point(12,12), scaledSize: new google.maps.Size(24,24)};
										var marker = new google.maps.Marker({
												position: {lat: parseFloat(datas[i].lat), lng: parseFloat(datas[i].lng)} ,
												map: map,
//												icon: {url: style, anchor: new google.maps.Point(7,7), scaledSize: new google.maps.Size(14,14)}
												icon: style
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
										strokeColor: '#82227b',
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
				var _SENS = $scope.currentChoice.direction.sens;
				var _STATION = $scope.currentChoice.station;
				
				var geop = new GeoPoint(Number(_STATION.lat), Number(_STATION.lng));
				var boundingCoordinates = geop.boundingCoordinates(1,true);
				var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(boundingCoordinates[0]["_degLat"],boundingCoordinates[0]["_degLon"]), new google.maps.LatLng(boundingCoordinates[1]["_degLat"],boundingCoordinates[1]["_degLon"])); 
				var icon_tram = "img/ic_map_train_situation.png";	

				var map;
				map = new google.maps.Map(document.getElementById('map'), {
						center: {lat: Number(_STATION.lat), lng: Number(_STATION.lng)},
    					disableDefaultUI: true
				});
				map.fitBounds(bounds);
				var legend = document.getElementById('legend');
				var div = document.createElement('div');
        div.innerHTML = '<img style="vertical-align:middle" src="img/ic_line.png"> Ligne: <span class="violet">'+$scope.currentChoice.line.name+'</span><br><img style="vertical-align:middle" src="img/ic_direction.png"> Direction: <span class="violet">'+$scope.currentChoice.direction.name+'</span><br><img style="vertical-align:middle" src="img/ic_station.png"> Station: <span class="violet">'+$scope.currentChoice.station.name+'</span>';
        legend.appendChild(div);
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(legend);

				document.getElementById("left").innerHTML = $scope.currentChoice.station.name;
				document.getElementById("right").innerHTML = $scope.currentChoice.direction.name;

				
				getDatasService.getStops(_TRAM).then(
						function(answer) {
								var ans = answer.data.results;
								drawInformations.drawMarkersStops(ans, _STATION.id, map);
						});

				getDatasService.getLine(_TRAM).then(
						function(answer) {
								drawInformations.drawLines(answer.data.results, map);
						});

				
				getDatasService.getVehicle(_TRAM, _SENS).then(
						function(answer) {
								var ans = answer.data.results;
								drawInformations.drawMarkersTrams(ans, icon_tram, _TRAM, map);								
						});

				var promise = $interval(function() { 
						getDatasService.getVehicle(_TRAM, _SENS).then(
						function(answer) {
								var ans = answer.data.results;
								drawInformations.drawMarkersTrams(ans, icon_tram, _TRAM, map);								
						});	
				}, 10000);

				var home = document.getElementById('home');
				home.onclick = function(){
					if(promise != undefined){
						$interval.cancel(promise);
					}
				}		
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
						var width = Math.floor(100 / json.length);
						for(var i = 0; i < json.length - 1; i++) {
								var node = document.createElement("span");
								node.className = "button car";
								node.id = json[i].id;
								if(typeof json[i].best != "undefined") {
										node.className += " best";
								}
								node.style.width = width + "%";
								document.getElementById("train-display").appendChild(node);
						}
						
						width = 100 - (json.length - 1) * width;
						var node = document.createElement("span");
						node.className = "button img car";
						node.id = "front-vehicle";
						node.style.backgroundColor = colors[parseInt(json[json.length-1].occupation)];
						node.style.width = width + "%";
						document.getElementById("train-display").appendChild(node);
				}

				function setOccupation(json) {
						for(var i = 0; i < json.length - 1; i++) {
								var node = document.getElementById(json[i].id);
								node.style.backgroundColor = colors[parseInt(json[i].occupation)];
								node.innerHTML = json[i].occupation + "%";
						}
						var node = document.getElementById("front-vehicle");
						node.style.backgroundColor = colors[parseInt(json[i].occupation)];
						node.innerHTML = json[json.length - 1].occupation + "%"
				}

				function drawInterface(response) {
						var json = JSON.parse(response);
						var trainData = getTrainData(json);
						var context = getContext(json);
						createCars(trainData);
						document.getElementById("loaderWrapper").style.display = 'none';
						document.getElementById("train-display").style.display = 'inline-flex';						
				}

				var wrapperCreated = false;

				var k = 0;
				function updateView() {
						document.getElementById("train-display").style.display = 'none';
						document.getElementById("loaderWrapper").style.display = 'block';
						$timeout(function() { httpGetAsync("datas_"+ (k%3) +".txt", drawInterface);}, 1500);

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
		


