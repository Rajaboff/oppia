/**
 * @fileoverview Component for the Oppia activation page.
 */

require('base-components/base-content.directive.ts');
require('domain/utilities/url-interpolation.service.ts');
require('services/alerts.service.ts');
require('services/user.service.ts');
require('services/contextual/url.service.ts');

interface ActivityInfo {
  title: string;
  category: string;
}

interface TokenInfo {
  activity: ActivityInfo;
}

angular.module('oppia').component('activationPage', {
  template: require('./activation-page.component.html'),
  controller: [
    '$http',
    function ($http) {
      const ctrl = this;

      ctrl.ui = {
        step: 'token'
      };

      function getInfoByToken() {
        if (!ctrl.ui.token) {
          return;
        }

        ctrl.ui.activity = undefined;
        ctrl.ui.activityNotFound = false;
        $http.get(`/activation/info/${ctrl.ui.token}`).then(function (response) {
          const result = response.data as TokenInfo;
          if (result.activity) {
            ctrl.ui.activity = result.activity;
            ctrl.ui.step = 'activation';
          } else {
            ctrl.ui.activityNotFound = true;
          }
        });
      }

      function activate() {
        $http.put(`/activity/access/${ctrl.ui.token}`).then(function (response) {
          if (response.data.status === 'ok') {
            ctrl.ui.step = 'success';
          }
        });
      }

      ctrl.submit = function () {
        switch (ctrl.ui.step) {
          case 'token':
            getInfoByToken();
            break;
          case 'activation':
            activate();
            break;
        }
      }
    }
  ]
});
