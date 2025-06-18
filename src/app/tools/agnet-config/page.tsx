'use client';

// Update the import path below to the correct relative path where AgentConfigWizard is located
import  ApiKeyConfig  from '@/components/config/ApiKeyConfig'
// Update the import path below to the correct relative path where Card is located
import { Card } from '@/components/ui/card';

export default function AgentConfigPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
        <Card className="bg-card text-card-foreground border border-border">
                <ApiKeyConfig isOpen={true} setIsOpen={() => {}} />
          </Card>
        
    </div>
  );
}