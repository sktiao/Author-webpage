angular
.module('webApp', ['ngRoute'])
.config(function($routeProvider,$locationProvider) {
	$routeProvider
	.when('/categoryList', {
		templateUrl: 'partials/categoryList.htm',
		controller: 'categoryListController',
	})
	.when('/productList', {
		templateUrl: 'partials/productList.htm',
		controller: 'productListController',
	})
	.otherwise({
		redirectTo: '/categoryList',
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
.controller('categoryListController', function($scope, $http) {
	$scope.Page.setTitle('Category List');
	
	// get category list
	$scope.getCategoryList = function() {
		$http
		.post('services/', {request:'getCategoryList'})
		.success(function(result) {
			if (result.reply == 'success') {
				$scope.categoryList = JSON.parse(result.message);
			}
		});
	};
	
	// filter category list
	$scope.categoryListFilter = function(category) {
		if ($scope.categoryFilterId
			|| $scope.categoryFilterName
		) {
			if ($scope.categoryFilterId && category.id != $scope.categoryFilterId) {
				return false;
			}
			if ($scope.categoryFilterName && category.name.toLowerCase().indexOf($scope.categoryFilterName.toLowerCase()) == -1) {
				return false;
			}
		}
		return true;
	};
})
.controller('productListController', function($scope, $http) {
	$scope.Page.setTitle('Product List');
	
	// get product list
	$scope.getProductList = function() {
		$http
		.post('services/', {request:'getProductList'})
		.success(function(result) {
			if (result.reply == 'success') {
				$scope.productList = JSON.parse(result.message);
			}
		});
	};
	
	// get category list
	$scope.getCategoryList = function() {
		$http
		.post('services/', {request:'getCategoryList'})
		.success(function(result) {
			if (result.reply == 'success') {
				$scope.categoryList = JSON.parse(result.message);
				$scope.categoryDictionary = [];
				for(var i=0; i<$scope.categoryList.length; i++) {
					$scope.categoryDictionary[$scope.categoryList[i].id] = $scope.categoryList[i].name;
				}
			}
		});
	};
	
	// filter product list
	$scope.productListFilter = function(product) {
		if ($scope.productFilterId
			|| $scope.productFilterCategory
			|| $scope.productFilterName
			|| $scope.productFilterPriceValue
			|| $scope.productFilterBrand
			|| $scope.productFilterDescription
			|| $scope.productFilterQuantityValue
		) {
			if ($scope.productFilterId && product.id != $scope.productFilterId) {
				return false;
			}
			if ($scope.productFilterCategory && product.category.toLowerCase() != $scope.productFilterCategory.toLowerCase()) {
				return false;
			}
			if ($scope.productFilterName && product.name.toLowerCase().indexOf($scope.productFilterName.toLowerCase()) == -1) {
				return false;
			}
			if ($scope.productFilterPriceValue && $scope.productFilterPriceOperator != '') {
				if ($scope.productFilterPriceOperator == 0) {
					if (parseFloat(product.price) >= $scope.productFilterPriceValue) {
						return false;
					}
				}
				if ($scope.productFilterPriceOperator == 1) {
					if (parseFloat(product.price) != $scope.productFilterPriceValue) {
						return false;
					}
				}
				if ($scope.productFilterPriceOperator == 2) {
					if (parseFloat(product.price) <= $scope.productFilterPriceValue) {
						return false;
					}
				}
			}
			if ($scope.productFilterBrand && product.brand.toLowerCase().indexOf($scope.productFilterBrand.toLowerCase()) == -1) {
				return false;
			}
			if ($scope.productFilterDescription && product.description.toLowerCase().indexOf($scope.productFilterDescription.toLowerCase()) == -1) {
				return false;
			}
			if ($scope.productFilterQuantityValue && $scope.productFilterQuantityOperator != '') {
				if ($scope.productFilterQuantityOperator == 0) {
					if (product.quantity >= $scope.productFilterQuantityValue) {
						return false;
					}
				}
				if ($scope.productFilterQuantityOperator == 1) {
					if (product.quantity != $scope.productFilterQuantityValue) {
						return false;
					}
				}
				if ($scope.productFilterQuantityOperator == 2) {
					if (product.quantity <= $scope.productFilterQuantityValue) {
						return false;
					}
				}
			}
		}
		return true;
	};
});