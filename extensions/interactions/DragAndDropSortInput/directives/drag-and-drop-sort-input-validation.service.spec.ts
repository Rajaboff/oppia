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
 * @fileoverview Unit tests for drag and drop sort input validation service.
 */

import { TestBed } from '@angular/core/testing';

import { AnswerGroup, AnswerGroupObjectFactory } from
  'domain/exploration/AnswerGroupObjectFactory';
import { DragAndDropSortInputValidationService } from 'interactions/DragAndDropSortInput/directives/drag-and-drop-sort-input-validation.service';
import { Outcome, OutcomeObjectFactory } from
  'domain/exploration/OutcomeObjectFactory';
import { Rule, RuleObjectFactory } from
  'domain/exploration/RuleObjectFactory';
import { SubtitledHtml } from
  'domain/exploration/SubtitledHtmlObjectFactory';

import { AppConstants } from 'app.constants';
import { DragAndDropSortInputCustomizationArgs } from
  'interactions/customization-args-defs';

describe('DragAndDropSortInputValidationService', () => {
  let validatorService: DragAndDropSortInputValidationService;
  let WARNING_TYPES: typeof AppConstants.WARNING_TYPES;

  let currentState: string;
  let answerGroups: AnswerGroup[], goodDefaultOutcome: Outcome;
  let customOutcome: Outcome;
  let equalsListWithEmptyValuesRule: Rule, equalsListWithDuplicatesRule: Rule,
    equalsListWithAllowedValuesRule: Rule, equalsListWithValuesRule: Rule,
    goodRule1: Rule, goodRule2: Rule, hasXBeforeYRule: Rule,
    hasElementXAtPositionYRule: Rule;
  let customizationArgs: DragAndDropSortInputCustomizationArgs;
  let oof: OutcomeObjectFactory, agof: AnswerGroupObjectFactory,
    rof: RuleObjectFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DragAndDropSortInputValidationService]
    });

    validatorService = TestBed.get(DragAndDropSortInputValidationService);
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
      missing_prerequisite_skill_id: null,
      labelled_as_correct: false,
      param_changes: [],
      refresher_exploration_id: null
    });

    customOutcome = oof.createFromBackendDict({
      dest: 'Third State',
      feedback: {
        html: '<p>great job!</p>',
        content_id: ''
      },
      labelled_as_correct: true,
      param_changes: [],
      refresher_exploration_id: null,
      missing_prerequisite_skill_id: ''
    });

    customizationArgs = {
      choices: {
        value: [
          new SubtitledHtml('a', ''),
          new SubtitledHtml('b', ''),
          new SubtitledHtml('c', ''),
          new SubtitledHtml('d', '')
        ]
      },
      allowMultipleItemsInSamePosition: {
        value: true
      }
    };

    goodRule1 = rof.createFromBackendDict({
      rule_type: 'IsEqualToOrdering',
      inputs: {
        x: [['a'], ['b'], ['c'], ['d']]
      }
    });

    goodRule2 = rof.createFromBackendDict({
      rule_type: 'IsEqualToOrdering',
      inputs: {
        x: [['d'], ['c'], ['b'], ['a']]
      }
    });

    equalsListWithAllowedValuesRule = rof.createFromBackendDict({
      rule_type: 'IsEqualToOrdering',
      inputs: {
        x: [['a', 'b'], ['d'], ['c']]
      }
    });

    equalsListWithValuesRule = rof.createFromBackendDict({
      rule_type: 'IsEqualToOrderingWithOneItemAtIncorrectPosition',
      inputs: {
        x: [['a'], ['d'], ['c'], ['b']]
      }
    });

    equalsListWithEmptyValuesRule = rof.createFromBackendDict({
      rule_type: 'IsEqualToOrdering',
      inputs: {
        x: [['a', ''], [], ['c', 'b', 'd']]
      }
    });

    equalsListWithDuplicatesRule = rof.createFromBackendDict({
      rule_type: 'IsEqualToOrderingWithOneItemAtIncorrectPosition',
      inputs: {
        x: [['a', 'b'], ['b'], ['c', 'a', 'd']]
      }
    });

    hasXBeforeYRule = rof.createFromBackendDict({
      rule_type: 'HasElementXBeforeElementY',
      inputs: {
        x: 'b',
        y: 'b'
      }
    });

    hasElementXAtPositionYRule = rof.createFromBackendDict({
      rule_type: 'HasElementXAtPositionY',
      inputs: {
        x: 'x',
        y: '5'
      }
    });

    answerGroups = [
      agof.createNew(
        [equalsListWithAllowedValuesRule],
        goodDefaultOutcome,
        null,
        null
      ), agof.createNew(
        [goodRule1, goodRule2],
        customOutcome,
        null,
        null
      )
    ];
  });

  it('should be able to perform basic validation', () => {
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([]);
  });

  it('should not allow multiple items in same position', () => {
    customizationArgs.allowMultipleItemsInSamePosition.value = false;
    var rules = [rof.createFromBackendDict({
      rule_type: 'IsEqualToOrdering',
      inputs: {
        x: [['a', 'b'], ['c', 'd']]
      }
    })];
    answerGroups = [
      agof.createNew(rules, customOutcome, null, null),
      agof.createNew(rules, customOutcome, null, null)
    ];
    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Несколько элементов в одной позиции не допускаются.'
    }, {
      type: WARNING_TYPES.ERROR,
      message: 'Несколько элементов в одной позиции не допускаются.'
    }]);
    customizationArgs.allowMultipleItemsInSamePosition.value = true;
  });

  it('should expect all items to be nonempty', () => {
    // Add rule containing empty items.
    answerGroups[0].rules = [equalsListWithEmptyValuesRule];

    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Убедитесь, что элементы не пусты.'
    }, {
      type: WARNING_TYPES.ERROR,
      message: 'Правило 1 из группы ответов 1 не соответствует' +
        'выбор аргументов настройки.'
    }]);
  });

  it('should expect all items to be unique', () => {
    // Add rule containing duplicate items.
    answerGroups[0].rules = [equalsListWithDuplicatesRule];

    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Убедитесь, что предметы уникальны.'
    }, {
      type: WARNING_TYPES.ERROR,
      message: 'Правило 1 из группы ответов 1 не соответствует' +
        'выбор аргументов настройки.'
    }]);
  });

  it('should expect at least two choices', () => {
    customizationArgs.choices.value = [
      new SubtitledHtml('1', '')
    ];

    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, [], goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.CRITICAL,
      message: 'Пожалуйста, введите как минимум два варианта.'
    }]);
  });

  it('should expect all choices to be nonempty', () => {
    // Set the first choice to empty.
    customizationArgs.choices.value[0].setHtml('');

    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, [], goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.CRITICAL,
      message: 'Убедитесь, что варианты не пусты.'
    }]);
  });

  it('should expect all choices to be unique', () => {
    // Repeat the last choice.
    customizationArgs.choices.value.push(new SubtitledHtml('d', ''));

    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, [], goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.CRITICAL,
      message: 'Убедитесь, что варианты выбора уникальны.'
    }]);
  });

  it('should catch redundancy of rules', () => {
    answerGroups[0].rules = [equalsListWithValuesRule,
      equalsListWithAllowedValuesRule];

    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Правило 2 из группы ответов 1 никогда не будет выполнено' +
          'потому что это делается избыточным правилом 1 из группы ответов 1.'
    }]);
  });

  it('should catch non-distinct selected choices', () => {
    answerGroups[0].rules = [hasXBeforeYRule];

    var warnings = validatorService.getAllWarnings(
      currentState, customizationArgs, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Правило 1 из группы ответов 1 никогда не будет выполнено ' +
          'потому что оба выбранных элемента одинаковы.'
    }]);
  });

  it(
    'should catch selected choice not present in custom args for ' +
    'hasXBeforeY rule', () => {
      hasXBeforeYRule.inputs.x = 'x';
      answerGroups[0].rules = [hasXBeforeYRule];
      var warnings = validatorService.getAllWarnings(
        currentState, customizationArgs, answerGroups, goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Правило 1 из группы ответов 1 содержит варианты, которые ' +
          'не соответствует ни одному из вариантов в аргументах настройки.'
      }]);
    });

  it(
    'should catch selected choices not present in custom args for ' +
    'hasElementXAtPositionY rule', () => {
      answerGroups[0].rules = [hasElementXAtPositionYRule];

      var warnings = validatorService.getAllWarnings(
        currentState, customizationArgs, answerGroups, goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Правило 1 из группы ответов 1 содержит вариант, который ' +
          'не соответствует ни одному из вариантов в аргументах настройки.'
      }, {
        type: WARNING_TYPES.ERROR,
        message: 'Правило 1 из группы ответов 1 относится к неверному выбору.' +
          'позиции.'
      }]);
    });

  it(
    'should throw an error if ' +
    'IsEqualToOrderingWithOneItemAtIncorrectPosition rule is used but ' +
    'multiple choices in the same position are note allowed',
    () => {
      answerGroups[0].rules = [equalsListWithValuesRule];
      customizationArgs.allowMultipleItemsInSamePosition.value = false;
      var warnings = validatorService.getAllWarnings(
        currentState, customizationArgs, answerGroups, goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Правило 1 из группы ответов 1 никогда не будет выполнено, потому что' +
          'будет как минимум 2 элемента в неправильных позициях, если' +
          'несколько элементов не могут занимать одну и ту же позицию.'
      }]);
      customizationArgs.allowMultipleItemsInSamePosition.value = true;
    });
});
