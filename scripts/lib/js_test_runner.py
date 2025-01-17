# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import re
import shutil
import subprocess
import sys
import time

from multiprocessing import Pool, cpu_count


class JsTestRunner(object):
    def __init__(
        self,
        package_manager,
        include_apm=True,
        packages_to_test=[],
        verbose=False,
        run_in_band=False,
        continue_on_errors=False,
    ):
        self._package_manager = package_manager
        self._include_apm = include_apm
        self._packages_to_test = packages_to_test
        self._run_in_band = run_in_band
        self._verbose = verbose
        self._continue_on_errors = continue_on_errors

    def run_integration_tests(self):
        run_integration_tests_with_clean_state(
            self._package_manager.get_nuclide_path(),
            self._packages_to_test,
            self._continue_on_errors,
        )

    def run_tests(self):
        for package_name in self._packages_to_test:
            if not self._package_manager.is_local_dependency(package_name):
                raise Exception(
                    '%s is not a valid nuclide package name' % package_name)

        apm_tests = []
        npm_tests = []
        serial_only_tests = []

        for package_config in self._package_manager.get_configs():
            pkg_path = package_config['packageRootAbsolutePath']
            name = package_config['name']

            # We run the tests in Nuclide/spec in a separate integration test step.
            if name == 'nuclide':
                continue

            if package_config['excludeTestsFromContinuousIntegration']:
                continue

            test_runner = package_config['testRunner']
            if test_runner == 'apm' and not self._include_apm:
                continue

            if self._packages_to_test and name not in self._packages_to_test:
                continue

            test_args = (test_runner, pkg_path, name)
            if package_config['testsCannotBeRunInParallel']:
              test_bucket = serial_only_tests
            elif test_runner == 'npm':
              test_bucket = npm_tests
            else:
              test_bucket = apm_tests
            test_bucket.append(test_args)

        if self._run_in_band:
            # We run all tests in serial on Windows because Python's multiprocessing library has issues:
            # https://docs.python.org/2/library/multiprocessing.html#windows
            parallel_tests = None
            serial_tests = npm_tests + apm_tests
        else:
            # Currently, all tests appear to be able to be run in parallel. We keep this code
            # here in case we have to special-case any tests (on a short-term basis) to be run
            # serially after all of the parallel tests have finished.
            parallel_tests = npm_tests
            serial_tests = apm_tests

        serial_tests += serial_only_tests

        if parallel_tests:
            pool = Pool(processes=max(1, cpu_count() - 1))
            results = [
                pool.apply_async(
                    run_js_test,
                    args=test_args,
                    kwds={'continue_on_errors': self._continue_on_errors},
                ) for test_args in parallel_tests
            ]
            for async_result in results:
                async_result.wait()
                if not async_result.successful():
                    raise async_result.get()

        for test_args in serial_tests:
            (test_runner, pkg_path, name) = test_args
            run_js_test(
                test_runner,
                pkg_path,
                name,
                continue_on_errors=self._continue_on_errors,
            )


def run_js_test(
    test_runner,
    pkg_path,
    name,
    apm_retry=True,
    continue_on_errors=False,
):
    """Run `apm test` or `npm test` in the given pkg_path."""

    logging.info('Running `%s test` in %s...', test_runner, pkg_path)

    # In Atom 1.2+, "apm test" exits with an error when there is no "spec" directory
    if test_runner == 'apm' and not os.path.isdir(os.path.join(pkg_path, 'spec')):
        logging.info('NO TESTS TO RUN FOR: %s', name)
        return

    if test_runner == 'apm':
        test_args = ['apm', 'test']
    else:
        test_args = ['npm', 'test']

    proc = subprocess.Popen(
            test_args,
            cwd=pkg_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=False)
    stdout = []
    for line in iter(proc.stdout.readline, ''):
        # line is a bytes string literal in Python 3.
        logging.info('[%s test %s]: %s', test_runner, name, line.rstrip().decode('utf-8'))
        stdout.append(line)
    proc.wait()

    if proc.returncode:
        logging.info(
            'TEST FAILED: %s (exit code: %d)\nstdout:\n%s',
            name,
            proc.returncode,
            '\n'.join(stdout),
        )
        if test_runner == 'apm' and apm_retry and is_retryable_error('\n'.join(stdout)):
            logging.info('RETRYING TEST: %s', name)
            time.sleep(3)
            run_js_test(
                test_runner,
                pkg_path,
                name,
                apm_retry=False,
                continue_on_errors=continue_on_errors,
            )
            return
        if not continue_on_errors:
            raise Exception('TEST FAILED: %s test %s (exit code: %d)' %
                            (test_runner, name, proc.returncode))
    else:
        logging.info('TEST PASSED: %s', name)


def run_integration_tests_with_clean_state(
    path_to_nuclide,
    named_tests,
    continue_on_errors,
):
    test_dir = os.path.join(path_to_nuclide, 'spec')
    test_dir_backup = os.path.join(path_to_nuclide, 'spec-backup')

    # Copy test_dir and its contents to backup so we can restore it later.
    shutil.copytree(test_dir, test_dir_backup)

    ran_tests = []
    try:
        # Remove all files in test_dir leaving directory structure intact.
        for root, subdirs, files in os.walk(test_dir):
            # Whitelist "lib" subdirectories.
            if 'lib' in subdirs:
                subdirs.remove('lib')
            for name in files:
                os.remove(os.path.join(root, name))

        # One by one, copy each test in test_dir_backup into test_dir, run the test, and then remove that file.
        for root, subdirs, files in os.walk(test_dir_backup):
            # Whitelist "lib" subdirectories.
            if 'lib' in subdirs:
                subdirs.remove('lib')
            for name in files:
                # Copy file.
                if not named_tests or name in named_tests:
                    ran_tests.append(name)
                    src_path_list = os.path.join(root, name).split(os.path.sep)
                    dest_path_list = map(lambda piece: piece if piece != 'spec-backup' else 'spec', src_path_list)
                    dest = os.path.sep + os.path.join(*dest_path_list)
                    shutil.copy(os.path.join(root, name), dest)

                    # Run test.
                    start_time = time.time()
                    run_js_test(
                        'apm',
                        path_to_nuclide,
                        os.path.basename(dest),
                        continue_on_errors=continue_on_errors,
                    )
                    total_time = time.time() - start_time
                    print "Finished in %.1f seconds" % total_time

                    # Remove file.
                    os.remove(dest)
    finally:
        # Clean up by restoring the backup.
        shutil.rmtree(test_dir)
        shutil.copytree(test_dir_backup, test_dir)
        shutil.rmtree(test_dir_backup)
    if named_tests:
        missing_tests = filter(lambda test: test not in ran_tests, named_tests)
        if (missing_tests):
            raise Exception('%s are not valid integration tests' % (','.join(missing_tests)))

def is_retryable_error(output):
    errors = [
        # Atom 1.5.3 for sure, maybe later ones too:
        r'Atom\.app/atom:\s+line 117:\s+\d+\s+Segmentation fault: 11',
        r'Atom\.app/atom:\s+line 117:\s+\d+\s+Abort trap: 6',
        # Atom 1.6.1 for sure:
        r'Atom\.app/atom:\s+line 117:\s+\d+\s+Illegal instruction: 4',
        # Atom 1.6.2 for sure:
        r'Atom\.app/atom:\s+line 117:\s+\d+\s+Bus error: 10',
    ]
    return any(re.search(error, output) for error in errors)
