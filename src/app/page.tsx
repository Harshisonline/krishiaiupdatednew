'use client'; // Need client for Framer Motion

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Microscope, Sprout, Handshake, CloudSun } from 'lucide-react'; // Using relevant icons, added Handshake and CloudSun


export default function Home() {
  // Hardcoded English strings
  const title = "KrishiAi+";
  const subtitle = "Revolutionizing agriculture with AI-powered insights for smarter farming decisions. Predict yields, detect diseases, get crop recommendations, and explore government schemes effortlessly.";
  const getStarted = "Get Started";
  const features = [
    {
      title: "Crop Yield Prediction",
      description: "Forecast your harvest potential based on key agricultural data.",
      icon: Sprout,
      href: '/crop-yield',
    },
    {
      title: "Crop Disease Detection",
      description: "Identify crop diseases early with simple photo uploads.",
      icon: Microscope,
      href: '/crop-disease',
    },
    {
      title: "Soil-to-Crop Recommendation",
      description: "Discover the best crops for your specific soil conditions.",
      icon: Leaf,
      href: '/soil-recommendation',
    },
     {
      title: "Government Schemes",
      description: "Explore beneficial government schemes for farmers and agriculture.",
      icon: Handshake, // New icon for schemes
      href: '/government-schemes',
    },
    {
      title: "Weather Forecast",
      description: "Check the latest weather conditions and forecasts for your area.",
      icon: CloudSun,
      href: '/weather',
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-2"
      >
         {/* Using an inline SVG for the logo */}
         <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 text-primary"
        >
           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 5.4L11.91 12 15 15.09 13.59 16.5 9 11.91 4.41 16.5 3 15.09l3.09-3.09L1.5 7.41 2.91 6 7.5 10.59 10.59 7.5l-1.5-1.5L10.5 4.5l1.5 1.5L15.59 6 16.5 7.41zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/> {/* Example complex path */}
        </svg>
        <h1 className="text-5xl font-bold text-primary">{title}</h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xl text-muted-foreground mb-12 max-w-3xl" // Increased max-width
      >
        {subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-16"
      >
        <Link href="/#features" passHref>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {getStarted}
          </Button>
        </Link>
      </motion.div>

      <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.03 }}
            className="w-full flex" // Added flex
          >
            <Link href={feature.href} passHref className="w-full">
              <Card className="h-full transition-shadow duration-300 hover:shadow-lg bg-card text-card-foreground cursor-pointer flex flex-col"> {/* Added flex flex-col */}
                <CardHeader className="items-center">
                  <feature.icon className="w-10 h-10 text-primary mb-3" />
                  <CardTitle className="text-base">{feature.title}</CardTitle> {/* Adjusted title size */}
                </CardHeader>
                <CardContent className="flex-grow"> {/* Added flex-grow */}
                  <CardDescription className="text-center text-sm">{feature.description}</CardDescription> {/* Adjusted description size */}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
