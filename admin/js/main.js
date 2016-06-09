angular
.module('webApp', ['ngRoute'])
.config(function($routeProvider,$locationProvider) {
	$routeProvider
	.when('/productList', {
		templateUrl: 'partials/productList.htm',
		controller: 'productListController',
	})
	.otherwise({
		redirectTo: '/productList',
	});
	
	$locationProvider.html5Mode(true);
})
.factory('Page', function() {
	service = {};
	var title = 'default';
	
	service.setTitle = function(newTitle) {
		title = newTitle;
	};
	
	service.getTitle = function() {
		return title;
	};
	
	return service;
})
.controller('appController', function($scope, Page) {
	$scope.Page = Page;
})
.controller('productListController', function($scope, Page, $http) {
	$scope.Page.setTitle('Product List');
	
	// get product list
	$scope.getProductList = function() {
		$http
		.post('services/', {request:'getProductList'})
		.success(function(result) {
			if (result.reply == 'success') {
				$scope.productList = JSON.parse(result.data);
			} else {
				console.log(result);
			}
		});
	};
	
	$scope.getProductList();
	
	// filter products
	$scope.filterProductsShow = function(index) {
		if ($scope.productFilter) {
			// filter by id
			if ($scope.productFilter.id && $scope.productFilter.id !== "" && $scope.productList[index].id !== $scope.productFilter.id) {
				return false;
			}
			// filter by name
			if ($scope.productFilter.nameValue && $scope.productFilter.nameValue !== "") {
				var arr = $scope.productFilter.nameValue.split(",");
				for (var i=0; i<arr.length; i++) {
					arr[i] = arr[i].replace(/^\s+|\s+$/g, '').toLowerCase();
				}
				if ($scope.productFilter.nameOperator === 'any') {
					var anyNameFail = true;
					for (var i=0; i<arr.length; i++) {
						if (arr[i] !== "" && $scope.productList[index].name.toLowerCase().indexOf(arr[i]) !== -1) {
							anyNameFail = false;
						}
					}
					if (anyNameFail) {
						return false;
					}
				} else if ($scope.productFilter.nameOperator === 'all') {
					for (var i=0; i<arr.length; i++) {
						if ($scope.productList[index].name.toLowerCase().indexOf(arr[i]) === -1) {
							return false;
						}
					}
				}
			}
			// filter by price
			if ($scope.productFilter.priceValue && $scope.productFilter.priceValue !== "") {
				if ($scope.productFilter.priceOperator == 'less') {
					if (parseFloat($scope.productList[index].price) >= parseFloat($scope.productFilter.priceValue)) {
						return false;
					}
				} else if ($scope.productFilter.priceOperator == 'lessEqual') {
					if (parseFloat($scope.productList[index].price) > parseFloat($scope.productFilter.priceValue)) {
						return false;
					}
				} else if ($scope.productFilter.priceOperator == 'equal') {
					if (parseFloat($scope.productList[index].price) !== parseFloat($scope.productFilter.priceValue)) {
						return false;
					}
				} else if ($scope.productFilter.priceOperator == 'greaterEqual') {
					if (parseFloat($scope.productList[index].price) < parseFloat($scope.productFilter.priceValue)) {
						return false;
					}
				} else if ($scope.productFilter.priceOperator == 'greater') {
					if (parseFloat($scope.productList[index].price) <= parseFloat($scope.productFilter.priceValue)) {
						return false;
					}
				}
			}
			// filter by keywords
			if ($scope.productFilter.keywordsValue && $scope.productFilter.keywordsValue !== "") {
				var arr = $scope.productFilter.keywordsValue.split(",");
				for (var i=0; i<arr.length; i++) {
					arr[i] = arr[i].replace(/^\s+|\s+$/g, '').toLowerCase();
				}
				if ($scope.productFilter.keywordsOperator === 'any') {
					var anyKeywordFail = true;
					for (var i=0; i<arr.length; i++) {
						if (arr[i] !== "" && $scope.productList[index].keywords.toLowerCase().indexOf(arr[i]) !== -1) {
							anyKeywordFail = false;
						}
					}
					if (anyKeywordFail) {
						return false;
					}
				} else if ($scope.productFilter.keywordsOperator === 'all') {
					for (var i=0; i<arr.length; i++) {
						if ($scope.productList[index].keywords.toLowerCase().indexOf(arr[i]) === -1) {
							return false;
						}
					}
				}
			}
			// filter by description
			if ($scope.productFilter.descriptionValue && $scope.productFilter.descriptionValue !== "") {
				var arr = $scope.productFilter.descriptionValue.split(",");
				for (var i=0; i<arr.length; i++) {
					arr[i] = arr[i].replace(/^\s+|\s+$/g, '').toLowerCase();
				}
				if ($scope.productFilter.descriptionOperator === 'any') {
					var anyDescriptionFail = true;
					for (var i=0; i<arr.length; i++) {
						if (arr[i] !== "" && $scope.productList[index].description.toLowerCase().indexOf(arr[i]) !== -1) {
							anyDescriptionFail = false;
						}
					}
					if (anyDescriptionFail) {
						return false;
						
					}
				} else if ($scope.productFilter.descriptionOperator === 'all') {
					for (var i=0; i<arr.length; i++) {
						if ($scope.productList[index].description.toLowerCase().indexOf(arr[i]) === -1) {
							return false;
						}
					}
				}
			}
			// filter by quantity
			if ($scope.productFilter.quantityValue && $scope.productFilter.quantityValue !== "") {
				if ($scope.productFilter.quantityOperator == 'less') {
					if (parseFloat($scope.productList[index].quantity) >= parseFloat($scope.productFilter.quantityValue)) {
						return false;
					}
				} else if ($scope.productFilter.quantityOperator == 'lessEqual') {
					if (parseFloat($scope.productList[index].quantity) > parseFloat($scope.productFilter.quantityValue)) {
						return false;
					}
				} else if ($scope.productFilter.quantityOperator == 'equal') {
					if (parseFloat($scope.productList[index].quantity) !== parseFloat($scope.productFilter.quantityValue)) {
						return false;
					}
				} else if ($scope.productFilter.quantityOperator == 'greaterEqual') {
					if (parseFloat($scope.productList[index].quantity) < parseFloat($scope.productFilter.quantityValue)) {
						return false;
					}
				} else if ($scope.productFilter.quantityOperator == 'greater') {
					if (parseFloat($scope.productList[index].quantity) <= parseFloat($scope.productFilter.quantityValue)) {
						return false;
					}
				}
			}
			return true;
		} else {
			return true;
		}
	};
	
	$scope.filterProductsClear = function() {
		$scope.productFilter = {};
	};
	
	// add products
	
	$scope.addProductsList = [];
	
	$scope.addProductsAdd = function() {
		$scope.addProductsList.push({});
	};
	
	$scope.addProductsRemove = function(index) {
		if (window.confirm('Remove '+$scope.addProductsList[index].name+'?')) {
			$scope.addProductsList.splice(index,1);
		}
	};
	
	$scope.addProductsSubmit = function() {
		$http
		.post('services/', {request:'addProducts', data:$scope.addProductsList})
		.success(function(result) {
			if (result.reply == 'success') {
				$scope.addProductsList = [];
				$scope.getProductList();
			} else {
				console.log(result);
			}
		});
	};
	
	// edit product
	
	// delete product
	$scope.deleteProduct = function(index) {
		if (window.confirm('Delete (ID '+$scope.productList[index].id+') '+$scope.productList[index].name+'?')) {
			$http
			.post('services/', {request:'deleteProduct', data:$scope.productList[index].id})
			.success(function(result) {
				if (result.reply == 'success') {
					$scope.productList.splice(index,1);
				} else {
					console.log(result);
				}
			});
		}
	};
});