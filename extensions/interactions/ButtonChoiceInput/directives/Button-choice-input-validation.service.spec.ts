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
 * @fileoverview Unit tests for Button choice input validation service.
 */

import { TestBed } from '@angular/core/testing';

import { AnswerGroup, AnswerGroupObjectFactory } from
  'domain/exploration/AnswerGroupObjectFactory';
import { ButtonChoiceInputCustomizationArgs } from
  'interactions/customization-args-defs';
import { ButtonChoiceInputValidationService } from 'interactions/ButtonChoiceInput/directives/Button-choice-input-validation.service';
import { Outcome, OutcomeObjectFactory } from
  'domain/exploration/OutcomeObjectFactory';
import { RuleObjectFactory } from 'domain/exploration/RuleObjectFactory';
import { SubtitledHtml } from
  'domain/exploration/SubtitledHtmlObjectFactory';

import { AppConstants } from 'app.constants';

describe('ButtonChoiceInputValidationService', () => {
  let WARNING_TYPES: typeof AppConstants.WARNING_TYPES;

  let currentState: string;
  let badOutcome: Outcome, goodAnswerGroups: AnswerGroup[],
    goodDefaultOutcome: Outcome;
  let validatorService: ButtonChoiceInputValidationService,
    customizationArguments: ButtonChoiceInputCustomizationArgs;
  let oof: OutcomeObjectFactory, agof: AnswerGroupObjectFactory;
  let rof: RuleObjectFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ButtonChoiceInputValidationService]
    });

    validatorService = TestBed.get(ButtonChoiceInputValidationService);
    WARNING_TYPES = AppConstants.WARNING_TYPES;
    oof = TestBed.get(OutcomeObjectFactory);
    agof = TestBed.get(AnswerGroupObjectFactory);
    rof = TestBed.get(RuleObjectFactory);
    currentState = 'First State';

    goodDefaultOutcome = oof.createFromBackendDict({
      dest: 'Second State',
      feedback: {
        html: '',
        content_id: ''
      },
      labelled_as_correct: false,
      param_changes: [],
      refresher_exploration_id: null,
      missing_prerequisite_skill_id: null
    });

    badOutcome = oof.createFromBackendDict({
      dest: currentState,
      feedback: {
        html: '',
        content_id: ''
      },
      labelled_as_correct: false,
      param_changes: [],
      refresher_exploration_id: null,
      missing_prerequisite_skill_id: null
    });

    customizationArguments = {
      choices: {
        value: [
          new SubtitledHtml('Option 1', ''),
          new SubtitledHtml('Option 2', '')
        ]
      },
      showChoicesInShuffledOrder: {
        value: true
      }
    };

    goodAnswerGroups = [agof.createNew(
      [{
        rule_type: 'Equals',
        inputs: {
          x: 0
        }
      }, {
        rule_type: 'Equals',
        inputs: {
          x: 1
        }
      }].map(rof.createFromBackendDict),
      goodDefaultOutcome,
      null,
      null)];
  });

  it('should be able to perform basic validation', () => {
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArguments, goodAnswerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([]);
  });

  it('should expect a choices customization argument', () => {
    expect(() => {
      validatorService.getAllWarnings(
      // This throws "Argument of type '{}' is not assignable to
      // parameter of type 'ButtonChoiceInputCustomizationArgs'." We are
      // purposely assigning the wrong type of customization args in order
      // to test validations.
      // @ts-expect-error
        currentState, {}, goodAnswerGroups, goodDefaultOutcome);
    }).toThrowError(
      'Expected customization arguments to have property: choices');
  });

  it('should expect non-empty and unique choices', () => {
    customizationArguments.choices.value[0].setHtml('');
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArguments, goodAnswerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.CRITICAL,
      message: 'Убедитесь, что варианты не пусты.'
    }]);

    customizationArguments.choices.value[0].setHtml('Option 2');
    warnings = validatorService.getAllWarnings(
      currentState, customizationArguments, goodAnswerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.CRITICAL,
      message: 'Убедитесь, что выбор уникален.'
    }]);
  });

  it('следует проверять правила группы ответов ссылаться на допустимые варианты только один раз',
    () => {
      goodAnswerGroups[0].rules[0].inputs.x = 2;
      var warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: 'Убедитесь, что правило 1 в группе 1 относится к допустимому выбору.'
      }]);

      goodAnswerGroups[0].rules[0].inputs.x = 1;
      warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      // Rule 2 will be caught when trying to verify whether any rules are
      // duplicated in their input choice.
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: (
          'Убедитесь, что правило 2 в группе 1 не совпадает с тем же ' +
          'вариант с множественным выбором как другое правило.')
      }]);
    });

  it(
    'следует ожидать не сбивающего с толку и ненулевого результата по умолчанию только тогда, когда ' +
    'не все варианты регулируются правилами',
    () => {
      var warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups, badOutcome);
      // All of the Button choice options are targeted by rules, therefore no
      // warning should be issued for a bad default outcome.
      expect(warnings).toEqual([]);

      // Taking away 1 rule reverts back to the expect validation behavior with
      // default outcome.
      goodAnswerGroups[0].rules.splice(1, 1);
      warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups, null);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: (
          'Добавьте что-нибудь для ответа Oqustudy в' +
          '\"All other answers\" .')
      }]);
      warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups, badOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: (
          'Добавьте что-нибудь для ответа Oqustudy в' +
          '\"All other answers\" .')
      }]);
    });
});
