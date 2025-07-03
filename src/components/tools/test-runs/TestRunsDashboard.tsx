"use client";

import React, { useState } from "react";
import { useTestExecution } from "@/hooks/useTestExecution";
import RunsList from "./RunsList";
import RunDetail from "./RunDetail";
import ChatDetail from "./ChatDetail";
import WarningDialog from "@/components/config/WarningDialog";
import { ModelFactory } from "@/services/llm/modelfactory";
import { withApiHandler } from "@/lib/api-utils";
import { set } from "zod";

export function TestRunsDashboard() {
  const {
    runs,
    selectedRun,
    setSelectedRun,
    selectedChat,
    setSelectedChat,
    savedAgentConfigs,
    executeTest,
    error,
    clearError,
  } = useTestExecution();

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningDialogContent, setWarningDialogContent] = useState({
    title: "Warning",
    message: "Something went wrong.",
    severity : 'info'
  });

  // Handle model config issues
  const handleExecuteTest = async (testId: string) => {
    const modelConfig = ModelFactory.getSelectedModelConfig();
    if (!modelConfig) {
      setWarningDialogContent({
        title: "LLM Keys not configured",
        message: "Please navigate to Settings and set up your preferred LLM.",
        severity: 'warning'
      });
      setShowWarningDialog(true);
      return;
    }
    //! this is to check if the test variations are configured and if not then show warning dialog
    try {
      const findtest = await fetch(`/api/tools/test-variations?testId=${testId}`);
      const findtestData = await findtest.json();
      console.log("findtestData", findtestData);
      if(findtestData.data && findtestData.data.testCases.length > 0){
        executeTest(testId);
      }
      else{
        setWarningDialogContent({
        title: "Test variations not configured",
        message: "Please navigate to Scenarios and set up your preferred Test Cases.",
        severity: 'warning'
      });
       setShowWarningDialog(true); 
      }
    } catch (error : any ) {
      throw new Error("Failed to execute test: " + error.message);
    }
    return;
  };

  if (selectedChat) {
    return <ChatDetail 
      chat={selectedChat} 
      onBack={() => setSelectedChat(null)} 
    />;
  }

  if (selectedRun) {
    return <RunDetail 
      run={selectedRun} 
      onBack={() => setSelectedRun(null)}
      onSelectChat={setSelectedChat}
    />;
  }

  return (
    <>
      <RunsList 
        runs={runs}
        onSelectRun={setSelectedRun}
        savedAgentConfigs={savedAgentConfigs}
        onExecuteTest={handleExecuteTest}
        isLoading={false}
      />

      {showWarningDialog && (
        <WarningDialog
          isOpen={showWarningDialog}
          title={warningDialogContent.title}
          message={warningDialogContent.message}
          severity={warningDialogContent.severity}
          onClose={() => setShowWarningDialog(false)}
        />
      )}
    </>
  );
}