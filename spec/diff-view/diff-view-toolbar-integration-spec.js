'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  activateAllPackages,
  copyMercurialFixture,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
  setLocalProject,
} from '../../pkg/nuclide-integration-test-helpers';
import path from 'path';
import invariant from 'assert';

describe('Diff View Toolbar Button Test', () => {

  let repoPath: string = (null: any);

  beforeEach(() => {
    waitsForPromise({timeout: 60000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate atom packages.
      await activateAllPackages();
      // Copy mercurial project to temporary directory.
      repoPath = await copyMercurialFixture('hg_repo_2', __dirname);
      // Add this directory as a new project in atom.
      setLocalProject(repoPath);
      // Open the test.txt file in the repo.
      await atom.workspace.open(path.join(repoPath, 'test.txt'));
    });
  });

  afterEach(() => {
    deactivateAllPackages();
  });

  it('tests diff files count', () => {
    const textEditor = atom.workspace.getActiveTextEditor();
    invariant(textEditor, 'no active text editor!');

    function getDiffCountElement() {
      return document.querySelector('.diff-view-count');
    }

    waitsFor('diff-count element to register in the toolbar', 30000, () => {
      return getDiffCountElement() != null;
    });

    runs(() => {
      // Initially we have no changed files so the diff view tool-bar counter should be empty.
      expect(getDiffCountElement().innerText).toEqual('');

      textEditor.setText('cg');
      textEditor.save();
    });

    waitsFor('uncommited file changes tool-bar counter to update', 10000, () => {
      return getDiffCountElement().innerText;
    });

    runs(() => {
      expect(getDiffCountElement().innerText).toEqual('1');
    });
  });
});
