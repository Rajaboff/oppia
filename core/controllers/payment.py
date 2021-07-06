import logging
from json import dumps, loads
from hashlib import sha256
from hmac import new as hmac_new
from base64 import b64encode
from urllib import unquote_plus

from core.controllers import acl_decorators
from core.controllers import base
from core.domain import exp_domain
from core.domain import exp_services
from core.domain import collection_services
from core.domain import collection_domain
from core.domain import topic_domain
from core.domain import topic_services
from core.domain import classroom_services
from core.domain import user_services


SECRET_KEY = bytes("56d3cdd54048436af7767bd524e0589c").encode("utf-8")


class PayDoneHandler(base.BaseHandler):
    REQUIRE_PAYLOAD_CSRF_CHECK = False

    def __check_cloudpayment_request(self):
        """Check the request from cloudpayments"""
        expected_hmac = self.request.headers["Content-Hmac"]

        message = bytes(self.request.body).encode("utf-8")
        signature = b64encode(hmac_new(SECRET_KEY, message, digestmod=sha256).digest())

        if signature != expected_hmac:
            raise RuntimeError("Invalid cloudayments credentials")

        # TODO(anyone): Add IP-address validation https://developers.cloudpayments.ru/#proverka-uvedomleniy

    def __open_access_for_user(self, data, user_id):
        activity_type = data.get("activityType")
        activity_id = data.get("activityId")

        assert activity_type, "No activity type"
        assert activity_id, "No activity ID"

        if activity_type == "exploration":
            exploration_user_access = exp_domain.ExplorationUserAccess(
                exploration_id=activity_id,
                user_id=user_id,
            )
            exp_services.update_exploration_user_access(exploration_user_access)

        if activity_type == "collection":
            collection_user_access = collection_domain.CollectionUserAccess(
                collection_id=activity_id,
                user_id=user_id,
            )
            collection_services.update_collection_user_access(collection_user_access)

        if activity_type == "topic":
            topic_user_access = topic_domain.TopicUserAccess(
                topic_id=activity_id,
                user_id=user_id,
            )
            topic_services.update_topic_user_access(topic_user_access)

        if activity_type == "class":
            classroom = classroom_services.get_classroom_by_url_fragment(
                activity_id
            )

            for topic_id in classroom.topic_ids:
                topic_user_access = topic_domain.TopicUserAccess(
                    topic_id=topic_id,
                    user_id=user_id,
                )
                topic_services.update_topic_user_access(topic_user_access)

    def __send_email_for_user(self, data, user_email):
        logging.info("Sending email to '%s'", user_email)

    @acl_decorators.open_access
    def post(self):
        self.__check_cloudpayment_request()

        logging.info("Request:\n\n'%s'", self.request)

        data = unquote_plus(self.request.get("Data"))

        description = unquote_plus(self.request.get("Description"))
        logging.info("Got request from cloudpayments for '%s'", description)

        email = unquote_plus(self.request.get("Email"))
        data = loads(unquote_plus(self.request.get("Data", "{}")))
        logging.info("Got payment data '%s' for user '%s'", data, email)

        is_present = data.get("isPresent", False)

        # Getting user
        user = user_services.get_user_settings_from_email(email)

        if is_present or not user:
            # If it is present - send email.
            # Or if user email does not exists at the system
            self.__send_email_for_user(data, email)
        else:
            # Otherwise - allow user access for the activity
            self.__open_access_for_user(data, user.user_id)

        logging.info("Pay ok for '%s'", description)
        self.response.write(dumps({"code": 0}))
