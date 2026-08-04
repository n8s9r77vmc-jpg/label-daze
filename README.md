# Label Daze

Professional food label software for bakers, cafés and food businesses.

## Features

- **User Authentication**: Email/password sign-up, sign-in, password reset, and persistent login with Firebase
- **Product Management**: Create, edit, duplicate, and delete products with detailed information
- **Automatic Detection**: UK allergen detection and use-by date calculation
- **Label Customization**: 
  - 60x40mm, 64x38mm, and 50mm circular label formats
  - Separate font controls for each section
  - Royal blue and navy premium design
  - Business profile and logo upload
- **Label Preview & Printing**: Live preview with batch-print quantities
- **Mobile-First**: Responsive design optimized for iPhone with safe-area spacing
- **Cloud Storage**: Firestore database with per-user data isolation

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: Netlify

## Setup Instructions

### Prerequisites

- Node.js 16+ (for local development)
- Firebase account (already configured)
- Netlify account (for deployment)
- Git

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/n8s9r77vmc-jpg/label-daze.git
   cd label-daze
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start a local server:
   ```bash
   npm start
   # or use python
   python -m http.server 8000
   ```

4. Open http://localhost:8000 in your browser

### Firebase Configuration

Firebase is pre-configured in `js/firebase-config.js`. No additional setup needed.

### Deployment to Netlify

#### Option 1: Deploy via Git

1. Push to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build` (or leave empty for static sites)
4. Set publish directory: `./` or `./dist`
5. Netlify will automatically deploy on push to main

#### Option 2: Deploy via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## Project Structure

```
label-daze/
├── index.html                 # Main application entry point
├── css/
│   ├── styles.css            # Global styles
│   └── print.css             # Print-specific styles
├── js/
│   ├── firebase-config.js    # Firebase configuration
│   ├── auth.js               # Authentication logic
│   ├── products.js           # Product CRUD operations
│   ├── labels.js             # Label generation and preview
│   ├── allergens.js          # UK allergen detection
│   ├── dates.js              # Use-by date calculation
│   └── app.js                # Main application logic
├── firestore.rules           # Firestore security rules
├── netlify.toml              # Netlify configuration
└── README.md                 # This file
```

## Testing Instructions

### Test User Account

You can use any email address to create a test account:

1. Navigate to http://localhost:8000 (or your deployed URL)
2. Click "Sign Up"
3. Enter email and password (min. 6 characters)
4. Verify email (check inbox)
5. Sign in with your credentials

### Testing Features

#### Authentication
- Sign up with new email
- Sign in with credentials
- Test "Forgot Password" link
- Refresh page to verify persistent login
- Sign out and verify redirect to login

#### Product Management
- Create product with all fields
- Edit existing product
- Duplicate product (should copy all fields)
- Delete product (with confirmation)
- Verify products only appear for logged-in user

#### Labels
- Change label format (60x40mm, 64x38mm, 50mm circle)
- Adjust font sizes and families for each section
- Upload business logo and profile image
- Test batch print quantities
- Print label to PDF

#### Allergen Detection
- Products with common allergens show warning
- Check for: milk, peanuts, tree nuts, eggs, wheat, soy, fish, shellfish

#### Use-by Date
- Automatic calculation based on shelf life
- Displays in DD/MM/YYYY format (UK standard)

## Firestore Security Rules

Rules are in `firestore.rules`. Key points:
- Users can only read/write their own products
- Authentication required for all operations
- No anonymous access

## Firebase Configuration

The app uses the following Firebase services:
- **Authentication**: Email/password provider
- **Firestore**: Real-time database with collection: `users/{uid}/products`
- **Storage**: For logo and profile images

## Performance Notes

- Icons and UI assets are inline or from CDN to minimize HTTP requests
- CSS is minified in production
- JavaScript is modular for better caching
- Service worker ready for offline support (future feature)

## Browser Support

- iOS Safari 14+
- Android Chrome 90+
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## License

Private repository. All rights reserved.

## Support

For issues or questions, please open a GitHub issue.
