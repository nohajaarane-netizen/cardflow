import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import AdminLayout from './admin/AdminLayout'
import DashboardPage from './admin/pages/DashboardPage'
import ClientsPage from './admin/pages/ClientsPage'
import CardsPage from './admin/pages/CardsPage'
import TransactionsPage from './admin/pages/TransactionsPage'
import DisputesPage from './admin/pages/DisputesPage'
import AnalyticsPage from './admin/pages/AnalyticsPage'
import ReportsPage from './admin/pages/ReportsPage'
import SettingsPage from './admin/pages/SettingsPage'
import UsersPage from './admin/pages/UsersPage'
import SupportPage from './admin/pages/SupportPage'

function RequireAdmin({ children }) {
    const token = localStorage.getItem('token')
    const user  = JSON.parse(localStorage.getItem('user') || 'null')

    if (!token || !user || user.role !== 'admin') {
        return <Navigate to="/" replace />
    }
    return children
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route
                    path="/admin"
                    element={
                        <RequireAdmin>
                            <AdminLayout />
                        </RequireAdmin>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="clients" element={<ClientsPage />} />
                    <Route path="cards" element={<CardsPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="disputes" element={<DisputesPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="support" element={<SupportPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
