'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Datatip,
  DatatipProvider,
  DatatipService,
} from '../../nuclide-datatip';
import type {
  DiagnosticUpdater,
  FileMessageUpdate,
  FileDiagnosticMessage,
} from '../../nuclide-diagnostics-base';

import {
  CompositeDisposable,
  Disposable,
} from 'atom';
import invariant from 'assert';
import {makeDiagnosticsDatatipComponent} from './DiagnosticsDatatipComponent';
import {passesGK} from '../../nuclide-commons';


const GK_DIAGNOSTICS_DATATIPS = 'nuclide_diagnostics_datatips';

const DATATIP_PACKAGE_NAME = 'nuclide-diagnostics-datatip';
export async function datatip(editor: TextEditor, position: atom$Point): Promise<?Datatip> {
  if (!await passesGK(GK_DIAGNOSTICS_DATATIPS, 0)) {
    return null;
  }
  invariant(fileDiagnostics);
  const messagesForFile = fileDiagnostics.get(editor);
  if (messagesForFile == null) {
    return null;
  }
  const messagesAtPosition = messagesForFile.filter(
    message => message.range != null && message.range.containsPoint(position)
  );
  if (messagesAtPosition.length === 0) {
    return null;
  }
  const [message] = messagesAtPosition;
  const {range} = message;
  invariant(range);
  return {
    component: makeDiagnosticsDatatipComponent(message),
    pinnable: false,
    range: range,
  };
}

function getDatatipProvider(): DatatipProvider {
  return {
    // show this datatip for every type of file
    validForScope: (scope: string) => true,
    providerName: DATATIP_PACKAGE_NAME,
    inclusionPriority: 1,
    datatip,
  };
}

export function consumeDatatipService(service: DatatipService): IDisposable {
  const datatipProvider = getDatatipProvider();
  invariant(disposables);
  service.addProvider(datatipProvider);
  const disposable = new Disposable(() => service.removeProvider(datatipProvider));
  disposables.add(disposable);
  return disposable;
}

let disposables: ?CompositeDisposable = null;
let fileDiagnostics: ?WeakMap<TextEditor, Array<FileDiagnosticMessage>> = null;

export function activate(state: ?mixed): void {
  disposables = new CompositeDisposable();
  fileDiagnostics = new WeakMap();
}

export function consumeDiagnosticUpdates(diagnosticUpdater: DiagnosticUpdater): void {
  invariant(disposables);
  disposables.add(atom.workspace.observeTextEditors((editor: TextEditor) => {
    invariant(fileDiagnostics);
    const filePath = editor.getPath();
    if (!filePath) {
      return;
    }
    fileDiagnostics.set(editor, []);
    const callback = (update: FileMessageUpdate) => {
      invariant(fileDiagnostics);
      fileDiagnostics.set(editor, update.messages);
    };
    const disposable = diagnosticUpdater.onFileMessagesDidUpdate(callback, filePath);

    editor.onDidDestroy(() => {
      disposable.dispose();
      if (fileDiagnostics != null) {
        fileDiagnostics.delete(editor);
      }
    });
    invariant(disposables);
    disposables.add(disposable);
  }));
}

export function deactivate(): void {
  if (disposables != null) {
    disposables.dispose();
    disposables = null;
  }
  fileDiagnostics = null;
}
