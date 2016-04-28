'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CustomPaneItemOptions} from '../../nuclide-ui/lib/types';
import type {VcsLogEntry} from '../../nuclide-hg-repository-base/lib/HgService';

import {React} from 'react-for-atom';
import {CustomPaneItem} from '../../nuclide-ui/lib/CustomPaneItem';
import VcsLog from './VcsLog';

class VcsLogPaneItem extends CustomPaneItem {
  __renderPaneItem(options: CustomPaneItemOptions): React.Element {
    return <VcsLog {...options.initialProps} />;
  }

  updateWithLogEntries(logEntries: Array<VcsLogEntry>) {
    this.__component.setState({logEntries});
  }
}

module.exports = document.registerElement(
  'nuclide-vcs-log',
  {prototype: VcsLogPaneItem.prototype},
);
