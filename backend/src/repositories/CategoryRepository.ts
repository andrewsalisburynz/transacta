/**
 * Category Repository
 */

import { Database } from '../database/connection';
import { Category, CategoryType } from '../types/models';

export class CategoryRepository {
  constructor(private db: Database) {}

  async create(category: Omit<Category, 'id' | 'transactionCount' | 'totalAmount' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const result = await this.db.run(
      `INSERT INTO categories (name, description, category_type, color)
       VALUES (?, ?, ?, ?)`,
      [category.name, category.description, category.categoryType, category.color]
    );

    return this.findById(result.lastID)!;
  }

  async findById(id: number): Promise<Category | undefined> {
    const row = await this.db.get<any>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return row ? this.mapRow(row) : undefined;
  }

  async findAll(): Promise<Category[]> {
    const rows = await this.db.all<any>(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    return rows.map(this.mapRow);
  }

  async findByName(name: string): Promise<Category | undefined> {
    const row = await this.db.get<any>(
      'SELECT * FROM categories WHERE name = ?',
      [name]
    );
    return row ? this.mapRow(row) : undefined;
  }

  async update(id: number, updates: Partial<Category>): Promise<Category> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }

    values.push(id);
    await this.db.run(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id)!;
  }

  async delete(id: number): Promise<void> {
    await this.db.run('DELETE FROM categories WHERE id = ?', [id]);
  }

  private mapRow(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      categoryType: row.category_type as CategoryType,
      color: row.color,
      transactionCount: row.transaction_count,
      totalAmount: row.total_amount,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
