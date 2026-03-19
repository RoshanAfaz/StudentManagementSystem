import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
})

// Hardcoded for Capacitor/APK so it knows where to talk to the backend
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://studentmanagementsystem-1-evsf.onrender.com';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
