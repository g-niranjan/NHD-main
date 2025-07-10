'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronRight, CheckCircle2, Code2, Send, Zap, Plus, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { set } from 'zod';
import { get } from 'http';
import { v4 as uuidv4 } from 'uuid';

import { useToast } from '@/hooks/use-toast';
import AgentRules from './AgentRules';
import { useAgentConfig } from "@/hooks/useAgentConfig"


interface ConfigStep {
  id: string;
  title: string;
  completed: boolean;
}

interface AgentConfigWizardProps {
  onComplete?: (config: any) => void;
  initialConfig?: any;
}

export default function AgentConfigWizard({ onComplete, initialConfig }: AgentConfigWizardProps = {}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState(initialConfig || {
    name: '',
    description: '',
    userDescription: '',
    endpoint: '',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Authorization', value: '' }
    ],
    testMessage: 'Hello, how can you help me today?',
    requestBody: {
      question: 'Hello, how can you help me today?',
      session_id: uuidv4() // Generate a unique session ID for each test
    },
    messagePath: 'question',
    responsePath: ''
  });

  const { toast } = useToast();

  const [testResult, setTestResult] = useState<any>(null);
  const [selectedPath, setSelectedPath] = useState(config.responsePath || '');
  const [selectedInputPath, setSelectedInputPath] = useState(config.messagePath || 'message');
  const [isLoading, setIsLoading] = useState(false);
  const [showInputSelector, setShowInputSelector] = useState(false);
  const [requestBodyText, setRequestBodyText] = useState(JSON.stringify(config.requestBody, null, 2));
  const [rules, setRules] = useState<any[]>(config.rules || []); // Assuming rules is an array of objects
  const { savedAgents, setSavedAgents } = useAgentConfig();
// Check if agent name exists in savedAgents (case-insensitive, exclude current id)
  const nameExists = !!config.name && savedAgents?.some(
    (agent: any) =>
      agent.name?.toLowerCase() === config.name.toLowerCase() &&
      agent.id !== config.id
  );

  // Update config when initialConfig changes (e.g., when loading an agent)
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setRequestBodyText(JSON.stringify(initialConfig.requestBody, null, 2));
      setSelectedPath(initialConfig.responsePath || '');
      setSelectedInputPath(initialConfig.messagePath || 'message');
      setTestResult(null); // Clear test result when loading new config
      setCurrentStep(0); // Reset to first step
      // setSelectedInputmessage(initialConfig.testMessage || 'Hello, how can you help me today?');
      setRules(initialConfig.rules || []); // Load rules if available
    }
  }, [initialConfig]);

  const steps: ConfigStep[] = [
    { id: 'describe', title: 'Describe Your Agent', completed: !!config.name && !!config.description },
    { id: 'connect', title: 'Connect & Test', completed: !!config.endpoint && !!testResult },
    { id: 'configure', title: 'Configure Fields', completed: !!testResult && !!config.messagePath && !!config.responsePath },
    { id: 'verify', title: 'Verify Setup', completed: false }
  ];

  // Helper function to get value from object using path
  const getValueFromPath = (obj: any, path: string): string => {
    try {
      const keys = path.split(/[\.\[\]]+/).filter(k => k);
      let value = obj;

      for (const key of keys) {
        if (value === null || value === undefined) return 'N/A';
        value = value[key];
      }

      return typeof value === 'string' ? value : JSON.stringify(value);
    } catch (error) {
      return 'N/A';
    }
  };

  const sendTestRequest = async () => {
    setIsLoading(true);

    try {
      // Convert headers array to object
      const headersObj = config.headers.reduce((acc: Record<string, string>, header: { key: string; value: string }) => {
        if (header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch('/api/tools/test-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: config.endpoint,
          headers: headersObj,
          requestBody: config.requestBody
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: "Success", description: 'api calling success', duration: 5000, variant: "success" });
        setTestResult(result.data);
        // //!added by niranjan , loading the existing rules if available
        // try {
        //   const rulesResponse = await fetch(`/api/tools/agent-rules?agentId=${config.agentId}`,{
        //     method : 'GET',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     } 
        //   });
        //   if (!rulesResponse.ok) {
        //     throw new Error('Failed to fetch rules');
        //   }
        //   const rulesData = await rulesResponse.json();
        //   setRules(rulesData.rules || []);
        //   toast({ title: "Success", description: 'Retrived validation rules', duration : 5000 ,variant: "success" });

        // } catch (error) {
        //   console.error('Error fetching rules:', error);
        //   toast({ title: "Error", description: 'Failed to fetch validation rules', duration : 5000 ,variant: "destructive" });
        // }
        if (config.rules && config.rules.length > 0) {
          setRules(config.rules || []);
          toast({ title: "Success", description: 'Retrived validation rules', duration: 5000, variant: "success" });
        }

        //!added by niranjan to showoff the error message in UI 
      } else {
        toast({title: "Error", description: result.error, duration: 5000, variant: "destructive" });
        throw new Error(result.error);
      } 
    } catch (error) {
      console.error('Error testing agent:', error);
      // toast.error('Failed to test agent. Please check your configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderJsonTree = (obj: any, path: string = '', level: number = 0, isInputSelection: boolean = false) => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const isArray = Array.isArray(obj);
      const displayPath = isArray ? `${path}[${key}]` : currentPath;

      if (typeof value === 'object' && value !== null) {
        return (
          <div key={currentPath} style={{ marginLeft: `${level * 20}px` }}>
            <div className="text-sm text-muted-foreground">
              {key}: {Array.isArray(value) ? '[' : '{'}
            </div>
            {renderJsonTree(value, displayPath, level + 1, isInputSelection)}
            <div className="text-sm text-muted-foreground" style={{ marginLeft: `${level * 20}px` }}>
              {Array.isArray(value) ? ']' : '}'}
            </div>
          </div>
        );
      }

      const selectedValue = isInputSelection ? selectedInputPath : selectedPath;
      const setSelectedValue = isInputSelection ? setSelectedInputPath : setSelectedPath;

      return (
        <div
          key={currentPath}
          style={{ marginLeft: `${level * 20}px` }}
          className={`text-sm py-1 px-2 rounded cursor-pointer transition-colors ${selectedValue === displayPath
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
            }`}
          onClick={() => {
            setSelectedValue(displayPath);
            if (isInputSelection) {
              // setConfig({ ...config, messagePath: displayPath });
              setConfig((config: any) => (
                { ...config, messagePath: displayPath, testMessage: getValueFromPath(config.requestBody, displayPath) }));
            }
          }}
        >
          <span className="text-muted-foreground">{key}:</span>{' '}
          <span className="font-mono">
            {typeof value === 'string' ? `"${value}"` : String(value)}
          </span>
        </div>
      );
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Describe Your Agent
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold mb-2">Let's start by understanding your agent</h3>
              <p className="text-muted-foreground">This information helps generate better tests</p>
            </div>

            <div>
              <Label htmlFor="name">Agent Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="My Customer Support Bot"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="mt-1 pr-10"
                  aria-invalid={!!config.name && nameExists}
                  aria-describedby="agent-name-feedback"
                />
                {config.name && (
                  nameExists ? (
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" aria-label="Name already exists" />
                  ) : (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-label="Name is available" />
                  )
                )}
              </div>
              {config.name && nameExists && (
                <p id="agent-name-feedback" className="text-xs text-red-500 mt-1">This name is already taken.</p>
              )}
              {config.name && !nameExists && (
                <p id="agent-name-feedback" className="text-xs text-green-600 mt-1">This name is available.</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">What does your agent do?</Label>
              <textarea
                id="description"
                placeholder="Example: A customer support chatbot that helps users with order tracking, returns, and product questions. It has access to order database and can process refunds up to $100."
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="mt-1 w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Be specific about capabilities, limitations, and behavior
              </p>
            </div>

            <div>
              <Label htmlFor="userDescription">Describe your ideal user interaction</Label>
              <textarea
                id="userDescription"
                placeholder="Example: Users should be able to ask about their orders in natural language. The agent should be friendly but professional, and always verify order numbers before giving information."
                value={config.userDescription}
                onChange={(e) => setConfig({ ...config, userDescription: e.target.value })}
                className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      case 1: // Connect & Test
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="endpoint">Agent Endpoint URL</Label>
              <Input
                id="endpoint"
                placeholder="https://api.openai.com/v1/chat/completions"
                value={config.endpoint}
                onChange={(e) => {
                  setConfig({ ...config, endpoint: e.target.value });
                  // Clear test result when endpoint changes
                  setTestResult(null);
                  setSelectedPath('');
                  setConfig((prev: typeof config) => ({ ...prev, responsePath: '' }));
                }}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Headers</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfig({
                    ...config,
                    headers: [...config.headers, { key: '', value: '' }]
                  })}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Header
                </Button>
              </div>
              <div className="space-y-2">
                {config.headers.map((header: { key: string; value: string }, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) => {
                        const newHeaders = [...config.headers];
                        newHeaders[index].key = e.target.value;
                        setConfig({ ...config, headers: newHeaders });
                        // Clear test result when headers change
                        setTestResult(null);
                        setSelectedPath('');
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Header value"
                      value={header.value}
                      type={header.key.toLowerCase().includes('auth') || header.key.toLowerCase().includes('key') ? 'password' : 'text'}
                      onChange={(e) => {
                        const newHeaders = [...config.headers];
                        newHeaders[index].value = e.target.value;
                        setConfig({ ...config, headers: newHeaders });
                        // Clear test result when headers change
                        setTestResult(null);
                        setSelectedPath('');
                      }}
                      className="flex-1"
                    />
                    {config.headers.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const newHeaders = config.headers.filter((_: any, i: number) => i !== index);
                          setConfig({ ...config, headers: newHeaders });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Request Body</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Edit the JSON below to match your API's expected format
              </p>
              <textarea
                className="w-full h-48 p-3 font-mono text-sm rounded-md border bg-background"
                value={requestBodyText}
                onChange={(e) => {
                  const newText = e.target.value;
                  setRequestBodyText(newText);
                  
                  try {
                    const parsed = JSON.parse(newText);
                    setConfig((prev: typeof config) => ({ 
                      ...prev, 
                      requestBody: parsed,
                      responsePath: '' // Reset response path when body changes
                    }));
                    // Clear test result when body changes
                    setTestResult(null);
                    setSelectedPath('');
                  } catch (err) {
                    // Invalid JSON - just update the text, don't update config
                    // This allows the user to keep typing even with invalid JSON
                  }
                }}
              />
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <Label>Test Your Connection</Label>
                <Button 
                  onClick={sendTestRequest}
                  disabled={!config.endpoint || isLoading}
                >
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Request
                    </>
                  )}
                </Button>
              </div>
              {/* //! added by niranjan commented out the test result display for now */}
              {/* {testResult && (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-red-500">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Success! Your agent responded. Click "Next" to configure response extraction.
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <Label className="text-sm">Response from your agent:</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md font-mono text-xs max-h-64 overflow-auto">
                      <pre>{JSON.stringify(testResult, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )} */}

              {testResult && (
                <div className="space-y-4">
                  {testResult.error ? (
                    <Alert className="border-red-200 bg-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {testResult.error}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Alert className="border-green-200 bg-red-500">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          Success! Your agent responded. Click "Next" to configure response extraction.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <Label className="text-sm">Response from your agent:</Label>
                        <div className="mt-1 p-3 bg-muted rounded-md font-mono text-xs max-h-64 overflow-auto">
                          <pre>{JSON.stringify(testResult, null, 2)}</pre>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Configure Fields
        return (
          <div className="space-y-6">
            {/* Input Field Configuration */}
            <div>
              <h3 className="font-medium mb-2">1. Configure Input Field</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click on the field where test messages should be placed
              </p>

              <div>
                <Label>Your Request Structure:</Label>
                <div className="mt-2 p-4 bg-muted rounded-md font-mono text-sm">
                  {renderJsonTree(config.requestBody, '', 0, true)}
                </div>
              </div>

              {selectedInputPath && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md mt-4">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Selected path:</span>
                  <Badge variant="secondary" className="font-mono">{selectedInputPath}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setConfig({ ...config, messagePath: selectedInputPath });
                      toast({ title: "Success", description: 'Input path set successfully', duration: 2000, variant: "success" }); // Correct usage of toast.error
                    }}
                    className="ml-auto"
                  >
                    Use This Path
                  </Button>
                </div>
              )}

              {config.messagePath && (
                <Alert className="border-blue-200 bg-red-500 mt-4">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    Input field configured: <code className="font-mono">{config.messagePath}</code>
                    <div className="mt-2 text-xs">
                      Preview: "{getValueFromPath(config.requestBody, config.messagePath)}"
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Output Field Configuration */}
            <div>
              <h3 className="font-medium mb-2">2. Configure Output Field</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click on the field in your agent's response that contains the message text
              </p>

              {testResult ? (
                <div>
                  <Label>Your Agent's Response:</Label>
                  <div className="mt-2 p-4 bg-muted rounded-md font-mono text-sm overflow-auto max-h-96">
                    {renderJsonTree(testResult)}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please complete the test in the previous step first
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {selectedPath && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Selected path:</span>
                <Badge variant="secondary" className="font-mono">{selectedPath}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setConfig({ ...config, responsePath: selectedPath });
                    toast({ title: "Success", description: 'Output path set successfully', duration: 2000, variant: "success" });
                  }}
                  className="ml-auto"
                >
                  Use This Path
                </Button>
                {/* <Toaster  position="bottom-right" richColors={true} /> */}
              </div>
            )}

            {config.responsePath && (
              <Alert className="border-green-200 bg-red-500">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div>Output field configured: <code className="font-mono">{config.responsePath}</code></div>
                  <div className="mt-2 text-xs">
                    Preview: "{testResult ? getValueFromPath(testResult, config.responsePath) : 'N/A'}"
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {/* Rule Configuration Section */}
            <div className="space-y-6 mt-6">
              <h3 className="font-medium mb-2">3. Configure Validation Rules</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set rules to validate the input and output fields. These rules will be used to ensure your agent behaves as expected.
              </p>
              <AgentRules
                manualResponse={testResult}
                rules={rules}
                setRules={setRules}
                agentId={config.agentId || ''}
              />
            </div>
          </div>
        );

      case 3: // Verify Setup
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configuration Complete!</h3>
              <p className="text-muted-foreground">Here's a summary of your agent configuration</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Agent Details</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {config.name}</div>
                  <div><span className="text-muted-foreground">Endpoint:</span> {config.endpoint}</div>
                  <div><span className="text-muted-foreground">Response Path:</span> <code>{config.responsePath}</code></div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Test Summary</h4>
                <div className="text-sm">
                  <p className="text-muted-foreground mb-2">When testing with message: "{config.testMessage}"</p>
                  <p className="text-green-600">✓ Successfully connected to agent</p>
                  <p className="text-green-600">✓ Received valid response</p>
                  <p className="text-green-600">✓ Extracted message from response</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={async () => {
                  try {
                    // Prepare the request body
                    const requestData: any = {
                      name: config.name,
                      endpoint: config.endpoint,
                      headers: config.headers.reduce((acc: Record<string, string>, header: { key: string; value: string }) => {
                        if (header.key && header.value) {
                          acc[header.key] = header.value;
                        }
                        return acc;
                      }, {} as Record<string, string>),
                      input: JSON.stringify(config.requestBody),
                      agentDescription: config.description,
                      userDescription: config.userDescription,
                      rules: rules,
                      agent_response: JSON.stringify(testResult),
                      responseTime: 0
                    };

                    // Include ID if updating existing config
                    if (config.id) {
                      requestData.id = config.id;
                    }

                    // Save the agent configuration
                    const response = await fetch('/api/tools/agent-config', {
                      method: config.id ? 'PUT' : 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(requestData)
                    });

                    if (!response.ok) {
                      throw new Error('Failed to save agent configuration');
                    }

                    const savedAgent = await response.json();
                    toast({ title: "Success", description: config.id ? 'Agent configuration updated successfully!' : 'Agent configuration saved successfully!', duration: 2000, variant: "info" });

                    // Call the onComplete callback if provided
                    onComplete?.(savedAgent);
                  } catch (error) {
                    console.error('Error saving agent configuration:', error);
                  }
                }}
              >
                {config.id ? 'Update & Test Agent' : 'Start Testing Your Agent'}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Step Indicators - Compact and Centered */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${index <= currentStep
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-muted-foreground/50 text-muted-foreground'
                  }`}>
                  {step.completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                <div className="ml-3 mr-2">
                  <p className={`text-sm font-medium whitespace-nowrap ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-12 h-0.5 bg-muted-foreground/20 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-8 shadow-sm">
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          {currentStep < steps.length - 1 && (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={
                (currentStep === 0 && (!config.name || !config.description || nameExists) ) ||
                (currentStep === 1 && !testResult) ||
                (currentStep === 2 && (!config.messagePath || !config.responsePath) )
              }
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}