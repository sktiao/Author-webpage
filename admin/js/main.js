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
	
	// add category
	$scope.addCategory = function(name,image) {
		var formData = new FormData(document.getElementById('addCategoryImage-form'));
		if (name && document.getElementById('addCategoryImage-input').files[0]) {
			$http
			.post('services/', {request:'addCategory', name:name})
			.success(function(result) {
				console.log(result);
				if (result.reply == 'success') {
					$scope.getCategoryList();
				}
			});
			var fd = new FormData(document.getElementById('addCategoryImage-form'));
			$.ajax({
				url: 'services/addCategoryImage-upload.php',
				method: 'POST',
				data: fd,
				contentType: false,
				processData: false,
				success: function(res) {
					console.log(res);
				}
			});
		} else {
			alert('You must fill in every field when adding new categories.');
		}
	};
	
	$('#addCategoryImage-input').on('change', function(e) {
		console.log(1);
		var src = window.URL.createObjectURL(this.files[0]);
		$('#addCategoryImage-preview').attr('src',src);
	});
	
	// edit category
	$scope.editCategory = function(index,category) {
		$scope.editCategoryIndex = index;
		category.tempId = category.id;
		category.tempName = category.name;
	};
	
	$scope.updateCategory = function(id,newId,newName) {
		if (id && newId && newName && document.getElementById('updateCategoryImage-input').files[0]) {
			$http
			.post('services/', {request:'updateCategory', id:id, newId:newId, newName:newName})
			.success(function(result) {
				if (result.reply == 'success') {
					$scope.getCategoryList();
					$scope.cancelEditCategory();
				}
			});
			var fd = new FormData(document.getElementById('editCategoryImage-form'));
			$.ajax({
				url: 'services/updateCategoryImage-upload.php',
				method: 'POST',
				data: fd,
				contentType: false,
				processData: false,
				success: function(res) {
					console.log(res);
				}
			});
		} else {
			alert('You must fill in every field when editing categories.');
		}
	};
	
	$scope.cancelEditCategory = function() {
		$scope.editCategoryIndex = null;
	};
	
	$scope.editCategoryImageBind = function() {
		$(this).find('#editCategoryImage-input').on('change', function(e) {
			console.log(1);
			var src = window.URL.createObjectURL(this.files[0]);
			$('#editCategoryImage-preview').attr('src',src);
		});
	};
	
	// delete category
	$scope.deleteCategory = function(id,name) {
		if (window.confirm('Are you sure you want to delete Category ID '+id+': "'+name+'"?')) {
			$http
			.post('services/', {request:'deleteCategory', id:id})
			.success(function(result) {
				if (result.reply == 'success') {
					$scope.getCategoryList();
				}
			});
		}
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
	
	// add product
	$scope.addProduct = function(category,name,price,brand,description,quantity) {
		if (category && name && price && brand && description && quantity) {
			$http
			.post('services/', {request:'addProduct', category:category, name:name, price:price, brand:brand, description:description, quantity:quantity})
			.success(function(result) {
				if (result.reply == 'success') {
					$scope.getProductList();
				}
			});
		} else {
			alert('You must fill in every field when adding new products.');
		}
	};
	
	// edit product
	$scope.editProduct = function(index,product) {
		$scope.editProductIndex = index;
		product.tempId = product.id;
		product.tempCategory = product.category;
		product.tempName = product.name;
		product.tempPrice = product.price;
		product.tempBrand = product.brand;
		product.tempDescription = product.description;
		product.tempQuantity = product.quantity;
	};
	
	$scope.updateProduct = function(id,newId,newCategory,newName,newPrice,newBrand,newDescription,newQuantity) {
		if (id && newId && newCategory && newName && newPrice && newBrand && newDescription && newQuantity) {
			$http
			.post('services/', {request:'updateProduct', id:id, newId:newId, newCategory:newCategory, newName:newName, newPrice:newPrice, newBrand:newBrand, newDescription:newDescription, newQuantity:newQuantity})
			.success(function(result) {
				if (result.reply == 'success') {
					$scope.getProductList();
					$scope.cancelEditProduct();
				}
			});
		} else {
			alert('You must fill in every field when editing products.');
		}
	};
	
	$scope.cancelEditProduct = function() {
		$scope.editProductIndex = null;
	};
	
	// delete product
	$scope.deleteProduct = function(id,name) {
		if (window.confirm('Are you sure you want to delete Item ID '+id+': "'+name+'"?')) {
			$http
			.post('services/', {request:'deleteProduct', id:id})
			.success(function(result) {
				if (result.reply == 'success') {
					$scope.getProductList();
				}
			});
		}
	};
});