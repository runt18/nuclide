'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileResult} from '../../nuclide-quick-open';
import type {CtagsResult, CtagsService} from '../../nuclide-remote-ctags-base';

import {React} from 'react-for-atom';
import featureConfig from '../../nuclide-feature-config';
import {getHackService} from '../../nuclide-hack-symbol-provider/lib/getHackService';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {join, relative} from '../../nuclide-remote-uri';
import {CTAGS_KIND_ICONS, CTAGS_KIND_NAMES, getLineNumberForTag} from './utils';

// ctags doesn't have a true limit API, so having too many results slows down Nuclide.
const MIN_QUERY_LENGTH = 2;
const RESULTS_LIMIT = 10;
const DEFAULT_ICON = 'icon-squirrel';

type Result = FileResult & CtagsResult & {dir: string};

async function getCtagsService(
  directory: atom$Directory,
): Promise<?CtagsService> {
  // The tags package looks in the directory, so give it a sample file.
  const path = join(directory.getPath(), 'file');
  const service = getServiceByNuclideUri('CtagsService', path);
  if (service == null) {
    return null;
  }
  return await service.getCtagsService(path);
}

export default class QuickOpenHelpers {

  static async isEligibleForDirectory(directory: atom$Directory): Promise<boolean> {
    const svc = await getCtagsService(directory);
    if (svc != null) {
      svc.dispose();
      return true;
    }
    return false;
  }

  static getComponentForItem(uncastedItem: FileResult): React.Element {
    const item = ((uncastedItem: any): Result);
    const path = relative(item.dir, item.path);
    let kind;
    let icon;
    if (item.kind != null) {
      kind = CTAGS_KIND_NAMES[item.kind];
      icon = CTAGS_KIND_ICONS[item.kind];
    }
    icon = icon || DEFAULT_ICON;
    return (
      <div title={kind}>
        <span className={`file icon ${icon}`}><code>{item.name}</code></span>
        <span className="omnisearch-symbol-result-filename">{path}</span>
      </div>
    );
  }

  static async executeQuery(query: string, directory?: atom$Directory): Promise<Array<FileResult>> {
    if (directory == null || query.length < MIN_QUERY_LENGTH) {
      return [];
    }

    const dir = directory.getPath();
    const service = await getCtagsService(directory);
    if (service == null) {
      return [];
    }

    // HACK: Ctags results typically just duplicate Hack results when they're present.
    // Filter out results from PHP files when the Hack service is available.
    // TODO(hansonw): Remove this when quick-open has proper ranking/de-duplication.
    let hack;
    if (featureConfig.get('nuclide-remote-ctags.disableWithHack') !== false) {
      hack = await getHackService(directory);
    }

    try {
      const results = await service.findTags(query, {
        caseInsensitive: true,
        partialMatch: true,
        limit: RESULTS_LIMIT,
      });

      return await Promise.all(results
        .filter(tag => hack == null || !tag.file.endsWith('.php'))
        .map(async tag => {
          const line = await getLineNumberForTag(tag);
          return {
            ...tag,
            path: tag.file,
            dir,
            line,
          };
        }));
    } finally {
      service.dispose();
    }
  }

}
