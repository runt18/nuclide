'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import {React} from 'react-for-atom';

import type {
  FileResult,
  Provider,
  ProviderType,
} from '../../nuclide-quick-open';

import {array, relativeDate} from '../../nuclide-commons';
import {Matcher} from '../../nuclide-fuzzy-native';

// Imported from nuclide-files-service, which is an apm package, preventing a direct import.
type FilePath = string;
type TimeStamp = number;
type FileList = Array<{path: FilePath; timestamp: TimeStamp}>;
type RecentFilesService = {
  getRecentFiles(): FileList;
  touchFile(path: string): void;
};

let _recentFilesService: ?RecentFilesService = null;

function getRecentFilesMatching(query: string): Array<FileResult> {
  if (_recentFilesService == null) {
    return [];
  }
  const projectPaths = atom.project.getPaths();
  const openFiles = new Set(array.compact(
    atom.workspace.getTextEditors().map(editor => editor.getPath())
  ));
  const validRecentFiles = _recentFilesService.getRecentFiles()
    .filter(result =>
      !openFiles.has(result.path) &&
      projectPaths.some(projectPath => result.path.indexOf(projectPath) !== -1)
    );
  const timestamps: Map<FilePath, TimeStamp> = new Map();
  const matcher = new Matcher(validRecentFiles.map(recentFile => {
    timestamps.set(recentFile.path, recentFile.timestamp);
    return recentFile.path;
  }));
  return matcher.match(query, {recordMatchIndexes: true})
    .map(result => ({
      path: result.value,
      score: result.score,
      matchIndexes: result.matchIndexes,
      timestamp: timestamps.get(result.value) || 0,
    }))
    // $FlowIssue Flow seems to type the arguments to `sort` as `FileResult` without `timestamp`.
    .sort((a, b) => b.timestamp - a.timestamp);
}

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MIN_OPACITY = 0.6;
const SHELF = 8 * MS_PER_HOUR; // 8 hours: heuristic for "current work day".
const FALLOFF = 1.1;
/**
 * Calculate opacity with logarithmic falloff based on recency of the timestamp.
 *
 *  Opacity                     now
 *  ^                           |
 *  |                  < SHELF >
 *  |                  #########
 *  |                  #########
 *  |   < FALLOFF >  ###########
 *  |               ############
 *  |            ###############
 *  |        ###################
 *  | ##########################  ] MIN_OPACITY
 *  | ##########################  ]
 *  +----------Time-------------->
 */
function opacityForTimestamp(timestamp: number): number {
  const ageInMS = Date.now() - timestamp;
  return Math.min(
    1,
    Math.max(
      1 - (FALLOFF * Math.log10(((ageInMS - SHELF) / MS_PER_DAY) + 1)),
      MIN_OPACITY
    )
  );
}

export const RecentFilesProvider: Provider = {

  getName(): string {
    return 'RecentFilesProvider';
  },

  getProviderType(): ProviderType {
    return 'GLOBAL';
  },

  getDebounceDelay(): number {
    return 0;
  },

  isRenderable(): boolean {
    return true;
  },

  getAction(): string {
    return 'nuclide-recent-files-provider:toggle-provider';
  },

  getPromptText(): string {
    return 'Search recently opened files';
  },

  getTabTitle(): string {
    return 'Recent Files';
  },

  executeQuery(query: string): Promise<Array<FileResult>> {
    return Promise.resolve(getRecentFilesMatching(query));
  },

  setRecentFilesService(service: RecentFilesService): void {
    _recentFilesService = service;
  },

  getComponentForItem(item: FileResult): React.Element {
    const filename = path.basename(item.path);
    const filePath = item.path.substring(0, item.path.lastIndexOf(filename));
    const date = item.timestamp == null ? null : new Date(item.timestamp);
    const datetime = date === null ? '' : date.toLocaleString();
    return (
      <div
        className="recent-files-provider-result"
        style={{opacity: opacityForTimestamp(item.timestamp || Date.now())}}
        title={datetime}>
        <div className="recent-files-provider-filepath-container">
          <span className="recent-files-provider-file-path">{filePath}</span>
          <span className="recent-files-provider-file-name">{filename}</span>
        </div>
        <div className="recent-files-provider-datetime-container">
          <span className="recent-files-provider-datetime-label">
            {date === null ? 'At some point' : relativeDate(date)}
          </span>
        </div>
      </div>
    );
  },

};
