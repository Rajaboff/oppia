# Copyright 2016 The Oppia Authors. All Rights Reserved.
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

"""Controller for user query related pages and handlers."""

from __future__ import absolute_import
from __future__ import unicode_literals

from core.controllers import acl_decorators
from core.controllers import base
from core.controllers import domain_objects_validator
from core.domain import email_manager
from core.domain import user_query_services
from core.domain import user_services
import feconf


class EmailDashboardPage(base.BaseHandler):
    """Page to submit query and show past queries."""

    URL_PATH_ARGS_SCHEMAS = {}
    HANDLER_ARGS_SCHEMAS = {
        'GET': {}
    }

    @acl_decorators.can_manage_email_dashboard
    def get(self):
        """Handles GET requests."""
        self.render_template('email-dashboard-page.mainpage.html')


def _generate_user_query_dicts(user_queries):
    """Generate data dicts for the user queries.

    Args:
        user_queries: list(UserQuery). List of user queries to transform.

    Returns:
        list(dict(str, str)). List of data dicts for the user queries.
    """
    submitters_settings = user_services.get_users_settings(
        list(set(model.submitter_id for model in user_queries)))
    user_id_to_username = {
        submitter.user_id: submitter.username
        for submitter in submitters_settings
    }
    return [
        {
            'id': user_query.id,
            'submitter_username': user_id_to_username[user_query.submitter_id],
            'created_on': user_query.created_on.strftime('%d-%m-%y %H:%M:%S'),
            'status': user_query.status,
            'num_qualified_users': len(user_query.user_ids)
        } for user_query in user_queries
    ]


class EmailDashboardDataHandler(base.BaseHandler):
    """Query data handler."""

    GET_HANDLER_ERROR_RETURN_TYPE = feconf.HANDLER_TYPE_JSON
    URL_PATH_ARGS_SCHEMAS = {}
    HANDLER_ARGS_SCHEMAS = {
        'GET': {
            'cursor': {
                'schema': {
                    'type': 'basestring'
                },
                'default_value': None
            },
            'num_queries_to_fetch': {
                'schema': {
                    'type': 'int',
                    'validators': [{
                        'id': 'is_at_least',
                        # The min_value ensures that the value is non-negative.
                        'min_value': 0
                    }]
                }
            }
        },
        'POST': {
            'data': {
                'schema': {
                    'type': 'object_dict',
                    'validation_method': (
                        domain_objects_validator.validate_email_dashboard_data)
                }
            }
        }
    }

    @acl_decorators.can_manage_email_dashboard
    def get(self):
        cursor = self.normalized_request.get('cursor')
        num_queries_to_fetch = (
            self.normalized_request.get('num_queries_to_fetch'))

        user_queries, next_cursor = (
            user_query_services.get_recent_user_queries(
                num_queries_to_fetch, cursor))

        data = {
            'recent_queries': _generate_user_query_dicts(user_queries),
            'cursor': next_cursor
        }
        self.render_json(data)

    @acl_decorators.can_manage_email_dashboard
    def post(self):
        """Post handler for query."""
        data = self.normalized_payload.get('data')
        kwargs = {key: data[key] for key in data if data[key] is not None}

        user_query_id = user_query_services.save_new_user_query(
            self.user_id, kwargs)

        # Start MR job in background.
        user_query = (
            user_query_services.get_user_query(user_query_id, strict=True))
        data = {
            'query': _generate_user_query_dicts([user_query])[0]
        }
        self.render_json(data)


class QueryStatusCheckHandler(base.BaseHandler):
    """Handler for checking status of individual queries."""

    GET_HANDLER_ERROR_RETURN_TYPE = feconf.HANDLER_TYPE_JSON
    URL_PATH_ARGS_SCHEMAS = {}
    HANDLER_ARGS_SCHEMAS = {
        'GET': {
            'query_id': {
                'schema': {
                    'type': 'basestring'
                }
            }
        }
    }

    @acl_decorators.can_manage_email_dashboard
    def get(self):
        query_id = self.normalized_request.get('query_id')

        user_query = user_query_services.get_user_query(query_id)
        if user_query is None:
            raise self.InvalidInputException('Invalid query id.')

        data = {
            'query': _generate_user_query_dicts([user_query])[0]
        }
        self.render_json(data)


class EmailDashboardResultPage(base.BaseHandler):
    """Handler for email dashboard result page."""

    URL_PATH_ARGS_SCHEMAS = {
        'query_id': {
            'schema': {
                'type': 'basestring'
            }
        }
    }
    HANDLER_ARGS_SCHEMAS = {
        'GET': {},
        'POST': {
            'email_subject': {
                'schema': {
                    'type': 'basestring'
                }
            },
            'email_body': {
                'schema': {
                    'type': 'basestring'
                }
            },
            'email_intent': {
                'schema': {
                    'type': 'basestring'
                }
            },
            'max_recipients': {
                'schema': {
                    'type': 'int'
                },
                'default_value': None
            }
        }
    }

    @acl_decorators.can_manage_email_dashboard
    def get(self, query_id):
        user_query = user_query_services.get_user_query(query_id)
        if (
                user_query is None or
                user_query.status != feconf.USER_QUERY_STATUS_COMPLETED
        ):
            raise self.InvalidInputException('400 Invalid query id.')

        if user_query.submitter_id != self.user_id:
            raise self.UnauthorizedUserException(
                '%s is not an authorized user for this query.' % self.username)

        self.render_template('email-dashboard-result.mainpage.html')

    @acl_decorators.can_manage_email_dashboard
    def post(self, query_id):
        user_query = user_query_services.get_user_query(query_id)
        if (
                user_query is None or
                user_query.status != feconf.USER_QUERY_STATUS_COMPLETED
        ):
            raise self.InvalidInputException('400 Invalid query id.')

        if user_query.submitter_id != self.user_id:
            raise self.UnauthorizedUserException(
                '%s is not an authorized user for this query.' % self.username)

        email_subject = self.normalized_payload.get('email_subject')
        email_body = self.normalized_payload.get('email_body')
        max_recipients = self.normalized_payload.get('max_recipients')
        email_intent = self.normalized_payload.get('email_intent')
        user_query_services.send_email_to_qualified_users(
            query_id, email_subject, email_body, email_intent, max_recipients)
        self.render_json({})


class EmailDashboardCancelEmailHandler(base.BaseHandler):
    """Handler for not sending any emails using query result."""

    URL_PATH_ARGS_SCHEMAS = {
        'query_id': {
            'schema': {
                'type': 'basestring'
            }
        }
    }
    HANDLER_ARGS_SCHEMAS = {
        'POST': {}
    }

    @acl_decorators.can_manage_email_dashboard
    def post(self, query_id):
        user_query = user_query_services.get_user_query(query_id)
        if (
                user_query is None or
                user_query.status != feconf.USER_QUERY_STATUS_COMPLETED
        ):
            raise self.InvalidInputException('400 Invalid query id.')

        if user_query.submitter_id != self.user_id:
            raise self.UnauthorizedUserException(
                '%s is not an authorized user for this query.' % self.username)
        user_query_services.archive_user_query(user_query.id)
        self.render_json({})


class EmailDashboardTestBulkEmailHandler(base.BaseHandler):
    """Handler for testing bulk email before sending it.

    This handler sends a test email to submitter of query before it is sent to
    qualfied users in bulk.
    """

    URL_PATH_ARGS_SCHEMAS = {
        'query_id': {
            'schema': {
                'type': 'basestring'
            }
        }
    }
    HANDLER_ARGS_SCHEMAS = {
        'POST': {
            'email_subject': {
                'schema': {
                    'type': 'basestring'
                }
            },
            'email_body': {
                'schema': {
                    'type': 'basestring'
                }
            }
        }
    }

    @acl_decorators.can_manage_email_dashboard
    def post(self, query_id):
        user_query = user_query_services.get_user_query(query_id)
        if (
                user_query is None or
                user_query.status != feconf.USER_QUERY_STATUS_COMPLETED
        ):
            raise self.InvalidInputException('400 Invalid query id.')

        if user_query.submitter_id != self.user_id:
            raise self.UnauthorizedUserException(
                '%s is not an authorized user for this query.' % self.username)

        email_subject = self.normalized_payload.get('email_subject')
        email_body = self.normalized_payload.get('email_body')
        test_email_body = '[This is a test email.]<br><br> %s' % email_body
        email_manager.send_test_email_for_bulk_emails(
            user_query.submitter_id, email_subject, test_email_body)
        self.render_json({})
