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
 * @fileoverview Validator service for the interaction.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';

import { AnswerGroup } from
  'domain/exploration/AnswerGroupObjectFactory';
import { Warning, baseInteractionValidationService } from
  'interactions/base-interaction-validation.service';
import { ItemSelectionInputCustomizationArgs } from
  'interactions/customization-args-defs';
import { Outcome } from
  'domain/exploration/OutcomeObjectFactory';

import { AppConstants } from 'app.constants';

@Injectable({
  providedIn: 'root'
})
export class ItemSelectionInputValidationService {
  constructor(
      private baseInteractionValidationServiceInstance:
        baseInteractionValidationService) {}

  getCustomizationArgsWarnings(
      customizationArgs: ItemSelectionInputCustomizationArgs): Warning[] {
    var warningsList = [];

    this.baseInteractionValidationServiceInstance.requireCustomizationArguments(
      customizationArgs, ['choices']);

    var areAnyChoicesEmpty = false;
    var areAnyChoicesDuplicated = false;
    var seenChoices = [];
    var handledAnswers = [];
    var numChoices = customizationArgs.choices.value.length;

    for (var i = 0; i < numChoices; i++) {
      var choice = customizationArgs.choices.value[i].getHtml();
      if (choice.trim().length === 0) {
        areAnyChoicesEmpty = true;
      }
      if (seenChoices.indexOf(choice) !== -1) {
        areAnyChoicesDuplicated = true;
      }
      seenChoices.push(choice);
      handledAnswers.push(false);
    }

    if (areAnyChoicesEmpty) {
      warningsList.push({
        type: AppConstants.WARNING_TYPES.CRITICAL,
        message: 'Убедитесь, что варианты не пусты.'
      });
    }

    if (areAnyChoicesDuplicated) {
      warningsList.push({
        type: AppConstants.WARNING_TYPES.CRITICAL,
        message: 'Убедитесь, что выбор уникален.'
      });
    }

    var minAllowedCount =
      customizationArgs.minAllowableSelectionCount.value;
    var maxAllowedCount =
      customizationArgs.maxAllowableSelectionCount.value;

    if (minAllowedCount > maxAllowedCount) {
      warningsList.push({
        type: AppConstants.WARNING_TYPES.CRITICAL,
        message: (
          'Убедитесь, что максимально допустимое количество не меньше ' +
          'минимального количества.')
      });
    }

    if (numChoices < minAllowedCount) {
      warningsList.push({
        type: AppConstants.WARNING_TYPES.CRITICAL,
        message: (
          'Убедитесь, что у вас достаточно вариантов для достижения минимального ' +
          'количества.')
      });
    } else if (numChoices < maxAllowedCount) {
      warningsList.push({
        type: AppConstants.WARNING_TYPES.CRITICAL,
        message: (
          'Убедитесь, что у вас достаточно вариантов для достижения максимального ' +
          'количества.')
      });
    }
    return warningsList;
  }

  getAllWarnings(
      stateName: string, customizationArgs:
      ItemSelectionInputCustomizationArgs, answerGroups: AnswerGroup[],
      defaultOutcome: Outcome): Warning[] {
    var warningsList = [];

    warningsList = warningsList.concat(
      this.getCustomizationArgsWarnings(customizationArgs));

    warningsList = warningsList.concat(
      this.baseInteractionValidationServiceInstance.getAnswerGroupWarnings(
        answerGroups, stateName));

    var seenChoices = customizationArgs.choices.value;
    var handledAnswers = seenChoices.map((item) => {
      return false;
    });

    var minAllowedCount =
      customizationArgs.minAllowableSelectionCount.value;
    var maxAllowedCount =
      customizationArgs.maxAllowableSelectionCount.value;

    var areAllChoicesCovered = false;
    if (maxAllowedCount === 1) {
      var answerChoiceToIndex = {};
      seenChoices.forEach((seenChoice, choiceIndex) => {
        answerChoiceToIndex[seenChoice.getHtml()] = choiceIndex;
      });

      answerGroups.forEach((answerGroup, answerIndex) => {
        var rules = answerGroup.rules;
        rules.forEach((rule, ruleIndex) => {
          var ruleInputs = (<string[]>rule.inputs.x);
          ruleInputs.forEach((ruleInput) => {
            var choiceIndex = answerChoiceToIndex[ruleInput];
            if (rule.type === 'Equals') {
              handledAnswers[choiceIndex] = true;
              if (ruleInputs.length > 1) {
                warningsList.push({
                  type: AppConstants.WARNING_TYPES.ERROR,
                  message: (
                    'В группе овтетов ' + (answerIndex + 1) + ', ' +
                    'правило ' + (ruleIndex + 1) + ', ' +
                    'пожалуйста, выберите только один вариант ответа.')
                });
              }
            } else if (rule.type === 'IsProperSubsetOf') {
              handledAnswers[choiceIndex] = true;
            } else if (rule.type === 'ContainsAtLeastOneOf') {
              handledAnswers[choiceIndex] = true;
            } else if (rule.type ===
              'DoesNotContainAtLeastOneOf') {
              for (var i = 0; i < handledAnswers.length; i++) {
                if (i !== choiceIndex) {
                  handledAnswers[i] = true;
                }
              }
            }
          });
        });
      });
      areAllChoicesCovered = handledAnswers.every((handledAnswer) => {
        return handledAnswer;
      });
    }

    if (!areAllChoicesCovered) {
      if (!defaultOutcome || defaultOutcome.isConfusing(stateName)) {
        warningsList.push({
          type: AppConstants.WARNING_TYPES.ERROR,
          message: (
            'Пожалуйста, добавьте что-нибудь для Oqustudy в ' +
            '\"Все ответы ученика\" ответ.')
        });
      }
    }

    answerGroups.forEach((answerGroup, answerIndex) => {
      var rules = answerGroup.rules;
      rules.forEach((rule, ruleIndex) => {
        var ruleInputs = (<string[]>rule.inputs.x);
        ruleInputs.forEach((ruleInput) => {
          if (rule.type === 'IsProperSubsetOf') {
            if (ruleInputs.length < 2) {
              warningsList.push({
                type: AppConstants.WARNING_TYPES.ERROR,
                message: (
                  'В группе ответов ' + (answerIndex + 1) + ', ' +
                  'правило ' + (ruleIndex + 1) + ', the "proper subset" ' +
                  'правило должно включать как минимум 2 варианта.')
              });
            }
          } else if (rule.type === 'Equals') {
            if (minAllowedCount > ruleInputs.length ||
              maxAllowedCount < ruleInputs.length) {
              warningsList.push({
                type: AppConstants.WARNING_TYPES.ERROR,
                message: (
                  'В группе ответов ' + (answerIndex + 1) + ', ' +
                  'правило ' + (ruleIndex + 1) + ', количество правильных ' +
                  'вариантов в "Equals" правило должно быть между ' +
                    minAllowedCount + ' и ' + maxAllowedCount +
                  ' (минимальное и максимальное допустимое количество выборок).')
              });
            }
          }
        });
        if (ruleInputs.length === 0) {
          if (rule.type === 'ContainsAtLeastOneOf') {
            warningsList.push({
              type: AppConstants.WARNING_TYPES.ERROR,
              message: (
                'В группе ответов ' + (answerIndex + 1) + ', правило ' +
                (ruleIndex + 1) + ', "ContainsAtLeastOneOf" правило ' +
                'должен быть хотя бы один вариант.')
            });
          }
        }
      });
    });

    return warningsList;
  }
}

angular.module('oppia').factory(
  'ItemSelectionInputValidationService',
  downgradeInjectable(ItemSelectionInputValidationService));
