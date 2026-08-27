'use client'

import React, { useState, useEffect } from 'react'
import { saveProduct, deleteProduct } from '../actions'
import { getProductsCached } from '@/lib/productCache'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ id: 0, name: '', default_rate: '' })
  const [errors, setErrors] = useState<any>({})

  const load = async () => setProducts(await getProductsCached())
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!formData.name) {
      setErrors({ name: 'Product name is required' })
      return
    }
    if (!formData.default_rate || isNaN(Number(formData.default_rate))) {
      setErrors({ default_rate: 'Valid rate is required' })
      return
    }
    
    await saveProduct({ id: formData.id || undefined, name: formData.name, default_rate: Number(formData.default_rate) })
    setModalOpen(false)
    load()
  }

  const handleDelete = async () => {
    if(deleteId) {
      await deleteProduct(deleteId)
      setDeleteId(null)
      load()
    }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Products</h1>
        <Button onClick={() => { setFormData({ id: 0, name: '', default_rate: '' }); setErrors({}); setModalOpen(true) }}>
          <Plus size={18} className="mr-2" /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] flex flex-col gap-6">
        <div className="w-80">
          <Input 
            placeholder="Search products..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            startIcon={<Search size={18} />}
          />
        </div>

        <div className="overflow-auto border border-[var(--color-border)] rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Product Name</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Default Rate</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors last:border-0">
                  <td className="p-4 font-medium text-[var(--color-text-primary)]">{p.name}</td>
                  <td className="p-4 text-[var(--color-text-secondary)] font-semibold">₹{p.default_rate.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <Button variant="tertiary" size="sm" onClick={() => { 
                      setFormData({ id: p.id, name: p.name, default_rate: p.default_rate.toString() })
                      setErrors({})
                      setModalOpen(true) 
                    }}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="tertiary" size="sm" className="text-[var(--color-error)] hover:text-red-700" onClick={() => setDeleteId(p.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-[var(--color-text-secondary)]">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={formData.id ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Product</Button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          <Input 
            label="Product Name" 
            value={formData.name} 
            onChange={e => {
              setFormData({...formData, name: e.target.value})
              setErrors({...errors, name: null})
            }}
            error={errors.name}
            placeholder="e.g. LED Bulb 9W"
          />
          <Input 
            label="Default Rate (₹)" 
            type="number" 
            step="0.01" 
            value={formData.default_rate} 
            onChange={e => {
              setFormData({...formData, default_rate: e.target.value})
              setErrors({...errors, default_rate: null})
            }}
            error={errors.default_rate}
            placeholder="150.00"
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-[var(--color-text-secondary)]">Are you sure you want to delete this product? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
