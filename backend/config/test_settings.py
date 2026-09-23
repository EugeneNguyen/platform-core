"""Settings for `python manage.py test --settings=config.test_settings` -
the real settings plus a test-only app (`tests.testapp`) whose models
exercise `core_api` (platform-core itself declares none), on an in-memory
sqlite db.
"""

from config.settings import *  # noqa: F403

INSTALLED_APPS = [*INSTALLED_APPS, "tests.testapp"]  # noqa: F405
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
ROOT_URLCONF = "tests.testapp.urls"
