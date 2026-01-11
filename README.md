# Digital Complaint Management System (DCMS)

A modern, full-stack web application for managing citizen complaints with a professional UI, built with React and Django REST Framework.

## 🎯 Features

### Landing Page
- Eye-catching hero section
- Feature overview (Submit, Track, Resolve)
- Easy navigation to Login/Register

### User Authentication
- **Registration**: Create new account with email validation
- **Login**: Secure JWT-based authentication
- **Password Toggle**: Show/Hide button for password fields
- Demo credentials for testing

### Dashboard
- Welcome message with user name
- Statistics cards showing:
  - Total Complaints (all time)
  - Pending Complaints (awaiting review)
  - In Progress Complaints (being processed)
  - Resolved Complaints (completed)
- Quick access button to submit new complaint
- Recent complaints table with instant viewing

### Submit Complaint
- Clean form with fields for:
  - Complaint Title
  - Category (Infrastructure, Maintenance, Sanitation, Utilities, Safety, Other)
  - Detailed Description
- Real-time form validation
- Success/Error messages
- Help text explaining next steps

### Track Complaints
- View all submitted complaints
- Filter by status (All, Pending, In Progress, Resolved)
- Progress bar showing complaint resolution status
- Timeline visualization (Submitted → In Progress → Resolved)
- Status badges for quick identification
- Complaint details and metadata

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.3 - UI library
- **React Router** 7.1.1 - Client-side routing
- **Axios** 1.7.9 - HTTP client
- **CSS3** - Responsive styling with modern layouts

### Backend
- **Django** 4.2 - Web framework
- **Django REST Framework** 3.14 - API development
- **Simple JWT** 5.5.1 - Token-based authentication
- **PostgreSQL/SQLite** - Database options

## 📦 Project Structure

```
governancecomplain/
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── Landing.js       # Home page
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Register.js      # Registration page
│   │   │   ├── Dashboard.js     # Dashboard page
│   │   │   ├── SubmitComplaint.js
│   │   │   ├── TrackComplaints.js
│   │   │   └── *.css            # Component styles
│   │   ├── api.js           # Axios configuration
│   │   ├── App.js           # Main App with routing
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── public/
│
├── backend/                  # Django application
│   ├── core/                # Django project
│   │   ├── settings.py      # Configuration
│   │   ├── urls.py          # Main routing
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── complaints/          # Main app
│   │   ├── models.py        # Complaint model
│   │   ├── serializers.py   # DRF serializers
│   │   ├── views.py         # API views
│   │   ├── urls.py          # App routing
│   │   ├── admin.py         # Django admin
│   │   └── migrations/
│   ├── manage.py
│   └── db.sqlite3           # SQLite database
│
├── requirements.txt         # Python dependencies
├── venv/                    # Virtual environment
└── SETUP_GUIDE.md          # Setup documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Installation & Setup

#### 1. Backend Setup
```bash
cd /home/homraj/Downloads/5thsem/governancecomplain

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Navigate to backend
cd backend

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser
# Enter:
# Username: admin
# Email: admin@example.com
# Password: (your choice)

# Start backend server
python manage.py runserver
```

Backend will be available at: **http://localhost:8000**

#### 2. Frontend Setup
```bash
# From the project root directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at: **http://localhost:3000**

## 📋 Usage Guide

### 1. Landing Page
- Visit http://localhost:3000
- Choose "Get Started" to register or "Sign In" to login

### 2. Registration
- Fill in Full Name, Email, and Password
- Password must be at least 6 characters
- Use the password toggle (👁️) to show/hide password
- Click "Register" to create account

### 3. Login
- Enter your email and password
- Use password toggle to verify your password
- Demo accounts available with any password

### 4. Dashboard
- View your complaint statistics
- See recent complaints at a glance
- Click "Submit New Complaint" to file a new complaint

### 5. Submit Complaint
- Fill in the complaint form
- Select appropriate category
- Provide detailed description
- Click "Submit Complaint"
- You'll be redirected to dashboard

### 6. Track Complaints
- View all your submitted complaints
- Filter by status
- See progress bar and timeline
- Track complaint through different stages

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

```
POST /api/auth/register/
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

POST /api/auth/login/
{
  "username": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px and above)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🎨 Design Features

### Color Scheme
- Primary Blue: #2c5aa0
- Secondary Gray: #2c3e50
- Accent Green: #2b8a3b
- Light Background: #f5f7fa

### Typography
- System fonts for better performance
- Responsive font sizes
- Clear visual hierarchy

### Components
- Reusable styled buttons
- Responsive forms
- Status badges with color coding
- Progress bars and timelines
- Statistics cards
- Modal dialogs (when needed)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/refresh/` - Refresh access token

### Complaints
- `GET /api/complaints/` - List user's complaints
- `POST /api/complaints/` - Create new complaint
- `PATCH /api/complaints/{id}/` - Update complaint (admin only)
- `DELETE /api/complaints/{id}/` - Delete complaint

## 🐛 Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules
npm install
npm start
```

### Backend migrations error
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Port already in use
```bash
# Change Django port
python manage.py runserver 8001

# Change React port (in .env)
PORT=3001 npm start
```

### CORS errors
- Ensure backend is running on http://localhost:8000
- Check CORS settings in `backend/core/settings.py`
- Frontend .env has correct API_URL

## 📝 Demo Credentials

### User Account
- Email: `user@example.com`
- Password: Any password

### Admin Account
- Email: `admin@example.com`
- Password: Any password

## 🚀 Deployment

### Using Gunicorn (Backend)
```bash
pip install gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

### Using Nginx (Frontend)
```bash
npm run build
# Serve build/ directory through Nginx
```

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [JWT Authentication](https://django-rest-framework-simplejwt.readthedocs.io/)

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Digital Complaint Management System - Full Stack Project

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Last Updated**: January 10, 2026
**Version**: 1.0.0
