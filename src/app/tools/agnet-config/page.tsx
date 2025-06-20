'use client';

// Update the import path below to the correct relative path where AgentConfigWizard is located
import  ApiKeyConfig  from '@/components/config/ApiKeyConfig';
import React,{useState} from 'react';

export default function AgentConfigPage() {
    const [open, setOpen] = useState(true);
  return (
    <div className="ps-6">
        <ApiKeyConfig isOpen={open} setIsOpen={setOpen} />        
    </div>
  );
}