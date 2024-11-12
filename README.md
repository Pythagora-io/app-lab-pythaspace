```markdown
# PythaSpace

PythaSpace is a cutting-edge platform for publishing, sharing, and discovering high-quality articles and stories across various domains. It aims to cultivate a vibrant community of writers and readers, promoting intellectual discourse and knowledge exchange.

## Overview

PythaSpace is built with a modern web stack, focusing on a seamless user experience and robust backend services. The architecture includes:
- **Backend**: Node.js with Express framework
- **Database**: MongoDB with Mongoose ORM for data management
- **Frontend**: EJS for templating, Bootstrap for styling, and Vanilla JS for functionality
- **AI Integration**: OpenAI for content moderation and writing assistance

The project structure is organized as follows:
- **models/**: Mongoose schemas for User and Article
- **routes/**: Express routes for authentication, articles, and API endpoints
- **services/**: Services for AI moderation and LLM requests
- **utils/**: Utility functions for file uploads
- **views/**: EJS templates for rendering pages
- **public/**: Static files including CSS and JavaScript

## Features

PythaSpace includes the following features:
1. **User Registration and Login**:
   - Users can register and log in using their email.
   - Essential for publishing, commenting, and utilizing the AI writer helper.

2. **Article Publishing**:
   - Support for multimedia content (images and videos) with specified size and format restrictions.
   - AI-powered moderation using OpenAI, with each user's API key stored in their user profile.
   - Articles automatically published upon passing AI moderation; issues highlighted otherwise.

3. **Article Organization**:
   - Categories: Technology, Science, Health & Wellness, Business & Finance, Arts & Culture, Lifestyle.
   - Tags: Specific Topics, Writing Styles, Target Audience, Content Format.

4. **Commenting System**:
   - Single-level comments on articles.

5. **Social Sharing**:
   - Integration with social-share-js for sharing articles on social media.

6. **AI Writer Helper ("Magic Helper")**:
   - Offers writing suggestions based on the title and existing content.
   - Utilizes the user's OpenAI API key stored in their profile for generating suggestions.
   - Accessible via a modern, intuitive interface with a magic wand icon.

## Getting started

### Requirements

To run PythaSpace, you need the following technologies installed on your computer:
- Node.js
- MongoDB (or use a cloud version like MongoDB Atlas)

### Quickstart

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   cd PythaSpace
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env` and fill in the required values:
     ```sh
     cp .env.example .env
     ```

4. **Start the application**:
   ```sh
   npm start
   ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:3000`

### License

The project is proprietary (not open source), just output the standard Copyright (c) 2024.
```