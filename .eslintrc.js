'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  'parser': 'babel-eslint',

  'parserOptions': {
    'ecmaVersion': 7,
    'sourceType': 'module',
    'ecmaFeatures': {
      'globalReturn': true,
      'jsx': true,
      'experimentalObjectRestSpread': true
    }
  },

  // https://github.com/sindresorhus/globals/blob/master/globals.json
  'env': {
    'atomtest': true,
    'es6': true,
    'jasmine': true,
    'node': true
  },

  'globals': {
    'atom': false,
    'document': false,
    'window': false,
    'HTMLElement': false,
    'WebSocket': false
  },

  'rules': {
    // Possible Errors (http://eslint.org/docs/rules/#possible-errors)
    'comma-dangle': [1, 'always-multiline'],
    'no-cond-assign': 1,
    'no-console': 1,
    'no-constant-condition': 1,
    'no-control-regex': 1,
    'no-debugger': 1,
    'no-dupe-args': 1,
    'no-dupe-keys': 1,
    'no-duplicate-case': 1,
    'no-empty': [1, {'allowEmptyCatch': true}],
    'no-empty-character-class': 1,
    'no-ex-assign': 1,
    'no-extra-boolean-cast': 1,
    'no-extra-parens': 0,
    'no-extra-semi': 1,
    'no-func-assign': 1,
    'no-inner-declarations': 1,
    'no-invalid-regexp': 1,
    'no-irregular-whitespace': 1,
    'no-negated-in-lhs': 1,
    'no-obj-calls': 1,
    'no-regex-spaces': 1,
    'no-sparse-arrays': 1,
    'no-unexpected-multiline': 1,
    'no-unreachable': 1,
    'no-unsafe-finally': 1,
    'use-isnan': 1,
    'valid-jsdoc': 0,
    'valid-typeof': 1,

    // Best Practices (http://eslint.org/docs/rules/#best-practices)
    'accessor-pairs': 1,
    'array-callback-return': 0,
    'block-scoped-var': 0,
    'complexity': 0,
    'consistent-return': 0,
    'curly': 1,
    // 'curly': [1, 'multi-line', 'consistent'],
    'default-case': 0,
    'dot-location': [1, 'property'],
    // 'dot-notation': 1,
    'eqeqeq': [1, 'allow-null'],
    'guard-for-in': 0,
    'no-alert': 1,
    'no-caller': 1,
    'no-case-declarations': 0,
    'no-div-regex': 1,
    'no-else-return': 0,
    'no-empty-function': 0,
    'no-empty-pattern': 1,
    'no-eq-null': 0,
    'no-eval': 1,
    'no-extend-native': 1,
    'no-extra-bind': 1,
    'no-extra-label': 1,
    'no-fallthrough': 1,
    'no-floating-decimal': 1,
    'no-implicit-coercion': 1,
    'no-implicit-globals': 0,
    'no-implied-eval': 1,
    'no-invalid-this': 0,
    'no-iterator': 1,
    'no-labels': 1,
    'no-lone-blocks': 1,
    'no-loop-func': 0,
    'no-magic-numbers': 0,
    'no-multi-spaces': 1,
    'no-multi-str': 0,
    'no-native-reassign': 1,
    'no-new': 1,
    'no-new-func': 1,
    'no-new-wrappers': 1,
    'no-octal': 1,
    'no-octal-escape': 1,
    // 'no-param-reassign': 1,
    'no-proto': 1,
    'no-redeclare': [1, {'builtinGlobals': true}],
    'no-return-assign': 1,
    'no-script-url': 1,
    'no-self-assign': 1,
    'no-self-compare': 1,
    'no-sequences': 1,
    'no-throw-literal': 0,
    'no-unmodified-loop-condition': 0,
    // 'no-unused-expressions': 1,
    'no-unused-labels': 1,
    'no-useless-call': 1,
    'no-useless-concat': 1,
    'no-useless-escape': 1,
    'no-void': 1,
    'no-warning-comments': 0,
    'no-with': 1,
    'radix': 1,
    'vars-on-top': 0,
    'wrap-iife': [1, 'inside'],
    'yoda': 1,

    // Strict Mode (http://eslint.org/docs/rules/#strict-mode)
    'strict': 0,

    // Variables (http://eslint.org/docs/rules/#variables)
    'init-declarations': 0,
    'no-catch-shadow': 1,
    'no-delete-var': 1,
    'no-label-var': 1,
    'no-restricted-globals': 0,
    'no-shadow': 1,
    'no-shadow-restricted-names': 1,
    'no-undef': 1,
    'no-undef-init': 0,
    'no-undefined': 0,
    'no-unused-vars': [1, {'args': 'none'}],
    'no-use-before-define': 0,

    // Node.js and CommonJS (http://eslint.org/docs/rules/#nodejs-and-commonjs)
    'callback-return': 0,
    'global-require': 0,
    'handle-callback-err': 1,
    'no-mixed-requires': 1,
    'no-new-require': 1,
    'no-path-concat': 1,
    'no-process-env': 0,
    'no-process-exit': 0,
    'no-restricted-modules': 0,
    'no-sync': 0,

    // // Stylistic Issues (http://eslint.org/docs/rules/#stylistic-issues)
    'array-bracket-spacing': 1,
    'block-spacing': 1,
    'brace-style': [1, '1tbs', {'allowSingleLine': true}],
    'camelcase': 0,
    'comma-spacing': 1,
    'comma-style': 1,
    'computed-property-spacing': 1,
    'consistent-this': 1,
    'eol-last': 1,
    'func-names': 0,
    'func-style': 0,
    'id-blacklist': 0,
    'id-length': 0,
    'id-match': 0,
    'indent': [1, 2, {'SwitchCase': 1}],
    'jsx-quotes': [1, 'prefer-double'],
    'key-spacing': [1, {'beforeColon': false, 'afterColon': true}],
    'keyword-spacing': 1,
    'linebreak-style': 1,
    'lines-around-comment': 0,
    'max-depth': 0,
    'max-len': [1, 100, {'tabWidth': 2, 'ignoreTrailingComments': true, 'ignoreUrls': true}],
    'max-nested-callbacks': 0,
    'max-params': 0,
    'max-statements': 0,
    'max-statements-per-line': 0,
    'new-cap': 0,
    'new-parens': 1,
    'newline-after-var': 0,
    'newline-before-return': 0,
    'newline-per-chained-call': 0,
    'no-array-constructor': 1,
    'no-bitwise': 1,
    'no-continue': 0,
    'no-inline-comments': 0,
    'no-lonely-if': 0,
    'no-mixed-spaces-and-tabs': 1,
    'no-multiple-empty-lines': [1, {'max': 2, 'maxBOF': 0, 'maxEOF': 1}],
    'no-negated-condition': 0,
    'no-nested-ternary': 0,
    'no-new-object': 1,
    'no-plusplus': 0,
    'no-restricted-syntax': 0,
    'no-spaced-func': 1,
    'no-ternary': 0,
    'no-trailing-spaces': 1,
    'no-underscore-dangle': 0,
    'no-unneeded-ternary': 0,
    'no-whitespace-before-property': 1,
    'object-curly-spacing': 1,
    'one-var': [1, 'never'],
    'one-var-declaration-per-line': 0,
    'operator-assignment': 1,
    'operator-linebreak': 0,
    // padded-blocks: [1, 'never'],
    // quote-props: [1, 'as-needed'],
    'quotes': [1, 'single', 'avoid-escape'],
    'require-jsdoc': 0,
    'semi': 1,
    'semi-spacing': 1,
    'sort-vars': 0,
    'space-before-blocks': 1,
    'space-before-function-paren': [1, 'never'],
    'space-in-parens': [1, 'never'],
    'space-infix-ops': 1,
    'space-unary-ops': 1,
    'wrap-regex': 0,

    // ECMAScript 6 (http://eslint.org/docs/rules/#ecmascript-6)
    'arrow-body-style': 0,
    'arrow-parens': 0,
    'arrow-spacing': 1,
    'constructor-super': 1,
    'generator-star-spacing': 0,
    'no-class-assign': 1,
    'no-confusing-arrow': [1, {'allowParens': true}],
    'no-const-assign': 1,
    'no-dupe-class-members': 1,
    'no-duplicate-imports': 0,
    'no-new-symbol': 1,
    'no-restricted-imports': 0,
    'no-this-before-super': 1,
    'no-useless-computed-key': 1,
    'no-useless-constructor': 0,
    'no-var': 1,
    // 'object-shorthand': 1,
    'prefer-arrow-callback': [1, {'allowNamedFunctions': true}],
    'prefer-const': 1,
    'prefer-reflect': 0,
    'prefer-rest-params': 0,
    'prefer-spread': 0,
    'prefer-template': 0,
    'require-yield': 0,
    'sort-imports': 0,
    'template-curly-spacing': 1,
    'yield-star-spacing': 1,

    // Babel (https://github.com/babel/eslint-plugin-babel)
    'babel/array-bracket-spacing': 0,
    'babel/arrow-parens': [1, 'as-needed'],
    'babel/generator-star-spacing': 1,
    'babel/new-cap': 0,
    'babel/object-curly-spacing': 0,
    'babel/object-shorthand': 0,
    // Babel (not in eslint)
    'babel/no-await-in-loop': 1,
    'babel/flow-object-type': [1, 'semicolon'],

    // flow-vars (https://github.com/zertosh/eslint-plugin-flow-vars)
    'flow-vars/define-flow-type': 1,
    'flow-vars/use-flow-type': 1,

    // Jasmine (https://github.com/tlvince/eslint-plugin-jasmine)
    'jasmine/missing-expect': 0,
    'jasmine/named-spy': 0,
    'jasmine/no-assign-spyon': 0,
    'jasmine/no-disabled-tests': 0,
    'jasmine/no-focused-tests': 0,
    'jasmine/no-spec-dupes': [1, 'branch'],
    'jasmine/no-suite-callback-args': 0,
    'jasmine/no-suite-dupes': [1, 'branch'],
    'jasmine/valid-expect': 0,

    // nuclide-internal (https://github.com/facebook/nuclide/tree/master/resources/eslint-plugin-nuclide-internal)
    'nuclide-internal/command-menu-items': 1,
    'nuclide-internal/consistent-import-name': 1,
    'nuclide-internal/import-type-style': 1,
    'nuclide-internal/license-header': 1,
    'nuclide-internal/type-alias-semi': 1,

    // prefer-object-spread (https://github.com/bryanrsmith/eslint-plugin-prefer-object-spread)
    'prefer-object-spread/prefer-object-spread': 1,

    // React (https://github.com/yannickcr/eslint-plugin-react)
    'react/display-name': 0,
    'react/forbid-prop-types': 0,
    'react/jsx-boolean-value': 0,
    'react/jsx-closing-bracket-location': [1, {'selfClosing': 'tag-aligned', 'nonEmpty': 'after-props'}],
    'react/jsx-curly-spacing': [1, 'never'],
    'react/jsx-equals-spacing': 0,
    'react/jsx-first-prop-new-line': 0,
    'react/jsx-handler-names': 0,
    'react/jsx-indent': 0,
    'react/jsx-indent-props': 0,
    'react/jsx-key': 1,
    'react/jsx-max-props-per-line': 0,
    'react/jsx-no-bind': 0,
    'react/jsx-no-duplicate-props': 1,
    'react/jsx-no-literals': 0,
    'react/jsx-no-undef': 1,
    'react/jsx-pascal-case': 0,
    'react/jsx-sort-prop-types': 0,
    'react/jsx-sort-props': 0,
    'react/jsx-space-before-closing': 1,
    'react/jsx-uses-react': 1,
    'react/jsx-uses-vars': 1,
    'react/no-danger': 0,
    'react/no-deprecated': 1,
    'react/no-did-mount-set-state': 0,
    'react/no-did-update-set-state': 0,
    'react/no-direct-mutation-state': 0,
    'react/no-is-mounted': 0,
    'react/no-multi-comp': 0,
    'react/no-set-state': 0,
    'react/no-string-refs': 0,
    'react/no-unknown-property': 1,
    'react/prefer-es6-class': 0,
    'react/prefer-stateless-function': 0,
    'react/prop-types': 1,
    'react/react-in-jsx-scope': 1,
    'react/require-extension': 0,
    'react/require-render-return': 0,
    'react/self-closing-comp': 0,
    'react/sort-comp': 0,
    'react/sort-prop-types': 0,
    'react/wrap-multilines': 0,
  },

  'plugins': [
    'babel',
    'flow-vars',
    'jasmine',
    'nuclide-internal',
    'prefer-object-spread',
    'react',
  ],
};
