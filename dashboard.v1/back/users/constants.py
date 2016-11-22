from django.utils.translation import ugettext_lazy as _

INVALID_CREDENTIALS_ERROR = _('Unable to login with provided credentials.')
INACTIVE_ACCOUNT_ERROR = _('User account is disabled.')
INVALID_TOKEN_ERROR = _('Invalid token for given user.')
PASSWORD_MISMATCH_ERROR = _('The two password fields didn\'t match.')
USERNAME_MISMATCH_ERROR = _('The two {0} fields didn\'t match.')
INVALID_PASSWORD_ERROR = _('Invalid password.')

provider_name = {
    "Github": "github",
    "Coding": "coding",
    "QQ": "qq",
}


class Providers:
    Github = "github"
    QQ = "qq"
    Coding = "coding"


providers = ['Github', 'Coding', 'QQ']
