# NSBM MyHostel - Hostel Management System

A full-stack web application for automating student outing approval with real-time notifications, role-based access control, and AI-based anomaly detection.

## Features

### 🎯 Core Functionality
- **4-Role Approval Workflow**: Students → Parents → Wardens → Security
- **Real-Time Updates**: Instant notifications on request status changes
- **AI Anomaly Detection**: Logistic regression model to detect irregular outing patterns
- **Digital Records**: Secure digital logs of all student outings
- **ID Scanning**: Security officers verify entry/exit permissions via student ID

### 👥 User Roles

#### 1. **Students**
- Submit outing requests (destination, time, date, reason)
- Track request status (pending → parent_approved → warden_approved → approved)
- View history of approved/rejected outings
- Receive real-time notifications

#### 2. **Parents**
- View child's pending outing requests
- Approve or deny requests with optional feedback
- Receive notifications for all request updates
- Access outing history

#### 3. **Wardens**
- Verify parent-approved requests
- Grant final permission for outings
- Monitor flagged students with irregular behavior
- View all outing records and analytics

#### 4. **Security Officers**
- Scan student IDs at entry/exit points
- Verify authorized outings (warden-approved only)
- Log entry/exit times
- Access digital authorization records

## System Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Realtime Database (production) / Mock JSON (development)
- **Authentication**: Custom JWT-based auth
- **ML Model**: Logistic Regression (Python/scikit-learn integration planned)
- **Real-Time**: Firebase Cloud Messaging (planned)

### File Structure
```
app/
├── api/
│   ├── auth/
│   │   ├── signup/route.ts
│   │   └── login/route.ts
│   ├── outings/route.ts
│   ├── anomalies/route.ts
│   └── security/scan/route.ts
├── students/page.tsx
├── parents/page.tsx
├── wardens/page.tsx
├── security/page.tsx
├── page.tsx
└── layout.tsx

components/
└── WardenLogin.tsx

contexts/
└── AuthContext.tsx

lib/
├── firebaseConfig.ts
└── types.ts
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email & password

### Outings Management
- `GET /api/outings?userId=X&role=Y` - Fetch outings (filtered by role)
- `POST /api/outings` - Create new outing request
- `PUT /api/outings?id=X` - Update outing status (approve/reject)

### Anomaly Detection
- `GET /api/anomalies` - Get flagged students
- `POST /api/anomalies` - Compute anomaly score for a student

### Security
- `POST /api/security/scan` - Verify student ID and authorize entry/exit

## Data Models

### UserProfile
```typescript
interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "student" | "parent" | "warden" | "security";
  phone?: string;
  hostelBlock?: string; // For students
  childrenIds?: string[]; // For parents
  createdAt: number;
  updatedAt: number;
}
```

### OutingRequest
```typescript
interface OutingRequest {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  wardenId?: string;
  reason: string;
  startDateTime: number;
  endDateTime: number;
  destination: string;
  status: "pending" | "parent_approved" | "parent_rejected" | "warden_approved" | "warden_rejected";
  parentApprovedAt?: number;
  parentApprovalReason?: string;
  wardenApprovedAt?: number;
  wardenApprovalReason?: string;
  createdAt: number;
  updatedAt: number;
}
```

### AnomalyResult
```typescript
interface AnomalyResult {
  studentId: string;
  studentName: string;
  anomalyScore: number; // 0-1, higher = more irregular
  irregularityReason: string;
  flaggedAt: number;
}
```

## Approval Workflow

```
┌─────────────────────────────────────────────────────────┐
│  STUDENT SUBMITS OUTING REQUEST                         │
│  (destination, date, time, reason)                      │
└────────────────────┬────────────────────────────────────┘
                     │ Status: "pending"
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PARENT REVIEWS & APPROVES/REJECTS                      │
│  (with optional feedback)                              │
└────────────────────┬────────────────────────────────────┘
        ┌────────────┴───────────┐
        │                        │
   APPROVED               REJECTED
        │                        │
        ▼                        ▼
┌──────────────────┐    Status: "parent_rejected"
│  Status: pending │    (Process Ends)
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  WARDEN VERIFIES & GRANTS/DENIES PERMISSION            │
│  (Check for anomalies, validate request)               │
└────────────────────┬────────────────────────────────────┘
        ┌────────────┴──────────────┐
        │                           │
   APPROVED                    REJECTED
        │                           │
        ▼                           ▼
Status: "warden_approved"  Status: "warden_rejected"
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  SECURITY OFFICER SCANS STUDENT ID AT GATE             │
│  (Verifies & logs entry/exit times)                    │
└─────────────────────────────────────────────────────────┘
```

## AI Anomaly Detection

The system uses **Logistic Regression** to predict irregular student behavior based on:
- Outing frequency (frequency increase detection)
- Time patterns (late-night outings, unusual hours)
- Destination patterns (repeat locations vs. new destinations)
- Duration patterns (unusually long/short outings)

**Anomaly Score**: 0-1 scale (higher = more irregular)
- Score > 0.7 → Flag for warden review
- Score > 0.6 → Monitor student

### Integration
- Python backend API (planned) for ML predictions
- Real-time computation on warden dashboard
- Automated alerts for high-risk students

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SenumiCosta/NSBM-MyHostel.git
   cd nsbm-myhostel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (if using Firebase)
   Create `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_db_url
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

For testing, use these credentials:

### Student
- Email: `student@nsbm.lk`
- Password: `password123`

### Parent
- Email: `parent@nsbm.lk`
- Password: `password123`

### Warden
- Email: `warden@nsbm.lk`
- Password: `password123`

### Security Officer
- Email: `security@nsbm.lk`
- Password: `password123`

## Testing the Workflow

1. **Sign in as a Student** → Create an outing request
2. **Sign in as a Parent** → Approve/deny the request
3. **Sign in as a Warden** → Review flagged students, grant/deny final permission
4. **Sign in as Security** → Scan student ID and verify authorization

## Future Enhancements

- [ ] Firebase Realtime Database integration
- [ ] Firebase Cloud Messaging for push notifications
- [ ] Mobile app (Flutter) for students, parents, and wardens
- [ ] Python ML backend for advanced anomaly detection
- [ ] Email notifications
- [ ] QR code generation for student verification
- [ ] Analytics dashboard for administrators
- [ ] Multi-language support
- [ ] Export reports (PDF/Excel)
- [ ] Integration with hostel booking system

## Performance Considerations

- Mock data store (in-memory) for development; switch to Firebase for production
- Implement pagination for large outing lists
- Cache user profiles in context to reduce API calls
- Use React Query/SWR for efficient data fetching

## Security Notes

⚠️ **Important**: This is a development version. For production:
- Hash passwords using bcrypt
- Implement CSRF protection
- Enable HTTPS
- Add rate limiting on API endpoints
- Validate all inputs server-side
- Use secure JWT signing with environment variables
- Implement role-based access control (RBAC) middleware

## License

This project is part of the NSBM Computing Group Project.

## Contributors

- Senumi Costa (Lead Developer)
- NSBM Group Project Team

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Last Updated**: November 23, 2025
