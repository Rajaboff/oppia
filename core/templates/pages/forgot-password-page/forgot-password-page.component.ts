// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Component for the Oppia profile page.
 */
var qs = require('qs');
const axios = require('axios');

require('base-components/base-content.directive.ts');

require('domain/utilities/url-interpolation.service.ts');
require('services/alerts.service.ts');
require('services/id-generation.service.ts');
require('services/site-analytics.service.ts');
require('services/user.service.ts');
require('services/contextual/url.service.ts');
require('services/stateful/focus-manager.service.ts');

angular.module('oppia').component('forgotPasswordPage', {
    template: require('./forgot-password-page.component.html'),
    controller: [
        '$http', '$uibModal', '$window', 'AlertsService',
        'FocusManagerService', 'LoaderService', 'SiteAnalyticsService',
        'UrlInterpolationService', 'UrlService', 'DASHBOARD_TYPE_CREATOR',
        'DASHBOARD_TYPE_LEARNER', 'MAX_USERNAME_LENGTH', 'SITE_NAME',

        function (
            $http, $uibModal, $window, AlertsService,
            FocusManagerService, LoaderService, SiteAnalyticsService,
            UrlInterpolationService, UrlService, DASHBOARD_TYPE_CREATOR,
            DASHBOARD_TYPE_LEARNER, MAX_USERNAME_LENGTH, SITE_NAME) {
            ctrl = this;

            ctrl.submitPasswordRecoveryForm = function () {
                const ERROR_MESSAGES = {
                    "No credentials": "Нет учётных данных",
                    "Invalid credentials": "Неверные учетные данные",
                    "Email not confirmed": "Почта не подтверждена",
                }

                var headers = new Headers();
                headers.append("Content-Type", "application/x-www-form-urlencoded");
                headers.append("Pragma", "no-cache");

                var recoveryData = {
                    email: ctrl.email,
                };

                if (recoveryData.email) {
                    recoveryData.email = ctrl.email
                } else {
                    $window.alert("Email field is null")
                    return
                }


                var recovery_url = '/password_recovery_token?payload=' + JSON.stringify(recoveryData);
                var config = {
                    method: 'POST',
                    url: recovery_url,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Access-Control-Allow-Origin': '*'

                    },
                }

                $http(config).then(function (response) {
                    $window.alert("URL-адрес для восстановления был отправлен на вашу почту")
                    console.log(response)
                    $window.location.href = '/'
                }).catch(function (error) {
                    console.log(error)
                    alert(ERROR_MESSAGES[error.data.error]);
                });
            }
        }
    ]
});
x