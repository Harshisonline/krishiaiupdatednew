# **App Name**: KrishiAi+

## Core Features:

- Crop Yield Prediction: Form to input crop data (type, location, date) and display predicted yield using API data.
- Crop Disease Detection: Upload a crop photo to detect diseases (if any) and display prevention tips. The app uses a tool to decide whether the image contains a plant, and whether the plant has a disease, and what treatments to recommend.
- Soil-to-Crop Recommendation: Upload a soil image and get crop recommendations based on soil type. The app uses a tool to decide what kind of soil the image depicts, and what crops are most suitable to grow in that kind of soil.

## Style Guidelines:

- Primary color: Earthy green (#388E3C) to reflect nature and agriculture.
- Secondary color: Light beige (#F5F5DC) for a clean, modern look.
- Accent: Mustard Yellow (#FFD600) for highlighting important elements.
- Card-style sections for each feature with intuitive navigation.
- Subtle animations (using Framer Motion) for loading spinners and transitions.
- Use simple, line-based icons related to farming and crops.

## Original User Request:
Build a modern, responsive Next.js website for a smart farming platform called Krishiai+. The site should be clean, elegant, and user-friendly, with a green and earthy color palette that reflects agriculture and nature. It will include the following main features powered by APIs:

    Crop Yield Prediction: A form where farmers can input data such as crop type, location, planting date, etc. The app will call an API and display the predicted yield in a styled results card.

    Crop Disease Detection: A section where users upload a photo of their crop. The image is sent to an API, and the app displays the detected disease (if any) along with prevention tips in a clean UI.

    Soil-to-Crop Recommendation: A form for uploading a soil image. The image is sent to an API, and the app suggests the best crops to grow based on the soil type.

Each feature should have its own page or card-style section with intuitive navigation, file upload components, form validation, loading spinners, and result display cards. Include a landing page with the Krishiai+ logo, an inviting "Get Started" button, and links to each feature.

Use Tailwind CSS for styling, Framer Motion for animations, and React components for clean modular code. Deploy-ready with Firebase Hosting and integrated with Firebase backend if needed.
  