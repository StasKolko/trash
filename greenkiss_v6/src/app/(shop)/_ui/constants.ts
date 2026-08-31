export type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  rating: number;
  reviews: number;
  badge: string | null;
  colors: string[];
};

export type Category = { id: string; label: string; count: number };

export type Color = { name: string; value: string; hex: string };

export const products: Product[] = [
  {
    id: 1,
    name: "Премиум Хлопковая Футболка",
    price: 89.99,
    originalPrice: 119.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    rating: 4.5,
    reviews: 234,
    badge: "Новинка",
    colors: ["black", "white", "gray"],
  },
  {
    id: 2,
    name: "Элегантное Платье",
    price: 249.99,
    originalPrice: 349.99,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
    rating: 4.8,
    reviews: 128,
    badge: "Скидка 30%",
    colors: ["red", "black"],
  },
  {
    id: 3,
    name: "Джинсы Slim Fit",
    price: 159.99,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    rating: 4.3,
    reviews: 456,
    badge: null,
    colors: ["blue", "black"],
  },
  {
    id: 4,
    name: "Кожаная Куртка",
    price: 499.99,
    originalPrice: 599.99,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    rating: 4.9,
    reviews: 89,
    badge: "Премиум",
    colors: ["black", "brown"],
  },
  {
    id: 5,
    name: "Спортивный Костюм",
    price: 189.99,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400",
    rating: 4.4,
    reviews: 312,
    badge: "Хит продаж",
    colors: ["gray", "navy", "black"],
  },
  {
    id: 6,
    name: "Шерстяной Свитер",
    price: 139.99,
    originalPrice: 179.99,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
    rating: 4.7,
    reviews: 201,
    badge: null,
    colors: ["beige", "gray", "navy"],
  },
];

export const categories: Category[] = [
  { id: "shirts", label: "Футболки", count: 234 },
  { id: "dresses", label: "Платья", count: 145 },
  { id: "jeans", label: "Джинсы", count: 98 },
  { id: "jackets", label: "Куртки", count: 67 },
  { id: "sportswear", label: "Спортивная одежда", count: 189 },
  { id: "sweaters", label: "Свитеры", count: 123 },
];

export const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export const colors: Color[] = [
  { name: "Черный", value: "black", hex: "#000000" },
  { name: "Белый", value: "white", hex: "#FFFFFF" },
  { name: "Серый", value: "gray", hex: "#9CA3AF" },
  { name: "Красный", value: "red", hex: "#EF4444" },
  { name: "Синий", value: "blue", hex: "#3B82F6" },
  { name: "Зеленый", value: "green", hex: "#10B981" },
];
