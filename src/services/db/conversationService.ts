import { prisma } from "@/lib/prisma";
import { TestMessage } from "@/types/runs";

export class ConversationService {
  async saveConversationMessage(message: {
    id: string;
    conversationId: string;
    role: string;
    content: string;
    timestamp: string;
    metrics?: any;
  }) {
    try {
      // Ensure metrics is properly formatted for JSON storage
      const formattedMetrics = message.metrics || {};

      // Log for debugging
      // console.log(`Saving ${message.role} message to database: ${message.id.substring(0, 8)}...`);
      // console.log('Full message data:', {
      //   id: message.id,
      //   conversationId: message.conversationId,
      //   role: message.role,
      //   contentLength: message.content?.length,
      //   timestamp: message.timestamp
      // });

      return await prisma.conversation_messages.create({
        data: {
          id: message.id,
          conversation_id: message.conversationId,
          role: message.role,
          content: message.content,
          created_at: new Date(message.timestamp),
          // Default values for nullable fields
          response_time:
            message.role === "assistant"
              ? message.metrics?.responseTime || null
              : null,
          validation_score:
            message.role === "assistant"
              ? message.metrics?.validationScore || null
              : null,
          metrics: formattedMetrics,
        },
      });
    } catch (error) {
      console.error(`Error saving ${message.role} message:`, error);
      console.error("Message data:", {
        id: message.id,
        conversationId: message.conversationId,
        role: message.role,
        contentLength: message.content?.length,
        metrics: message.metrics,
      });
      throw new Error(`Failed to save ${message.role} message: ${error}`);
    }
  }

  // New method to create a test conversation:
  async createTestConversation(data: {
    runId: string;
    scenarioId: string;
    personaId: string;
    status: string;
  }) {
    try {
      const conversation = await prisma.test_conversations.create({
        data: {
          run_id: data.runId,
          scenario_id: data.scenarioId,
          persona_id: data.personaId,
          status: data.status,
        },
      });
      // console.log("++++++++++++ conversationid:" + conversation.id);
      return conversation.id;
    } catch (error) {
      console.error("Error creating test conversation:", error);
      throw new Error("Failed to create test conversation");
    }
  }

  async getConversationMessages(
    conversationId: string
  ): Promise<TestMessage[]> {
    try {
      const messages = await prisma.conversation_messages.findMany({
        where: { conversation_id: conversationId },
        orderBy: { created_at: "asc" },
      });

      return messages.map((msg) => ({
        id: msg.id,
        chatId: msg.conversation_id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        metrics: msg.metrics as any,
      }));
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      throw new Error("Failed to fetch conversation messages");
    }
  }
  //write a method to get the each runid have how many personas working
  async getTestConversions(runIds: string[]) {
    try {
      // const runids = runIds;
      // const messages  = await prisma.$queryRaw`SELECT
      //     tc.run_id,
      //     tc.persona_id,
      //     pr.name AS persona_name,
      //     COUNT(*) AS total_count,
      //     COUNT(*) FILTER (WHERE tc.status = 'passed') AS passed_count,
      //     COUNT(*) FILTER (WHERE tc.status = 'failed') AS failed_count
      //   FROM public.test_conversations tc
      //   LEFT JOIN personas pr ON pr.id = tc.persona_id
      //   WHERE tc.run_id IN (${runids})
      //   GROUP BY tc.run_id, tc.persona_id, pr.name;`
      //   return messages;

      //       const runIds = [
      //   '4b4421de-eda1-4c15-b6f8-97adf07c5800',
      //   '9061a477-f232-48b8-bb12-9628e994b38b'
      // ];

      const messages = await prisma.$queryRawUnsafe(
        `
        SELECT 
          --tc.run_id,
          --tc.persona_id,
          pr.name AS "personaName",
         -- CAST(COUNT(*) AS INTEGER) AS total_count,
          CAST(COUNT(*) FILTER (WHERE tc.status = 'passed') AS INTEGER) AS "passed",
          CAST(COUNT(*) FILTER (WHERE tc.status = 'failed') AS INTEGER) AS "failed"
        FROM public.test_conversations tc
        LEFT JOIN personas pr ON pr.id = tc.persona_id
        WHERE tc.run_id = ANY($1::uuid[])
        GROUP BY tc.run_id, tc.persona_id, pr.name;
        `,
        runIds
      );
      return messages;
    } catch (error) {
      console.log("Test conversion Error message :", error);
      throw new Error("failed to fetch the test conversions");
    }
  }

  async reconstructMemoryFromDb(conversationId: string, memory: any) {
    try {
      const messages = await this.getConversationMessages(conversationId);

      // Clear existing memory
      await memory.clear();

      // Reconstruct the memory from messages
      for (let i = 0; i < messages.length; i += 2) {
        if (i + 1 < messages.length) {
          const userMsg = messages[i];
          const assistantMsg = messages[i + 1];

          await memory.saveContext(
            { input: userMsg.content },
            { output: assistantMsg.content }
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error reconstructing memory:", error);
      return false;
    }
  }
}

export const conversationService = new ConversationService();
