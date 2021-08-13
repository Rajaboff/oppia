angular.module('oppia').controller('BuyModalController', [
  '$controller', '$scope', '$uibModalInstance', 'UserService', 'params',
  function ($controller, $scope, $uibModalInstance, UserService, params) {
    $controller('ConfirmOrCancelModalController', {
      $scope: $scope,
      $uibModalInstance: $uibModalInstance
    });

    $scope.params = params;
    params.isPresent = false;
    params.presentEmail = '';

    $scope.buy = function () {
      UserService.getUserInfoAsync().then(function (userInfo) {
        const data = {
          isPresent: params.isPresent,
          presentEmail: params.presentEmail,
          activityType: params.activityType,
          activityId: params.activityId
        };

        const accountId = userInfo.isLoggedIn() ? userInfo.getEmail() : '';
        const config = {
          publicId: 'test_api_00000000000000000000001',
          description: `Покупка '${params.title}'`,
          amount: params.cost,
          currency: 'KZT',
          requireEmail: true,
          accountId: accountId,
          skin: 'mini',
          data: data
        };

        console.log(config);

        const cp = (window as any).cp;
        const widget = new cp.CloudPayments();
        widget.pay('charge',
          config,
          {
            onSuccess: function (options) { // success
              //действие при успешной оплате
            },
            onFail: function (reason, options) { // fail
              //действие при неуспешной оплате
            },
            onComplete: function (paymentResult, options) { //Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
              //например вызов вашей аналитики Facebook Pixel
            }
          }
        )
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.close();
    }
  }
]);
