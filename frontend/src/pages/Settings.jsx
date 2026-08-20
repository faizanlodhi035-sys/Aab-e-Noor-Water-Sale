import React, { useEffect, useState } from 'react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { apiRequest } from '../api/api'

export default function Settings() {

  // =========================
  // PASSWORD
  // =========================

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })

  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  function handlePasswordChange(e) {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    })
  }

  async function changePassword(e) {
    e.preventDefault()

    setPasswordMessage('')
    setPasswordError('')

    if (!passwordForm.current_password) {
      setPasswordError('Current password is required')
      return
    }

    if (!passwordForm.new_password) {
      setPasswordError('New password is required')
      return
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    if (
      passwordForm.new_password !==
      passwordForm.new_password_confirmation
    ) {
      setPasswordError(
        'New password and confirmation password do not match'
      )
      return
    }

    setPasswordSaving(true)

    try {
      const response = await apiRequest('/user/password', {
        method: 'PUT',
        body: JSON.stringify(passwordForm),
      })

      if (response.success) {

        setPasswordMessage(
          'Password updated successfully. Please login again.'
        )

        setPasswordForm({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        })

        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')

        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      }

    } catch (err) {
      setPasswordError(
        err.message || 'Failed to update password'
      )
    } finally {
      setPasswordSaving(false)
    }
  }


  // =========================
  // SALESMEN
  // =========================

  const [salesmen, setSalesmen] = useState([])
  const [salesmanLoading, setSalesmanLoading] = useState(false)
  const [salesmanSaving, setSalesmanSaving] = useState(false)

  const [showSalesmanForm, setShowSalesmanForm] = useState(false)

  const [salesmanForm, setSalesmanForm] = useState({
    id: null,
    name: '',
    phone: '',
    email: '',
    password: '',
    status: true,
  })

  const [salesmanError, setSalesmanError] = useState('')
  const [salesmanMessage, setSalesmanMessage] = useState('')


  async function loadSalesmen() {

    setSalesmanLoading(true)
    setSalesmanError('')

    try {

      const response = await apiRequest('/salesmen')

      const data =
        Array.isArray(response)
          ? response
          : response.data || []

      setSalesmen(data)

    } catch (err) {

      setSalesmanError(
        err.message || 'Failed to load salesmen'
      )

    } finally {

      setSalesmanLoading(false)

    }
  }


  useEffect(() => {

    loadSalesmen()

  }, [])


  function openCreateSalesman() {

    setSalesmanForm({
      id: null,
      name: '',
      phone: '',
      email: '',
      password: '',
      status: true,
    })

    setSalesmanError('')
    setSalesmanMessage('')
    setShowSalesmanForm(true)
  }


  function openEditSalesman(salesman) {

    setSalesmanForm({
      id: salesman.id,
      name: salesman.name || '',
      phone: salesman.phone || '',
      email: salesman.email || '',
      password: '',
      status: salesman.status !== false && salesman.status !== 0,
    })

    setSalesmanError('')
    setSalesmanMessage('')
    setShowSalesmanForm(true)
  }


  function handleSalesmanChange(e) {

    const { name, value, type, checked } = e.target

    setSalesmanForm({
      ...salesmanForm,
      [name]: type === 'checkbox' ? checked : value,
    })
  }


  async function saveSalesman(e) {

    e.preventDefault()

    setSalesmanError('')
    setSalesmanMessage('')

    if (!salesmanForm.name.trim()) {
      setSalesmanError('Salesman name is required')
      return
    }

    if (!salesmanForm.email.trim()) {
      setSalesmanError('Email is required')
      return
    }

    if (
      !salesmanForm.id &&
      salesmanForm.password.length < 6
    ) {
      setSalesmanError(
        'Password must be at least 6 characters'
      )
      return
    }

    setSalesmanSaving(true)

    try {

      const payload = {
        name: salesmanForm.name.trim(),
        phone: salesmanForm.phone.trim() || null,
        email: salesmanForm.email.trim(),
        status: salesmanForm.status,
      }

      if (salesmanForm.password) {
        payload.password = salesmanForm.password
      }

      let response

      if (salesmanForm.id) {

        response = await apiRequest(
          `/salesmen/${salesmanForm.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
        )

      } else {

        response = await apiRequest(
          '/salesmen',
          {
            method: 'POST',
            body: JSON.stringify(payload),
          }
        )

      }

      setSalesmanMessage(
        response.message ||
        (
          salesmanForm.id
            ? 'Salesman updated successfully'
            : 'Salesman account created successfully'
        )
      )

      setShowSalesmanForm(false)

      setSalesmanForm({
        id: null,
        name: '',
        phone: '',
        email: '',
        password: '',
        status: true,
      })

      await loadSalesmen()

    } catch (err) {

      setSalesmanError(
        err.message || 'Failed to save salesman'
      )

    } finally {

      setSalesmanSaving(false)

    }
  }


  async function deleteSalesman(id) {

    if (!confirm(
      'Are you sure you want to delete this salesman account?'
    )) {
      return
    }

    try {

      setSalesmanError('')

      await apiRequest(`/salesmen/${id}`, {
        method: 'DELETE',
      })

      setSalesmen(current =>
        current.filter(item => item.id !== id)
      )

      setSalesmanMessage(
        'Salesman account deleted successfully'
      )

    } catch (err) {

      setSalesmanError(
        err.message || 'Failed to delete salesman'
      )

    }
  }


  return (
    <div className="max-w-4xl">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-5">

        <h1 className="text-2xl font-semibold">
          Settings
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your account and system users
        </p>

      </div>


      {/* =========================
          CHANGE PASSWORD
      ========================= */}

      <div className="bg-white rounded-lg shadow p-5 mb-6">

        <h2 className="text-lg font-semibold mb-1">
          Change Password
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Update your account password securely.
        </p>


        {passwordError && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded p-3 mb-4 text-sm">
            {passwordError}
          </div>
        )}


        {passwordMessage && (
          <div className="bg-green-50 text-green-600 border border-green-200 rounded p-3 mb-4 text-sm">
            {passwordMessage}
          </div>
        )}


        <form
          onSubmit={changePassword}
          className="space-y-4"
        >

          <Input
            label="Current Password"
            name="current_password"
            type="password"
            value={passwordForm.current_password}
            onChange={handlePasswordChange}
            placeholder="Enter current password"
          />

          <Input
            label="New Password"
            name="new_password"
            type="password"
            value={passwordForm.new_password}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
          />

          <Input
            label="Confirm New Password"
            name="new_password_confirmation"
            type="password"
            value={passwordForm.new_password_confirmation}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
          />

          <Button
            type="submit"
            disabled={passwordSaving}
          >
            {passwordSaving
              ? 'Updating...'
              : 'Update Password'}
          </Button>

        </form>

      </div>


      {/* =========================
          SALESMAN MANAGEMENT
      ========================= */}

      <div className="bg-white rounded-lg shadow p-5">

        <div className="flex justify-between items-center mb-4">

          <div>

            <h2 className="text-lg font-semibold">
              Salesman Accounts
            </h2>

            <p className="text-sm text-gray-500">
              Create and manage salesman login accounts.
            </p>

          </div>

          <Button onClick={openCreateSalesman}>
            + Create Salesman
          </Button>

        </div>


        {salesmanError && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded p-3 mb-4 text-sm">
            {salesmanError}
          </div>
        )}


        {salesmanMessage && (
          <div className="bg-green-50 text-green-600 border border-green-200 rounded p-3 mb-4 text-sm">
            {salesmanMessage}
          </div>
        )}


        {/* FORM */}

        {showSalesmanForm && (

          <div className="border rounded-lg p-4 mb-5 bg-gray-50">

            <h3 className="font-semibold mb-4">
              {salesmanForm.id
                ? 'Edit Salesman'
                : 'Create Salesman Account'}
            </h3>


            <form
              onSubmit={saveSalesman}
              className="space-y-3"
            >

              <Input
                label="Salesman Name"
                name="name"
                value={salesmanForm.name}
                onChange={handleSalesmanChange}
                placeholder="Enter salesman name"
              />


              <Input
                label="Phone"
                name="phone"
                value={salesmanForm.phone}
                onChange={handleSalesmanChange}
                placeholder="03XXXXXXXXX"
              />


              <Input
                label="Login Email"
                name="email"
                type="email"
                value={salesmanForm.email}
                onChange={handleSalesmanChange}
                placeholder="salesman@example.com"
              />


              <Input
                label={
                  salesmanForm.id
                    ? 'New Password (optional)'
                    : 'Password'
                }
                name="password"
                type="password"
                value={salesmanForm.password}
                onChange={handleSalesmanChange}
                placeholder={
                  salesmanForm.id
                    ? 'Leave empty to keep current password'
                    : 'Minimum 6 characters'
                }
              />


              <div className="flex items-center gap-2">

                <input
                  type="checkbox"
                  name="status"
                  checked={salesmanForm.status}
                  onChange={handleSalesmanChange}
                />

                <label className="text-sm">
                  Active Account
                </label>

              </div>


              <div className="flex gap-2 pt-2">

                <Button
                  type="submit"
                  disabled={salesmanSaving}
                >
                  {salesmanSaving
                    ? 'Saving...'
                    : salesmanForm.id
                      ? 'Update Salesman'
                      : 'Create Account'}
                </Button>


                <button
                  type="button"
                  onClick={() => setShowSalesmanForm(false)}
                  disabled={salesmanSaving}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        )}


        {/* SALESMAN LIST */}

        {salesmanLoading ? (

          <div className="text-sm text-gray-500">
            Loading salesman accounts...
          </div>

        ) : salesmen.length === 0 ? (

          <div className="text-sm text-gray-500">
            No salesman accounts found.
          </div>

        ) : (

          <div className="space-y-2">

            {salesmen.map(salesman => (

              <div
                key={salesman.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >

                <div>

                  <div className="font-semibold">
                    {salesman.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {salesman.email || '-'}
                  </div>

                  <div className="text-sm text-gray-500">
                    {salesman.phone || '-'}
                  </div>

                  <div className="text-xs mt-1">

                    {salesman.status
                      ? (
                        <span className="text-green-600">
                          ● Active
                        </span>
                      )
                      : (
                        <span className="text-red-600">
                          ● Inactive
                        </span>
                      )}

                  </div>

                </div>


                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      openEditSalesman(salesman)
                    }
                    className="px-3 py-2 text-sm bg-gray-100 rounded"
                  >
                    Edit
                  </button>


                  <button
                    onClick={() =>
                      deleteSalesman(salesman.id)
                    }
                    className="px-3 py-2 text-sm bg-red-100 rounded"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>      
    </div>
  )
} 