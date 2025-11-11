# Education Platform Backend

Professional Python FastAPI backend with JSON file storage for education management system.

## Default Login Credentials

Backend avtomatik ravishda default Super Admin foydalanuvchini yaratadi:

- **Email**: `admin@education.uz`
- **Password**: `admin123`

⚠️ **Muhim**: Production muhitida bu parolni o'zgartiring!

## Quick Start

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Create `.env` file (copy from `.env.example`):
\`\`\`bash
cp .env.example .env
\`\`\`

3. Run the server:
\`\`\`bash
python main.py
\`\`\`

Backend `http://localhost:8000` da ishga tushadi.

## API Documentation

Backend ishga tushgandan keyin quyidagi sahifalarda API dokumentatsiyasini ko'ring:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Lessons
- `GET /api/lessons` - Get all lessons
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/{id}` - Update lesson
- `DELETE /api/lessons/{id}` - Delete lesson

### Grades
- `GET /api/grades` - Get all grades
- `POST /api/grades` - Create grade
- `PUT /api/grades/{id}` - Update grade

### Tests
- `GET /api/tests` - Get all tests
- `POST /api/tests` - Create test
- `GET /api/tests/{id}/results` - Get test results
- `POST /api/tests/{id}/submit` - Submit test

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Attendance
- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Create attendance record

## Data Storage

Ma'lumotlar `data/` papkasida JSON fayllar sifatida saqlanadi:

- `data/users.json` - Foydalanuvchilar
- `data/lessons.json` - Darslar
- `data/grades.json` - Baholar
- `data/tests.json` - Testlar
- `data/test_results.json` - Test natijalari
- `data/courses.json` - Kurslar
- `data/attendance.json` - Davomat

## User Roles

System 5 ta rolni qo'llab-quvvatlaydi:

1. `super_admin` - Tizim administratori
2. `school_admin` - Maktab administratori
3. `teacher` - O'qituvchi
4. `student` - O'quvchi
5. `parent` - Ota-ona

## Environment Variables

`.env` faylida quyidagi o'zgaruvchilarni sozlang:

\`\`\`env
SECRET_KEY=your-secret-key-here
DEBUG=True
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
\`\`\`

## Frontend Connection

Frontend'dan backend'ga ulanish uchun frontend `.env.local` faylida:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS protection
- Request validation with Pydantic

## Development

Backend development mode'da avtomatik reload bilan ishlaydi:

\`\`\`bash
python main.py
\`\`\`

Yoki uvicorn bilan:

\`\`\`bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
