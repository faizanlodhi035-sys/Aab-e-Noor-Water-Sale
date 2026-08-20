import React, { useContext, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetails from './pages/CustomerDetails'
import Products from './pages/Products'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import OrderDetails from './pages/OrderDetails'
import Reports from './pages/Reports'
import Inventory from './pages/Inventory'
import Expenses from './pages/Expenses'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Help from './pages/Help'

import AppLayout from './components/layout/AppLayout'
import { AuthContext } from './contexts/AuthContext'



/*
|--------------------------------------------------------------------------
| Authentication Route
|--------------------------------------------------------------------------
*/

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}


/*
|--------------------------------------------------------------------------
| Role Protected Route
|--------------------------------------------------------------------------
*/

function RoleRoute({ children, roles }) {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}


/*
|--------------------------------------------------------------------------
| Application
|--------------------------------------------------------------------------
*/

export default function App() {

  useEffect(() => {
    
  }, [])

  return (
    <div className="app-container">

      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />


        {/* Protected Application */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >

          {/* Default */}
          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />


          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<Dashboard />}
          />


          {/* Customers */}
          <Route
            path="customers"
            element={<Customers />}
          />

          <Route
            path="customers/:id"
            element={<CustomerDetails />}
          />


          {/* Products - Admin + Salesman */}
          <Route
            path="products"
            element={
              <RoleRoute roles={['admin', 'salesman']}>
                <Products />
              </RoleRoute>
            }
          />


          {/* Orders / Sales - Admin + Salesman */}
          <Route
            path="orders"
            element={
              <RoleRoute roles={['admin', 'salesman']}>
                <Orders />
              </RoleRoute>
            }
          />

          <Route
            path="orders/new"
            element={
              <RoleRoute roles={['admin', 'salesman']}>
                <NewOrder />
              </RoleRoute>
            }
          />

          <Route
            path="orders/:id"
            element={
              <RoleRoute roles={['admin', 'salesman']}>
                <OrderDetails />
              </RoleRoute>
            }
          />


          {/* Inventory - Admin Only */}
          <Route
            path="inventory"
            element={
              <RoleRoute roles={['admin']}>
                <Inventory />
              </RoleRoute>
            }
          />


          {/* Expenses - Admin Only */}
          <Route
            path="expenses"
            element={
              <RoleRoute roles={['admin']}>
                <Expenses />
              </RoleRoute>
            }
          />


          {/* Reports - Admin Only */}
          <Route
            path="reports"
            element={
              <RoleRoute roles={['admin']}>
                <Reports />
              </RoleRoute>
            }
          />


          {/* Settings - Admin Only */}
          <Route
            path="settings"
            element={
              <RoleRoute roles={['admin']}>
                <Settings />
              </RoleRoute>
            }
          />


          {/* Profile - Both */}
          <Route
            path="profile"
            element={<Profile />}
          />


          {/* Help - Both */}
          <Route
            path="help"
            element={<Help />}
          />

        </Route>


        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </div>
  )
}