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

  overview.agentCount = configs.length;
  // getting the personas count
  const personas = await dbService.getPersonas();
  if (!personas) {
    console.error("No personas found");
    // throw new NotFoundError('No personas found');
  }
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

  const uniqueTestRuns  =  testcases.map((val)=>val.id);

  const testconversion   = await dbService.getTestConversions(uniqueTestRuns);

  barGraphData = testcases.map((test : any)=>{
    return {
      agentName : test.name,
      passed : test.passed,
      failed : test.failed
    }
  })
  dashbaordParams.overview = overview;  
  dashbaordParams.barGraphData = barGraphData;
  dashbaordParams.pieChartData = testconversion
  

  return dashbaordParams
});
