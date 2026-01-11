web: cd backend && gunicorn core.wsgi --log-file -
release: cd backend && python manage.py migrate && python manage.py create_admins
