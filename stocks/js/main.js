$(function() {
	$('.modal-shadow').on('click', function() {
		$(this).parent().removeClass('active');
	});
	
	$('.stockDetailsModal').find('input[type=number]').on('mouseup', function() {
		$(this).select();
	});
});

(function() {
	angular.module('stocksApp', [])
	.controller('AppController', function($scope, $http) {
		// load portfolio data from cookie, or create one if first time
		// in a production app, the user would login, and user data would be fetched from a database through a server backend
		if (document.cookie.replace(/(?:(?:^|.*;\s*)portfolio\s*\=\s*([^;]*).*$)|^.*$/, "$1") !== '') {
			$scope.portfolio = JSON.parse(document.cookie.replace(/(?:(?:^|.*;\s*)portfolio\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
			fetchPriceData();
		} else {
			document.cookie = 'portfolio={"cash":10000,"stocks":[]}';
			$scope.portfolio = JSON.parse(document.cookie.replace(/(?:(?:^|.*;\s*)portfolio\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
			fetchPriceData();
		}
		
		// load transaction history data from cookie, or create one if first time
		// in a production app, the user would login, and user data would be fetched from a database through a server backend
		if (document.cookie.replace(/(?:(?:^|.*;\s*)transactionHistory\s*\=\s*([^;]*).*$)|^.*$/, "$1") !== '') {
			$scope.transactionHistory = JSON.parse(document.cookie.replace(/(?:(?:^|.*;\s*)transactionHistory\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
		} else {
			document.cookie = 'transactionHistory={"history":[]}';
			$scope.transactionHistory = JSON.parse(document.cookie.replace(/(?:(?:^|.*;\s*)transactionHistory\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
		}
		
		function fetchPriceData() {
			// construct query string from portfolio
			var portfolioSymbols = '';
			for (var i=0; i<$scope.portfolio.stocks.length; i++) {
				portfolioSymbols += $scope.portfolio.stocks[i].symbol+',';
			}
			$scope.portfolioValue = 0;
			
			// fetch price data from yahoo finance
			if (portfolioSymbols.length > 0) {
				$http
				.jsonp('https://finance.yahoo.com/webservice/v1/symbols/'+portfolioSymbols+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
				.then(function(res) {
					var arr = res.data.list.resources;
					if (arr.length === $scope.portfolio.stocks.length) {
						for (var i=0; i<arr.length; i++) {
							$scope.portfolio.stocks[i].priceCurrent = arr[i].resource.fields.price;
							$scope.portfolioValue += parseFloat(arr[i].resource.fields.price)*$scope.portfolio.stocks[i].shares;
						}
					} else {
						console.log('invalid portfolio');
					}
				});
			}
		}
		
		// open stock details modal
		$scope.showDetails = function(symbol) {
			$http
			.jsonp('https://finance.yahoo.com/webservice/v1/symbols/'+symbol+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
			.then(function(res) {
				if (res.data.list.resources.length === 1) {
					$scope.stockDetails = res.data.list.resources[0].resource.fields;
					$scope.stockDetails.shares = 0;
					for (var i=0; i<$scope.portfolio.stocks.length; i++) {
						if ($scope.portfolio.stocks[i].symbol === symbol) {
							$scope.stockDetails.shares = $scope.portfolio.stocks[i].shares;
						}
					}
					$scope.sharesToBuy = 0;
					$scope.sharesToSell = 0;
					$('.stockDetailsModal').addClass('active');
				} else {
					console.log('invalid symbol');
				}
			});
		};
		
		$scope.closeDetails = function() {
			$('.stockDetailsModal').removeClass('active');
		};
		
		// buy stock
		$scope.buyStock = function() {
			if (parseInt($scope.sharesToBuy) === $scope.sharesToBuy && $scope.sharesToBuy > 0) {
				$http
				.jsonp('https://finance.yahoo.com/webservice/v1/symbols/'+$scope.stockDetails.symbol+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
				.then(function(res) {
					if (res.data.list.resources.length === 1) {
						var price = res.data.list.resources[0].resource.fields.price;
						var totalPrice = $scope.sharesToBuy*price;
						if ($scope.portfolio.cash >= totalPrice) {
							$scope.portfolio.cash -= totalPrice;
							var stockExists = false;
							for (var i=0; i<$scope.portfolio.stocks.length; i++) {
								if ($scope.portfolio.stocks[i].symbol === $scope.stockDetails.symbol) {
									$scope.portfolio.stocks[i].priceAvg = ($scope.portfolio.stocks[i].priceAvg*$scope.portfolio.stocks[i].shares+$scope.sharesToBuy*price)/($scope.portfolio.stocks[i].shares+parseInt($scope.sharesToBuy));
									$scope.portfolio.stocks[i].shares = $scope.portfolio.stocks[i].shares + parseInt($scope.sharesToBuy);
									stockExists = true;
								}
							}
							if (!stockExists) {
								$scope.portfolio.stocks.push({symbol:$scope.stockDetails.symbol,shares:parseInt($scope.sharesToBuy),priceAvg:price});
							}
							$scope.transactionHistory.history.unshift({date:new Date().toISOString().slice(0,10),text:'Bought '+$scope.sharesToBuy+' share'+($scope.sharesToBuy===1?'':'s')+' of '+$scope.stockDetails.symbol+' at a price of $'+parseFloat(price).toFixed(2)+'.'});
							savePortfolio()
							fetchPriceData();
							$('.stockDetailsModal').removeClass('active');
						} else {
							alert('You do not have enough cash to buy that many shares!');
						}
					} else {
						console.log('invalid symbol');
					}
				});
			} else {
				alert('Please enter a positive integer for shares to buy.');
			}
		};
		
		// sell stock
		$scope.sellStock = function() {
			if (parseInt($scope.sharesToSell) === $scope.sharesToSell && $scope.sharesToSell > 0) {
				$http
				.jsonp('https://finance.yahoo.com/webservice/v1/symbols/'+$scope.stockDetails.symbol+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
				.then(function(res) {
					if (res.data.list.resources.length === 1) {
						var price = res.data.list.resources[0].resource.fields.price;
						var totalPrice = $scope.sharesToBuy*price;
						var sharesOwned = 0;
						for (var i=0; i<$scope.portfolio.stocks.length; i++) {
							if ($scope.portfolio.stocks[i].symbol === $scope.stockDetails.symbol) {
								sharesOwned = $scope.portfolio.stocks[i].shares;
							}
						}
						if (sharesOwned >= $scope.sharesToSell) {
							$scope.portfolio.cash += totalPrice;
							var sharesDepleted = -1;
							for (var i=0; i<$scope.portfolio.stocks.length; i++) {
								if ($scope.portfolio.stocks[i].symbol === $scope.stockDetails.symbol) {
									$scope.portfolio.stocks[i].shares -= parseInt($scope.sharesToSell);
									if ($scope.portfolio.stocks[i].shares === 0) {
										sharesDepleted = i;
									}
								}
							}
							if (sharesDepleted >= 0) {
								$scope.portfolio.stocks.splice(sharesDepleted,1);
							}
							$scope.transactionHistory.history.unshift({date:new Date().toISOString().slice(0,10),text:'Sold '+$scope.sharesToSell+' share'+($scope.sharesToBuy===1?'':'s')+' of '+$scope.stockDetails.symbol+' at a price of $'+parseFloat(price).toFixed(2)+'.'});
							savePortfolio()
							fetchPriceData();
							$('.stockDetailsModal').removeClass('active');
						} else {
							alert('You do not have that many shares to sell!');
						}
					} else {
						console.log('invalid symbol');
					}
				});
			} else {
				alert('Please enter a positive integer for shares to sell.');
			}
		};
		
		// save portfolio to cookie
		// in a production app, the server backend would take care of updating the database
		function savePortfolio() {
			document.cookie = 'portfolio='+JSON.stringify($scope.portfolio);
			var truncatedHistory = $scope.transactionHistory;
			truncatedHistory.history = truncatedHistory.history.slice(0,20);
			document.cookie = 'transactionHistory='+JSON.stringify(truncatedHistory);
		}
		
		// search
		$scope.searchResults = [];
		$scope.search = function() {
			$http
			.jsonp('https://finance.yahoo.com/webservice/v1/symbols/'+$scope.searchSymbol+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
			.then(function(res) {
				var arr = res.data.list.resources;
				if (arr.length > 0) {
					$scope.searchError = '';
					for (var i=0; i<arr.length; i++) {
						$scope.searchResults.unshift({symbol:arr[i].resource.fields.symbol,name:arr[i].resource.fields.name,price:arr[i].resource.fields.price});
					}
					$scope.searchSymbol = '';
				} else {
					$scope.searchError = 'No results for that stock symbol.';
				}
			});
		};
		
		// reset portfolio by wiping the cookie
		// in a production app, the server backend would take care of updating the database
		$scope.resetPortfolio = function() {
			if (confirm('You will go back to having $10,000 and zero shares. Are you sure you want to reset your portfolio?')) {
				document.cookie = 'portfolio=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
				document.cookie = 'transactionHistory=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
				location.reload();
			}
		};
	});
})();