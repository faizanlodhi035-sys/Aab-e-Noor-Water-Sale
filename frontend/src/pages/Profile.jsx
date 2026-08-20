import React, { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Button from '../components/common/Button'

export default function Profile() {
  const { user, logout } = useContext(AuthContext)

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-3">
        <div className="text-lg font-semibold">{user?.name}</div>
        <div className="text-sm text-gray-500">{user?.role}</div>
        <div className="text-sm text-gray-500">EMP ID: {user?.empId}</div>
        <div className="text-sm text-gray-500">Mobile: {user?.mobile}</div>
      </div>
      <div className="space-y-2">
        <Button onClick={() => alert('Profile not editable in demo')}>My Profile</Button>
        <Button onClick={() => alert('Change password demo')}>Change Password</Button>
        <Button onClick={() => alert('Sync data demo')}>Sync Data</Button>
        <Button onClick={() => logout()}>Logout</Button>
      </div>
    </div>
  )
}
