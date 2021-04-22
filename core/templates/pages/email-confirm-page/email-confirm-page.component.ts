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

require('base-components/base-content.directive.ts');

require('domain/utilities/url-interpolation.service.ts');
require('services/alerts.service.ts');
require('services/id-generation.service.ts');
require('services/site-analytics.service.ts');
require('services/user.service.ts');
require('services/contextual/url.service.ts');
require('services/stateful/focus-manager.service.ts');

angular.module('oppia').component('emailConfirmPage', {
  template: require('./email-confirm-page.component.html'),
  controller: [
    '$http', '$uibModal', '$window', 'AlertsService',
    'FocusManagerService', 'LoaderService', 'SiteAnalyticsService',
    'UrlInterpolationService', 'UrlService', 'DASHBOARD_TYPE_CREATOR',
    'DASHBOARD_TYPE_LEARNER', 'MAX_USERNAME_LENGTH', 'SITE_NAME',
    function(
        $http, $uibModal, $window, AlertsService,
        FocusManagerService, LoaderService, SiteAnalyticsService,
        UrlInterpolationService, UrlService, DASHBOARD_TYPE_CREATOR,
        DASHBOARD_TYPE_LEARNER, MAX_USERNAME_LENGTH, SITE_NAME) {
    }
  ]
});
