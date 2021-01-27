// Copyright 2020 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for ratio expression input validation service.
 */

import { TestBed } from '@angular/core/testing';

import { AnswerGroup, AnswerGroupObjectFactory } from
  'domain/exploration/AnswerGroupObjectFactory';
import { RatioExpressionInputValidationService } from
// eslint-disable-next-line max-len
  'interactions/RatioExpressionInput/directives/ratio-expression-input-validation.service';
import { Outcome, OutcomeObjectFactory } from
  'domain/exploration/OutcomeObjectFactory';
import { Rule, RuleObjectFactory } from
  'domain/exploration/RuleObjectFactory';
import { SubtitledUnicode } from
  'domain/exploration/SubtitledUnicodeObjectFactory';
import { RatioExpressionInputCustomizationArgs } from
  'extensions/interactions/customization-args-defs';

import { AppConstants } from 'app.constants';

describe('RatioExpressionInputValidationService', () => {
  let validatorService: RatioExpressionInputValidationService;
  let WARNING_TYPES: typeof AppConstants.WARNING_TYPES;

  let currentState: string;
  let answerGroups: AnswerGroup[], goodDefaultOutcome: Outcome;
  let equals: Rule, isEquivalent: Rule, hasNumberOfTermsEqualTo: Rule;
  let customizationArgs: RatioExpressionInputCustomizationArgs;
  let oof: OutcomeObjectFactory, agof: AnswerGroupObjectFactory,
    rof: RuleObjectFactory;
  let warnings;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RatioExpressionInputValidationService]
    });

    validatorService = TestBed.get(RatioExpressionInputValidationService);
    oof = TestBed.get(OutcomeObjectFactory);
    agof = TestBed.get(AnswerGroupObjectFactory);
    rof = TestBed.get(RuleObjectFactory);
    WARNING_TYPES = AppConstants.WARNING_TYPES;

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

    customizationArgs = {
      placeholder: {
        value: new SubtitledUnicode('', '')
      },
      numberOfTerms: {
        value: 3
      }
    };

    isEquivalent = rof.createFromBackendDict({
      rule_type: 'IsEquivalent',
      inputs: {
        x: [1, 2, 3]
      }
    });

    equals = rof.createFromBackendDict({
      rule_type: 'Equals',
      inputs: {
        x: [1, 2, 3]
      }
    });

    hasNumberOfTermsEqualTo = rof.createFromBackendDict({
      rule_type: 'HasNumberOfTermsEqualTo',
      inputs: {
        y: 3
      }
    });

    answerGroups = [agof.createNew([], goodDefaultOutcome, null, null)];
  });

  it('должен иметь возможность выполнять базовую проверку', () => {
    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([]);
  });

  it('должен уловить избыточность правил с соответствующими входами', () => {
    // The third rule will never get matched.
    answerGroups[0].rules = [equals, isEquivalent];

    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Правило 2 из группы ответов 1 никогда не будет выполнено, потому чтоe' +
      ' ему предшествует \'Equals\' правило с соответствием' +
      ' входом.'
    }]);
    let isEquivalentNonSimplified = rof.createFromBackendDict({
      rule_type: 'IsEquivalent',
      inputs: {
        x: [2, 4, 6]
      }
    });

    // The second rule will never get matched.
    answerGroups[0].rules = [isEquivalent, isEquivalentNonSimplified];

    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Правило 2 из группы ответов 1 никогда не будет выполнено, потому что' +
      ' предоставленный ввод не в простейшей форме.'
    }, {
      type: WARNING_TYPES.ERROR,
      message: 'Правило 2 из группы ответов 1 никогда не будет выполнено, потому что' +
      ' ему предшествует \'IsEquivalent\' правило с подходящим ' +
      ' входом.'
    }
    ]);

    let equalFourTerms = rof.createFromBackendDict({
      rule_type: 'Equals',
      inputs: {
        x: [1, 2, 3, 4]
      }
    });

    // The second rule will never get matched.
    answerGroups[0].rules = [hasNumberOfTermsEqualTo, equals, equalFourTerms];

    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Правило 2 из группы ответов 1 никогда не будет выполнено, потому что ' +
      ' \'HasNumberOfTermsEqualTo\' правилу предшествует правило с ' +
      'соответствующий ввод.'
    }, {
      type: WARNING_TYPES.ERROR,
      message: 'Правило 3 из группы ответов 1 никогда не будет выполнено, потому что' +
      ' количество терминов отличается от требуемого.'
    }]);

    // The second rule will never get matched.
    answerGroups[0].rules = [hasNumberOfTermsEqualTo, hasNumberOfTermsEqualTo];

    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Правило 2 из группы ответов 1 никогда не будет выполнено, потому что ' +
      'ему предшествует \'HasNumberOfTermsEqualTo\' правило с ' +
      'соответствующим вводом.'
    }]);

    let equalsTwoTerms = rof.createFromBackendDict({
      rule_type: 'Equals',
      inputs: {
        x: [1, 2]
      }
    });
    let hasNumberOfTermsEqualToLength2 = rof.createFromBackendDict({
      rule_type: 'HasNumberOfTermsEqualTo',
      inputs: {
        y: 2
      }
    });

    // The second rule will never get matched.
    answerGroups[0].rules = [
      equalsTwoTerms, equals, hasNumberOfTermsEqualToLength2];
    warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Правило 1 из группы ответов 1 никогда не будет выполнено, потому что' +
      ' количество терминов отличается от требуемого.'
    }, {
      type: WARNING_TYPES.ERROR,
      message: 'Правило 3 из группы ответов 1 никогда не будет выполнено, потому что' +
      ' количество терминов отличается от требуемого.'
    }]);
  });

  it('должен улавливать нецелое значение для # терминов', () => {
    customizationArgs.numberOfTerms.value = 1.5;
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: (
        'Количество терминов должно быть неотрицательным целым числом, отличным от 1.')
    }]);
  });

  it('должен поймать неопределенное значение для # терминов', () => {
    customizationArgs.numberOfTerms.value = undefined;
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: (
        'Количество терминов должно быть неотрицательным целым числом, отличным от 1..')
    }]);
  });

  it('должно быть отрицательное значение для # условий', () => {
    customizationArgs.numberOfTerms.value = -1;
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: (
        'Количество терминов должно быть неотрицательным целым числом, отличным от 1.')
    }]);
  });

  it('должен поймать целое значение 1 для # терминов', () => {
    customizationArgs.numberOfTerms.value = 1;
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: ('Количество членов в соотношении должно быть больше 1.')
    }]);
  });
});
