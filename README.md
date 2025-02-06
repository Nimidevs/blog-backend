Blog API Backend
A RESTful API for a university student blog platform, enabling users to create, edit, and manage posts with categories, tags, authentication, and real-time engagement tracking.

🚀 Features
✅ User Authentication & Roles

JWT-based authentication (Login, Signup)
Role-based access control (Admin, Writers, Readers)
✅ Post Management

CRUD operations (Create, Read, Update, Delete) for posts
Draft & Publish functionality
Featured, Trending, and Editor's Pick posts
✅ Categories & Tags

Predefined categories (set by admins)
Flexible user-generated tags (handled efficiently to prevent duplication)
✅ Engagement Metrics

Like & Comment System
"Today's Update" Dashboard tracking:
Number of new posts
Number of new subscribers
Total visitors & blog reads
✅ Inline Editing Support

Integrated Quill.js for rich-text editing
✅ Performance & Optimization

Optimized querying for trending posts
Efficient tag handling in the database
🛠️ Tech Stack
Technology	Purpose
Node.js & Express.js	Backend Framework
MongoDB	Database
Mongoose	ODM for MongoDB
JWT	Authentication
Quill.js	Inline Text Editing (Frontend Integration)
Cloudinary	Image Uploads (if used)
Postman	API Testing
💻 Installation & Running Locally
1️⃣ Clone the Repository
```sh
git clone https://github.com/yourusername/blog-backend.git
cd blog-backend
```
2️⃣ Install Dependencies
```sh
npm install
```
3️⃣ Setup Environment Variables
Create a .env file in the root directory and add the required environment variables:

env
Copy
Edit
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_API_KEY=your_cloudinary_key  # If using Cloudinary
4️⃣ Start the Server
```sh
npm run serverstart
```
The backend will run on http://localhost:8080/ by default.

📡 API Endpoints
Auth Routes
| Method | Endpoint | Description |
|--------|----------|------------|
|POST |	/api/auth/signup|	Register a new user|
POST|	/api/auth/login|	Login and get token
Post Routes
| Method | Endpoint | Description |
|--------|----------|------------|
POST	|/api/posts|	Create a new post (Authenticated)
GET|	/api/posts|	Fetch all posts
GET|	/api/posts/:id|	Get post by ID
PUT|	/api/posts/:id|	Update a post (Author/Admin)
DELETE|	/api/posts/:id|	Delete a post (Admin)
Category & Tag Routes

| Method | Endpoint | Description |
|--------|----------|------------|
GET	| /api/categories|	Fetch all predefined categories
POST |	/api/tags|	Create a new tag

##
🚀 Future Improvements
🔹 Implement real-time comments using WebSockets
🔹 Add pagination for posts to improve performance
🔹 Optimize trending post algorithm for better accuracy

👨‍💻 Contributing
Fork the repository
Create a new branch (git checkout -b feature-name)
Make your changes and commit (git commit -m "Added feature XYZ")
Push to your branch (git push origin feature-name)
Create a Pull Request
📜 License
This project is licensed under the MIT License.
🔗 GitHub: github.com/Nimidevs