# 🛠 FM-Nexus Developer Guide: Backend

## 📊 Project Statistics
- **Total Lines of Logic**: ~5,140 (TypeScript/TSX)
- **Primary Modules**: 12 (Assets, WOs, Incidents, Inventory, Maintenance, Spaces, AMC, Vendors, Documents, Reports, Users, Notifications)
- **Database Collections**: 12 (Mongoose Based)

## 🔐 RBAC Configuration
FM-Nexus uses a strict hierarchical permission system.

| Role | Hierarchy Level | Capabilities | Primary Interface |
| :--- | :--- | :--- | :--- |
| **Admin** | 4 (Highest) | Full system control, User management, Audit logs, System seeding. | Admin Settings / Users |
| **Manager** | 3 | Vendor management, Space allocation, Inventory approving, All Reports. | Reports / Vendors / Spaces |
| **Technician** | 2 | Execute Work Orders, Report Incidents, Checklist submissions, PM execution. | My Tasks / Work Orders |
| **Viewer** | 1 (Lowest) | View-only access to dashboards, active incidents, and asset locations. | Dashboard / Assets |

## 📡 API Endpoint Reference

| Category | Base Path | Methods | Middleware |
| :--- | :--- | :--- | :--- |
| **Auth** | `/auth` | POST (login/register/me) | Public / Refresh |
| **Assets** | `/assets` | GET, POST, PATCH, DELETE | Manager (Delete) |
| **Work Orders** | `/work-orders` | GET, POST, PATCH, DELETE | Technician (Edit) |
| **Incidents** | `/incidents` | GET, POST, PATCH, DELETE | Admin (Delete) |
| **Maintenance** | `/maintenance` | GET, POST, PATCH, DELETE | Technician (Complete) |
| **Inventory** | `/inventory` | GET, POST, PATCH, DELETE | Manager (Restock) |
| **Users** | `/users` | GET, PATCH, DELETE | Admin Only |

---
*Maintained by the FM-Nexus Core Team.*
