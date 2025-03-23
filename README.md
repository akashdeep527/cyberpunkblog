# CyberScribe - Cyberpunk Blog Platform

A modern, feature-rich blogging platform with a cyberpunk aesthetic, built using React, TypeScript, and Node.js.

![CyberScribe Screenshot](https://via.placeholder.com/800x400?text=CyberScribe+Screenshot)

## Features

- 🔐 **User Authentication**: Secure login and registration system
- 📝 **Content Management**: Create, edit, and manage blog posts
- 🖼️ **Media Management**: Upload and organize images and other media
- 📋 **Page Management**: Create and manage static pages
- 💬 **Comments System**: Allow readers to comment on posts with moderation
- 🔌 **Plugin System**: Extend functionality with plugins
- 🎨 **Theme Customization**: Customize appearance with different themes
- 👥 **User Management**: Admin tools for managing users and permissions
- 📊 **Analytics**: Track post views and engagement metrics
- 📱 **Responsive Design**: Optimized for both desktop and mobile

## Tech Stack

- **Frontend**:
  - React
  - TypeScript
  - Tailwind CSS
  - React Query
  - React Router

- **Backend**:
  - Node.js
  - Express
  - Authentication system

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/akashdeep527/cyberpunkblog.git
   cd cyberpunkblog
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   ```

3. Start the development server:
   ```bash
   # In the root directory
   npm run dev
   ```
   
   This will start both the backend server and the React frontend.

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
cyberpunkblog/
├── client/              # React frontend
│   ├── public/          # Static files
│   ├── src/             # Source files
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── App.tsx      # Main app component
├── server/              # Node.js backend
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

## Admin Features

- **Dashboard**: Overview of blog statistics and recent activity
- **Posts Management**: Create, edit, delete, and organize blog posts
- **Media Library**: Upload and manage images and files
- **Page Management**: Create and manage static pages
- **Comments Moderation**: Approve, reject, or delete user comments
- **User Management**: Add, edit, and manage user accounts
- **Plugin Management**: Install, activate, and configure plugins
- **Appearance Settings**: Customize themes and layout options
- **General Settings**: Configure blog title, description, and other settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Cyberpunk aesthetic inspiration
- React and Node.js communities for excellent documentation
- All open-source contributors

---

Created with ❤️ by [Akash Deep](https://github.com/akashdeep527) 