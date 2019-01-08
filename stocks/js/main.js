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
    var cookiePortfolio = document.cookie.replace(/(?:(?:^|.*;\s*)portfolio\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookiePortfolio !== '') {
      $scope.portfolio = JSON.parse(cookiePortfolio);
      fetchPriceData();
    } else {
      document.cookie = 'portfolio={"cash":10000,"stocks":[]}';
      $scope.portfolio = {"cash":10000,"stocks":[]};
      fetchPriceData();
    }

    // load transaction history data from cookie, or create one if first time
      var cookieTransactionHistory = document.cookie.replace(/(?:(?:^|.*;\s*)transactionHistory\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (cookieTransactionHistory !== '') {
      $scope.transactionHistory = JSON.parse(cookieTransactionHistory);
    } else {
      document.cookie = 'transactionHistory={"history":[]}';
      $scope.transactionHistory = {"history":[]};
    }

    // check with cookie if greeting message should appear
    $scope.greeting = true;
    if (document.cookie.replace(/(?:(?:^|.*;\s*)greeting\s*\=\s*([^;]*).*$)|^.*$/, "$1")) {
      $scope.greeting = false;
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
        .get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+portfolioSymbols+'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
        .then(function(res) {
          var arr = res.data.query.results.quote;
          if (arr.constructor === Object) {
            arr = [arr];
          }
          if (arr.length === $scope.portfolio.stocks.length) {
            for (var i=0; i<arr.length; i++) {
              $scope.portfolio.stocks[i].priceCurrent = arr[i].LastTradePriceOnly;
              $scope.portfolioValue += parseFloat(arr[i].LastTradePriceOnly)*$scope.portfolio.stocks[i].shares;
            }
          } else {
            console.log('invalid portfolio');
          }
        });
      }
    }

    // close greeting
    $scope.closeGreeting = function() {
      document.cookie = 'greeting=false';
      $scope.greeting = false;
    };

    // open stock details modal
    $scope.showDetails = function(symbol) {
      $http
      .get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+symbol+'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
      .then(function(res) {
        var arr = res.data.query.results.quote;
        if (arr.constructor === Object) {
          arr = [arr];
        }
        if (arr.length === 1) {
          $scope.stockDetails = arr[0];
          $scope.stockDetails.shares = 0;
          for (var i=0; i<$scope.portfolio.stocks.length; i++) {
            if ($scope.portfolio.stocks[i].symbol === symbol) {
              $scope.stockDetails.shares = $scope.portfolio.stocks[i].shares;
            }
          }
          $scope.sharesToBuy = 0;
          $scope.sharesToSell = 0;
          $('.stockDetailsModal').addClass('active');
          $('body').addClass('noScroll');
        } else {
          console.log('invalid symbol');
        }
      });
    };

    $scope.closeDetails = function() {
      $('.stockDetailsModal').removeClass('active');
      $('body').removeClass('noScroll');
    };

    // buy stock
    $scope.buyStock = function() {
      if (parseInt($scope.sharesToBuy) === $scope.sharesToBuy && $scope.sharesToBuy > 0) {
        $http
        .get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+$scope.stockDetails.symbol+'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
        .then(function(res) {
          var arr = res.data.query.results.quote;
          if (arr.constructor === Object) {
            arr = [arr];
          }
          if (arr.length === 1) {
            var price = arr[0].LastTradePriceOnly;
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
              $scope.transactionHistory.history.unshift({date:Date.now(),type:'Bought',shares:$scope.sharesToBuy,symbol:$scope.stockDetails.symbol,price:price});
              savePortfolio()
              fetchPriceData();
              $scope.closeDetails();
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
        .get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+$scope.stockDetails.symbol+'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
        .then(function(res) {
          var arr = res.data.query.results.quote;
          if (arr.constructor === Object) {
            arr = [arr];
          }
          if (arr.length === 1) {
            var price = arr[0].LastTradePriceOnly;
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
              $scope.transactionHistory.history.unshift({date:Date.now(),type:'Sold',shares:$scope.sharesToSell,symbol:$scope.stockDetails.symbol,price:price});
              savePortfolio()
              fetchPriceData();
              $scope.closeDetails();
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
    function savePortfolio() {
      var portfolio = $scope.portfolio;
      for (var i=0; i<portfolio.stocks.length; i++) {
        delete portfolio.stocks[i].priceCurrent;
      }
      document.cookie = 'portfolio='+JSON.stringify($scope.portfolio)+';expires='+(new Date(Date.now()+1000*60*60*24*365).toUTCString());
      var truncatedHistory = $scope.transactionHistory;
      truncatedHistory.history = truncatedHistory.history.slice(0,20);
      document.cookie = 'transactionHistory='+JSON.stringify(truncatedHistory)+';expires='+(new Date(Date.now()+1000*60*60*24*365).toUTCString());
    }

    // search
    $scope.searchResults = [];
    $scope.search = function() {
      $http
      .get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+$scope.searchSymbol+'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
      .then(function(res) {
        console.log(res);
        var arr = res.data.query.results.quote;
        if (arr.constructor === Object) {
          arr = [arr];
        }
        if (arr.length > 0) {
          $scope.searchError = '';
          for (var i=0; i<arr.length; i++) {
            $scope.searchResults.unshift({symbol:arr[i].Symbol,name:arr[i].Name,price:arr[i].LastTradePriceOnly});
          }
          $scope.searchSymbol = '';
        } else {
          $scope.searchError = 'No results for that stock symbol.';
        }
      });
    };

    // reset portfolio by wiping the cookie
    $scope.resetPortfolio = function() {
      if (confirm('You will go back to having $10,000 and zero shares. Are you sure you want to reset your portfolio?')) {
        document.cookie = 'portfolio=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'transactionHistory=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'greeting=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        location.reload();
      }
    };
  });
})();
