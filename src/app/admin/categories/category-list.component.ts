import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models/category.model';

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
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categories">
                <td>
                  <img [src]="cat.image_url || fallbackImg" [alt]="cat.name" class="cat-thumb" />
                </td>
                <td>
                  <strong>{{ cat.name }}</strong>
                  <div class="cat-desc" *ngIf="cat.description">{{ cat.description }}</div>
                </td>
                <td><code>{{ cat.slug }}</code></td>
                <td>{{ cat.display_order || 0 }}</td>
                <td>
                  <span class="badge" [class.badge-pink]="cat.active" [class.badge-dark]="!cat.active">
                    {{ cat.active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
                <td>
                  <div class="action-btn-group">
                    <button (click)="openEditModal(cat)" class="edit-btn">Edit</button>
                    <button (click)="deleteCategory(cat)" class="delete-btn">Delete</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0">
                <td colspan="6" class="text-center">No categories found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-box">
          <div class="modal-header">
            <h2>{{ editingCat ? 'Edit Category' : 'Create New Category' }}</h2>
            <button (click)="closeModal()" class="close-modal-btn">&times;</button>
          </div>

          <form (ngSubmit)="saveCategory()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Category Name *</label>
              <input type="text" [(ngModel)]="formCat.name" name="name" required class="form-control" (input)="autoSlug()" />
            </div>

            <div class="form-group">
              <label class="form-label">Slug *</label>
              <input type="text" [(ngModel)]="formCat.slug" name="slug" required class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea [(ngModel)]="formCat.description" name="description" rows="2" class="form-control"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Image Direct URL</label>
              <input type="text" [(ngModel)]="formCat.image_url" name="image_url" class="form-control" placeholder="https://i.ibb.co/..." />
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Display Order</label>
                <input type="number" [(ngModel)]="formCat.display_order" name="display_order" class="form-control" />
              </div>

              <div class="form-group flex-1 flex-center">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formCat.active" name="active" />
                  <span>Active</span>
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn-outline">Cancel</button>
              <button type="submit" [disabled]="isSaving" class="btn-primary">
                {{ isSaving ? 'Saving...' : 'Save Category' }}
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
    .admin-table th, .admin-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border-light); text-align: left; }
    .admin-table th { background-color: var(--color-bg-alt); font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-muted); }

    .cat-thumb { width: 44px; height: 56px; object-fit: cover; border-radius: 4px; }
    .cat-desc { font-size: 12px; color: var(--color-muted); }

    .action-btn-group { display: flex; gap: 8px; }
    .edit-btn { color: #1976D2; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }
    .delete-btn { color: #D32F2F; font-size: 13px; font-weight: 500; background: transparent; border: none; cursor: pointer; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .modal-box { background: #FFFFFF; width: 100%; max-width: 500px; border-radius: var(--radius-lg); padding: 32px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--color-border-light); padding-bottom: 12px; }
    .close-modal-btn { font-size: 28px; color: var(--color-muted); background: transparent; border: none; cursor: pointer; }

    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .flex-center { display: flex; align-items: center; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }

    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-border-light); }
    .text-center { text-align: center; }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  fallbackImg = 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg';

  isModalOpen = false;
  editingCat: Category | null = null;
  isSaving = false;

  formCat: Partial<Category> = {
    name: '',
    slug: '',
    description: '',
    image_url: '',
    active: true,
    display_order: 1
  };

  constructor(private productService: ProductService) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.productService.getCategories(false);
  }

  openCreateModal() {
    this.editingCat = null;
    this.formCat = {
      name: '',
      slug: '',
      description: '',
      image_url: 'https://i.ibb.co/7tQbhHpZ/Whats-App-Image-2026-08-13-at-12-31-11-PM-2.jpg',
      active: true,
      display_order: this.categories.length + 1
    };
    this.isModalOpen = true;
  }

  openEditModal(cat: Category) {
    this.editingCat = cat;
    this.formCat = { ...cat };
    this.isModalOpen = true;
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
  }

  async saveCategory() {
    if (!this.formCat.name || !this.formCat.slug) {
      alert('Please fill in Name and Slug.');
      return;
    }

    this.isSaving = true;
    try {
      if (this.editingCat) {
        await this.productService.updateCategory(this.editingCat.id, this.formCat);
      } else {
        await this.productService.createCategory(this.formCat);
      }
      this.closeModal();
      await this.loadCategories();
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    } finally {
      this.isSaving = false;
    }
  }

  async deleteCategory(cat: Category) {
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      try {
        await this.productService.deleteCategory(cat.id);
        await this.loadCategories();
      } catch (err: any) {
        alert(err.message || 'Error deleting category');
      }
    }
  }
}
