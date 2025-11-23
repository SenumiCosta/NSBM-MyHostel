# Quick Start Guide - NSBM MyHostel

## System Overview

NSBM MyHostel is a **4-role outing management system** with:
- ✅ Student outing requests
- ✅ Parent approvals
- ✅ Warden verification
- ✅ Security scanning
- ✅ AI anomaly detection

## Running the System

### Step 1: Start the Development Server
```bash
cd nsbm-myhostel
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing Workflow

### Scenario: Request an Outing

**1. Student Submits Request**
- Go to: http://localhost:3000/students
- Login: student@nsbm.lk / password123
- Click "New Outing Request"
- Fill form:
  - Destination: "Home"
  - Reason: "Family visit"
  - Start Time: Tomorrow 10:00 AM
  - End Time: Tomorrow 6:00 PM
- Submit → Status: **"pending"**

**2. Parent Reviews & Approves**
- Go to: http://localhost:3000/parents
- Login: parent@nsbm.lk / password123
- Click "Review Request"
- Add feedback: "Approved - home visit on weekend"
- Click "Approve" → Status: **"parent_approved"**

**3. Warden Grants Final Permission**
- Go to: http://localhost:3000/wardens
- Login: warden@nsbm.lk / password123
- See flagged students in "Irregular Behavior" section
- Click "Review & Decide" on parent-approved request
- Click "Grant Permission" → Status: **"warden_approved"**

**4. Security Scans at Gate**
- Go to: http://localhost:3000/security
- Login: security@nsbm.lk / password123
- Enter Student ID: S12345
- Click "Scan"
- ✓ Student verified as authorized to exit/enter

## Key Pages

| Page | URL | Role | Function |
|------|-----|------|----------|
| Home | / | All | System overview & navigation |
| Student Dashboard | /students | Student | Create & track outing requests |
| Parent Portal | /parents | Parent | Review & approve requests |
| Warden Dashboard | /wardens | Warden | Verify approvals & monitor anomalies |
| Security Portal | /security | Security | Scan & verify entry/exit |

## API Endpoints (for development)

### Authentication
```
POST /api/auth/signup
POST /api/auth/login
```

### Outings
```
GET /api/outings?userId=X&role=Y
POST /api/outings
PUT /api/outings?id=X
```

### Anomaly Detection
```
GET /api/anomalies
```

### Security
```
POST /api/security/scan
```

## Features Implemented

### ✅ Completed
- [x] 4-role authentication system
- [x] Outing request submission (Student)
- [x] Parent approval workflow
- [x] Warden final verification
- [x] Security ID scanning
- [x] Anomaly detection dashboard
- [x] Real-time status tracking
- [x] Role-based access control
- [x] API routes for all features

### 🔄 Ready for Integration
- [ ] Firebase Realtime Database (replace mock data)
- [ ] Firebase Cloud Messaging (push notifications)
- [ ] Python ML backend (advanced anomaly detection)
- [ ] Mobile app (Flutter)
- [ ] Email notifications
- [ ] QR code verification

## File Structure

Key files to know:

```
app/
  ├── api/
  │   ├── auth/              (Login/Signup)
  │   ├── outings/           (Outing CRUD)
  │   ├── anomalies/         (AI detection)
  │   └── security/scan/     (ID verification)
  ├── students/              (Student dashboard)
  ├── parents/               (Parent approval)
  ├── wardens/               (Warden verification)
  ├── security/              (Security scanning)
  ├── page.tsx               (Home page)
  └── layout.tsx             (Root with AuthProvider)

components/
  └── WardenLogin.tsx        (Login form)

contexts/
  └── AuthContext.tsx        (Auth state management)

lib/
  ├── firebaseConfig.ts      (Firebase setup)
  └── types.ts               (TypeScript interfaces)
```

## Troubleshooting

**Issue**: "Module not found 'firebase'"
- **Solution**: The system uses mock data by default. Firebase SDK is optional for production.

**Issue**: Login fails
- **Solution**: Ensure you're using correct credentials from the demo accounts list.

**Issue**: Requests not appearing
- **Solution**: Data is stored in memory. Refresh the page to see updates.

## Next Steps

1. **Integrate Firebase**
   - Replace mock data store with Firebase Realtime DB
   - Enable real-time sync across all users

2. **Add Notifications**
   - Implement Firebase Cloud Messaging
   - Send push notifications on request status changes

3. **Deploy**
   - Deploy to Vercel: `npm run build && vercel deploy`
   - Set up Firebase in production

4. **Mobile App** (Optional)
   - Develop Flutter app for students, parents, wardens
   - Share same backend API

## Contact

For questions or support, contact the NSBM Computing Group Project team.

---

**Version**: 1.0  
**Last Updated**: November 23, 2025
