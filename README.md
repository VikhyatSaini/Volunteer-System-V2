# Volunteer Registration System - Backend API

This is the complete backend for the Volunteer Registration System. It is a secure, scalable REST API built with Node.js, Express, MongoDB, and Mongoose.

## 🚀 Key Features

* **Role-Based Access:** Strict separation between **Admins** and **Volunteers**.
* **Approval Workflow:** New accounts are `approved` by default and can be banned/rejected by an Admin.
* **Event Management:**
    * **Image Uploads:** Cloudinary integration for event banners and user profile pictures.
    * **Smart Search:** Filter by location, date, and availability.
    * **Pagination:** Efficient data loading.
* **Registration Logic:**
    * **Capacity Checks:** Prevents overbooking.
    * **Waitlists:** Automated FIFO queue when events are full.
    * **Auto-Promotion:** Automatically promotes waitlisted users when a spot opens.
    * **Email Notifications:** Automated emails for registration, promotion, and password resets.
* **Volunteer Tracking:** Log hours for past events with Admin approval flow.
* **AI Integration (Google Gemini):**
    * Auto-generate event descriptions.
    * Auto-tag events based on content.
    * **Smart Recommendations:** Suggest events based on volunteer skills.

---

## 🛠️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root `backend` folder and add these keys:

    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
    JWT_SECRET=your_super_secret_jwt_key
    
    # Cloudinary (Image Uploads)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Google Gemini AI
    GEMINI_API_KEY=your_gemini_api_key
    
    # Email (Optional - defaults to Ethereal for Dev)
    EMAIL_USER=your_email
    EMAIL_PASS=your_app_password
    ```

4.  **Run the server:**
    ```bash
    # Development Mode (auto-restart)
    npm run dev
    ```

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api`

### 1. 🔐 Authentication

| Method | Endpoint | Access | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | `{ "email": "...", "password": "..." }` <br> **Returns:** Token + Role + Status |
| `POST` | `/users/register` | Public | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/auth/forgotpassword` | Public | `{ "email": "..." }` |
| `PUT` | `/auth/resetpassword/:token` | Public | `{ "password": "..." }` |

### 2. 📅 Events (Core)

| Method | Endpoint | Access | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/events` | Public | **Filters:** `?page=1&limit=6&location=NY&sort=date` |
| `GET` | `/events/:id` | Public | Get single event details |
| `POST` | `/events` | **Admin** | **Format:** `multipart/form-data` <br> **Fields:** `title`, `date`, `location`, `slotsAvailable`, `description`, `tags` (array), `image` (File) |
| `PUT` | `/events/:id` | **Admin** | Update event details |
| `DELETE` | `/events/:id` | **Admin** | Delete event & cascade delete registrations |

### 3. 📝 Registration & Queue

| Method | Endpoint | Access | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/events/:id/register` | **User** | Registers user. Fails if full or pending approval. |
| `DELETE` | `/events/:id/unregister` | **User** | Unregisters & **Promotes next waitlister**. |
| `POST` | `/events/:id/waitlist` | **User** | Join waitlist if event is full. |
| `GET` | `/events/:id/volunteers` | **Admin** | View roster of registered volunteers. |

### 4. 👤 User Profiles

| Method | Endpoint | Access | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/profile` | **User** | Get my details |
| `PUT` | `/users/profile` | **User** | **Format:** `multipart/form-data` <br> **Fields:** `image` (File), `skills` (Array: send key multiple times), `availability`, `name`. |
| `GET` | `/users/my-events` | **User** | List events I am registered for. |
| `GET` | `/users/my-hours` | **User** | List my hour logs (Pending/Approved). |
| `POST` | `/events/:id/loghours` | **User** | `{ "hours": 4, "dateWorked": "2024-01-01" }` |

### 5. 🛡️ Admin Management

| Method | Endpoint | Access | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | **Admin** | List all users (check for `status: pending`). |
| `PUT` | `/users/:id/status` | **Admin** | `{ "status": "approved" }` (or "rejected") |
| `GET` | `/admin/stats` | **Admin** | Dashboard analytics (counts, hours logged). |
| `GET` | `/admin/pending-hours` | **Admin** | View hour logs needing review. |
| `PUT` | `/admin/hours/:logId/status` | **Admin** | `{ "status": "approved" }` |

### 6. 🧠 AI Features (Gemini)

| Method | Endpoint | Access | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/generate` | **Admin** | `{ "title": "Beach Cleanup", "location": "Miami" }` <br> Returns: Generated description text. |
| `POST` | `/ai/classify` | **Admin** | `{ "title": "...", "description": "..." }` <br> Returns: `{ "tags": ["Env", "Outdoor"] }` |
| `GET` | `/ai/recommendations` | **User** | **New!** Returns events matching user's `skills`. |

---

## 🧪 Testing Notes

* **Image Uploads:** Must use `form-data` in Postman/Frontend. Key must be named **`image`**.
* **Arrays in Forms:** When sending `skills` or `tags` via form-data, append the key multiple times (e.g., `tags: Tech`, `tags: Education`).
* **Waitlists:** Waitlist logic only triggers if `slotsAvailable` is full.
* **AI:** Requires `GEMINI_API_KEY` in the `.env` file.
