import type { FC } from 'react';
import type { GovernmentScheme } from '@/services/government-schemes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle } from 'lucide-react';

interface SchemeCardProps {
  scheme: GovernmentScheme;
}

const SchemeCard: FC<SchemeCardProps> = ({ scheme }) => {
  return (
    <Card className="flex flex-col h-full bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        {scheme.icon && <scheme.icon className="w-8 h-8 text-primary mb-2" />}
        <CardTitle className="text-lg text-primary">{scheme.title}</CardTitle>
        <CardDescription>{scheme.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-1 text-foreground">Eligibility:</h4>
          <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-1 text-foreground">Benefits:</h4>
          <ul className="space-y-1">
            {scheme.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={scheme.link} target="_blank" rel="noopener noreferrer">
            Learn More
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SchemeCard;
