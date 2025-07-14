# Community Platform

Modern web application for club management and community organization.

## ✨ Features

- **Club Management**: Create education, social and project clubs  
- **Task System**: Task assignment, tracking and status management  
- **Meeting Planning**: Calendar integration and participant management  
- **File Sharing**: Organized file management with folder structure  
- **Notifications**: Real-time notification system  
- **Role Management**: Admin, club leader and member roles  

## 🛠️ Technologies

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS  
- **Backend**: Next.js API Routes, Supabase  
- **File Storage**: Cloudinary  
- **Database**: PostgreSQL (Supabase)  
- **Authentication**: Supabase Auth  

## 🚀 Installation

```bash
# Clone the repository
git clone <repo-url>
cd community-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local file

# Start development server
npm run dev

```


⚙️ Environment Variables
env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
