"use client"

import { useState } from "react"
import { useAgentConfig } from "@/hooks/useAgentConfig"
import { useErrorContext } from "@/hooks/useErrorContext"
import { ChevronDown, Server, FileCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

import ErrorDisplay from "@/components/common/ErrorDisplay"
import AgentConfigWizard from "@/components/tools/AgentConfigWizard"
import { set } from "zod"
import { v4 as uuidv4 } from "uuid"

import { useToast } from "@/hooks/use-toast"

export default function ToolsPage() {
  const { savedAgents, loadAgent, saveTest,setSavedAgents } = useAgentConfig()
  const { error, clearError } = useErrorContext()
  const [currentConfig, setCurrentConfig] = useState<any>(null)

  const handleWizardComplete = async (config: any) => {
    console.log('Wizard completed with config:', config)
    setCurrentConfig(config)
  }
  //!added by niranjan
  const  {toast}  = useToast();

  const handleOpenWizard = () => {
    setCurrentConfig( true);
  }

  const handleCloseWizard = () => {
    setCurrentConfig(false);  
  }

  const handleLoadAgent = async (agentId: string) => {
    try {
      const res = await fetch(`/api/tools/agent-config?id=${agentId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch agent config: ${res.status}`);
      }
      
      const result = await res.json();
      const data = result.data;
      
      if (!data) {
        toast({ title: "Success", description: 'NO agent Data', duration : 5000 ,variant: "warning" });
        throw new Error("No data returned from API");
      }
      
      // Transform the loaded data to match the wizard's expected format
      const loadedConfig = {
        name: data.name || "",
        description: data.agentDescription || "",
        userDescription: data.userDescription || "",
        endpoint: data.endpoint || "",
        headers: Object.entries(data.headers || {}).map(([key, value]) => ({
          key,
          value: value as string,
        })),
        testMessage: 'Hello, how can you help me today?',
        requestBody: data.inputFormat || { message: 'Hello, how can you help me today?', session_id : uuidv4()  },
        messagePath: data.rules?.find((r: any) => r.description === 'Input message field')?.path || 'message',
        responsePath: data.rules?.find((r: any) => r.description === 'Response message field')?.path || '',
        id: data.id, // Include the ID for updates
        rules : data.rules,
        org_id : data.org_id || 'isteer', // Include org_id if available
        created_by: data.created_by || 'niranjan', // Include created_by if available

      };
      
      setCurrentConfig(loadedConfig);
    } catch (error) {
      console.error("Error loading agent:", error);
    }
  }

  //!added by niranjan
   const handleDeleteAgent  = async (agentid : string) =>{
    try {
      const res = await fetch(`/api/tools/agent-config`,{
        method : 'DELETE',
        headers:{
          'Content-Type': 'application/json',
        },
        body : JSON.stringify({ configId : agentid }),
      })

      if(!res.ok){
        toast({ title: "Failure", description: 'Failed to delete agent', duration : 5000 ,variant: "destructive" });

        throw new Error(`Failed to delete agent config: ${res.status}`);
      }
      const result = await res.json();
      if(!result.success){
        throw new Error("Failed to delete agent config");
      }
      const updatedAgents = savedAgents.filter(agent => agent.id !== agentid);
      setSavedAgents(updatedAgents);
      // Optionally, you can refresh the saved agents list or show a success message
      toast({ title: "Success", description: 'Agent deleted successfully', duration : 5000 ,variant: "success" });
      console.log("Agent deleted successfully:", result);
    }catch(error : any){
      console.error("Error deleting agent:", error);

      throw new Error("Failed to delete agent", error.message);
    }

   }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-background/80 p-6">
      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          className="mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-300"
        />
      )}

      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configure Agent</h1>
            <p className="text-muted-foreground mt-1">Set up and test your AI agent with validation rules</p>
          </div>

          <div className="flex gap-4 ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 hover:bg-green-500">
                  <Server className="h-4 w-4 "/>
                  <span>Load Agent</span>
                  <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-green-300">Saved Agents</div>
                <Separator className="my-1 hover:bg-green-500" />
                {savedAgents.length > 0 ? (
                  savedAgents.map((agent) => (
                    <DropdownMenuItem
                      key={agent.id}
                      onClick={() => handleLoadAgent(agent.id)}
                      className="flex items-center gap-2 cursor-pointer "
                    >
                      <FileCode className="h-4 w-4 text-primary/70 hover:bg-green-500"  />
                      {agent.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-muted-foreground/70">
                    No saved agents
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 hover:bg-red-500">
                  <Server className="h-4 w-4" />
                  <span>Delete Agent</span>
                  <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Saved Agents</div>
                <Separator className="my-1" />
                {savedAgents.length > 0 ? (
                  savedAgents.map((agent) => (
                    <DropdownMenuItem
                      key={agent.id}
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <FileCode className="h-4 w-4 text-primary/70" />
                      {agent.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-muted-foreground/70">
                    No saved agents
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <AgentConfigWizard 
          onComplete={handleWizardComplete}
          initialConfig={currentConfig}
        />
      </div>
    </div>
  )
}