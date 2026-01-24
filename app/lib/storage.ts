// Mock backend using localStorage for data persistence

export interface User {
  id: string;
  email: string;
  mobile?: string;
  name?: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin";
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  deliveryDays: number;
  pagesRange: string;
  popular?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  deliveryDays: number;
  basePrice: number;
  pricePerPage: number;
}

export interface QRSettings {
  id: string;
  qrImageUrl: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  supportEmail: string;
  supportWhatsApp: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  topic: string;
  domain: string;
  type: string;
  pages: number;
  citationStyle: string;
  deadline: string;
  notes?: string;
  planId: string;
  status: string;
  createdAt: string;
  abstractRequired: boolean;
  plagiarismCheck: boolean;
  includeCharts: boolean;
  referenceFiles?: string[];
  paymentScreenshot?: string;
  deliverables?: { name: string; url: string }[];
  verifiedAt?: string;
  verifiedBy?: string;
  totalPrice: number;
}

class Storage {
  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Users
  getUsers(): User[] {
    return this.getItem<User[]>("users", []);
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setItem("users", users);
  }

  getUserByMobile(mobile: string): User | undefined {
    return this.getUsers().find((u) => u.mobile === mobile);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email === email);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  // Admin
  getAdmin(): Admin | null {
    return this.getItem<Admin | null>("admin", null);
  }

  saveAdmin(admin: Admin): void {
    this.setItem("admin", admin);
  }

  // Plans
  getPlans(): Plan[] {
    return this.getItem<Plan[]>("plans", []);
  }

  savePlans(plans: Plan[]): void {
    this.setItem("plans", plans);
  }

  getPlanById(id: string): Plan | undefined {
    return this.getPlans().find((p) => p.id === id);
  }

  // Pricing Plans
  getPricingPlans(): PricingPlan[] {
    return this.getItem<PricingPlan[]>("pricingPlans", []);
  }

  savePricingPlans(plans: PricingPlan[]): void {
    this.setItem("pricingPlans", plans);
  }

  updatePricingPlan(planId: string, basePrice: number, pricePerPage: number): void {
    const plans = this.getPricingPlans();
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      plan.basePrice = basePrice;
      plan.pricePerPage = pricePerPage;
      this.savePricingPlans(plans);
    }
  }

  getPricingPlanById(id: string): PricingPlan | undefined {
    return this.getPricingPlans().find((p) => p.id === id);
  }

  // QR Settings
  getQRSettings(): QRSettings | null {
    return this.getItem<QRSettings | null>("qrSettings", null);
  }

  saveQRSettings(settings: QRSettings): void {
    this.setItem("qrSettings", settings);
  }

  // App Settings
  getAppSettings(): AppSettings | null {
    return this.getItem<AppSettings | null>("appSettings", null);
  }

  saveAppSettings(settings: AppSettings): void {
    this.setItem("appSettings", settings);
  }

  updateAdminPassword(newPassword: string): void {
    const admin = this.getAdmin();
    if (admin) {
      admin.passwordHash = newPassword;
      this.saveAdmin(admin);
    }
  }

  // Orders
  getOrders(): Order[] {
    return this.getItem<Order[]>("orders", []);
  }

  saveOrder(order: Order): void {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.push(order);
    }
    this.setItem("orders", orders);
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id);
  }

  getOrdersByUserId(userId: string): Order[] {
    return this.getOrders().filter((o) => o.userId === userId);
  }

  // Current User Session
  getCurrentUser(): User | null {
    return this.getItem<User | null>("currentUser", null);
  }

  setCurrentUser(user: User | null): void {
    this.setItem("currentUser", user);
  }

  // Admin Session
  getCurrentAdmin(): Admin | null {
    return this.getItem<Admin | null>("currentAdmin", null);
  }

  setCurrentAdmin(admin: Admin | null): void {
    this.setItem("currentAdmin", admin);
  }

  // Initialize with seed data
  initializeSeedData(): void {
    if (this.getPlans().length === 0) {
      this.savePlans([
        {
          id: "1",
          name: "Basic",
          price: 2999,
          features: ["5-10 pages", "1 revision", "7 days delivery", "Basic plagiarism check", "APA/MLA citation"],
          deliveryDays: 7,
          pagesRange: "5-10",
        },
        {
          id: "2",
          name: "Standard",
          price: 4999,
          features: [
            "10-20 pages",
            "2 revisions",
            "5 days delivery",
            "Advanced plagiarism check",
            "All citation styles",
            "Charts & figures",
          ],
          deliveryDays: 5,
          pagesRange: "10-20",
          popular: true,
        },
        {
          id: "3",
          name: "Premium",
          price: 7999,
          features: [
            "20-30 pages",
            "3 revisions",
            "14 days delivery",
            "Premium plagiarism check",
            "All citation styles",
            "Charts & figures",
            "Abstract included",
            "Priority support",
          ],
          deliveryDays: 14,
          pagesRange: "20-30",
        },
        {
          id: "4",
          name: "Custom",
          price: 0,
          features: [
            "30+ pages",
            "Unlimited revisions",
            "Custom delivery",
            "Premium plagiarism check",
            "All citation styles",
            "Charts & figures",
            "Abstract included",
            "Dedicated support",
          ],
          deliveryDays: 0,
          pagesRange: "30+",
        },
      ]);
    }

    if (!this.getAdmin()) {
      this.saveAdmin({
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "admin@thesistrack.com",
        passwordHash: "admin123",
        role: "admin",
      });
    }

    if (!this.getQRSettings()) {
      this.saveQRSettings({
        id: "qr-1",
        qrImageUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop",
        updatedAt: new Date().toISOString(),
      });
    }

    if (!this.getAppSettings()) {
      this.saveAppSettings({
        id: "app-settings-1",
        supportEmail: "admin@thesistrack.com",
        supportWhatsApp: "+1234567890",
        updatedAt: new Date().toISOString(),
      });
    }

    if (this.getPricingPlans().length === 0) {
      this.savePricingPlans([
        {
          id: "express",
          name: "Express Delivery",
          deliveryDays: 14,
          basePrice: 2000,
          pricePerPage: 300,
        },
        {
          id: "standard",
          name: "Standard Delivery",
          deliveryDays: 7,
          basePrice: 1500,
          pricePerPage: 200,
        },
        {
          id: "economy",
          name: "Economy Delivery",
          deliveryDays: 14,
          basePrice: 1000,
          pricePerPage: 150,
        },
      ]);
    }
  }
}

export const storage = new Storage();
