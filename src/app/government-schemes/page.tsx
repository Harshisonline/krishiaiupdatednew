'use client';

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { getGovernmentSchemes, type GovernmentScheme } from '@/services/government-schemes';
import SchemeCard from '@/components/scheme-card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const pageStrings = {
    title: "Government Schemes for Farmers",
    description: "Explore various government schemes beneficial for agriculture and farmers.",
    loading: "Loading schemes...",
    error: "Failed to load schemes. Please try again later.",
    backToHome: "Back to Home"
};

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center p-8 text-primary">
    <Loader2 className="h-8 w-8 animate-spin mr-2" />
    <span>{pageStrings.loading}</span>
  </div>
);

const GovernmentSchemesPage: FC = () => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGovernmentSchemes();
        setSchemes(data);
      } catch (err) {
        console.error("Error fetching government schemes:", err);
        setError(pageStrings.error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-6xl mx-auto">
       <Link href="/" passHref className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" />
        {pageStrings.backToHome}
      </Link>

       <Card className="mb-8 border-none shadow-none bg-transparent">
           <CardHeader className="px-0">
                <CardTitle className="text-3xl text-primary">{pageStrings.title}</CardTitle>
                <CardDescription className="text-lg">{pageStrings.description}</CardDescription>
           </CardHeader>
       </Card>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner />
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-destructive p-8">
             {error}
          </motion.div>
        ) : (
          <motion.div
            key="schemes"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {schemes.map((scheme) => (
              <motion.div key={scheme.id} variants={itemVariants}>
                 <SchemeCard scheme={scheme} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GovernmentSchemesPage;
