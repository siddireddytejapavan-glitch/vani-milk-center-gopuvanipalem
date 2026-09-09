'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface VariantFormItem {
  id?: string;
  packSize: string;
  unit: string;
  price: number | string;
  stockQuantity: number | string;
  isAvailable: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  quality: string;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
  variants: Array<{
    id: string;
    packSize: string;
    unit: string;
    price: number;
    stockQuantity: number;
    isAvailable: boolean;
  }>;
}

export default function ProductManager({
  initialProducts,
  categories,
}: {
  initialProducts: ProductItem[];
  categories: Array<{ id: string; name: string; slug: string }>;
}) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<ProductItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [quality, setQuality] = useState('Fresh Farm Quality');
  const [imageUrl, setImageUrl] = useState('/images/default-dairy.jpg');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<VariantFormItem[]>([
    { packSize: '500 ml', unit: 'packet', price: 30, stockQuantity: 50, isAvailable: true },
  ]);

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setQuality('Fresh Farm Quality');
    setImageUrl('/images/default-dairy.jpg');
    setIsActive(true);
    setIsFeatured(false);
    setVariants([
      { packSize: '500 ml', unit: 'packet', price: 30, stockQuantity: 50, isAvailable: true },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setDescription(p.description);
    setQuality(p.quality);
    setImageUrl(p.imageUrl);
    setIsActive(p.isActive);
    setIsFeatured(p.isFeatured);
    setVariants(
      p.variants.map((v) => ({
        id: v.id,
        packSize: v.packSize,
        unit: v.unit,
        price: v.price,
        stockQuantity: v.stockQuantity,
        isAvailable: v.isAvailable,
      }))
    );
    setIsModalOpen(true);
  };

  // Add / Remove Variant rows in modal
  const addVariantRow = () => {
    setVariants([
      ...variants,
      { packSize: '', unit: 'packet', price: '', stockQuantity: 50, isAvailable: true },
    ]);
  };

  const removeVariantRow = (index: number) => {
    if (variants.length <= 1) {
      showNotification('At least one pack size variant is required.', 'error');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantRow = (index: number, field: keyof VariantFormItem, val: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: val };
    setVariants(updated);
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setImageUrl(data.url);
      showNotification('Image uploaded successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showNotification('Product name is required', 'error');
      return;
    }

    if (variants.some((v) => !v.packSize || !v.price)) {
      showNotification('All variants must have a pack size and price.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        categoryId,
        description: description.trim(),
        quality: quality.trim(),
        imageUrl,
        isActive,
        isFeatured,
        variants,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      if (editingProduct) {
        setProducts(products.map((p) => (p.id === data.product.id ? data.product : p)));
        showNotification('Product updated successfully!');
      } else {
        setProducts([data.product, ...products]);
        showNotification('Product added successfully!');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      showNotification(err.message || 'Error saving product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete product
  const confirmDeleteProduct = async () => {
    if (!isDeleting) return;

    try {
      const res = await fetch(`/api/products/${isDeleting.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      setProducts(products.filter((p) => p.id !== isDeleting.id));
      showNotification('Product deleted successfully!');
      setIsDeleting(null);
    } catch (err: any) {
      showNotification(err.message || 'Error deleting product', 'error');
    }
  };

  // Toggle active status directly
  const handleToggleActive = async (product: ProductItem) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(products.map((p) => (p.id === product.id ? data.product : p)));
        showNotification(
          `Product marked as ${!product.isActive ? 'Active' : 'Unavailable'}`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchCategory = categoryFilter === 'all' || p.category?.slug === categoryFilter;
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Boolean(p.variants?.some((v) => v.packSize.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Product &amp; Variant Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Add, update pack sizes (250ml to 20kg buckets), prices, and stock.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or pack sizes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              categoryFilter === 'all'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                categoryFilter === c.slug
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Variants &amp; Prices</th>
                <th className="px-6 py-4">Quality Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Thumbnail & Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image
                          src={prod.imageUrl || '/images/default-dairy.jpg'}
                          alt={prod.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">{prod.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                          {prod.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">
                      {prod.category?.name || 'Dairy'}
                    </span>
                  </td>

                  {/* Variants & Prices */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-sm">
                      {(prod.variants || []).map((v) => (
                        <span
                          key={v.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                            v.isAvailable && v.stockQuantity > 0
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-rose-50 border-rose-200 text-rose-700 line-through'
                          }`}
                        >
                          <span>{v.packSize}:</span>
                          <span className="text-emerald-700">{formatINR(v.price)}</span>
                          <span className="text-slate-400 text-[10px]">({v.stockQuantity})</span>
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Quality Info */}
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {prod.quality}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(prod)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold transition-colors ${
                        prod.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {prod.isActive ? 'Active' : 'Unavailable'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsDeleting(prod)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">
                {editingProduct ? 'Edit Product & Variants' : 'Add New Dairy Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Traditional Thick Curd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Quality Tag / Description
                </label>
                <input
                  type="text"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  placeholder="e.g. Thick Naturally Set, Fresh Farm Quality"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product taste, preparation, or function use..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                />
              </div>

              {/* Image Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <Image
                      src={imageUrl || '/images/default-dairy.jpg'}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="/images/products/fresh-curd.jpg or https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">JPG, PNG, WebP up to 5MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variants Section (Pack sizes, prices, stock) */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Pack Sizes &amp; Variants
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      e.g. 500 ml, 1 Litre, 5 kg bucket, 10 kg bucket, 20 kg bucket
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Pack Size</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200"
                    >
                      <div className="col-span-4">
                        <input
                          type="text"
                          required
                          value={v.packSize}
                          onChange={(e) => updateVariantRow(index, 'packSize', e.target.value)}
                          placeholder="e.g. 10 kg bucket"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            required
                            min="0"
                            step="any"
                            value={v.price}
                            onChange={(e) => updateVariantRow(index, 'price', e.target.value)}
                            placeholder="Price"
                            className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          required
                          min="0"
                          value={v.stockQuantity}
                          onChange={(e) => updateVariantRow(index, 'stockQuantity', e.target.value)}
                          placeholder="Stock"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Toggles */}
              <div className="pt-2 flex items-center gap-6 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span>Active &amp; Available on Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span>Show as Featured on Home</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">&ldquo;{isDeleting?.name}&rdquo;</span>? This will permanently remove the product and all its pack size variants from the catalogue.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsDeleting(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
