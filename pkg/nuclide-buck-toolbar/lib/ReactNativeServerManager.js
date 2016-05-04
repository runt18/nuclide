Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideReactNativeNodeExecutor = require('../../nuclide-react-native-node-executor');

var _nuclideReactNativeNodeExecutor2 = _interopRequireDefault(_nuclideReactNativeNodeExecutor);

var _ReactNativeServerStatus = require('./ReactNativeServerStatus');

var _ReactNativeServerStatus2 = _interopRequireDefault(_ReactNativeServerStatus);

var _reactForAtom = require('react-for-atom');

var _ReactNativeServerPanel = require('./ReactNativeServerPanel');

var _ReactNativeServerPanel2 = _interopRequireDefault(_ReactNativeServerPanel);

var _ReactNativeServerActions = require('./ReactNativeServerActions');

var _ReactNativeServerActions2 = _interopRequireDefault(_ReactNativeServerActions);

var ReactNativeServerManager = (function () {
  function ReactNativeServerManager(dispatcher, actions) {
    _classCallCheck(this, ReactNativeServerManager);

    this._actions = actions;
    this._dispatcher = dispatcher;
    this._status = new _ReactNativeServerStatus2.default();
    this._setupActions();
  }

  _createClass(ReactNativeServerManager, [{
    key: 'dispose',
    value: function dispose() {
      this._stopServer();
      if (this._nodeExecutorServer) {
        this._nodeExecutorServer.close();
      }
    }
  }, {
    key: '_setupActions',
    value: function _setupActions() {
      var _this = this;

      this._dispatcher.register(function (action) {
        switch (action.actionType) {
          case _ReactNativeServerActions2.default.ActionType.START_NODE_EXECUTOR_SERVER:
            _this._startNodeExecutorServer();
            break;
          case _ReactNativeServerActions2.default.ActionType.START_SERVER:
            _this._startServer(action.serverCommand);
            break;
          case _ReactNativeServerActions2.default.ActionType.STOP_SERVER:
            _this._stopServer();
            break;
          case _ReactNativeServerActions2.default.ActionType.RESTART_SERVER:
            _this._stopServer();
            atom.workspace.destroyActivePaneItem();
            _this._startServer(action.serverCommand);
            break;
        }
      });
    }
  }, {
    key: '_stopServer',
    value: function _stopServer() {
      this._processRunner && this._processRunner.dispose();
      this._processRunner = null;
      this._status.setServerRunning(false);
    }
  }, {
    key: '_startServer',
    value: _asyncToGenerator(function* (serverCommand) {
      var processRunner = this._processRunner;
      if (processRunner == null) {
        processRunner = yield this._createProcessRunner(serverCommand);
        if (processRunner == null) {
          return;
        }
        this._processRunner = processRunner;
        this._status.setServerRunning(true);
      }
      (0, _assert2.default)(processRunner);
      processRunner.run();
    })
  }, {
    key: '_createProcessRunner',
    value: _asyncToGenerator(function* (serverCommand) {
      var getRunCommandInNewPane = require('../../nuclide-process-output');

      var _getRunCommandInNewPane = getRunCommandInNewPane();

      var runCommandInNewPane = _getRunCommandInNewPane.runCommandInNewPane;
      var disposable = _getRunCommandInNewPane.disposable;

      var runProcessWithHandlers = function runProcessWithHandlers(dataHandlerOptions) {
        var stdout = dataHandlerOptions.stdout;
        var stderr = dataHandlerOptions.stderr;
        var error = dataHandlerOptions.error;
        var exit = dataHandlerOptions.exit;

        (0, _assert2.default)(serverCommand);
        var observable = (0, _nuclideCommons.scriptSafeSpawnAndObserveOutput)(serverCommand);
        var onNext = function onNext(data) {
          if (data.stdout) {
            stdout(data.stdout);
          } else {
            stderr(data.stderr || '');
          }
        };
        var onError = function onError(data) {
          error(new Error(data));
          exit(1);
          disposable.dispose();
        };
        var onExit = function onExit() {
          exit(0);
          disposable.dispose();
        };
        var subscription = observable.subscribe(onNext, onError, onExit);

        return Promise.resolve({
          kill: function kill() {
            subscription.unsubscribe();
            disposable.dispose();
          }
        });
      };

      var _require = require('../../nuclide-process-output-store');

      var ProcessOutputStore = _require.ProcessOutputStore;

      var processOutputStore = new ProcessOutputStore(runProcessWithHandlers);

      var panel = _reactForAtom.React.createElement(_ReactNativeServerPanel2.default, {
        actions: this._actions,
        store: this._status,
        serverCommand: serverCommand
      });

      var isOutputPaneOpen = false;
      var paneSubscription = undefined;

      // We don't want to call getRunCommandInNewPane() multiple times because it has unwanted
      // side effects. So, we cache the output of runCommandInNewPane function and use the same
      // instance of runCommandInNewPane to re-open output pane for the same server process.
      return {
        run: _asyncToGenerator(function* () {
          if (isOutputPaneOpen) {
            return;
          }
          var textEditor = yield runCommandInNewPane({
            tabTitle: 'React Native Server',
            processOutputStore: processOutputStore,
            processOutputViewTopElement: panel
          });
          isOutputPaneOpen = true;

          paneSubscription = atom.workspace.onDidDestroyPaneItem(function (event) {
            if (event.item === textEditor) {
              isOutputPaneOpen = false;
              (0, _assert2.default)(paneSubscription);
              paneSubscription.dispose();
              paneSubscription = null;
            }
          });
        }),

        dispose: function dispose() {
          processOutputStore && processOutputStore.stopProcess();
          paneSubscription && paneSubscription.dispose();
        }
      };
    })
  }, {
    key: '_attachNodeDebugger',
    value: _asyncToGenerator(function* (pid) {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      var debuggerService = yield require('../../nuclide-service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
      debuggerService.debugNode(pid);
    })
  }, {
    key: '_startNodeExecutorServer',
    value: function _startNodeExecutorServer() {
      if (!this._nodeExecutorServer) {
        var server = this._nodeExecutorServer = new _nuclideReactNativeNodeExecutor2.default(8090);
        server.onDidEvalApplicationScript(this._attachNodeDebugger.bind(this));
      }
    }
  }]);

  return ReactNativeServerManager;
})();

exports.default = ReactNativeServerManager;
module.exports = exports.default;