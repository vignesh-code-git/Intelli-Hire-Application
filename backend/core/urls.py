from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.job_list, name='job_list'),
    path('parse/', views.parse_cv, name='parse_cv'),
    path('optimize/', views.optimize_cv, name='optimize_cv'),
    path('recommend/', views.recommend_jobs, name='recommend_jobs'),
    path('chat/', views.chat_assistant, name='chat_assistant'),
    path('stats/', views.platform_stats, name='platform_stats'),
    path('cv-content/', views.cv_content, name='cv_content'),
]
