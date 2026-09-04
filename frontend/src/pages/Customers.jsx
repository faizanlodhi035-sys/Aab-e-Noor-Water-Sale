import React, { useEffect, useRef, useState } from 'react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Link } from 'react-router-dom'
import { apiRequest, getCustomers, getStorageUrl } from '../api/api'

function CustomerCard({ customer, onDelete, onEdit }) {
  const shopName = customer.shop_name || customer.name || 'Unnamed Customer'
  const phone = customer.phone || '-'
  const alternatePhone = customer.alternate_phone || '-'
  const address = customer.address || '-'
  const isActive = customer.status !== false && customer.status !== 0

  return (
    <div className="bg-white p-3 rounded shadow flex justify-between items-center">
      <div className="flex items-center gap-3">
        {customer.photo ? (
          <img
            src={getStorageUrl(customer.photo)}
            alt={shopName}
            className="w-14 h-14 rounded-full object-cover border"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
            👤
          </div>
        )}

        <div>
          <div className="font-semibold">
            {shopName}

            {!isActive && (
              <span className="text-xs text-red-500 ml-2">
                (Inactive)
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {customer.name || '-'}
          </div>

          <div className="text-xs text-gray-500">
            {address}
          </div>

          <div className="text-xs text-gray-500">
            {phone} • {alternatePhone}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          to={`/customers/${customer.id}`}
          className="text-sm text-purifly"
        >
          View
        </Link>

        <button
          onClick={() => onEdit(customer)}
          className="text-sm text-purifly"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(customer.id)}
          className="text-sm text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

const emptyForm = {
  id: null,
  name: '',
  shop_name: '',
  phone: '',
  alternate_phone: '',
  address: '',
  area: '',
  opening_balance: 0,
  status: true,
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Camera states
  const [cameraOpen, setCameraOpen] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  async function loadCustomers() {
    try {
      setLoading(true)
      setError('')

      const data = await getCustomers()

      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load customers:', err)
      setError(err.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()

    return () => {
      stopCamera()
    }
  }, [])

  function handleAdd() {
    stopCamera()

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }

    setForm({
      ...emptyForm,
    })

    setPhoto(null)
    setPhotoPreview(null)
    setCameraOpen(false)

    setShowForm(true)
    setError('')
  }

  function handleEdit(customer) {
    stopCamera()

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }

    setForm({
      id: customer.id,
      name: customer.name || '',
      shop_name: customer.shop_name || '',
      phone: customer.phone || '',
      alternate_phone: customer.alternate_phone || '',
      address: customer.address || '',
      area: customer.area || '',
      opening_balance: customer.opening_balance ?? 0,
      status: customer.status !== false && customer.status !== 0,
    })

    setPhoto(null)
    setPhotoPreview(null)
    setCameraOpen(false)

    setShowForm(true)
    setError('')
  }

  async function startCamera() {
    try {
      setError('')

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera is not supported by this browser.')
        return
      }

      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: 'environment',
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      })

      streamRef.current = stream
      setCameraOpen(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      }, 50)
    } catch (err) {
      console.error('Camera error:', err)

      if (err.name === 'NotAllowedError') {
        setError(
          'Camera permission denied. Please allow camera permission and try again.'
        )
      } else if (err.name === 'NotFoundError') {
        setError('No camera was found on this device.')
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already being used by another application.')
      } else {
        setError('Unable to open camera. Please try again.')
      }

      setCameraOpen(false)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })

      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraOpen(false)
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      setError('Camera is not ready.')
      return
    }

    if (!video.videoWidth || !video.videoHeight) {
      setError('Camera is still loading. Please wait a moment.')
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Failed to capture photo.')
          return
        }

        const file = new File(
          [blob],
          `customer-${Date.now()}.jpg`,
          {
            type: 'image/jpeg',
          }
        )

        if (photoPreview) {
          URL.revokeObjectURL(photoPreview)
        }

        const previewUrl = URL.createObjectURL(file)

        setPhoto(file)
        setPhotoPreview(previewUrl)

        stopCamera()
        setError('')
      },
      'image/jpeg',
      0.85
    )
  }

  function retakePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhoto(null)
    setPhotoPreview(null)

    startCamera()
  }

  async function saveCustomer() {
    if (!form.name.trim()) {
      alert('Customer name is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const formData = new FormData()

      formData.append('name', form.name.trim())
      formData.append(
        'shop_name',
        form.shop_name.trim() || ''
      )
      formData.append(
        'phone',
        form.phone.trim() || ''
      )
      formData.append(
        'alternate_phone',
        form.alternate_phone.trim() || ''
      )
      formData.append(
        'address',
        form.address.trim() || ''
      )
      formData.append(
        'area',
        form.area.trim() || ''
      )
      formData.append(
        'opening_balance',
        Number(form.opening_balance) || 0
      )
      formData.append(
        'status',
        form.status ? '1' : '0'
      )

      if (photo) {
        formData.append('photo', photo)
      }

      let savedCustomer

      if (form.id) {
        // Laravel/PHP does not reliably parse multipart PUT/PATCH.
        // Use POST + method spoofing for update.
        formData.append('_method', 'PUT')

        savedCustomer = await apiRequest(
          `/customers/${form.id}`,
          {
            method: 'POST',
            body: formData,
          }
        )

        setCustomers((current) =>
          current.map((customer) =>
            customer.id === form.id
              ? savedCustomer
              : customer
          )
        )
      } else {
        savedCustomer = await apiRequest(
          '/customers',
          {
            method: 'POST',
            body: formData,
          }
        )

        setCustomers((current) => [
          savedCustomer,
          ...current,
        ])
      }

      stopCamera()

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }

      setShowForm(false)
      setForm(emptyForm)
      setPhoto(null)
      setPhotoPreview(null)
    } catch (err) {
      console.error('Failed to save customer:', err)
      setError(err.message || 'Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCustomer(id) {
    if (!confirm('Delete customer?')) {
      return
    }

    try {
      setError('')

      await apiRequest(`/customers/${id}`, {
        method: 'DELETE',
      })

      setCustomers((current) =>
        current.filter((customer) => customer.id !== id)
      )
    } catch (err) {
      console.error('Failed to delete customer:', err)
      setError(err.message || 'Failed to delete customer')
    }
  }

  const search = query.toLowerCase()

  const list = customers.filter((customer) => {
    const name = (
      customer.name ||
      ''
    ).toLowerCase()

    const shopName = (
      customer.shop_name ||
      ''
    ).toLowerCase()

    const phone = customer.phone || ''

    const area = (
      customer.area ||
      ''
    ).toLowerCase()

    return (
      name.includes(search) ||
      shopName.includes(search) ||
      phone.includes(query) ||
      area.includes(search)
    )
  })

  return (
    <div>

      <div className="flex items-center gap-2 mb-3">
        <Input
          placeholder="Search customers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Button onClick={handleAdd}>
          Add
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-3 rounded shadow mb-3">

          {/* Customer Photo */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Customer Photo
            </label>

            {!cameraOpen && !photoPreview && (
              <button
                type="button"
                onClick={startCamera}
                className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium"
              >
                📷 Take Customer Photo
              </button>
            )}

            {cameraOpen && (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-lg bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold"
                  >
                    📸 Capture Photo
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-3 rounded-lg bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {photoPreview && (
              <div className="space-y-3">
                <img
                  src={photoPreview}
                  alt="Customer preview"
                  className="w-full max-h-72 object-cover rounded-lg border"
                />

                <button
                  type="button"
                  onClick={retakePhoto}
                  className="w-full px-4 py-3 rounded-lg bg-orange-500 text-white font-semibold"
                >
                  🔄 Retake Photo
                </button>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>

          <Input
            label="Customer Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <Input
            label="Shop Name"
            value={form.shop_name}
            onChange={(e) =>
              setForm({
                ...form,
                shop_name: e.target.value,
              })
            }
          />

          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          <Input
            label="Alternate Phone"
            value={form.alternate_phone}
            onChange={(e) =>
              setForm({
                ...form,
                alternate_phone: e.target.value,
              })
            }
          />

          <Input
            label="Address"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
          />

          <Input
            label="Area"
            value={form.area}
            onChange={(e) =>
              setForm({
                ...form,
                area: e.target.value,
              })
            }
          />

          <Input
            label="Opening Balance"
            type="number"
            value={form.opening_balance}
            onChange={(e) =>
              setForm({
                ...form,
                opening_balance: e.target.value,
              })
            }
          />

          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.checked,
                })
              }
            />

            <label className="text-sm">
              Active Customer
            </label>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              onClick={saveCustomer}
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : form.id
                  ? 'Update'
                  : 'Save'}
            </Button>

            <button
              className="px-4 py-2 rounded bg-gray-200"
              onClick={() => {
                stopCamera()

                if (photoPreview) {
                  URL.revokeObjectURL(photoPreview)
                }

                setShowForm(false)
                setForm(emptyForm)
                setPhoto(null)
                setPhotoPreview(null)
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>

        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">
          Loading customers...
        </div>
      ) : (
        <div className="space-y-2">

          {list.length === 0 && (
            <div className="text-sm text-gray-500">
              No customers found
            </div>
          )}

          {list.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onDelete={deleteCustomer}
              onEdit={handleEdit}
            />
          ))}

        </div>
      )}

    </div>
  )
}