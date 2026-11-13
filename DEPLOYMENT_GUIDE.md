# CampusConnect – Deployment & Operations Guide

## 1. Prerequisites
- **Node.js:** v18.0.0 or higher (v24 LTS recommended)
- **MongoDB:** MongoDB Atlas cluster URI or self-hosted MongoDB instance (v6.0+)
- **Cloudinary:** Account cloud name, API key, and secret (for production cloud media hosting)

---

## 2. Production Environment Variables

### Backend (`server/.env`)
```ini
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=your_production_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-campusconnect-frontend.vercel.app

# Seed Administrative Credentials
ADMIN_COLLEGE_ID=ADM2026
ADMIN_NAME=Campus Administrator
ADMIN_EMAIL=admin@campusconnect.edu
ADMIN_PASSWORD=YourStrongAdminPassword2026!

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 3. Frontend Deployment on Vercel

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the GitHub repository and configure the project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. The repository includes `client/vercel.json` configured with client-side routing rewrites:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
5. Set the environment variable in Vercel project settings:
   - `VITE_API_URL`: URL of your deployed backend (e.g. `https://campusconnect-backend.onrender.com/api/v1`).
6. Deploy!

---

## 4. Backend Deployment on Render

1. Log in to [Render](https://render.com) and click **"New Web Service"**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. In the **Environment Variables** section, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random secret string
   - `CLIENT_URL`: URL of your deployed frontend on Vercel
   - `ADMIN_PASSWORD`: Strong master password
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Alternatively, deploy using the bundled `render.yaml` blueprint.

---

## 5. Initializing Database & Seed Records on Production

Once the backend is live, execute the administrative and demonstration seeder:
```bash
# To seed only the secure administrator account:
npm run seed:admin

# To seed the full demonstration environment (admin, roster, demo students, sample items):
npm run seed:demo
```

