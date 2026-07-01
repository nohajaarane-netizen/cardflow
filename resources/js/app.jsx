import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Page principale = Login direct */}
                <Route path="/" element={<Login />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)