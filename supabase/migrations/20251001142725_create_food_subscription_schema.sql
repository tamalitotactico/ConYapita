/*
  # Food Subscription App Database Schema

  ## Overview
  This migration creates the complete database structure for a food subscription mobile app
  that connects users with local food providers (restaurants, chefs, businesses).

  ## New Tables

  ### 1. profiles
  Extends auth.users with additional user information
  - `id` (uuid, references auth.users)
  - `full_name` (text)
  - `phone` (text)
  - `address` (text)
  - `city` (text)
  - `postal_code` (text)
  - `dietary_preferences` (text array) - e.g., ["vegan", "gluten-free", "keto"]
  - `avatar_url` (text)
  - `user_type` (text) - 'customer' or 'provider'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. providers
  Restaurant and food business information
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `business_name` (text)
  - `description` (text)
  - `cuisine_types` (text array) - e.g., ["italian", "vegan", "organic"]
  - `logo_url` (text)
  - `cover_image_url` (text)
  - `address` (text)
  - `city` (text)
  - `phone` (text)
  - `email` (text)
  - `uses_eco_packaging` (boolean)
  - `is_local` (boolean)
  - `is_organic` (boolean)
  - `average_rating` (numeric)
  - `total_reviews` (integer)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. menu_items
  Food items offered by providers
  - `id` (uuid, primary key)
  - `provider_id` (uuid, references providers)
  - `name` (text)
  - `description` (text)
  - `image_url` (text)
  - `price` (numeric)
  - `dietary_tags` (text array) - e.g., ["vegan", "gluten-free"]
  - `is_available` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. subscription_plans
  Available subscription plans from providers
  - `id` (uuid, primary key)
  - `provider_id` (uuid, references providers)
  - `name` (text) - e.g., "Weekly Healthy Plan"
  - `description` (text)
  - `plan_type` (text) - 'weekly', 'biweekly', 'monthly'
  - `price` (numeric)
  - `meals_per_delivery` (integer)
  - `delivery_days` (text array) - e.g., ["monday", "wednesday"]
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. subscriptions
  User subscriptions to provider plans
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `plan_id` (uuid, references subscription_plans)
  - `status` (text) - 'active', 'paused', 'cancelled', 'expired'
  - `start_date` (date)
  - `end_date` (date)
  - `delivery_address` (text)
  - `delivery_time_preference` (text) - e.g., "morning", "afternoon", "evening"
  - `special_instructions` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. orders
  Individual delivery orders from subscriptions
  - `id` (uuid, primary key)
  - `subscription_id` (uuid, references subscriptions)
  - `user_id` (uuid, references profiles)
  - `provider_id` (uuid, references providers)
  - `delivery_date` (date)
  - `delivery_time` (text)
  - `delivery_address` (text)
  - `status` (text) - 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'
  - `total_amount` (numeric)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. order_items
  Menu items in each order
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `menu_item_id` (uuid, references menu_items)
  - `quantity` (integer)
  - `price` (numeric)
  - `created_at` (timestamptz)

  ### 8. reviews
  User reviews for providers
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `provider_id` (uuid, references providers)
  - `order_id` (uuid, references orders)
  - `rating` (integer) - 1-5
  - `comment` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 9. promotions
  Discounts and special offers
  - `id` (uuid, primary key)
  - `provider_id` (uuid, references providers, nullable for platform-wide promos)
  - `code` (text, unique)
  - `description` (text)
  - `discount_type` (text) - 'percentage', 'fixed_amount'
  - `discount_value` (numeric)
  - `valid_from` (timestamptz)
  - `valid_until` (timestamptz)
  - `max_uses` (integer)
  - `current_uses` (integer)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 10. referrals
  User referral tracking
  - `id` (uuid, primary key)
  - `referrer_id` (uuid, references profiles)
  - `referred_id` (uuid, references profiles)
  - `status` (text) - 'pending', 'completed'
  - `reward_amount` (numeric)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to access their own data
  - Policies for providers to manage their business data
  - Public read access for provider listings and menus
  - Protected write access for orders and subscriptions

  ## Important Notes
  1. All tables use UUIDs for primary keys
  2. Timestamps default to current time
  3. Soft deletes not implemented (can be added later)
  4. Payment processing handled externally (RevenueCat recommended)
  5. Image URLs stored as text (uploaded to Supabase Storage)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  dietary_preferences text[] DEFAULT '{}',
  avatar_url text,
  user_type text DEFAULT 'customer' CHECK (user_type IN ('customer', 'provider')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create providers table
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  description text,
  cuisine_types text[] DEFAULT '{}',
  logo_url text,
  cover_image_url text,
  address text,
  city text,
  phone text,
  email text,
  uses_eco_packaging boolean DEFAULT false,
  is_local boolean DEFAULT false,
  is_organic boolean DEFAULT false,
  average_rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2) NOT NULL,
  dietary_tags text[] DEFAULT '{}',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  plan_type text NOT NULL CHECK (plan_type IN ('weekly', 'biweekly', 'monthly')),
  price numeric(10,2) NOT NULL,
  meals_per_delivery integer DEFAULT 1,
  delivery_days text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  delivery_address text,
  delivery_time_preference text,
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  delivery_date date NOT NULL,
  delivery_time text,
  delivery_address text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  total_amount numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value numeric(10,2) NOT NULL,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  max_uses integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  reward_amount numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Providers policies
CREATE POLICY "Anyone can view active providers"
  ON providers FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Providers can view own data"
  ON providers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Providers can update own data"
  ON providers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can create provider profile"
  ON providers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Menu items policies
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Providers can manage own menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = menu_items.provider_id
      AND providers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = menu_items.provider_id
      AND providers.user_id = auth.uid()
    )
  );

-- Subscription plans policies
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Providers can manage own subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = subscription_plans.provider_id
      AND providers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = subscription_plans.provider_id
      AND providers.user_id = auth.uid()
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Providers can view subscriptions to their plans"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscription_plans
      JOIN providers ON providers.id = subscription_plans.provider_id
      WHERE subscription_plans.id = subscriptions.plan_id
      AND providers.user_id = auth.uid()
    )
  );

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Providers can view orders for their business"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = orders.provider_id
      AND providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Providers can update their orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = orders.provider_id
      AND providers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = orders.provider_id
      AND providers.user_id = auth.uid()
    )
  );

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view their order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN providers ON providers.id = orders.provider_id
      WHERE orders.id = order_items.order_id
      AND providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for own orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Promotions policies
CREATE POLICY "Anyone can view active promotions"
  ON promotions FOR SELECT
  TO authenticated
  USING (is_active = true AND valid_until > now());

CREATE POLICY "Providers can manage own promotions"
  ON promotions FOR ALL
  TO authenticated
  USING (
    provider_id IS NULL OR
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = promotions.provider_id
      AND providers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    provider_id IS NULL OR
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = promotions.provider_id
      AND providers.user_id = auth.uid()
    )
  );

-- Referrals policies
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (referrer_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_city ON providers(city);
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON providers(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_provider_id ON menu_items(provider_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_provider_id ON subscription_plans(provider_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();