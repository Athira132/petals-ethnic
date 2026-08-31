import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models/category.model';
import { handleImageError, sanitizeImageUrl, isIbbShareUrl } from '../../core/utils/image.utils';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="category-admin">
      <div class="header-flex">
        <div>
          <h1 class="page-title">Categories Management</h1>
          <p class="page-subtitle">Manage store categories, slugs, and cover banner images.</p>
        </div>
        <button (click)="openCreateModal()" class="btn-primary">
          + Create New Category
        </button>
      </div>

      <div class="table-card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Order</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categories">
                <td>
                  <img [src]="cat.image_url || fallbackImg" [alt]="cat.name" class="cat-thumb" (error)="onImageError($event)" />
                </td>
                <td>
                  <strong>{{ cat.name }}</strong>
                </td>
                <td><code>{{ cat.slug }}</code></td>
                <td>
                  <div class="cat-desc" *ngIf="cat.description">{{ cat.description }}</div>
                  <div class="cat-desc text-muted" *ngIf="!cat.description">No description provided</div>
                </td>
                <td>{{ cat.display_order || 0 }}</td>
                <td>
                  <span class="date-text">{{ cat.created_at | date:'mediumDate' }}</span>
                </td>
                <td>
                  <span class="badge" [class.badge-pink]="cat.active" [class.badge-dark]="!cat.active">
                    {{ cat.active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
                <td>
                  <div class="action-btn-group">
                    <button (click)="openEditModal(cat)" class="edit-btn" title="Edit Category">Edit</button>
                    <button (click)="toggleActive(cat)" class="toggle-btn" [title]="cat.active ? 'Deactivate' : 'Activate'">
                      {{ cat.active ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button (click)="deleteCategory(cat)" class="delete-btn" title="Delete Category">Delete</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0">
                <td colspan="8" class="text-center py-4">No categories found in database.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Category Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-box">
          <div class="modal-header">
            <h2>{{ editingCat ? 'Edit Category' : 'Create New Category' }}</h2>
            <button (click)="closeModal()" class="close-modal-btn">&times;</button>
          </div>

          <form (ngSubmit)="saveCategory()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Category Name *</label>
              <input 
                type="text" 
                [(ngModel)]="formCat.name" 
                name="name" 
                required 
                class="form-control" 
                placeholder="e.g. Party Wear"
                (input)="autoSlug()" 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Slug (Auto-generated)</label>
              <input 
                type="text" 
                [(ngModel)]="formCat.slug" 
                name="slug" 
                class="form-control" 
                placeholder="e.g. party-wear" 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea 
                [(ngModel)]="formCat.description" 
                name="description" 
                rows="3" 
                class="form-control"
                placeholder="Describe this fashion collection..."
              ></textarea>
            </div>

            <!-- Device Image Upload Section -->
            <div class="form-group">
              <label class="form-label">Category Image / Banner</label>
              <div class="upload-container">
                <div class="file-dropzone">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    (change)="onFileSelected($event)" 
                    class="form-control-file" 
                    [disabled]="isUploadingImage"
                  />
                  <div class="upload-instructions">
                    <span class="upload-icon">📁</span>
                    <span>Upload image from device (JPG, PNG, WEBP max 10MB)</span>
                  </div>
                </div>

                <div *ngIf="uploadStatusText" class="upload-status" [class.error-text]="uploadHasError" [class.success-text]="!uploadHasError">
                  {{ uploadStatusText }}
                </div>

                <!-- Image Preview Box -->
                <div class="preview-box" *ngIf="imagePreviewUrl || formCat.image_url">
                  <img [src]="imagePreviewUrl || formCat.image_url" alt="Category Image Preview" class="img-preview" (error)="onImageError($event)" />
                  <button type="button" (click)="clearImage()" class="clear-img-btn" title="Remove Image">&times;</button>
                </div>

                <div class="or-divider"><span>OR PASTE DIRECT URL</span></div>

                <input 
                  type="text" 
                  [(ngModel)]="formCat.image_url" 
                  (input)="onUrlInput()"
                  name="image_url" 
                  class="form-control" 
                  placeholder="https://i.ibb.co/... (Direct image URL)" 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Display Order</label>
                <input type="number" [(ngModel)]="formCat.display_order" name="display_order" class="form-control" />
              </div>

              <div class="form-group flex-1 flex-center">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formCat.active" name="active" />
                  <span>Active Category</span>
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn-outline">Cancel</button>
              <button type="submit" [disabled]="isSaving || isUploadingImage" class="btn-primary">
                {{ isUploadingImage ? 'Uploading Image...' : (isSaving ? 'Saving...' : 'Save Category') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 28px; margin-bottom: 4px; }
    .page-subtitle { font-size: 14px; color: var(--color-muted); }

    .table-card { background: #FFFFFF; border: 1px solid var(--color-border-light); border-radius: var(--radius-md); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .admin-table th, .admin-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border-light); text-align: left; vertical-align: middle; }
    .admin-table th { background-color: var(--color-bg-alt); font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-muted); }

    .cat-thumb { width: 44px; height: 56px; object-fit: cover; border-radius: 4px; border: 1px solid var(--color-border-light); }
    .cat-desc { font-size: 12px; color: var(--color-muted); max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .text-muted { font-style: italic; color: #9E9E9E; }
    .date-text { font-size: 12px; color: var(--color-muted); white-space: nowrap; }

    .action-btn-group { display: flex; gap: 8px; align-items: center; }
    .edit-btn { color: #1976D2; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }
    .toggle-btn { color: #E65100; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }
    .delete-btn { color: #D32F2F; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .modal-box { background: #FFFFFF; width: 100%; max-width: 540px; border-radius: var(--radius-lg); padding: 32px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--color-border-light); padding-bottom: 12px; }
    .close-modal-btn { font-size: 28px; color: var(--color-muted); background: transparent; border: none; cursor: pointer; }

    .upload-container { margin-top: 6px; }
    .file-dropzone { border: 2px dashed #E0E0E0; border-radius: 8px; padding: 16px; text-align: center; position: relative; background: #FAF9F6; transition: border-color 0.2s; cursor: pointer; }
    .file-dropzone:hover { border-color: var(--color-pink-accent, #D4AF37); }
    .form-control-file { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
    .upload-instructions { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: #666; }
    .upload-icon { font-size: 18px; }

    .upload-status { font-size: 12px; margin-top: 8px; font-weight: 500; }
    .success-text { color: #2E7D32; }
    .error-text { color: #D32F2F; }

    .preview-box { position: relative; display: inline-block; margin-top: 12px; border-radius: 6px; overflow: hidden; border: 1px solid var(--color-border-light); }
    .img-preview { width: 90px; height: 110px; object-fit: cover; display: block; }
    .clear-img-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }

    .or-divider { text-align: center; margin: 12px 0 8px; font-size: 10px; color: #9E9E9E; letter-spacing: 1px; }

    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .flex-center { display: flex; align-items: center; margin-top: 24px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }

    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-border-light); }
    .text-center { text-align: center; }
    .py-4 { padding-top: 24px; padding-bottom: 24px; }
  `]
})
export class CategoryListComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  fallbackImg = 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg';

  isModalOpen = false;
  editingCat: Category | null = null;
  isSaving = false;

  imagePreviewUrl: string = '';
  uploadStatusText: string = '';
  uploadHasError: boolean = false;
  isUploadingImage: boolean = false;

  private catSub?: Subscription;

  formCat: Partial<Category> = {
    name: '',
    slug: '',
    description: '',
    image_url: '',
    active: true,
    display_order: 1
  };

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.catSub = this.productService.categories$.subscribe(cats => {
      this.categories = cats;
      this.cdr.markForCheck();
    });
    await this.loadCategories();
  }

  ngOnDestroy() {
    if (this.catSub) this.catSub.unsubscribe();
  }

  async loadCategories() {
    try {
      this.categories = await this.productService.getCategories(false);
      this.cdr.markForCheck();
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  }

  openCreateModal() {
    this.editingCat = null;
    this.formCat = {
      name: '',
      slug: '',
      description: '',
      image_url: '',
      active: true,
      display_order: this.categories.length + 1
    };
    this.imagePreviewUrl = '';
    this.uploadStatusText = '';
    this.uploadHasError = false;
    this.isUploadingImage = false;
    this.isModalOpen = true;

    this.resetFileInput();
    this.cdr.markForCheck();
  }

  openEditModal(cat: Category) {
    this.editingCat = cat;
    this.formCat = { ...cat };
    this.imagePreviewUrl = cat.image_url || '';
    this.uploadStatusText = '';
    this.uploadHasError = false;
    this.isUploadingImage = false;
    this.isModalOpen = true;

    this.resetFileInput();
    this.cdr.markForCheck();
  }

  resetFileInput() {
    setTimeout(() => {
      const fileInput = document.querySelector('.upload-container input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }, 0);
  }

  autoSlug() {
    if (!this.editingCat && this.formCat.name) {
      this.formCat.slug = this.formCat.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingCat = null;
    this.imagePreviewUrl = '';
    this.uploadStatusText = '';
    this.uploadHasError = false;
    this.isUploadingImage = false;
    this.isSaving = false;
    this.resetFileInput();
    this.cdr.markForCheck();
  }

  onImageError(event: Event) {
    handleImageError(event);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isUploadingImage = true;
    this.uploadHasError = false;
    this.uploadStatusText = `Uploading image (${file.name})...`;

    // Generate local preview URL
    try {
      this.imagePreviewUrl = URL.createObjectURL(file);
    } catch (e) {
      // Fallback
    }

    this.cdr.markForCheck();

    try {
      const uploadedUrl = await this.productService.uploadCategoryImage(file);
      this.formCat.image_url = uploadedUrl;
      this.imagePreviewUrl = uploadedUrl;
      this.uploadStatusText = '✓ Image uploaded successfully!';
      this.uploadHasError = false;
    } catch (err: any) {
      console.error('Category image upload failed:', err);
      this.uploadStatusText = `⚠️ Upload failed: ${err.message || 'Image upload request failed.'}`;
      this.uploadHasError = true;
    } finally {
      this.isUploadingImage = false;
      input.value = '';
      this.cdr.markForCheck();
    }
  }

  onUrlInput() {
    if (this.formCat.image_url) {
      this.imagePreviewUrl = this.formCat.image_url;
    }
  }

  clearImage() {
    this.formCat.image_url = '';
    this.imagePreviewUrl = '';
    this.uploadStatusText = '';
    this.uploadHasError = false;
    this.resetFileInput();
    this.cdr.markForCheck();
  }

  async saveCategory() {
    if (this.isUploadingImage) {
      alert('Please wait for image upload to complete before saving.');
      return;
    }

    if (!this.formCat.name || !this.formCat.name.trim()) {
      alert('Please enter a Category Name.');
      return;
    }

    if (!this.formCat.slug || !this.formCat.slug.trim()) {
      this.autoSlug();
    }

    if (this.formCat.image_url) {
      this.formCat.image_url = sanitizeImageUrl(this.formCat.image_url);
      if (isIbbShareUrl(this.formCat.image_url)) {
        alert('Please use the direct image URL, not the ImgBB share-page URL.');
        return;
      }
    }

    this.isSaving = true;
    this.cdr.markForCheck();

    try {
      let savedCat: Category;
      if (this.editingCat) {
        savedCat = await this.productService.updateCategory(this.editingCat.id, this.formCat);
        alert('Category updated successfully!');
      } else {
        savedCat = await this.productService.createCategory(this.formCat);
        alert('Category added successfully!');
      }

      this.closeModal();

      // Update component local state immediately for instant 0ms rendering
      if (savedCat && savedCat.id) {
        const existingIdx = this.categories.findIndex(c => c.id === savedCat.id);
        if (existingIdx >= 0) {
          this.categories[existingIdx] = { ...savedCat };
        } else {
          this.categories = [...this.categories, { ...savedCat }];
        }
      }

      this.cdr.markForCheck();

    } catch (err: any) {
      console.error('Error saving category:', err);
      alert(err.message || 'Error saving category');
    } finally {
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }

  async toggleActive(cat: Category) {
    if (!cat || !cat.id) return;
    try {
      const updated = await this.productService.updateCategory(cat.id, { active: !cat.active });
      const idx = this.categories.findIndex(c => c.id === cat.id);
      if (idx >= 0 && updated) {
        this.categories[idx] = { ...updated };
      } else {
        cat.active = !cat.active;
      }
      this.cdr.markForCheck();
    } catch (err: any) {
      alert(err.message || 'Error toggling category status');
    }
  }

  async deleteCategory(cat: Category) {
    if (!cat || !cat.id) return;

    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      try {
        await this.productService.deleteCategory(cat.id);
        this.categories = this.categories.filter(c => c.id !== cat.id);
        this.cdr.markForCheck();
        alert('Category deleted successfully.');
      } catch (err: any) {
        console.error('Error deleting category:', err);
        alert(err.message || 'Error deleting category');
      }
    }
  }
}
