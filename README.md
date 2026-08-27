# BOM Calculator - Professional Bill of Materials Management

A modern, professional Bill of Materials (BOM) calculator application inspired by clean e-commerce design. This application helps businesses manage material costs, labor costs, and generate professional reports with seamless user experience.

## 🚀 Features

### Core Functionality
- **Advanced BOM Calculations**: Calculate material costs, labor costs, overhead, and profit margins
- **Material Management**: Organize materials with costs, units, waste percentages, and supplier information
- **Labor Cost Tracking**: Include labor costs with hourly rates and time calculations
- **Real-time Calculations**: Automatic computation of all cost components

### User Interface
- **Modern Design**: Clean, professional interface with responsive layout
- **Intuitive Navigation**: Easy-to-use sidebar navigation
- **Search & Filtering**: Quick search for BOMs and materials with status filters
- **Mobile Friendly**: Fully responsive design for all devices

### Export Capabilities
- **Excel Export**: Export individual BOMs or all BOMs to Excel format
- **PDF Export**: Generate professional PDF reports for individual BOMs
- **Configurable Options**: Choose what to include in exports

### User Management
- **Authentication System**: Login/register functionality
- **Role-Based Access**: Admin and regular user roles
- **Admin Dashboard**: System overview and management features

## 🎨 Color Scheme

The application uses a color scheme inspired by professional e-commerce platforms:
- **Primary**: Rose/Red tones (Primary actions, main buttons)
- **Secondary**: Green tones (Success actions, secondary buttons)  
- **Accent**: Blue tones (Information, tertiary actions)

## 🔐 Demo Credentials

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Routing**: React Router
- **Icons**: Lucide React
- **Data Export**: xlsx, jsPDF
- **UI Components**: Custom components with modern design

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
bom-calculator/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── stores/         # State management
│   ├── lib/            # Utility functions
│   ├── types/          # TypeScript types
│   └── main.tsx        # Application entry point
├── public/             # Static assets
└── package.json        # Dependencies
```

## 🌟 Key Features

### BOM Calculator
- Add materials with costs, quantities, and waste percentages
- Include labor costs with hourly rates
- Automatic calculation of overhead and profit margins
- Real-time cost updates

### Material Management
- Create and manage material inventory
- Set units, costs, and supplier information
- Search and filter materials
- Edit and delete materials

### Reports & Analytics
- Cost breakdown analysis
- Material vs labor cost comparison
- Export to Excel and PDF
- Visual cost distribution

### Admin Dashboard
- System overview and statistics
- User management interface
- Activity tracking
- System health monitoring

## 🎯 Usage

1. **Login**: Use demo credentials or register a new account
2. **Create BOM**: Navigate to BOM Calculator and create your first Bill of Materials
3. **Add Materials**: Add materials to your inventory for quick access
4. **Calculate Costs**: The system automatically calculates all cost components
5. **Export**: Export your BOMs to Excel or PDF for sharing

## 🔧 Customization

### Change Colors
Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ },
      secondary: { /* your colors */ },
      accent: { /* your colors */ },
    },
  },
}
```

### Modify Business Logic
Update calculation formulas in `src/stores/bomStore.ts`

### Add New Features
- Add new pages in `src/pages/`
- Create reusable components in `src/components/`
- Update routing in `src/App.tsx`

## 📄 License

This project is created for demonstration purposes.

## 🤝 Contributing

Feel free to fork this project and customize it for your needs.

## 📞 Support

For questions or issues, please open an issue in the repository.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**