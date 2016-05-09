var app = angular.module('smoothini', ['ngRoute', 'ngCart', 'ui.bootstrap']);

app.directive('navBar', function () {
    return {
        restrict: 'E'
        , templateUrl: "templates/nav.html"
    };
});

app.directive('breadCrumb', function () {
    return {
        restrict: 'E'
        , templateUrl: "templates/breadcrumb.html"
    };
});

app.directive('foodCategory', function () {
    return {
        restrict: 'E'
        , scope: {
            category: '='
        }
        , templateUrl: "templates/foodCategory.html"
        , link: function (scope, element, attrs) {
            if (attrs.category == "dairy") {
                scope.foodCat = scope.$parent.ingredients.liquids.list.dairy;
                scope.foodCatList = scope.foodCat.list;
            } else {
                scope.foodCat = scope.$parent.ingredients[attrs.category];
                scope.foodCatList = scope.foodCat.list;
            }
        }
    };
});

var findKey = function (parent, keyObj) {
    var p, key, val, tRet;
    for (p in keyObj) {
        if (keyObj.hasOwnProperty(p)) {
            key = p;
            val = keyObj[p];
        }
    }

    for (p in parent) {
        if (p == key) {
            if (parent[p] == val) {
                return parent;
            }
        } else if (parent[p] instanceof Object) {
            if (parent.hasOwnProperty(p)) {
                tRet = findKey(parent[p], keyObj);
                if (tRet) {
                    return tRet;
                }
            }
        }
    }

    return false;
};

var upperCaseFirst = function (str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
};

app.directive('foodItems', function () {
    return {
        restrict: 'E'
        , scope: {
            category: '='
        }
        , templateUrl: "templates/foodItems.html"
        , link: function (scope, element, attrs) {
            if (attrs.category == "nutsAndSeeds") {
                scope.foodCat = scope.$parent.ingredients.nutsAndSeeds;
            } else if (attrs.category == "otherLiquids") {
                scope.foodCat = scope.$parent.ingredients.liquids.list.otherLiquids;
            } else {
                scope.foodCat = findKey(scope.$parent.ingredients, {
                    name: upperCaseFirst(attrs.category)
                });
            }
            scope.foodCatList = scope.foodCat.list;

        }
    };
});

app.controller('cartCtrl', ['$scope', 'ngCart', function ($scope, ngCart) {
    ngCart.setTaxRate(7.5);
}]);

app.factory('foodService', function ($http, $q) {
    var deferred = $q.defer();
    var ingredients = {};
    var foodService = {};

    foodService.async = function () {
        $http.get('/js/food.json').success(function (data) {
            ingredients = data;
            deferred.resolve();
        });
        return deferred.promise;
    };

    foodService.getFoods = function () {
        return ingredients;
    };
    return foodService;
});

app.controller('foodCtrl', ['$scope', '$http', 'foodService', function ($scope, $http, foodService) {
    foodService.async().then(function(){
        $scope.ingredients = foodService.getFoods();
    });

    //    $http.get('/js/food.json').success(function (data){
    //        $scope.ingredients = data;
    //    });
}]);

app.controller('searchCtrl', ['$scope', '$timeout', 'foodService', 'ngCart', function ($scope, $timeout, foodService, ngCart) {
    foodService.async().then(function () {
        var foods = foodService.getFoods();
        var allFoods = [];
        $scope.allFoods = allFoods.concat(foods.fruits.list, foods.vegetables.list, foods.powders.list, foods.nutsAndSeeds.list, foods.liquids.list.dairy.list, foods.liquids.list.teas.list, foods.liquids.list.otherLiquids.list);
    });

    $scope.closedClass = "closed";
    $scope.toggleClose = function () {
        if ($scope.closedClass == "closed") {
            $scope.closedClass = " ";
        } else {
            $scope.closedClass = "closed";
        }
    };
    
    $scope.onSelect = function ($item, $model, $label){
        ngCart.toggleItem($label, $label, $item.price, 1, $item);
        $('#search-2').val("");
    };
}]);

app.config(['$routeProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/home.html'
            , controller: 'foodCtrl'
        })
        .when('/Liquids', {
            template: '<food-category category="liquids"></food-category>'
        })
        .when('/Fruits', {
            template: '<food-items category="fruits"></food-items>'
        })
        .when('/Vegetables', {
            template: '<food-items category="vegetables"></food-items>'
        })
        .when('/NutsandSeeds', {
            template: '<food-items category="nutsAndSeeds"></food-items>'
        })
        .when('/Powders', {
            template: '<food-items category="powders"></food-items>'
        })
        .when('/Cart', {
            templateUrl: 'templates/cart.html'
            , controller: 'cartCtrl'
        })
        .when('/Teas', {
            template: '<food-items category="teas"></food-items>'
        })
        .when('/Dairy', {
            template: '<food-items category="dairy"></food-items>'
        })
        .when('/Milks', {
            template: '<food-items category="milks"></food-items>'
        })
        .when('/Yogurts', {
            template: '<food-items category="yogurts"></food-items>'
        })
        .when('/OtherLiquids', {
            template: '<food-items category="otherLiquids"></food-items>'
        })
        .when('/about', {
            templateUrl: 'templates/about.html'
        });
    //        .otherwise({
    //            redirectTo: '/home'
    //        });

    //    $locationProvider.html5Mode({
    //                 enabled: true,
    //                 requireBase: false
    //          });
}]);

function searchToggle(obj, evt) {
    var container = $(obj).closest('.search-wrapper');
    if (!container.hasClass('active')) {
        container.addClass('active');
        evt.preventDefault();
    } else if (container.hasClass('active') && $(obj).closest('.input-holder').length == 0) {
        container.removeClass('active');
        // clear input
        container.find('.search-input').val('');
    }
}