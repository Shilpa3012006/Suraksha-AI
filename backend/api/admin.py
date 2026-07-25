from django.contrib import admin

from .models import Evidence

admin.site.register(Evidence)

from .models import TrustedContact

admin.site.register(TrustedContact)