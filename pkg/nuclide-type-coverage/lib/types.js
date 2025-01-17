/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

export type CoverageResult = {
  percentage: number;
};

export interface CoverageProvider {
  getCoverage(path: NuclideUri): Promise<?CoverageResult>;
  priority: number;
  grammarScopes: Array<string>;
}
