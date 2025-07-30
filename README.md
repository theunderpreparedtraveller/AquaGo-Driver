# AquaGo Driver App

A React Native water delivery driver app built with Expo and Supabase.

## Features

- Driver dashboard with real-time order management
- Order status updates (accept, reject, deliver)
- Driver status toggle (online/offline)
- Statistics tracking
- Supabase integration for data persistence

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create the following tables in your Supabase database:

#### Drivers Table
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
  current_location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  water_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'delivered', 'cancelled')),
  driver_id UUID REFERENCES drivers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run the App

```bash
npm start
```

## Usage

1. The app will load with mock data for demonstration
2. You can toggle driver status between online/offline
3. View recent orders and update their status
4. Track statistics and earnings

## Database Schema

### Drivers
- `id`: Unique identifier
- `name`: Driver's full name
- `phone`: Contact number
- `vehicle_number`: Vehicle registration number
- `status`: Current status (online/offline/busy)
- `current_location`: GPS coordinates (optional)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### Orders
- `id`: Unique identifier
- `customer_name`: Customer's name
- `customer_phone`: Customer's phone number
- `delivery_address`: Delivery location
- `water_type`: Type of water tanker
- `quantity`: Amount in liters
- `amount`: Order value in rupees
- `status`: Order status
- `driver_id`: Assigned driver (foreign key)
- `created_at`: Order creation timestamp
- `updated_at`: Last update timestamp

## Development

The app uses:
- React Native with Expo
- TypeScript for type safety
- Supabase for backend services
- Lucide React Native for icons
- React Native Safe Area Context for safe areas 