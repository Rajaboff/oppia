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

angular.module('oppia').component('customAuthPage', {
    template: require('./custom-auth-page.component.html'),
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

            ctrl.submitLoginForm = function () {
                const getMethods = (obj) => {
                    let properties = new Set()
                    let currentObj = obj
                    do {
                        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
                    } while ((currentObj = Object.getPrototypeOf(currentObj)))
                    return [...properties.keys()].filter(item => typeof obj[item] === 'function')
                }

                const ERROR_MESSAGES = {
                    "Invalid credentials": "Нет учетных данных"
                }

                var headers = new Headers();
                headers.append("Content-Type", "application/x-www-form-urlencoded");
                headers.append("Pragma", "no-cache");

                var authData = {
                    email: null,
                    password: null
                };

                if (ctrl.email) {
                    authData.email = ctrl.email
                }

                if (ctrl.password) {
                    authData.password = ctrl.password
                }

                var auth_url = '/custom_auth?email=' + ctrl.email + '&action=Login&continue=http://0.0.0.0/signup?return_url=/&payload=' + JSON.stringify(authData);
                var config = {
                    method: 'POST',
                    url: auth_url,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Access-Control-Allow-Origin': '*'

                    },
                }

                $http(config).then(function (response) {
                    console.log(response);
                    $window.location.href = '/'
                }).catch(function (error) {
                    console.log(error);
                    alert(ERROR_MESSAGES[error.data.error]);
                });
            }
        }
    ]
});
x