'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type ActivationType from './Activation';
import type {OutputService, RegisterExecutorFunction} from './types';
import type {GadgetsService} from '../../nuclide-gadgets';

import invariant from 'assert';

let activation: ?ActivationType = null;

export function activate(state: ?Object) {
  if (activation == null) {
    const Activation = require('./Activation');
    activation = new Activation(state);
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function consumeGadgetsService(gadgetsApi: GadgetsService): void {
  invariant(activation);
  activation.consumeGadgetsService(gadgetsApi);
}

export function provideOutputService(): OutputService {
  invariant(activation);
  return activation.provideOutputService();
}

export function provideRegisterExecutor(): RegisterExecutorFunction {
  invariant(activation);
  return activation.provideRegisterExecutor();
}
