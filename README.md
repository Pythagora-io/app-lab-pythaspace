# PythaSpace

PythaSpace is a cutting-edge platform designed for publishing, sharing, and discovering high-quality articles and stories across various domains. It aims to foster a vibrant community of writers and readers, promoting intellectual discourse and knowledge exchange.

## Overview

PythaSpace is built with a robust architecture that leverages modern web technologies to deliver an intuitive and seamless user experience. The platform is structured as follows:

- **Backend:** Node.js with the Express framework for handling server-side logic.
- **Database:** MongoDB managed with Mongoose ORM for efficient data storage and retrieval.
- **Frontend:** EJS for templating, Bootstrap for responsive design, and Vanilla JS for client-side functionality.
- **AI Integration:** OpenAI for content moderation and writing assistance.
- **Additional Libraries:** bcrypt for password hashing, multer for file uploads, and social-share-js for social media sharing.

The project structure includes:

- **Models:** Mongoose schemas for User, Article, and Comment.
- **Routes:** Express routes for authentication, article management, and API endpoints.
- **Views:** EJS templates for rendering pages.
- **Public:** Static files including CSS, JavaScript, and images.
- **Services:** Helper services for AI interactions and file uploads.
- **Middleware:** Authentication middleware for protecting routes.

## Features

PythaSpace offers a wide range of features to enhance the user experience:

1. **User Registration and Login:**
   - Users can register and log in using their email and password.
   - Essential for publishing, commenting, and utilizing the AI writer helper.

2. **Article Publishing:**
   - Support for multimedia content (images and videos).
   - AI-powered moderation using OpenAI.
   - Articles can be saved as drafts or published directly.
   - Moderation issues are highlighted for user correction.

3. **Article Organization:**
   - Articles are categorized into Technology, Science, Health & Wellness, Business & Finance, Arts & Culture, and Lifestyle.
   - Tagging system for specific topics, writing styles, and content formats.

4. **Commenting System:**
   - Single-level comments on articles to foster discussions.

5. **Social Sharing:**
   - Integration with social-share-js for sharing articles on social media platforms.

6. **AI Writer Helper ("Magic Helper"):**
   - Provides writing suggestions based on the title and existing content.
   - Utilizes the user's OpenAI API key for generating suggestions.

## Getting started

### Requirements

To run PythaSpace, ensure you have the following technologies installed on your computer:

- Node.js
- MongoDB (or use a cloud version like MongoDB Atlas)

### Quickstart

Follow these steps to set up and run the project:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PythaSpace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the project root using the provided `.env.example` as a template.
   - Populate the `.env` file with your values (e.g., MongoDB URL, session secret).

4. **Start the application:**
   ```bash
   npm start
   ```

5. **Access the application:**
   - Open your browser and navigate to `http://localhost:3000` to start using PythaSpace.

### License

The project is open source, licensed under the MIT License. See the [LICENSE](LICENSE).

Copyright © 2024 Pythagora-io. 
