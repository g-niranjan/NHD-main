import { prisma } from "@/lib/prisma";
import { SimplifiedTestCases, TestVariation } from "@/types/variations";
import { e } from "mathjs";

export class TestService {
  async getTestVariations(testId: string): Promise<SimplifiedTestCases> {
    try {
      const scenarios = await prisma.test_scenarios.findMany({
        where: { agent_id: testId },
        orderBy: { created_at: "desc" },
      });

      const testCases = scenarios.map((scenario) => ({
        id: scenario.id,
        scenario: scenario.name,
        expectedOutput: scenario.expected_output,
        enabled: scenario.enabled,
      }));

      return { testId, testCases };
    } catch (error) {
      console.error("Database error in getTestVariations:", error);
      throw new Error("Failed to fetch test variations");
    }
  }

  async createTestVariation(variation: TestVariation) {
    try {
      const testScenariosData = variation.cases.map((testCase) => ({
        id: testCase.id,
        agent_id: variation.testId,
        name: testCase.scenario,
        input: testCase.scenario,
        expected_output: testCase.expectedOutput,
        created_at: new Date(variation.timestamp),
        updated_at: new Date(variation.timestamp),
      }));

      const result = await prisma.test_scenarios.createMany({
        data: testScenariosData,
      });

      return result;
    } catch (error) {
      console.error("Database error in createTestVariation:", error);
      throw new Error("Failed to create test variation");
    }
  }

  async updateTestVariation(variation: TestVariation) {
    try {
      const editedCase = variation.cases[0];
      return await prisma.test_scenarios.update({
        where: { id: editedCase.id },
        data: {
          name: editedCase.scenario,
          input: editedCase.scenario,
          expected_output: editedCase.expectedOutput,
          updated_at: new Date(variation.timestamp),
        },
      });
    } catch (error) {
      console.error("Database error in updateTestVariation:", error);
      throw new Error("Failed to update test variation");
    }
  }

  async updateScenarioEnabled(scenarioId: string, enabled: boolean) {
    try {
      return await prisma.test_scenarios.update({
        where: { id: scenarioId },
        data: { enabled },
      });
    } catch (error) {
      console.error("Database error in updateScenarioEnabled:", error);
      throw new Error("Failed to update scenario status");
    }
  }

  async deleteTestScenarios(testId: string, scenarioIds: string[]) {
    try {
      // try {
      //   let conversionObjs = await prisma.test_conversations.findMany({
      //     where: {
      //       scenario_id: {
      //         in: scenarioIds,
      //       },
      //     },
      //     select: { id: true },
      //   });
      //   const conversionIds = conversionObjs.map((val) => val.id);

      //   console.log("conversaions ids count : ", conversionIds.length);

      //   const result1 = await prisma.conversation_messages.deleteMany({
      //     where: {
      //       id: {
      //         in: conversionIds,
      //       },
      //     },
      //   });
      //   console.log("conversation messages delete count : ", result1.count);

      //   const result = await prisma.test_conversations.deleteMany({
      //     where: {
      //       scenario_id: {
      //         in: scenarioIds,
      //       },
      //     },
      //   });
      //   console.log("test conversatoins delete count : ", result.count);
      // } catch (error: any) {
      //   throw new Error("test conversions deletion error :", error);
      // }
      try {
        //! delete the conversation messsages related to conversations
        scenarioIds.forEach(async (id) => {
          console.log(`Deleting conversation messages for scenario ID: ${id}`);
          const select_conversation_ids =
            await prisma.test_conversations.findMany({
              where: { scenario_id: id },
              select: { id: true },
            });
          try {
            const conversationIds = select_conversation_ids.map((c) => c.id);
            console.log(
              `Deleting conversation messages for scenario ID: ${id} with conversation IDs: ${conversationIds}`
            );
            await prisma.conversation_messages.deleteMany({
              where: { conversation_id: { in: conversationIds } },
            });
          } catch (err) {
            console.error(
              `Error deleting conversation messages for scenario ID ${id}:`,
              err
            );
          }
        });
      } catch (error) {
        console.log("conversation message delete error :", error);
      }

      await prisma.test_conversations.deleteMany({
        where: { scenario_id: { in: scenarioIds } },
      });

      const result = await prisma.test_scenarios.deleteMany({
        where: {
          agent_id: testId,
          id: {
            in: scenarioIds,
          },
        },
      });
      return { deletedCount: result.count };
    } catch (error) {
      console.error("Database error in deleteTestScenarios:", error);
      throw new Error("Failed to delete test scenarios");
    }
  }
}

export const testService = new TestService();
