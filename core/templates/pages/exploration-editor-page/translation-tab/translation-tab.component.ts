// Copyright 2018 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Component for the translation tab.
 */

require(
  'components/common-layout-directives/common-elements/' +
  'attribution-guide.component.ts');
require(
  'pages/exploration-editor-page/translation-tab/state-translation/' +
  'state-translation.component.ts');
require(
  'pages/exploration-editor-page/translation-tab/modal-templates/' +
  'welcome-translation-modal.controller.ts');
require(
  'pages/exploration-editor-page/translation-tab/' +
  'state-translation-status-graph/state-translation-status-graph.component.ts');
require(
  'pages/exploration-editor-page/translation-tab/translator-overview/' +
  'translator-overview.component.ts');

require('domain/utilities/url-interpolation.service.ts');
require('pages/exploration-editor-page/services/exploration-data.service.ts');
require('pages/exploration-editor-page/services/exploration-states.service.ts');
require(
  'pages/exploration-editor-page/services/' +
  'state-tutorial-first-time.service.ts');
require(
  'pages/exploration-editor-page/services/' +
  'user-exploration-permissions.service.ts');
require(
  'components/state-editor/state-editor-properties-services/' +
  'state-editor.service.ts');
require(
  'components/state-editor/state-editor-properties-services/' +
  'state-property.service.ts');
require(
  'components/state-editor/state-editor-properties-services/' +
  'state-recorded-voiceovers.service.ts');
require('services/context.service.ts');
require('services/editability.service.ts');
require('pages/admin-page/services/admin-router.service.ts');

import { Subscription } from 'rxjs';

angular.module('oppia').component('translationTab', {
  template: require('./translation-tab.component.html'),
  controller: ['$scope', '$templateCache', '$uibModal',
    'ContextService', 'EditabilityService', 'ExplorationStatesService',
    'LoaderService', 'RouterService', 'SiteAnalyticsService',
    'StateEditorService', 'StateRecordedVoiceoversService',
    'StateTutorialFirstTimeService', 'StateWrittenTranslationsService',
    'TranslationTabActiveModeService', 'UrlInterpolationService',
    'UserExplorationPermissionsService',
    function(
        $scope, $templateCache, $uibModal,
        ContextService, EditabilityService, ExplorationStatesService,
        LoaderService, RouterService, SiteAnalyticsService,
        StateEditorService, StateRecordedVoiceoversService,
        StateTutorialFirstTimeService, StateWrittenTranslationsService,
        TranslationTabActiveModeService, UrlInterpolationService,
        UserExplorationPermissionsService) {
      var ctrl = this;
      ctrl.directiveSubscriptions = new Subscription();
      var _ID_TUTORIAL_TRANSLATION_LANGUAGE =
        '#tutorialTranslationLanguage';
      var _ID_TUTORIAL_TRANSLATION_STATE = '#tutorialTranslationState';
      var _ID_TUTORIAL_TRANSLATION_OVERVIEW = (
        '#tutorialTranslationOverview');
      // Replace the ng-joyride template with one that uses
      // <[...]> interpolators instead of/ {{...}} interpolators.
      var ngJoyrideTemplate = (
        $templateCache.get('ng-joyride-title-tplv1.html'));
      ngJoyrideTemplate = ngJoyrideTemplate.replace(
        /\{\{/g, '<[').replace(/\}\}/g, ']>');

      var initTranslationTab = function() {
        StateTutorialFirstTimeService.initTranslation(
          ContextService.getExplorationId());
        var stateName = StateEditorService.getActiveStateName();
        StateRecordedVoiceoversService.init(
          stateName, ExplorationStatesService.getRecordedVoiceoversMemento(
            stateName));
        StateWrittenTranslationsService.init(
          stateName, ExplorationStatesService.getWrittenTranslationsMemento(
            stateName));
        $scope.showTranslationTabSubDirectives = true;
        TranslationTabActiveModeService.activateVoiceoverMode();
        LoaderService.hideLoadingScreen();
      };

      $scope.leaveTutorial = function() {
        EditabilityService.onEndTutorial();
        $scope.$apply();
        StateTutorialFirstTimeService.markTranslationTutorialFinished();
        $scope.translationTutorial = false;
      };

      $scope.onFinishTutorial = function() {
        $scope.leaveTutorial();
      };

      $scope.onSkipTutorial = function() {
        $scope.leaveTutorial();
      };

      var permissions = null;
      $scope.onStartTutorial = function() {
        if (permissions === null) {
          return;
        }
        if (permissions.canVoiceover) {
          EditabilityService.onStartTutorial();
          $scope.translationTutorial = true;
        }
      };

      $scope.showWelcomeTranslationModal = function() {
        $uibModal.open({
          templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
            '/pages/exploration-editor-page/translation-tab/' +
            'modal-templates/welcome-translation-modal.template.html'),
          backdrop: true,
          controller: 'WelcomeTranslationModalController',
          windowClass: 'oppia-welcome-modal'
        }).result.then(function(explorationId) {
          SiteAnalyticsService.registerAcceptTutorialModalEvent(
            explorationId);
          $scope.onStartTutorial();
        }, function(explorationId) {
          SiteAnalyticsService.registerDeclineTutorialModalEvent(
            explorationId);
          StateTutorialFirstTimeService.markTranslationTutorialFinished();
        });
      };

      ctrl.$onInit = function() {
        LoaderService.showLoadingScreen('Loading');
        $scope.isTranslationTabBusy = false;
        $scope.showTranslationTabSubDirectives = false;
        ctrl.directiveSubscriptions.add(
          RouterService.onRefreshTranslationTab.subscribe(
            () => {
              initTranslationTab();
            }
          )
        );
        // Toggles the translation tab tutorial on/off.
        $scope.translationTutorial = false;
        $scope.TRANSLATION_TUTORIAL_OPTIONS = [{
          type: 'title',
          heading: 'Переводы в Oqustudy.kz',
          text: (
            'Привет, добро пожаловать во вкладку «Переводы»! ' +
            'Этот тур проведет вас по странице перевода. ' +
            'Нажмите кнопку "Дальше", чтобы начать.')
        }, {
          type: 'function',
          fn: function(isGoingForward) {
            $('html, body').animate({
              scrollTop: (isGoingForward ? 0 : 20)
            }, 1000);
          }
        }, {
          type: 'element',
          selector: _ID_TUTORIAL_TRANSLATION_LANGUAGE,
          heading: 'Выберите язык',
          text: (
            'Начните свой перевод с выбора языка, на котором ' +
            'ты хочешь перевести.'),
          placement: 'bottom'
        }, {
          type: 'function',
          fn: function(isGoingForward) {
            var idToScrollTo = (
              isGoingForward ? _ID_TUTORIAL_TRANSLATION_OVERVIEW :
              _ID_TUTORIAL_TRANSLATION_LANGUAGE);
            $('html, body').animate({
              scrollTop: angular.element(idToScrollTo).offset().top - 200
            }, 1000);
          }
        }, {
          type: 'element',
          selector: _ID_TUTORIAL_TRANSLATION_OVERVIEW,
          heading: 'Выберите карточку для перевода',
          text: (
            'Затем выберите карточку в обзоре занятий, нажав ' +
            'нажав на карточку. На выбранной карточке будет ' +
            'выделены края. Карточки с отсутствующим переводом ' +
            'окрашены в желтый или красный цвет, и эти карточки доработки.'),
          placement: 'left'
        }, {
          type: 'function',
          fn: function(isGoingForward) {
            var idToScrollTo = (
              isGoingForward ? _ID_TUTORIAL_TRANSLATION_STATE :
              _ID_TUTORIAL_TRANSLATION_OVERVIEW);
            $('html, body').animate({
              scrollTop: angular.element(idToScrollTo).offset().top - 200
            }, 1000);
          }
        }, {
          type: 'element',
          selector: _ID_TUTORIAL_TRANSLATION_STATE,
          heading: 'Выберите часть карточки для перевода',
          text: (
            '<p>Затем выберите одну из частей карточки урока из ' +
            'меню сверху. Здесь перечислены все переводимые части ' +
            'карточек. На каждой вкладке может быть несколько разделов ' +
            'доступные для перевода.</p>'),
          placement: 'bottom'
        }, {
          type: 'function',
          fn: function(isGoingForward) {
            $('html, body').animate({
              scrollTop: (isGoingForward ? 0 : 20)
            }, 1000);
          }
        }, {
          type: 'title',
          heading: 'Запись аудио',
          text: (
            '<p>Чтобы создать аудиоперевод в Oqustudy.kz, ' +
            'просто выполните следующие 3 шага:</p>' +
            '<ol>' +
            '  <li>' +
            '    Для старта нажмите <b>запись</b>, нажмите' +
            '    <i class="material-icons" style="color:#007EFF">' +
            '    mic</i> кнопку. ' +
            '    Если в браузере появляется сообщение с вопросом, хотите ли вы ' +
            '    начать записывать звук, примите это. ' +
            '  </li>' +
            '  <li>' +
            '    Когда вы будете готовы завершить запись, нажмите ' +
            '    <i class="material-icons" style="color:#007EFF">' +
            '    &#xE047;</i> на <b>стоп</b>. ' +
            '  </li>' +
            '  <li>' +
            '    Нажмите на <b>сохранить</b> <i class="material-icons"' +
            '    style="color:#007EFF" > &#xE161;</i> кнопка ' +
            '    для подтверждения записи.' +
            '  </li>' +
            '</ol>' +
            '<p>В качестве альтернативы вы можете использовать ' +
            '<i class="material-icons" style="color:#007EFF" >' +
            '&#xE2C6;</i>' +
            'кнопку <b>обновить</b> аудио файлы с вашего компьютера.</p>')
        }, {
          type: 'function',
          fn: function(isGoingForward) {
            $('html, body').animate({
              scrollTop: (isGoingForward ? 0 : 20)
            }, 1000);
          }
        }, {
          type: 'title',
          heading: 'Запись/обновление аудио',
          text: (
            '<p>Аудиозапись также имеет параметры, связанные ' +
            'с обновлением и удалением переводов.</p>' +
            '<ul>' +
            '  <li>' +
            '    Чтобы вернуть и отменить любой несохраненный перевод,' +
            '    нажать ' +
            '    <i class="material-icons" style="color:#007EFF">' +
            '    &#xE5C9;</i> кнопку.' +
            '  </li>' +
            '  <li>' +
            '    Чтобы воспроизвести звук, нажмите на ' +
            '    <i class="material-icons" style="color:#007EFF" >' +
            '    &#xE039;</i> кнопку. ' +
            '  </li>' +
            '  <li>' +
            '    Чтобы сделать повторные попытки, нажмите ' +
            '    <i class="material-icons" style="color:#007EFF">' +
            '    &#xE028;</i> кнопку. ' +
            '  </li>' +
            '  <li>' +
            '    Чтобы удалить запись, нажмите ' +
            '    <i class="material-icons" style="color:#007EFF">' +
            '    &#xE872;</i> кнопку. ' +
            '  </li>' +
            '</ul>')
        }, {
          type: 'function',
          fn: function(isGoingForward) {
            $('html, body').animate({
              scrollTop: (isGoingForward ? 0 : 20)
            }, 1000);
          }
        }, {
          type: 'title',
          heading: 'Учебник завершен',
          text: (
            '<p>' +
            'Теперь вы готовы начать добавлять переводы ' +
            'к вашим занятиям! ' +
            'Это говорит о конце этого тура. ' +
            'Не забывайте периодически сохранять свой прогресс, используя ' +
            'кнопка сохранения на панели навигации вверху: ' +
            '<button class="btn btn-success" disabled>' +
            '<i class="material-icons" >&#xE161;' +
            '</i></button>.<br> ' +
            'Спасибо, что сделали этот урок более доступным ' +
            'для не носителей языка!')
        }];
        $templateCache.put(
          'ng-joyride-title-tplv1.html', ngJoyrideTemplate);
        UserExplorationPermissionsService.getPermissionsAsync()
          .then(function(explorationPermissions) {
            permissions = explorationPermissions;
          });
        ctrl.directiveSubscriptions.add(
          // eslint-disable-next-line max-len
          StateTutorialFirstTimeService.onEnterTranslationForTheFirstTime.subscribe(
            () => $scope.showWelcomeTranslationModal()
          )
        );
        ctrl.directiveSubscriptions.add(
          StateTutorialFirstTimeService.onOpenTranslationTutorial.subscribe(
            () => {
              $scope.onStartTutorial();
            }
          )
        );
      };
      ctrl.$onDestroy = function() {
        ctrl.directiveSubscriptions.unsubscribe();
      };
    }]
});
