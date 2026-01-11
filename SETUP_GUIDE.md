# Digital Complaint Management System Setup Guide

## Quick Start

### Backend Setup
```bash
cd /home/homraj/Downloads/5thsem/governancecomplain

# Activate virtual environment
source venv/bin/activate

# Install dependencies (already done)
pip install -r requirements.txt

# Navigate to backend
cd backend

# Create migrations and apply them (already done)
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser
# Follow prompts to create admin user (e.g., username: admin, password: admin123)

# Run development server
python manage.py runserver
# Backend will be available at http://localhost:8000
```

### Frontend Setup
```bash
# From another terminal, navigate to frontend
cd /home/homraj/Downloads/5thsem/governancecomplain/frontend

# Install dependencies (already done)
npm install

# Create .env file (already done)
echo "REACT_APP_API_URL=http://localhost:8000/api/" > .env

# Start development server
npm start
# Frontend will be available at http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
  ```json
  { "username": "user", "email": "user@example.com", "password": "pass123" }
  ```
- `POST /api/auth/login/` - Login user
  ```json
  { "username": "user", "password": "pass123" }
  ```
  Returns: `{ "access": "token", "refresh": "token" }`

### Complaints
- `GET /api/complaints/` - Get complaints (auth required)
- `POST /api/complaints/` - Create complaint (auth required)
  ```json
  { "title": "Broken light", "description": "Light in room 101 is broken", "category": "Maintenance" }
  ```
- `PATCH /api/complaints/{id}/` - Update status (admin only)
  ```json
  { "status": "In Progress" }
  ```
- `DELETE /api/complaints/{id}/` - Delete complaint (admin or owner only)

## User Roles

### Regular User
- Register and login
- Submit complaints
- View only their own complaints
- View complaint status updates

### Admin
- Login to admin dashboard
- View all complaints
- Update complaint status (Pending → In Progress → Resolved)
- Add remarks/notes
- Access Django admin at `/admin/`

## Testing the Application

1. **Register a user:** Use the registration form on http://localhost:3000
2. **Login:** Use the login form with your credentials
3. **Submit a complaint:** Fill in the complaint form
4. **View complaints:** Refresh the complaints list
5. **Admin actions:** Login as admin to update complaint statuses

## Dependencies Installed

### Backend (Python)
- Django 4.2
- Django REST Framework 3.14
- djangorestframework-simplejwt 5.5 (JWT authentication)
- django-cors-headers 4.4 (Cross-Origin Resource Sharing)
- psycopg2-binary 2.9 (PostgreSQL support, optional)

### Frontend (Node.js)
- React 19.2
- react-dom 19.2
- axios 1.7 (HTTP requests)
- react-router-dom 6.24 (routing, if needed)
- react-scripts 5.0 (CRA build tools)

## Database Configuration

By default, SQLite database is used. To switch to PostgreSQL:

1. Update `.env` file:
   ```
   POSTGRES_DB=complaints_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   ```

2. Make sure PostgreSQL is running:
   ```bash
   sudo systemctl start postgresql
   ```

3. Create database:
   ```bash
   sudo -u postgres createdb complaints_db
   ```

4. Re-run migrations:
   ```bash
   python manage.py migrate
   ```

## Troubleshooting

### Backend won't start
- Ensure virtual environment is activated: `source venv/bin/activate`
- Check if port 8000 is available: `lsof -i :8000`
- Clear migrations: `rm backend/complaints/migrations/0001_initial.py` and re-run makemigrations

### Frontend won't start
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is available: `lsof -i :3000`
- Clear npm cache: `npm cache clean --force`

### CORS errors
- Ensure backend is running on http://localhost:8000
- Check CORS settings in `backend/core/settings.py`

### JWT authentication issues
- Token expires after 5 minutes, use refresh token to get new access token
- Token stored in localStorage, check browser DevTools → Application → localStorage

## Project Structure

```
governancecomplain/
├── backend/
│   ├── core/                  # Django project settings
│   │   ├── settings.py       # Main settings file
│   │   ├── urls.py           # Main URL routing
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── complaints/            # Complaints app
│   │   ├── models.py         # Complaint model
│   │   ├── serializers.py    # DRF serializers
│   │   ├── views.py          # API views
│   │   ├── urls.py           # App URL routing
│   │   ├── admin.py          # Django admin config
│   │   └── tests.py          # Unit tests
│   └── manage.py
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Styles
│   │   ├── api.js            # Axios setup
│   │   └── index.js
│   ├── package.json
│   └── public/
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
└── venv/                     # Virtual environment
```

## Next Steps

1. Run backend: `cd backend && python manage.py runserver`
2. Run frontend: `cd frontend && npm start`
3. Create admin account: `python manage.py createsuperuser`
4. Test the application in browser
5. Explore Django admin at http://localhost:8000/admin/
