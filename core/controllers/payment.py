import logging
from json import dumps, loads
from hashlib import sha256
from hmac import new as hmac_new
from base64 import b64encode
from urllib import unquote_plus

import feconf
from core.controllers import acl_decorators
from core.controllers import base
from core.domain import activity_domain
from core.domain import activity_services
from core.domain import exp_domain
from core.domain import exp_services
from core.domain import collection_services
from core.domain import collection_domain
from core.domain import topic_domain
from core.domain import topic_services
from core.domain import classroom_services
from core.domain import user_services
from core.platform.email.mailgun_email_services import send_email_to_recipients


SECRET_KEY = bytes("56d3cdd54048436af7767bd524e0589c").encode("utf-8")

def open_access_for_user(activity_type, activity_id, user_id):
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

    def __send_email_for_user(self, activity_type, activity_id, user_email, token):
        logging.info("Sending email to '%s'", user_email)

        message = """
Congratulations!

You've got access to the {0}.

Use the token '{1}' at the platform to activate it.
        """.format(activity_type, token)

        send_email_to_recipients(
            sender_email=feconf.SENDER_EMAIL,
            recipient_emails=[user_email],
            subject="Access to the %s" % activity_type,
            plaintext_body=message,
            html_body=message,
        )

    def __open_access_for_user(self, activity_type, activity_id, user_id):
        open_access_for_user(activity_type, activity_id, user_id)

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
        present_email = data.get("presentEmail")

        # Getting user
        user = user_services.get_user_settings_from_email(email)

        # Activity info
        activity_type = data.get("activityType")
        assert activity_type, "No activity type"
        activity_id = data.get("activityId")
        assert activity_id, "No activity ID"

        if is_present or not user:
            email_to_send = present_email or email
            # If it is present - send email.
            # Or if user email does not exists at the system
            activity_token_access = activity_domain.ActivityTokenAccess(
                activity_type=activity_type,
                activity_id=activity_id,
                email=email_to_send,
                payment_transaction=self.request.get("TransactionId", ""),
                cost=float(self.request.get("Amount")) if self.request.get("Amount") else None,
                request_body=str(self.request),
            )
            activity_token_access = activity_services.create_activity_token_access(activity_token_access)

            logging.info("Generated token '%s'", activity_token_access.token)
            self.__send_email_for_user(activity_type, activity_id, email_to_send, activity_token_access.token)
        else:
            # Otherwise - allow user access for the activity
            self.__open_access_for_user(activity_type, activity_id, user.user_id)

        logging.info("Pay ok for '%s'", description)
        self.response.write(dumps({"code": 0}))


class TokenActivityAccessHandler(base.BaseHandler):

    @acl_decorators.should_be_logged_in
    def put(self, token):
        logging.info("Got token '%s'", token)

        activity_token_access = activity_services.get_activity_token_access(token)
        if not activity_token_access or not activity_token_access.is_active():
            raise self.PageNotFoundException

        open_access_for_user(
            activity_type=activity_token_access.activity_type,
            activity_id=activity_token_access.activity_id,
            user_id=self.user_id,
        )

        activity_services.mark_activity_token_activated(token, self.user_id)

        self.render_json({'status': 'ok'})
