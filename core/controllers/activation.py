# Copyright 2017 The Oppia Authors. All Rights Reserved.
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

"""Controllers for the learner dashboard."""

from __future__ import absolute_import  # pylint: disable=import-only-modules
from __future__ import unicode_literals  # pylint: disable=import-only-modules

from core.controllers import base
from core.domain import activity_services


class ActivationPage(base.BaseHandler):
    """Code activation page."""

    def get(self):
        """Handles GET requests."""
        self.render_template('activation-page.mainpage.html')


class ActivationHandler(base.BaseHandler):
    """Code activation info."""

    def get(self, token):
        activity = activity_services.get_activity_by_token(token)

        self.render_json({'activity': activity})
