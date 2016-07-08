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
								return $http.get("http://data.bordeaux-metropole.fr/wps?key="+_KEY+"&service=WPS&version=1.0.0&request=Execute&Identifier=saeiv_troncons_sens&DataInputs=GID%3D" + id,
																 {transformResponse: function (cnv) {
																		 var x2js = new X2JS();
																		 var aftCnv = x2js.xml_str2json(cnv);
																		 return aftCnv;
																 }});
						},
						getStops: function(lineId) {
								return $http.get("http://data.bordeaux-metropole.fr/wps?key="+_KEY+"&service=WPS&version=1.0.0&request=Execute&Identifier=saeiv_arrets_sens&DataInputs=GID%3D"+lineId,
																 {transformResponse: function (cnv) {
																		 var x2js = new X2JS();
																		 var aftCnv = x2js.xml_str2json(cnv);
																		 return aftCnv;
																 }});
						},
						getTrams: function(lineId) {
								var filter = "%3CFilter%3E%3CAND%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3ERS_SV_LIGNE_A%3C%2FPropertyName%3E%3CLiteral%3E"+lineId+"%3C%2FLiteral%3E%3C%2FPropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3ESENS%3C%2FPropertyName%3E%3CLiteral%3EALLER%3C%2FLiteral%3E%3C%2FPropertyIsEqualTo%3E%3C%2FAND%3E%3C%2FFilter%3E";
								return $http.get("http://data.bordeaux-metropole.fr/wfs?key="+_KEY+"&REQUEST=GetFeature&SERVICE=WFS&TYPENAME=SV_VEHIC_P&VERSION=1.1.0&Filter="+filter,
																 {transformResponse: function (cnv) {
																		 var x2js = new X2JS();
																		 var aftCnv = x2js.xml_str2json(cnv);
																		 return aftCnv;
																 }});
						}
				}
		})
		.factory('drawInformations', function($http) {

				function rgf93tomercator(point) {
						var firstProjection = '+proj=lcc +lat_1=44.25 +lat_2=45.75 +lat_0=45 +lon_0=3 +x_0=1700000 +y_0=4200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ';
						var secondProjection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
						var res = proj4(firstProjection,secondProjection, point);
						return {lat: res[1], lng: res[0]}
				}

				function getLatLngTrams(data) {
						var pos = data.SV_VEHIC_P.msGeometry.Point.pos.__text.split(" ").map(Number);
						var latlng = rgf93tomercator(pos);
						return latlng;
				}

				function getLatLngStops(data) {
						if(typeof data.Data.ComplexData.featureMember.SV_ARRET_P.Geometry.Point.pos.__text != 'undefined') {
								var pos = data.Data.ComplexData.featureMember.SV_ARRET_P.Geometry.Point.pos.__text.split(" ").map(Number);
								var latlng = rgf93tomercator(pos);
						}
						return latlng;
				}

				function getLabel(data) {
						var lateTime = data.SV_VEHIC_P.RETARD.__text;
						var text = "Late by " + lateTime + "s";
						if(lateTime < 0)
								text = "Ahead by " + Math.abs(lateTime) + "s";
						return text;
				}

				return {
						drawMarkersTrams: function(datas, style, map) {
								for(var i = 0; i < datas.length; ++i) {
										var positionLatLng = getLatLngTrams(datas[i]);
										var label = getLabel(datas[i]);
										new google.maps.Marker({
												position: positionLatLng,
												map: map,
												title: label
												//												icon: style
										});
								}
						},
						drawMarkersStops: function(datas, style, map) {
								for(var i = 0; i < datas.length; ++i) {
										var positionLatLng = getLatLngStops(datas[i]);
										//									var label = getLabel(datas[i]);
										new google.maps.Marker({
												position: positionLatLng,
												map: map,
												//												title: label,
												icon: {url: style, anchor: new google.maps.Point(15,15)}
										});
								}
						},
						drawLines: function(lineId, map) {
								function drawLine(polyline, datas) {
										var listPaths = datas.split(" ").map(Number);
										var path = [];
										for(var j = 0; j+1 < listPaths.length; j+=2) {
												var mercatorpos = rgf93tomercator([listPaths[j], listPaths[j+1]]);
 												if(mercatorpos.lat > 43 && mercatorpos.lat < 45 && mercatorpos.lng > -1 && mercatorpos.lng < 0) {
														path.push(mercatorpos);
												}
										}
										polyline.setPath(path);
								}

								var options = {
										strokeColor: '#4285F4',
										strokeOpacity: 1.0,
										strokeWeight: 3,
										map: map
								};
								
								var poly_b = new google.maps.Polyline(options);
								var poly_b_bis = new google.maps.Polyline(options);
								var poly_a = new google.maps.Polyline(options);
								var poly_a_bis = new google.maps.Polyline(options);
								var poly_c = new google.maps.Polyline(options);

								if(lineId == 59) { //ligne A
										$http.get("datas/datas_a.txt").then(
												function(answer) {
														drawLine(poly_a, answer.data);
												});
										$http.get("datas/datas_a_bis.txt").then(
												function(answer) {
														drawLine(poly_a_bis, answer.data);
												});
								}
								
								if(lineId == 60) { //ligne B
										$http.get("datas/datas_b.txt").then(
												function(answer) {
														drawLine(poly_b, answer.data);
												});
										$http.get("datas/datas_b_bis.txt").then(
												function(answer) {
														drawLine(poly_b_bis, answer.data);
												});
								}								
								
								if(lineId == 61) { //ligne C
										$http.get("datas/datas_c.txt").then(
												function(answer) {
														drawLine(poly_c, answer.data);
												});
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
    		console.log(choice);
    		$scope.currentChoice = choice;
				var _TRAM = $scope.currentChoice.line.id;
				var _SENS = 'ALLER';
				var _STOP = 404;
				
				var icon_stop = "img/line-stop.png";
				var icon_tram = "img/position_stop.png";
				
				var map;
				map = new google.maps.Map(document.getElementById('map'), {
						center: {lat: 44.8357953, lng: -0.5735781},
						zoom: 14
				});

				var promiseStops = getDatasService.getStops(_TRAM);
				promiseStops.then(
						function(answer) {
								var ans = answer.data.ExecuteResponse.ProcessOutputs.Output;
								drawInformations.drawMarkersStops(ans, icon_stop, map);
						});
				
				drawInformations.drawLines(_TRAM, map);
				
				var promiseTrams = getDatasService.getTrams(_TRAM);
				promiseTrams.then(
						function(answer) {
								var ans = answer.data.FeatureCollection.featureMember;
								drawInformations.drawMarkersTrams(ans, icon_tram, map);								
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
		


