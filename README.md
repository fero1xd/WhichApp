<h1 align="center">WhichApp</h1>

<h3 align="center">WhichApp is an online messaging and voice calling application</h3>
 
 <p align="center">
  <img src="https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/-TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white" />
  <img src="https://img.shields.io/badge/-Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white" />
 </p>
 
----
<h3 align="center">Features</h3>

<div align="center">
  <p>⚡ Server-side rendering with Next.js<br />
  🍪 Cookie-based authorization with JSON web tokens<br />
  📞 Realtime voice call with WebRtc<br />
  💬 Realtime chat with Socket.io<br />
  🖼️ Cloud image upload with Cloudinary<br />
  📱 Otp verification with Twillio<br />
  🔐 Only one logged in device allowed at one time
</div>

## Running Locally

Clone this repository and install dependencies by running:

```
cd frontend
npm install

cd backend
npm install
```

Create a new file named `.env` in the frontend and the backend directory with the following environment variables in the root of the project folder:

```
Backend .env

PORT=3001
MONGO_URI=
NODE_ENV=
API_V=1
TWILLIO_SID=
TWILLIO_TOKEN=
TWILLIO_TRIAL_NO=
JWT_SECRET=
DEFAULT_PROFILE_PIC=
HASH_SECRET=
BUCKET_NAME = 
AWS_S3_ACCESS_KEY_ID = 
AWS_S3_ACCESS_KEY_SECRET = 

Frontend .env

NEXT_PUBLIC_CLOUDINARY_URL=
```

For development mode, run:

```
cd frontend

npm run dev

cd backend

npm run start
```

For production mode, run:

```
cd frontend

npm run build
npm start
```

Visit http://localhost:3000 or your custom port environment variable to view the app.

## Screenshots

![Banner Image](https://res.cloudinary.com/dxdizd7ia/image/upload/v1654107744/stock/w1_njykuo.png)


![](https://res.cloudinary.com/dxdizd7ia/image/upload/v1654108051/stock/w4_rerobw.png) 
![](https://res.cloudinary.com/dxdizd7ia/image/upload/v1654108287/stock/w6_qgdcxy.png)
