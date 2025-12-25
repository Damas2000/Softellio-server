import {
  Page,
  PageTranslation,
  BlogPost,
  BlogPostTranslation,
  BlogCategory,
  BlogCategoryTranslation,
  Menu,
  MenuItem,
  MenuItemTranslation
} from '@prisma/client';

export interface PageWithTranslations extends Page {
  translations: PageTranslation[];
}

export interface BlogPostWithTranslations extends BlogPost {
  translations: BlogPostTranslation[];
  category?: BlogCategoryWithTranslations;
}

export interface BlogCategoryWithTranslations extends BlogCategory {
  translations: BlogCategoryTranslation[];
  children?: BlogCategoryWithTranslations[];
  parent?: BlogCategoryWithTranslations;
}

export interface MenuWithItems extends Menu {
  items: MenuItemWithTranslations[];
}

export interface MenuItemWithTranslations extends MenuItem {
  translations: MenuItemTranslation[];
  page?: PageWithTranslations;
  children: MenuItemWithTranslations[];
}