'use client';

import React, { useEffect, useState } from "react";
import AgentRules from "@/components/tools/AgentRules";
import { Rule } from "@/services/agents/claude/types";

export default function AgentRulesContainer({ agentid, manualResponse }: { agentId: string, manualResponse: any }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const agentId  =  'd11ea73f-2723-491e-bfde-a33d900718d8' ;

  useEffect(() => {
    // Replace with your actual API endpoint
    // fetch(`/api/tools/agent-rules?agentId=${agentId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setRules(data.rules); // Adjust according to your API response structure
    //     setLoading(false);
    //   })
    //   .catch(() => setLoading(false));

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
  }, [agentId]);

  if (loading) return <div>Loading rules...</div>;

  return (
    <AgentRules
      manualResponse={manualResponse}
      rules={rules}
      setRules={setRules}
      agentId={agentId}
    />
  );
}