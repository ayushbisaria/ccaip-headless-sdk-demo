# CCAI-Platform Headless SDK Chat Demo

This repository contains a demonstration of a chat application built using a ccai-platform Headless SDK. It showcases a basic client-server architecture where the Node.js backend handles secure authentication and configuration delivery, while the pure JavaScript frontend provides the chat user interface.

## 🚀 Features

* **Client-Server Architecture:** Separated frontend and backend for clear responsibilities.
* **Secure Authentication:** Backend (`server.js`) generates signed JSON Web Tokens (JWTs) for client authentication with the headless SDK.
* **Dynamic Configuration:** Backend provides necessary SDK configuration variables to the client, loaded securely from environment variables.
* **Chat Interface:** A simple web-based chat interface (`main.js`, `index.html`, `style.css`) for interacting with the ccai platform.
* **Message Handling:** Displays text messages, file messages, inline buttons, and rich content cards received from the SDK.
* **File Attachment:** Supports sending image and video attachments.
* **Environment Variable Management:** Utilizes `server/config/.env` files for managing sensitive and environment-specific configurations.

## 📁 Project Structure

The project is organized into two main directories:
```
.
├── client/
│   ├── favicon23.png
│   ├── favicon.png
│   ├── index.html
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   ├── public/
│   │   └── vite.svg
│   └── src/
│       ├── javascript.svg
│       ├── main.js
│       └── style.css
├── Readme.md
└── server/
    ├── config
    ├── node_modules
    ├── package.json
    ├── package-lock.json
    └── server.js

```

## 🏗️ Architecture

![alt text](https://github.com/ayushbisaria/ccaip-headless-sdk-demo/blob/main/architecture.png?raw=true)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

* [**Node.js**](https://nodejs.org/en/download/) (LTS version recommended)
* [**npm**](https://www.npmjs.com/get-npm) (comes with Node.js)

## 🚀 Setup & Installation

Follow these steps to get the demo up and running on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/ayushbisaria/ccaip-headless-sdk-demo.git)
    cd ccaip-headless-sdk-demo
    ```
2.  **Backend Setup:**
    Navigate into the `server` directory, install its dependencies, and set up its environment variables.

    ```bash
    cd server
    npm install
    mkdir config
    cd config
    touch .env 
    ```
    Now, open the newly created `.env` file in your `server/config` directory and fill in the actual values. **Do NOT commit your `.env` file to Git.**

    ```dotenv
    # server/.env
    COMPANY_SECRET="YOUR_CCAIP_COMPANY_SECRET_FROM_CCAIP_DEVELOPER_SETTINGS"
    HOST="YOUR_CCAIP_HOST"
    COMPANY_ID="YOUR_CCAIP_COMPANY_ID_FROM_CCAIP_DEVELOPER_SETTINGS"
    MENU_ID="YOUR_QUEUE_ID" # e.g., "23"
    TENANT="YOUR_CCAIP_TENANT_NAME" 
    ```

3.  **Frontend Setup:**
    Navigate into the `client` directory, install its dependencies, and set up its environment variables.

    ```bash
    cd ../client # Go back to the root and then into client
    npm install
    ```
    **Creating env in client directory is not required**
    Open the newly created `.env.development` file in your `client/` directory. **For this specific project, the frontend currently fetches config from the backend, so you might not need additional variables here unless your Vite setup explicitly uses them for something else.**

    ```dotenv
    # client/.env.development
    # No specific variables required here for this demo, as config comes from backend.
    # But if you had frontend-specific API_URLs, they'd go here:
    # VITE_API_URL=http://localhost:3000
    ```

---

## 🚀 Running the Application

There are two ways to run the application:

### Option 1: Recommended (Using `npm run dev` from root)

This method uses `concurrently` to start both the backend and frontend simultaneously. This is the easiest way to get everything running.

1.  From the **root directory** of your project (`ccaip-headless-sdk-demo/`), run:
    ```bash
    npm install
    npm run dev
    ```
    This command will:
    * Start the backend server on `http://localhost:3000`.
    * Start the frontend development server (Vite) and automatically open your browser to the client application (e.g., `http://localhost:5173`).

    **Note:** Due to the asynchronous nature of starting two servers, you might occasionally experience a "failed to load config" error on the very first auto-opened browser tab. A quick manual browser refresh (F5 or Cmd+R) should resolve this as it allows the backend server sufficient time to be fully ready.

### Option 2: Manual Start (Alternative)

If you prefer to start each component individually, or if you encounter issues with the recommended method:

1.  **Start the Backend Server:**
    Open your first terminal window, navigate to the `server` directory, and run:
    ```bash
    cd server
    node server.js
    ```
    You should see a message like: `Authentication server listening at http://localhost:3000`.

2.  **Start the Frontend Development Server:**
    Open a second terminal window, navigate to the `client` directory, and run:
    ```bash
    cd client
    npm run dev
    ```
    This will start the Vite development server and automatically open the client application in your browser (e.g., `http://localhost:5173`).

---

## ⚙️ Headless Web SDK Methods/Events Utilized

The client-side code (main.js) extensively utilizes various methods and listens for events provided by the [Headless web SDK](https://cloud.google.com/contact-center/ccai-platform/docs/headless-web-guide) to manage the chat lifecycle and interactions. Below is a summary of the key methods and events implemented in this demo:

### Methods Used:

* `createChat`: Initiates a new chat session with the ccai platform.
* `finishChat`: Ends an ongoing chat session.
* `fetchMessages`: Retrieves the history of messages for the current chat.
* `sendTextMessage`: Sends a plain text message from the user.
* `sendFileMessage`: Sends a file (e.g., image, video) as an attachment in the chat.

### Events Used:

* `ready`: Fired when the SDK is successfully initialized and ready for interaction.
* `authenticated`: Indicates that the client has been successfully authenticated with the ccai platform.
* `chat.ongoing`: Triggered when a chat session transitions to an ongoing state.
* `chat.message`: Fired when a new message (text, file, custom payload) is received in the chat.
* `chat.update`: Provides updates on the chat session status or properties.
* `chat.connected`: Indicates that the chat connection has been successfully established.

## 💡 Technical Notes

* The client-side `main.js` fetches the ccai-platform configuration (`host`, `companyId`, `menuId`, `tenant`) and the JWT authentication token from the Node.js backend(server). This prevents hardcoding sensitive or environment-specific SDK details directly in the client-side bundle.
* The `server.js` uses `dotenv` to load configurations from its `config/.env` file, ensuring secrets are not exposed in the codebase.
* The `package-lock.json` files in both `server/` and `client/` are committed to the repository to ensure consistent dependency installations across all environments.

---

## 🛠️ Technologies Used

* **Backend:**
    * [Node.js](https://nodejs.org/en/)
    * [Express.js](https://expressjs.com/)
    * [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
    * [cors](https://www.npmjs.com/package/cors)
    * [dotenv](https://www.npmjs.com/package/dotenv)
* **Frontend:**
    * HTML, CSS, JavaScript (Vanilla JS)
    * [Vite](https://vitejs.dev/) (as the development server and build tool)
    * [@ujet/websdk-headless](https://www.npmjs.com/package/@ujet/websdk-headless) ( Headless Web SDK)
* **Project Management:**
    * [npm](https://www.npmjs.com/)
    * [concurrently](https://www.npmjs.com/package/concurrently) (for running multiple scripts)

---
