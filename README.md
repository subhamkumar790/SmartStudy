# 🎓 SmartStudy – AI-Powered Study Assistant

SmartStudy is an AI-powered study assistant designed to help students organize their learning, manage study tasks, prepare for exams, and improve productivity. It provides a centralized platform for managing notes, creating flashcards, practicing quizzes, planning study sessions, and accessing AI-powered learning assistance.

## ✨ Features

* **🔐 User Authentication** – Secure registration and login functionality.
* **📚 Task Management** – Create, organize, and track daily study tasks.
* **📝 Notes Management** – Create, save, and manage study notes.
* **🤖 AI Study Assistant** – Get AI-powered explanations and assistance with learning.
* **🃏 Flashcards** – Create and review flashcards for effective revision.
* **❓ Quizzes** – Practice quizzes to test your knowledge.
* **📅 Exam Planner** – Organize upcoming exams and monitor preparation.
* **⏱️ Study Sessions** – Track study sessions and monitor learning progress.
* **🔍 Global Search** – Quickly find relevant study materials and information.
* **📊 Progress Tracking** – Monitor study activities and learning progress.
* **📱 Responsive Design** – Access the application through a user-friendly interface.

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS / Tailwind CSS (as configured in the project)

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* MongoDB

### AI Integration

* Google Gemini API

### Other Tools

* JWT for authentication
* Cookie Parser for cookie handling
* Git and GitHub for version control

## 📂 Project Structure

```text
SmartStudy/
├── client/                 # Frontend application
├── server/                 # Backend application (if separated)
├── src/                    # Application source files (depending on setup)
├── package.json            # Project dependencies and scripts
├── .env.example            # Example environment configuration
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

*Note: The exact folder structure may differ depending on your project configuration.*

## ⚙️ Prerequisites

Before running SmartStudy, make sure you have installed:

* Node.js
* npm
* MongoDB or a MongoDB Atlas account
* A Google Gemini API key

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/subhamkumar790/SmartStudy.git
```

### 2. Navigate to the Project Directory

```bash
cd SmartStudy
```

### 3. Install Dependencies

```bash
npm install
```

If the project has separate frontend and backend directories with their own `package.json` files, install the dependencies in each directory as well.

### 4. Configure Environment Variables

Create a `.env` file using `.env.example` as a reference.

Example configuration:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
GEMINI_API_KEY=your_google_gemini_api_key
APP_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

Replace the placeholder values with your actual configuration.

**Important:** Never upload your `.env` file, database credentials, JWT secret, or API keys to GitHub.

### 5. Start the Application

Use the development command configured in your `package.json`.

For example:

```bash
npm run dev
```

If your project uses separate commands for the frontend and backend, start both services in their respective terminals.

Open the local URL displayed in your terminal to access SmartStudy.

## 🔑 Environment Variables

| Variable         | Description                                         |
| ---------------- | --------------------------------------------------- |
| `MONGODB_URI`    | MongoDB database connection string                  |
| `JWT_SECRET`     | Secret used for signing authentication tokens       |
| `GEMINI_API_KEY` | API key for Google Gemini integration               |
| `APP_URL`        | Application URL                                     |
| `CLIENT_URL`     | Frontend URL used for client configuration and CORS |

## 💡 How It Works

1. Register or log in to your account.
2. Create and organize your study tasks.
3. Save notes and prepare flashcards for revision.
4. Use the AI study assistant to help understand difficult topics.
5. Practice quizzes to evaluate your knowledge.
6. Add exam dates and organize your preparation.
7. Track study sessions and monitor your progress.

## 🎯 Project Objectives

* Make studying more organized and productive.
* Provide AI-powered learning assistance in one place.
* Help students manage their time and academic responsibilities.
* Improve revision through flashcards and quizzes.
* Encourage consistent study habits through progress tracking.

## 🔮 Future Enhancements

* Personalized AI-generated study plans.
* Advanced learning analytics and progress reports.
* Automated revision reminders.
* AI-generated quizzes and flashcards.
* Personalized recommendations based on learning performance.
* Collaboration and resource sharing between students.

## 🔒 Security

* Keep API keys and database credentials private.
* Use a strong, randomly generated JWT secret.
* Validate user input on the server.
* Configure authentication, cookies, and CORS securely.
* Never commit environment files containing secrets.

## 👨‍💻 Author

**Subham Kumar**

* GitHub: [subhamkumar790](https://github.com/subhamkumar790)

## 📄 License

This project is available for educational and portfolio purposes. Add a specific open-source license if you intend to distribute or reuse the project under formal license terms.

---

⭐ If you find this project useful, consider giving the repository a star!
