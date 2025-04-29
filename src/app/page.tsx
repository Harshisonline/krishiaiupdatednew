'use client'; // Need client for Framer Motion

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Microscope, Sprout } from 'lucide-react'; // Using relevant icons

export default function Home() {
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

  const features = [
    {
      title: 'Crop Yield Prediction',
      description: 'Forecast your harvest potential based on key agricultural data.',
      icon: Sprout,
      href: '/crop-yield',
    },
    {
      title: 'Crop Disease Detection',
      description: 'Identify crop diseases early with simple photo uploads.',
      icon: Microscope,
      href: '/crop-disease',
    },
    {
      title: 'Soil-to-Crop Recommendation',
      description: 'Discover the best crops for your specific soil conditions.',
      icon: Leaf,
      href: '/soil-recommendation',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-2"
      >
         <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 text-primary"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
        <h1 className="text-5xl font-bold text-primary">KrishiAi+</h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xl text-muted-foreground mb-12 max-w-2xl"
      >
        Revolutionizing agriculture with AI-powered insights for smarter farming decisions. Predict yields, detect diseases, and get crop recommendations effortlessly.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-16"
      >
        <Link href="/#features" passHref>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Get Started
          </Button>
        </Link>
      </motion.div>

      <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.03 }}
            className="w-full"
          >
            <Link href={feature.href} passHref>
              <Card className="h-full transition-shadow duration-300 hover:shadow-lg bg-card text-card-foreground cursor-pointer">
                <CardHeader className="items-center">
                  <feature.icon className="w-10 h-10 text-primary mb-3" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
