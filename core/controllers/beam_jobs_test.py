# coding: utf-8
#
# Copyright 2021 The Oppia Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Tests for the beam jobs controllers."""

from __future__ import absolute_import
from __future__ import unicode_literals
import datetime

from core.domain import beam_job_domain
from core.domain import beam_job_services
from core.tests import test_utils
import feconf
from jobs import base_jobs
from jobs import jobs_manager

import apache_beam as beam


class FooJob(base_jobs.JobBase):
    """Simple test-only class."""

    def run(self) -> beam.PCollection:
        """Does nothing."""
        return self.pipeline | beam.Create([])


class BeamHandlerTestBase(test_utils.GenericTestBase):
    """Common setUp() and tearDown() for Apache Beam job handler tests."""

    def setUp(self) -> None:
        super(BeamHandlerTestBase, self).setUp() # type: ignore[no-untyped-call]
        self.signup(
            self.RELEASE_COORDINATOR_EMAIL, self.RELEASE_COORDINATOR_USERNAME)
        self.add_user_role(
            self.RELEASE_COORDINATOR_USERNAME,
            feconf.ROLE_ID_RELEASE_COORDINATOR)
        self.login(self.RELEASE_COORDINATOR_EMAIL, is_super_admin=True)

    def tearDown(self) -> None:
        self.logout()
        super(BeamHandlerTestBase, self).tearDown() # type: ignore[no-untyped-call]


class BeamJobHandlerTests(BeamHandlerTestBase):

    def test_get_returns_registered_jobs(self) -> None:
        job = beam_job_domain.BeamJob(FooJob)
        get_beam_jobs_swap = self.swap_to_always_return(
            beam_job_services, 'get_beam_jobs', value=[job])

        with get_beam_jobs_swap:
            response = self.get_json('/beam_job')

        self.assertEqual(response, {
            'jobs': [{'name': 'FooJob', 'parameter_names': []}],
        })


class BeamJobRunHandlerTests(BeamHandlerTestBase):

    def test_get_returns_all_runs(self) -> None:
        beam_job_services.create_beam_job_run_model('FooJob', []).put()
        beam_job_services.create_beam_job_run_model('FooJob', []).put()
        beam_job_services.create_beam_job_run_model('FooJob', []).put()

        response = self.get_json('/beam_job_run')

        self.assertIn('runs', response)
        runs = response['runs']
        self.assertEqual(len(runs), 3)
        self.assertCountEqual([run['job_name'] for run in runs], ['FooJob'] * 3)
        self.assertCountEqual(
            [run['job_arguments'] for run in runs], [[], [], []])

    def test_put_starts_new_job(self) -> None:
        now = datetime.datetime.utcnow()
        mock_job = beam_job_domain.BeamJobRun(
            '123', 'FooJob', 'RUNNING', [], now, now, False)
        run_job_sync_swap = self.swap_to_always_return(
            jobs_manager, 'run_job_sync', value=mock_job)

        with run_job_sync_swap:
            response = self.put_json( # type: ignore[no-untyped-call]
                '/beam_job_run', {'job_name': 'FooJob', 'job_arguments': []},
                csrf_token=self.get_new_csrf_token()) # type: ignore[no-untyped-call]

        self.assertEqual(response, mock_job.to_dict())


class BeamJobRunResultHandlerTests(BeamHandlerTestBase):

    def test_get_returns_job_output(self) -> None:
        beam_job_services.create_beam_job_run_result_model('123', 'o', '').put()

        response = self.get_json('/beam_job_run_result?job_id=123')

        self.assertEqual(response, {'stdout': 'o', 'stderr': ''})

    def test_get_raises_when_job_id_missing(self) -> None:
        response = (
            self.get_json('/beam_job_run_result', expected_status_int=400))

        self.assertEqual(
            response['error'], 'Missing key in handler args: job_id.')
