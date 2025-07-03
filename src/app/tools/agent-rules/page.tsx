'use client';

import React, { useEffect, useState } from "react";
import AgentRules from "@/components/tools/AgentRules";
import { Rule } from "@/services/agents/claude/types";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useErrorContext } from "@/hooks/useErrorContext"
import { useAgentConfig } from "@/hooks/useAgentConfig";
import ErrorDisplay from "@/components/common/ErrorDisplay"
import { Button } from "@/components/ui/button";
import { Server, ChevronDown, FileCode } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import  ToolsPage  from "@/app/tools/page"




export default function AgentRulesContainer() {
  //const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
    const { savedAgents, loadAgent, saveTest,setSavedAgents,currentAgentId,setCurrentAgentId, manualResponse,rules, setRules } = useAgentConfig()
    const { error, clearError } = useErrorContext()
    const [currentConfig, setCurrentConfig] = useState<any>(null)
    const agentId = currentAgentId || ""; // Replace with your logic to get the current agent ID

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch(`/api/tools/agent-rules?agentId=${agentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch rules");
        }
        const data = await response.json();
        setRules(data.rules); // Adjust according to your API response structure
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setLoading(false);
      }
    };
  }, [agentId || '']);

  // if (loading) return <div>Loading rules...</div>;

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
            <h1 className="text-2xl font-bold tracking-tight">Configure Rules</h1>
            <p className="text-muted-foreground mt-1">Set up and test your rules with api response</p>
          </div>

          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>Load Agent</span>
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
                      onClick={() => {loadAgent(agent.id);
                         setCurrentAgentId(agent.id)}}
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
        <AgentRules
          manualResponse = {manualResponse}
          rules={rules}
          setRules={setRules}
          agentId={agentId}
        />
      </div>
    </div>

  );
}