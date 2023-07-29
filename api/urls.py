from django.urls import path

from . import views

urlpatterns = [
        path("process",views.ProcessView.as_view(), name='process' ),


]