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
 * @fileoverview Unit tests for item selection input validation service.
 */

import { TestBed } from '@angular/core/testing';

import { AnswerGroup, AnswerGroupObjectFactory } from
  'domain/exploration/AnswerGroupObjectFactory';
import { ItemSelectionInputValidationService } from 'interactions/ItemSelectionInput/directives/item-selection-input-validation.service';
import { Outcome, OutcomeObjectFactory } from
  'domain/exploration/OutcomeObjectFactory';
import { RuleObjectFactory } from 'domain/exploration/RuleObjectFactory';
import { SubtitledHtml } from 'domain/exploration/SubtitledHtmlObjectFactory';

import { AppConstants } from 'app.constants';
import { ItemSelectionInputCustomizationArgs } from
  'interactions/customization-args-defs';

describe('ItemSelectionInputValidationService', () => {
  let WARNING_TYPES: typeof AppConstants.WARNING_TYPES;
  let validatorService: ItemSelectionInputValidationService;

  let currentState: string = null;
  let goodAnswerGroups: AnswerGroup[] = null,
    goodDefaultOutcome: Outcome = null;
  let customizationArguments: ItemSelectionInputCustomizationArgs = null;
  let IsProperSubsetValidOption: AnswerGroup[] = null;
  let oof: OutcomeObjectFactory = null,
    agof: AnswerGroupObjectFactory = null,
    rof: RuleObjectFactory = null;
  let ThreeInputsAnswerGroups: AnswerGroup[] = null,
    OneInputAnswerGroups: AnswerGroup[] = null,
    NoInputAnswerGroups: AnswerGroup[] = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ItemSelectionInputValidationService]
    });

    validatorService = TestBed.get(ItemSelectionInputValidationService);
    WARNING_TYPES = AppConstants.WARNING_TYPES;

    oof = TestBed.get(OutcomeObjectFactory);
    agof = TestBed.get(AnswerGroupObjectFactory);
    rof = TestBed.get(RuleObjectFactory);

    currentState = 'First State';

    goodDefaultOutcome = oof.createFromBackendDict({
      dest: 'Second State',
      feedback: {
        html: 'Feedback',
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
          new SubtitledHtml('Selection 1', ''),
          new SubtitledHtml('Selection 2', ''),
          new SubtitledHtml('Selection 3', '')
        ]
      },
      maxAllowableSelectionCount: {
        value: 2
      },
      minAllowableSelectionCount: {
        value: 1
      }
    };
    goodAnswerGroups = [agof.createNew(
      [rof.createFromBackendDict({
        rule_type: 'Equals',
        inputs: {
          x: ['Selection 1', 'Selection 2']
        }
      })],
      goodDefaultOutcome,
      null,
      null)
    ];
    ThreeInputsAnswerGroups = [agof.createNew(
      [rof.createFromBackendDict({
        rule_type: 'Equals',
        inputs: {
          x: ['Selection 1', 'Selection 2', 'Selection 3']
        }
      })],
      goodDefaultOutcome,
      null,
      null)
    ];
    OneInputAnswerGroups = [agof.createNew(
      [rof.createFromBackendDict({
        rule_type: 'Equals',
        inputs: {
          x: ['Selection 1']
        }
      })],
      goodDefaultOutcome,
      null,
      null)
    ];
    NoInputAnswerGroups = [agof.createNew(
      [rof.createFromBackendDict({
        rule_type: 'ContainsAtLeastOneOf',
        inputs: {
          x: []
        }
      })],
      goodDefaultOutcome,
      null,
      null)
    ];
    IsProperSubsetValidOption = [agof.createNew(
      [rof.createFromBackendDict({
        rule_type: 'IsProperSubsetOf',
        inputs: {
          x: ['Selection 1']
        }
      })],
      goodDefaultOutcome,
      null,
      null)
    ];
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
        // parameter of type 'ItemSelectionInputCustomizationArgs'." We are
        // purposely assigning the wrong type of customization args in order
        // to test validations.
        // @ts-expect-error
        currentState, {}, goodAnswerGroups, goodDefaultOutcome);
    }).toThrowError(
      'Expected customization arguments to have property: choices');
  });

  it(
    'should expect the minAllowableSelectionCount to be less than or ' +
    'equal to maxAllowableSelectionCount',
    () => {
      customizationArguments.minAllowableSelectionCount.value = 3;

      var warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, ThreeInputsAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toContain({
        type: WARNING_TYPES.CRITICAL,
        message: (
          'Убедитесь, что максимально допустимое количество не меньше ' +
          'минимального количества.')
      });
    });

  it(
    'should expect maxAllowableSelectionCount to be less than the total ' +
    'number of selections',
    () => {
      customizationArguments.maxAllowableSelectionCount.value = 3;

      // Remove the last choice.
      customizationArguments.choices.value.splice(2, 1);

      var warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: (
          'Убедитесь, что у вас достаточно вариантов для достижения максимального количества.')
      }]);
    });

  it(
    'should expect minAllowableSelectionCount to be less than the total ' +
    'number of selections',
    () => {
    // Remove the last choice.
      customizationArguments.choices.value.splice(2, 1);

      customizationArguments.minAllowableSelectionCount.value = 3;
      customizationArguments.maxAllowableSelectionCount.value = 3;

      var warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, ThreeInputsAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: (
          'Убедитесь, что у вас достаточно вариантов для достижения минимального количества.')
      }]);
    });

  it('should expect all choices to be nonempty', () => {
    // Set the first choice to empty.
    customizationArguments.choices.value[0] = (
      new SubtitledHtml('', ''));

    var warnings = validatorService.getAllWarnings(
      currentState, customizationArguments, goodAnswerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.CRITICAL,
      message: 'Убедитесь, что варианты не пусты.'
    }]);
  });

  it('should expect all choices to be unique', () => {
    // Repeat the last choice.
    customizationArguments.choices.value.push(
      new SubtitledHtml('Selection 3', ''));

    var warnings = validatorService.getAllWarnings(
      currentState, customizationArguments, goodAnswerGroups,
      goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.CRITICAL,
      message: 'Убедитесь, что выбор уникален.'
    }]);
  });

  it(
    'should expect more that 1 element to be in the rule input, if the ' +
    '"proper subset" rule is used.',
    () => {
      var warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, IsProperSubsetValidOption,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: (
          'В группе ответов 1, ' +
          'правило 1, правило «правильного подмножества» должно включать как минимум 2 варианта.')
      }]);
    });

  it(
    'следует ожидать, что количество правильных вариантов будет между максимальным ' +
    'и минимально допустимый выбор при использовании правила "Equals".',
    () => {
      // Make min allowed selections greater than correct answers.
      customizationArguments.minAllowableSelectionCount.value = 2;

      var warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, OneInputAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: (
          'В группе ответов 1, правило 1, количество правильных вариантов в ' +
          'правило "Equals" должно быть от 2 до 2 ( ' +
          'минимальное и максимальное допустимое количество выборок).')
      }]);
    });

  it(
    'следует ожидать хотя бы один вариант, когда ' +
    '"ContainsAtLeastOneOf" правило используется.',
    () => {
      var warnings = validatorService.getAllWarnings(
        currentState, customizationArguments, NoInputAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: (
          'В группе ответов 1, правило 1, "ContainsAtLeastOneOf" правило ' +
          'должен быть хотя бы один вариант.')
      }]);
    });
});
