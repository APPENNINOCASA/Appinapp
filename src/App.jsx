import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddProperty from './pages/AddProperty'
import MyProperties from './pages/MyProperties'
import PropertyImages from './pages/PropertyImages'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import EditProperty from './pages/EditProperty'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="loading">Caricamento...</div>
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="loading">Caricamento...</div>
  }
  
  return user ? <Navigate to="/dashboard" /> : children
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/add-property" element={
            <ProtectedRoute>
              <AddProperty />
            </ProtectedRoute>
          } />
          <Route path="/my-properties" element={
            <ProtectedRoute>
              <MyProperties />
            </ProtectedRoute>
          } />
          <Route path="/property-images/:id" element={
            <ProtectedRoute>
              <PropertyImages />
            </ProtectedRoute>
          } />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/edit-property/:id" element={
            <ProtectedRoute>
              <EditProperty />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
