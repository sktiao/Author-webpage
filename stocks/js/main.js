(function() {
	angular.module('stocksApp', [])
	.controller('appController', function($scope, $http) {
		// grab portfolio data from json file
		// in a real app, the user would login, and user data would be fetched from a datbase through a server backend
		$http
		.get('portfolio.json')
		.then(function(res) {
			$scope.portfolio = res.data;
		
			$scope.portfolioValue = 0;
			var portfolioSymbols = '';
			for (var i=0; i<$scope.portfolio.stocks.length; i++) {
				portfolioSymbols += $scope.portfolio.stocks[i].symbol+',';
			}
			$http
			.jsonp('http://finance.yahoo.com/webservice/v1/symbols/'+portfolioSymbols+'/quote?format=json&view=detail&callback=JSON_CALLBACK')
			.then(function(res) {
				var arr = res.data.list.resources;
				for (var i=0; i<arr.length; i++) {
					$scope.portfolio.stocks[i].priceCurrent = arr[i].resource.fields.price;
					$scope.portfolioValue += parseFloat(arr[i].resource.fields.price)*$scope.portfolio.stocks[i].shares;
				}
			});
		});
	});
})();