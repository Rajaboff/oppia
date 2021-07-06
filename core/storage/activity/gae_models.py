# coding: utf-8
#
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

"""Models for activity references."""

from __future__ import absolute_import  # pylint: disable=import-only-modules
from __future__ import unicode_literals  # pylint: disable=import-only-modules

from core.platform import models
import core.storage.base_model.gae_models as base_models
import feconf
from uuid import uuid4

datastore_services = models.Registry.import_datastore_services()


class ActivityReferencesModel(base_models.BaseModel):
    """Storage model for a list of activity references.

    The id of each model instance is the name of the list. This should be one
    of the constants in feconf.ALL_ACTIVITY_REFERENCE_LIST_TYPES.
    """

    # The types and ids of activities to show in the library page. Each item
    # in this list is a dict with two keys: 'type' and 'id'.
    activity_references = datastore_services.JsonProperty(repeated=True)

    @staticmethod
    def get_deletion_policy():
        """ActivityReferencesModel are not related to users."""
        return base_models.DELETION_POLICY.NOT_APPLICABLE

    @classmethod
    def get_export_policy(cls):
        """Model does not contain user data."""
        return dict(super(cls, cls).get_export_policy(), **{
            'activity_references': base_models.EXPORT_POLICY.NOT_APPLICABLE
        })

    @classmethod
    def get_or_create(cls, list_name):
        """This creates the relevant model instance, if it does not already
        exist.
        """
        if list_name not in feconf.ALL_ACTIVITY_REFERENCE_LIST_TYPES:
            raise Exception(
                'Invalid ActivityListModel id: %s' % list_name)

        entity = cls.get(list_name, strict=False)
        if entity is None:
            entity = cls(id=list_name, activity_references=[])
            entity.put()

        return entity


class ActivityTokenAccessModel(base_models.BaseModel):
    """Storage model for a list of tokens for activities"""

    # Unique token for access allowing
    token = datastore_services.StringProperty(required=True, indexed=True)

    # The type of the activity
    activity_type = datastore_services.StringProperty(required=True, indexed=True)

    # The ID of the activity
    activity_id = datastore_services.StringProperty(required=True, indexed=True)

    # The email where the message was sended
    email = datastore_services.StringProperty(required=True, indexed=True)

    # The transaction ID of the payment from pay service
    payment_transaction = datastore_services.StringProperty(required=False, indexed=True)

    # The cost of the activity
    cost = datastore_services.FloatProperty(indexed=True, default=None)

    # Request body
    request_body = datastore_services.TextProperty(required=False, indexed=False)

    # User ID who activated the token
    activated_user_id = datastore_services.StringProperty(required=False, indexed=True)

    # Status of the token
    status = datastore_services.StringProperty(required=True, indexed=True, default="active")

    # Time of the activation
    activated_time = datastore_services.DateTimeProperty(indexed=True)

    @staticmethod
    def get_deletion_policy():
        """Exploration context should be kept if the story and exploration are
        published.
        """
        return base_models.DELETION_POLICY.DELETE_AT_END

    @staticmethod
    def get_lowest_supported_role():
        """The lowest supported role here should be Learner."""
        return feconf.ROLE_ID_LEARNER

    @classmethod
    def get_export_policy(cls):
        """Model does not contain user data."""
        return dict(super(cls, cls).get_export_policy(), **{
            'token': base_models.EXPORT_POLICY.NOT_APPLICABLE,
            'activity_type': base_models.EXPORT_POLICY.NOT_APPLICABLE,
            'activity_id': base_models.EXPORT_POLICY.NOT_APPLICABLE,
            'email': base_models.EXPORT_POLICY.NOT_APPLICABLE,
            'payment_transaction': base_models.EXPORT_POLICY.NOT_APPLICABLE,
            'cost': base_models.EXPORT_POLICY.NOT_APPLICABLE,
            'request_body': base_models.EXPORT_POLICY.NOT_APPLICABLE,
            'activated_user_id': base_models.EXPORT_POLICY.NOT_APPLICABLE,
            'status': base_models.EXPORT_POLICY.NOT_APPLICABLE,
            'activated_time': base_models.EXPORT_POLICY.NOT_APPLICABLE,
        })

    @classmethod
    def get_by_token(cls, token):
        """Gets ActivityTokenAccessModel by token.
        Returns `None` if not exists

        Args:
            token: str. The token

        Returns:
            ActivityTokenAccessModel|None
        """
        return cls.query().filter(cls.token == token).get()

    @classmethod
    def delete_by_token(cls, token):
        """Delete ActivityTokenAccessModel by token.

        Args:
            token: str. The token

        """
        datastore_services.delete_multi(
            cls.query(cls.token == token).iter(keys_only=True)
        )

    @classmethod
    def generate_token(cls):
        for _ in range(100):
            token = uuid4().hex.upper()
            if not cls.get_by_token(token):
                return token

        raise RuntimeError("Failed to generate unique token")

