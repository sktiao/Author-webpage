angular.module('webApp', ['ngRoute'])
.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/register', {
		templateUrl: 'partials/register.htm',
		controller: 'registerController'
	})
	.when('/login', {
		templateUrl: 'partials/login.htm',
		controller: 'loginController'
	})
	.when('/stocks', {
		templateUrl: 'partials/stocks.htm',
		controller: 'stocksController'
	})
	.when('/stocks/:stockSymbol', {
		templateUrl: 'partials/stockDetails.htm',
		controller: 'stockDetailsController'
	})
	.otherwise({
		redirectTo: '/stocks'
	});
	
	$locationProvider.html5Mode(true);
})
.factory('Page', function() {
	service = {};
	var title = 'default';
	
	service.getTitle = function() {
		return title;
	};
	
	service.setTitle = function(newTitle) {
		title = newTitle;
	};
	
	return service;
})
.factory('User', function($rootScope, $http, $location) {
	var service = {};
	var isLoggedIn = false;
	var userInfo = {};
	
	service.getIsLoggedIn = function() {
		return isLoggedIn;
	};
	
	service.setIsLoggedIn = function(bool) {
		isLoggedIn = bool;
	};
	
	service.getUserInfo = function() {
		return userInfo;
	};
	
	service.checkToken = function() {
		$http
		.post('services/', {request:'checkToken'})
		.then(function(res) {
			if (res.data.reply == 'success') {
				isLoggedIn = true;
				$rootScope.$broadcast('checkTokenComplete','');
			} else {
				isLoggedIn = false;
			}
		});
	};
	
	service.fetchUserInfo = function(data) {
		service.checkToken();
		var offCheckTokenComplete = $rootScope.$on('checkTokenComplete', function() {
			if (isLoggedIn) {
				$http
				.post('services/', {request:'getUserInfo',data:data})
				.then(function(res) {
					if (res.data.reply == 'success') {
						for (var prop in res.data.data) {
							userInfo[prop] = res.data.data[prop];
						}
						$rootScope.$broadcast('fetchUserInfoComplete','');
					} else {
						console.log(res);
					}
				});
			}
			offCheckTokenComplete();
		});
	};
	
	service.login = function(user,pass) {
		$http
		.post('services/', {request:'login',data:{username:user,password:pass}})
		.then(function(res) {
			if (res.data.reply == 'success') {
				isLoggedIn = true;
				history.back();
			} else {
				console.log(res.data);
			}
		});
	};
	
	service.logout = function() {
		isLoggedIn = false;
		$http
		.post('services/', {request:'logout'})
		.then(function(res) {
			if (res.data.reply == 'success') {
				isLoggedIn = false;
				$location.url('stocks');
			} else {
				console.log(res);
			}
		});
	};
	
	return service;
})
.controller('appController', function($scope, $http, Page, User) {
	$scope.Page = Page;
	$scope.User = User;
})
.controller('registerController', function($scope, $location, $http, Page, User) {
	Page.setTitle('Register');
	User.fetchUserInfo('username,name');
	
	if (User.getIsLoggedIn()) {
		$location.url('stocks');
	}
	
	$scope.submit = function() {
		if ($scope.username && $scope.password && $scope.passwordConfirm && $scope.password === $scope.passwordConfirm) {
			$http
			.post('services/', {request:'register',data:{username:$scope.username,password:$scope.password}})
			.then(function(res) {
				if (res.data.reply == 'success') {
					$scope.registered = true;
				} else {
					console.log(res);
				}
			});
		} else {
			alert('Missing username or password, or passwords different.');
		}
	};
})
.controller('loginController', function($scope, $http, $location, Page, User) {
	Page.setTitle('Log In');
	User.fetchUserInfo('username,name');
	
	if (User.getIsLoggedIn()) {
		$location.url('stocks');
	}
	
	$scope.submit = function() {
		if ($scope.username && $scope.password) {
			User.login($scope.username,$scope.password);
		} else {
			alert('Missing username or password.');
		}
	};
})
.controller('stocksController', function($scope, $http, $location, Page, User) {
	Page.setTitle('Stocks');
	User.fetchUserInfo('username,name,portfolio');
	
	var featuredStocksSymbols = 'GOOG,YHOO,TSLA,NVDA,AAPL';
	$scope.featuredStocks = [];
	$http
	.jsonp('http://finance.yahoo.com/webservice/v1/symbols/'+featuredStocksSymbols+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
	.then(function(res) {
		if (res.data.list.resources.length) {
			for (var i=0; i<res.data.list.resources.length; i++) {
				var stock = {}
				stock.symbol = res.data.list.resources[i].resource.fields.symbol;
				stock.name = res.data.list.resources[i].resource.fields.name;
				stock.price = (Math.round(res.data.list.resources[i].resource.fields.price * 100) / 100).toFixed(2);
				$scope.featuredStocks.push(stock);
			}
		}
	});
	
	$scope.searchStock = function() {
		if ($scope.symbolToSearch) {
			$location.url('/stocks/'+$scope.symbolToSearch);
		}
	};
	
	var offFetchUserInfoComplete = $scope.$on('fetchUserInfoComplete', function() {
		$scope.portfolio = JSON.parse(User.getUserInfo().portfolio);
		if ($scope.portfolio.stocks.length) {
			var portfolioSymbols = '';
			for (var i=0; i<$scope.portfolio.stocks.length; i++) {
				portfolioSymbols += $scope.portfolio.stocks[i].symbol+',';
			}
			$http
			.jsonp('http://finance.yahoo.com/webservice/v1/symbols/'+portfolioSymbols+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
			.then(function(res) {
				$scope.portfolio.totalValue = 0;
				if (res.data.list.resources.length) {
					for (var i=0; i<res.data.list.resources.length; i++) {
						$scope.portfolio.stocks[i].name = res.data.list.resources[i].resource.fields.name;
						$scope.portfolio.stocks[i].price = (Math.round(res.data.list.resources[i].resource.fields.price * 100) / 100).toFixed(2);
						$scope.portfolio.stocks[i].value = (Math.round(res.data.list.resources[i].resource.fields.price * $scope.portfolio.stocks[i].shares * 100) / 100).toFixed(2);
						$scope.portfolio.totalValue += parseFloat($scope.portfolio.stocks[i].value);
					}
				}
				$scope.portfolio.networth = $scope.portfolio.cash + $scope.portfolio.totalValue;
				$scope.portfolio.networth = $scope.portfolio.networth.toFixed(2);
				$scope.portfolio.cash = $scope.portfolio.cash.toFixed(2);
				$scope.portfolio.totalValue = $scope.portfolio.totalValue.toFixed(2);
			});
		}
		offFetchUserInfoComplete();
	});
	
	$scope.stockDetails = function(symbol) {
		$location.url('/stocks/'+symbol);
	};
})
.controller('stockDetailsController', function($scope, $http, $routeParams, $location, Page, User) {
	$scope.symbol = $routeParams.stockSymbol;
	if ($scope.symbol.indexOf(',') !== -1) {
		$scope.symbol = $scope.symbol.split(',')[0];
	}
	Page.setTitle($scope.symbol+' | Stock Details');
	User.fetchUserInfo('username,name,portfolio');
	
	$scope.searchStock = function() {
		if ($scope.symbolToSearch) {
			$location.url('/stocks/'+$scope.symbolToSearch);
		}
	};
	
	$scope.getHistoricalData = function(days) {
		$http
		.jsonp('http://finance.yahoo.com/webservice/v1/symbols/'+$scope.symbol+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
		.then(function(res) {
			if (res.data.list.resources.length) {
				$scope.stock = res.data.list.resources[0].resource.fields;
				$scope.stock.price = (Math.round($scope.stock.price * 100) / 100).toFixed(2);
				$http
				.post('services/', {request:'getStockHistoricals',data:{symbol:$scope.symbol}})
				.then(function(res) {
					res.data.shift();
					var graphArr = [];
					var min = Math.round(res.data[0].split(',')[6]*100);
					var max = min;
					var count = Math.min(days,res.data.length);
					var width = 800/count;
					for (var i=0; i<count; i++) {
						var row = res.data.shift().split(',');
						var open = parseFloat(row[6]).toFixed(2);
						var height = Math.round(row[6]*100);
						min = Math.min(min,height);
						max = Math.max(max,height);
						graphArr.unshift({date:row[0],open:open,height:height});
					}
					var range = max - min;
					for (var i=0; i<count; i++) {
						graphArr[i].height = Math.round((graphArr[i].height - min) / range * 200);
					}
					$scope.graph = {width:width, start:graphArr[0].date, end:graphArr[graphArr.length-1].date, min:min/100, max:max/100, bars:graphArr};
				});
			} else {
				console.log('no such company');
				$location.url('/stocks');
			}
		});
	}
	
	$scope.getHistoricalData(100);
	
	var offFetchUserInfoComplete = $scope.$on('fetchUserInfoComplete', function() {
		if (User.getIsLoggedIn()) {
			$scope.portfolio = JSON.parse(User.getUserInfo().portfolio);
			$scope.symbolSharesOwned = 0;
			for (var i=0; i<$scope.portfolio.stocks.length; i++) {
				if ($scope.portfolio.stocks[i].symbol == $scope.symbol) {
					$scope.symbolSharesOwned = $scope.portfolio.stocks[i].shares;
				}
			}
		}
		offFetchUserInfoComplete();
	});
	
	$scope.buyStock = function() {
		$http
		.jsonp('http://finance.yahoo.com/webservice/v1/symbols/'+$scope.symbol+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
		.then(function(res) {
			if (res.data.list.resources.length) {
				$scope.stock.realPrice = parseFloat(res.data.list.resources[0].resource.fields.price);
				if ($scope.portfolio.cash >= $scope.sharesToBuy * $scope.stock.realPrice) {
					$http
					.post('services/', {request:'buyStock',data:{symbol:$scope.symbol,shares:$scope.sharesToBuy}})
					.then(function(res) {
						if (res.data.reply == 'success') {
							window.location.reload();
						} else {
							console.log(res);
						}
					});
				} else {
					$scope.stock.price = ($scope.stock.realPrice).toFixed(2);
					alert('You do not have enough cash to buy '+$scope.sharesToBuy+' shares of '+$scope.symbol+'.');
				}
			}
		});
	};
	
	$scope.sellStock = function() {
		if ($scope.symbolSharesOwned >= $scope.sharesToSell) {
			$http
			.post('services/', {request:'sellStock',data:{symbol:$scope.symbol,shares:$scope.sharesToSell}})
			.then(function(res) {
				if (res.data.reply == 'success') {
					window.location.reload();
				} else {
					console.log(res);
				}
			});
		} else {
			alert('You do not have that many shares to sell.');
		}
	}
});