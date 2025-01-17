'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from '../../pkg/nuclide-hg-repository-client';

import {
  activateAllPackages,
  copyMercurialFixture,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
  setLocalProject,
} from '../../pkg/nuclide-integration-test-helpers';
import path from 'path';
import fs from 'fs';
import invariant from 'assert';
import {repositoryForPath} from '../../pkg/nuclide-hg-git-bridge';

const NO_FILE_SELECTED_TITLE = 'No file selected...No file selected';

describe('Diff View Commit Mode Integration Test', () => {

  let repoPath: string = (null: any);
  let filePath: string = (null: any);

  beforeEach(() => {
    waitsForPromise({timeout: 60000}, async () => {
      jasmineIntegrationTestSetup();
      // Activate atom packages.
      await activateAllPackages();
      // Copy mercurial project to temporary directory.
      repoPath = await copyMercurialFixture('hg_repo_2', __dirname);
      // This is an existing file to be changed & committed.
      filePath = path.join(repoPath, 'test.txt');
      // Add this directory as a new project in atom.
      setLocalProject(repoPath);
    });
  });

  afterEach(() => {
    deactivateAllPackages();
  });

  // In this test, we only mock `watchman` sending updates after the files are changed.
  // This is to avoid the dependency on `watchman` existing and working on test machines.
  function triggerWatchmanHgChange() {
    const repository = repositoryForPath(filePath);
    invariant(repository != null && repository.getType() === 'hg', 'non-hg repository');
    const hgRepository: HgRepositoryClient = (repository: any);
    hgRepository._service._filesDidChangeObserver.next([filePath]);
  }

  it('tests commit view have the changed files & commit/amend works', () => {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-diff-view:open');

    let diffViewElement: HTMLElement = (null : any);
    waitsFor('diff view to load', 10000, () => {
      diffViewElement = (atom.workspace.getActivePaneItem(): any);
      return diffViewElement != null && diffViewElement.tagName === 'NUCLIDE-DIFF-VIEW';
    });

    let revisionsTimelineElement: HTMLElement = (null: any);
    let treeElement: HTMLElement = (null: any);
    let diffFiles = [];

    runs(() => {
      treeElement = diffViewElement.querySelector('.nuclide-diff-view-tree');
      expect(treeElement).not.toBeNull();
      revisionsTimelineElement = diffViewElement.querySelector('.nuclide-diff-timeline');
      expect(revisionsTimelineElement).not.toBeNull();
    });

    let revisionLabels = [];

    waitsFor('revisions to load', 5000, () => {
      revisionLabels = revisionsTimelineElement.querySelectorAll('.revision-label');
      return revisionLabels.length > 0;
    });

    let commitButton: HTMLElement = (null: any);
    let amendButton: HTMLElement = (null: any);

    function getDiffHeaderTitle(): string {
      return diffViewElement
        .querySelector('.nuclide-ui-toolbar__center')
        .textContent;
    }

    function updateUncommittedButtons(): void {
      const uncommittedButtons = revisionsTimelineElement
        .querySelectorAll('.nuclide-diff-rev-side-button');
      commitButton = uncommittedButtons[0];
      amendButton = uncommittedButtons[1];
    }

    function getUncommittedChangesText(): string {
      const uncommittedNode = revisionsTimelineElement
        .querySelector('.revision-label--uncommitted');
      return uncommittedNode.firstChild.textContent;
    }

    runs(() => {
      expect(revisionLabels.length).toBe(4);

      expect(getUncommittedChangesText()).toBe('No Uncommitted Changes');
      updateUncommittedButtons();
      expect(commitButton).not.toBeNull();
      expect(amendButton).not.toBeNull();
      expect((commitButton: any).disabled).toBe(true);

      diffFiles = treeElement.querySelectorAll('.file-change');
      expect(diffFiles.length).toBe(0);

      expect(getDiffHeaderTitle()).toBe(NO_FILE_SELECTED_TITLE);

      // Save and wait for the file to update there.
      // TODO(most): edit the file in a text editor and in the diff view, save
      // and make sure they sync and update the markers/offsets correctly.
      fs.appendFileSync(filePath, '\nnew_line_1\nnew_line_2');
      triggerWatchmanHgChange();
    });

    waitsFor('repo diff status to update', 5000, () => {
      diffFiles = treeElement.querySelectorAll('.file-change');
      return diffFiles.length > 0;
    });

    runs(() => {
      // Verify the diff tree reflects the repo status.
      expect(diffFiles.length).toBe(1);
      const dataPathElement = diffFiles[0].querySelector('[data-path]');
      expect(dataPathElement).not.toBeNull();
      expect(dataPathElement.getAttribute('data-path')).toBe(filePath);

      // Verify the revision timeline reflects the repo status.
      expect(getUncommittedChangesText()).toBe('1 Uncommitted Change');

      expect((commitButton: any).disabled).toBe(false);

      // Double click to open the diff view with `test.txt`.
      diffFiles[0].click();
      diffFiles[0].click();
    });

    waitsFor('header title changes with diff update', () => {
      return getDiffHeaderTitle() !== NO_FILE_SELECTED_TITLE;
    });

    runs(() => {
      expect(getDiffHeaderTitle()).toBe('a570d5d57a44...Filesystem / Editor');
      const editorElements = diffViewElement.querySelectorAll('atom-text-editor');
      const oldEditor = ((editorElements[0]: any): atom$TextEditorElement).getModel();
      const newEditor = ((editorElements[1]: any): atom$TextEditorElement).getModel();
      // Verify the trailing block decoration shows in place.
      const offsetDecorations = oldEditor.getDecorations({type: 'block'});
      expect(offsetDecorations.length).toBe(1);
      const [trailingOffsetDecoration] = offsetDecorations;
      const {item, position} = trailingOffsetDecoration.getProperties();
      expect(position).toBe('after');
      expect(item.style.minHeight).toBe(`${2 * oldEditor.getLineHeightInPixels()}px`);
      expect(trailingOffsetDecoration.getMarker().getStartBufferPosition().isEqual([6, 0]))
        .toBeTruthy();

      // Verify the added highlight markers.
      const addLinesDecorations = newEditor.getDecorations({class: 'diff-view-insert'});
      expect(addLinesDecorations.length).toBe(2);
      expect(addLinesDecorations[0].getMarker().getBufferRange()
        .isEqual([[7, 0], [8, 0]])).toBeTruthy();
      expect(addLinesDecorations[1].getMarker().getBufferRange()
        .isEqual([[8, 0], [8, 10]])).toBeTruthy();

      // Click the commit button to go to commit mode.
      commitButton.click();
    });

    waitsFor('commit mode to open', () => {
      return diffViewElement.querySelector('.message-editor-wrapper') != null;
    });

    let commitModeContainer: HTMLElement = (null: any);
    runs(() => {
      revisionsTimelineElement = diffViewElement.querySelector('.nuclide-diff-timeline');
      expect(revisionsTimelineElement).toBeNull();
      commitModeContainer = diffViewElement.querySelector('.nuclide-diff-mode');
    });

    let modeButtons = [];
    waitsFor('load commit message', () => {
      modeButtons = commitModeContainer.querySelectorAll('.btn');
      return modeButtons.length === 2 && modeButtons[1].textContent === 'Commit';
    });

    let commitMessage = 'Commit title from nuclide\nThat is a multi-line commit message';
    let amendCheckbox: HTMLInputElement = (null: any);

    runs(() => {
      amendCheckbox = (commitModeContainer.querySelector('input[type=checkbox]'): any);
      expect(amendCheckbox.checked).toBe(false);
      const commitEditorElement = commitModeContainer.querySelector('atom-text-editor');
      const commitEditor = ((commitEditorElement: any): atom$TextEditorElement).getModel();
      commitEditor.setText(commitMessage);

      const doCommitButton = modeButtons[1];
      // Now, commit.
      doCommitButton.click();
    });

    waitsFor('back to browse mode after a successful commit', () => {
      revisionsTimelineElement = diffViewElement.querySelector('.nuclide-diff-timeline');
      return revisionsTimelineElement != null;
    });

    waitsFor('new commit to load in the revisions timeline', 5000, () => {
      revisionLabels = revisionsTimelineElement.querySelectorAll('.revision-label');
      return revisionLabels.length === 5;
    });

    waitsFor('hg status to update', () => {
      return getUncommittedChangesText() === 'No Uncommitted Changes';
    });

    runs(() => {
      expect(revisionLabels[1].textContent).toBe(`${commitMessage.split('\n')[0]} (HEAD)`);
      updateUncommittedButtons();
      expect((commitButton: any).disabled).toBe(true);
      // Now, let's amend to change the commit message.
      amendButton.click();
    });

    waitsFor('amend mode to open', () => {
      return diffViewElement.querySelector('.message-editor-wrapper') != null;
    });

    runs(() => {
      revisionsTimelineElement = diffViewElement.querySelector('.nuclide-diff-timeline');
      expect(revisionsTimelineElement).toBeNull();
      commitModeContainer = diffViewElement.querySelector('.nuclide-diff-mode');
    });

    waitsFor('load amend message', () => {
      modeButtons = commitModeContainer.querySelectorAll('.btn');
      return modeButtons.length === 2 && modeButtons[1].textContent === 'Commit';
    });

    runs(() => {
      amendCheckbox = (commitModeContainer.querySelector('input[type=checkbox]'): any);
      expect(amendCheckbox.checked).toBe(true);

      const commitEditorElement = commitModeContainer.querySelector('atom-text-editor');
      const commitEditor = ((commitEditorElement: any): atom$TextEditorElement).getModel();
      expect(commitEditor.getText()).toBe(commitMessage);
      commitMessage = `Amended:${commitMessage}`;
      commitEditor.setText(commitMessage);

      const doAmendButton = modeButtons[1];
      // Now, amend.
      doAmendButton.click();
    });

    waitsFor('back to browse mode after a successful amend', () => {
      revisionsTimelineElement = diffViewElement.querySelector('.nuclide-diff-timeline');
      return revisionsTimelineElement != null;
    });

    waitsFor('amended commit to show in the revisions timeline', 5000, () => {
      revisionLabels = revisionsTimelineElement.querySelectorAll('.revision-label');
      return revisionLabels.length === 5 &&
        revisionLabels[1].textContent === `${commitMessage.split('\n')[0]} (HEAD)`;
    });
  });
});
