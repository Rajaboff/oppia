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
require(
  'pages/signup-page/modal-templates/license-explanation-modal.controller.ts');
require(
  'pages/signup-page/modal-templates/' +
  'registration-session-expired-modal.controller.ts');

require('domain/utilities/url-interpolation.service.ts');
require('services/alerts.service.ts');
require('services/id-generation.service.ts');
require('services/site-analytics.service.ts');
require('services/user.service.ts');
require('services/contextual/url.service.ts');
require('services/stateful/focus-manager.service.ts');

angular.module('oppia').component('signupPage', {

  template: require('./signup-page.component.html'),
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
            var ctrl = this;
            var _SIGNUP_DATA_URL = '/signuphandler/data';
            ctrl.MAX_USERNAME_LENGTH = MAX_USERNAME_LENGTH;
            ctrl.CREATEABLE_ROLES = {
                "LEARNER": "Ученик",
                "EXPLORATION_EDITOR": "Учитель",
            };
            ctrl.isFormValid = function () {
                return (
                    ctrl.hasAgreedToLatestTerms &&
                    (ctrl.hasUsername || !ctrl.warningI18nCode)
                );
            };

            ctrl.showLicenseExplanationModal = function () {
                $uibModal.open({
                    templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
                        '/pages/signup-page/modal-templates/' +
                        'license-explanation-modal.template.directive.html'),
                    backdrop: true,
                    controller: 'LicenseExplanationModalController'
                }).result.then(function () {
                }, function () {
                    // Note to developers:
                    // This callback is triggered when the Cancel button is clicked.
                    // No further action is needed.
                });
            };

            ctrl.onUsernameInputFormBlur = function (username) {
                if (ctrl.hasUsername) {
                    return;
                }
                AlertsService.clearWarnings();
                ctrl.blurredAtLeastOnce = true;
                ctrl.updateWarningText(username);
                if (!ctrl.warningI18nCode) {
                    $http.post('usernamehandler/data', {
                        username: username
                    }).then(function (response) {
                        if (response.data.username_is_taken) {
                            ctrl.warningI18nCode = 'I18N_SIGNUP_ERROR_USERNAME_TAKEN';
                        }
                    });
                }
            };

            // Returns the warning text corresponding to the validation error for
            // the given username, or an empty string if the username is valid.
            ctrl.updateWarningText = function (username) {
                var alphanumericRegex = /^[A-Za-z0-9]+$/;
                var adminRegex = /admin/i;
                var oppiaRegex = /oppia/i;

                if (!username) {
                    ctrl.warningI18nCode = 'I18N_SIGNUP_ERROR_NO_USERNAME';
                } else if (username.indexOf(' ') !== -1) {
                    ctrl.warningI18nCode = 'I18N_SIGNUP_ERROR_USERNAME_WITH_SPACES';
                } else if (username.length > ctrl.MAX_USERNAME_LENGTH) {
                    ctrl.warningI18nCode = 'I18N_SIGNUP_ERROR_USERNAME_TOO_LONG';
                } else if (!alphanumericRegex.test(username)) {
                    ctrl.warningI18nCode = 'I18N_SIGNUP_ERROR_USERNAME_ONLY_ALPHANUM';
                } else if (adminRegex.test(username)) {
                    ctrl.warningI18nCode = 'I18N_SIGNUP_ERROR_USERNAME_WITH_ADMIN';
                } else if (oppiaRegex.test(username)) {
                    ctrl.warningI18nCode = 'I18N_SIGNUP_ERROR_USERNAME_NOT_AVAILABLE';
                } else {
                    ctrl.warningI18nCode = '';
                }
            };

            ctrl.onSelectEmailPreference = function () {
                ctrl.emailPreferencesWarningText = '';
            };

            ctrl.submitPrerequisitesForm = function (
                agreedToTerms, username, canReceiveEmailUpdates) {
                if (!agreedToTerms) {
                    AlertsService.addWarning('I18N_SIGNUP_ERROR_MUST_AGREE_TO_TERMS');
                    return;
                }

                if (!ctrl.hasUsername && ctrl.warningI18nCode) {
                    return;
                }

                var defaultDashboard = DASHBOARD_TYPE_LEARNER;
                var returnUrl = decodeURIComponent(
                    UrlService.getUrlParams().return_url);

                if (returnUrl.indexOf('creator-dashboard') !== -1) {
                    defaultDashboard = DASHBOARD_TYPE_CREATOR;
                } else {
                    defaultDashboard = DASHBOARD_TYPE_LEARNER;
                }

                var requestParams = {
                    agreed_to_terms: agreedToTerms,
                    can_receive_email_updates: null,
                    default_dashboard: defaultDashboard,
                    username: null,
                    email: null,
                    password: null,
                    role: "EXPLORATION_EDITOR"
                };

                if (!ctrl.hasUsername) {
                    requestParams.username = username;
                }

                if (ctrl.email) {
                    requestParams.email = ctrl.email
                }

                if (ctrl.role) {
                    requestParams.role = ctrl.role
                }

                if (ctrl.password) {
                    requestParams.password = ctrl.password
                }


                if (ctrl.showEmailPreferencesForm && !ctrl.hasUsername) {
                    if (canReceiveEmailUpdates === null) {
                        ctrl.emailPreferencesWarningText = 'I18N_SIGNUP_FIELD_REQUIRED';
                        return;
                    }

                    if (canReceiveEmailUpdates === 'yes') {
                        requestParams.can_receive_email_updates = true;
                    } else if (canReceiveEmailUpdates === 'no') {
                        requestParams.can_receive_email_updates = false;
                    } else {
                        throw new Error(
                            'Invalid value for email preferences: ' +
                            canReceiveEmailUpdates);
                    }
                }

                SiteAnalyticsService.registerNewSignupEvent();
                ctrl.submissionInProcess = true;

                var dev_app_server_login_config = {
                    method: 'GET',
                    url: "/custom_auth?email=" + ctrl.email + "&action=Login",
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                }
                $http(dev_app_server_login_config).then(function () {
                    $http.post(_SIGNUP_DATA_URL, requestParams).then(function () {
                        // $window.location.href = decodeURIComponent(
                        //   UrlService.getUrlParams().return_url);
                        $window.location.href = '/logout'
                        $window.alert("Подтверждение почты было отправлено на " + ctrl.email)
                    }, function (rejection) {
                        if (
                            rejection.data && rejection.data.status_code === 401) {
                            ctrl.showRegistrationSessionExpiredModal();
                        }
                        ctrl.submissionInProcess = false;
                    });
                }, function(rejection) {
                    console.log(rejection);
                })


                // Don't skip user until email wasn't  confirmed
                // ctrl.navigate('/logout');
            };

            ctrl.showRegistrationSessionExpiredModal = function () {
                $uibModal.open({
                    templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
                        '/pages/signup-page/modal-templates/' +
                        'registration-session-expired-modal.template.html'),
                    backdrop: 'static',
                    keyboard: false,
                    controller: 'RegistrationSessionExpiredModalController'
                }).result.then(function () {
                }, function () {
                    // Note to developers:
                    // This callback is triggered when the Cancel button is clicked.
                    // No further action is needed.
                });
            };
            ctrl.$onInit = function () {
                LoaderService.showLoadingScreen('I18N_SIGNUP_LOADING');
                ctrl.warningI18nCode = '';
                ctrl.siteName = SITE_NAME;
                ctrl.submissionInProcess = false;

                $http.get(_SIGNUP_DATA_URL).then(function (response) {
                    var data = response.data;
                    LoaderService.hideLoadingScreen();
                    ctrl.username = data.username;
                    ctrl.hasEverRegistered = data.has_ever_registered;
                    ctrl.hasAgreedToLatestTerms = data.has_agreed_to_latest_terms;
                    ctrl.showEmailPreferencesForm = data.can_send_emails;
                    ctrl.hasUsername = Boolean(ctrl.username);
                    FocusManagerService.setFocus('usernameInputField');
                });

                ctrl.blurredAtLeastOnce = false;
                ctrl.canReceiveEmailUpdates = null;
            };
        }

  ]
});
