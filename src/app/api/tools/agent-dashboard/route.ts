import { withApiHandler } from "@/lib/api-utils";
import { dbService } from "@/services/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { agentConfigSchema, safeValidateRequest } from "@/lib/validations/api";

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const overview = {
    agentCount: 0,
    personaCount: 0,
    testCases: 0,
    passed: 0,
    failed: 0,
  };
  let pieChartData: any = [];
  let barGraphData: any = [];
  let dashbaordParams = {
    overview,
    pieChartData,
    barGraphData,
  };

  if (id) {
    const config = await dbService.getAgentConfigAll(id);
    if (!config) {
      throw new NotFoundError("Agent not found");
    }
    return config;
  }

  // Return all configs since we don't have user context
  const configs = await dbService.getAllAgentConfigs();
  if (!configs) {
    console.error("No agent configurations found");
    // throw new NotFoundError('No agent configurations found');
  }
  console.log("Total agent configurations:", configs);
  overview.agentCount = configs.length;
  // getting the personas count
  const personas = await dbService.getPersonas();
  if (!personas) {
    console.error("No personas found");
    // throw new NotFoundError('No personas found');
  }
  console.log("Total personas:", personas);
  overview.personaCount = personas.length;
  // getting the test cases count
  const testcases = await dbService.getUniqueTestRuns();
  if (!testcases) {
    console.error("No test cases found");
    // throw new NotFoundError('No test cases found');
  }
  function summarizeMetrics(dataArray: any) {
    return dataArray.reduce(
      (summary, item) => {
        summary.total += item.total || 0;
        summary.passed += item.passed || 0;
        summary.failed += item.failed || 0;
        return summary;
      },
      { total: 0, passed: 0, failed: 0 }
    );
  }

  const metrics = summarizeMetrics(testcases);
  overview.testCases = metrics.total;
  overview.passed = metrics.passed;
  overview.failed = metrics.failed;

  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& :",testcases);

  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", overview);

    const testconversion   = await dbService.getTestConversions(['4b4421de-eda1-4c15-b6f8-97adf07c5800',
  '9061a477-f232-48b8-bb12-9628e994b38b']);
console.log(testconversion);
  // barGraphData = testcases.reduce((ERun, NRun)=>{
  //   ERun.name = NRun.name || "";
  //   ERun.passed = 

  //   return ERun
  // },{name :'',passed : 0, failed :0 }) 

  barGraphData = testcases.map((test : any)=>{
    return {
      agentName : test.name,
      passed : test.passed,
      failed : test.failed
    }
  })
  dashbaordParams.overview = overview;
  dashbaordParams.barGraphData = barGraphData;
  // dashbaordParams.pieChartData = [
  //     { personaName: 'Friendly user', passed: 10, failed: 6 },
  //     { personaName: 'Confused user', passed: 1, failed: 6 },
  //     { personaName: 'Technical expert', passed: 9, failed: 6 },
  //   ]
  dashbaordParams.pieChartData = testconversion

  return dashbaordParams
  //   {
  //   pieChartData: [
  //     { personaName: 'Friendly user', passed: 10, failed: 6 },
  //     { personaName: 'Confused user', passed: 1, failed: 6 },
  //     { personaName: 'Technical expert', passed: 9, failed: 6 },
  //   ],
  //   overview: {
  //     agentCount: 15,
  //     personaCount: 3,
  //     testCases: 100,
  //     passed: 60,
  //     failed: 40,
  //   },
  //   barGraphData: [
  //     { agentName: 'Agent A', passed: 45, failed: 5 },
  //     { agentName: 'Agent B', passed: 32, failed: 8 },
  //     { agentName: 'Agent C', passed: 27, failed: 13 },
  //     { agentName: 'Agent D', passed: 50, failed: 2 },
  //     { agentName: 'Agent E', passed: 20, failed: 20 },
  //     { agentName: 'Agent F', passed: 35, failed: 5 },
  //     { agentName: 'Agent G', passed: 38, failed: 7 },
  //     { agentName: 'Agent H', passed: 41, failed: 4 },
  //   ]
  // };
});
