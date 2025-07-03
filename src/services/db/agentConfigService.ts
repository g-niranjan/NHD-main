import { prisma } from '@/lib/prisma';
import { Rule } from '@/services/agents/claude/types';

export class AgentConfigService {
  async getAllAgentConfigs(): Promise<any[]> {
    try { 
      const configs = await prisma.agent_configs.findMany({
        include: {
          agent_headers: true,
          agent_persona_mappings: true,
        },
      });
    
      return configs.map(config => ({
        id: config.id,
        name: config.name,
        endpoint: config.endpoint,
        headers: config.agent_headers.reduce((acc, header) => ({
          ...acc,
          [header.key]: header.value,
        }), {}),
      }));
    } catch(error) {
      console.error("Database error in getAllAgentConfigs:", error);
      throw new Error("Failed to fetch agent configs");
    }
  }

  async getAgentConfigs(): Promise<any[]> {
    try { 
      const configs = await prisma.agent_configs.findMany({
        include: {
          agent_headers: true,
          agent_persona_mappings: true,
        },
      });
    
      return configs.map(config => ({
        id: config.id,
        name: config.name,
        endpoint: config.endpoint,
        headers: config.agent_headers.reduce((acc, header) => ({
          ...acc,
          [header.key]: header.value,
        }), {}),
      }));
    } catch(error) {
      console.error("Database error in getAgentConfigs:", error);
      throw new Error("Failed to fetch agent configs");
    }
  }
  
  async getAgentConfigAll(id: string) {
    try {
      const config = await prisma.agent_configs.findUnique({
        where: { id },
        include: {
          agent_headers: true,
          agent_descriptions: true,
          agent_user_descriptions: true,
          validation_rules: true,
          agent_outputs: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      if (!config) return null;
      const latestOutput = config.agent_outputs[0];
      return {
        id: config.id,
        name: config.name,
        endpoint: config.endpoint,
        inputFormat: config.input_format,
        headers: config.agent_headers.reduce((acc, h) => {
          acc[h.key] = h.value;
          return acc;
        }, {} as Record<string, string>),
        agentDescription: config.agent_descriptions?.[0]?.description ?? "",
        userDescription: config.agent_user_descriptions?.[0]?.description ?? "",
        rules: config.validation_rules.map(r => ({
          id : r.id,
          path: r.path,
          condition: r.condition,
          value: r.expected_value,
          description: r.description
        })),
        latestOutput: latestOutput ? {
          responseData: latestOutput.response_data,
          responseTime: latestOutput.response_time,
          status: latestOutput.status,
          errorMessage: latestOutput.error_message
        } : null
      };
    } catch(error) {
      console.error("Database error in getAgentConfigAll:", error);
      throw new Error("Failed to fetch agent config details");
    }
  }

  async saveAgentConfig(config: {
    id?: string;
    name: string;
    endpoint: string;
    headers: Record<string, string>;
    agentDescription: string;
    userDescription: string;
    rules: Array<{ path: string; condition: string; value: string; description?: string }>;
    agent_response: string;
    responseTime: number;
    input: string;
  }) {
    const parsedResponse = this.safeJsonParse(config.agent_response);
    let input_format = this.safeJsonParse(config.input);

    return await prisma.$transaction(async (tx) => {
      try {
        if (config.id) {
          // Delete related data first in a transaction
          await tx.agent_headers.deleteMany({ where: { agent_id: config.id } });
          await tx.agent_descriptions.deleteMany({ where: { agent_id: config.id } });
          await tx.agent_user_descriptions.deleteMany({ where: { agent_id: config.id } });
          await tx.validation_rules.deleteMany({ where: { agent_id: config.id } });
          await tx.agent_outputs.deleteMany({ where: { agent_id: config.id } });

          // Update existing config
          const updatedConfig = await tx.agent_configs.update({
            where: { id: config.id },
            data: {
              name: config.name,
              endpoint: config.endpoint,
              input_format: input_format,
              updated_at: new Date()
            }
          });

          // Create new related data
          await tx.agent_headers.createMany({
            data: Object.entries(config.headers).map(([key, value]) => ({
              agent_id: config.id,
              key,
              value: String(value),
            }))
          });

          await tx.agent_descriptions.create({
            data: {
              agent_id: config.id,
              description: config.agentDescription
            }
          });

          await tx.agent_user_descriptions.create({
            data: {
              agent_id: config.id,
              description: config.userDescription
            }
          });

          await tx.validation_rules.createMany({
            data: config.rules.map((rule: any) => ({
              agent_id: config.id,
              path: rule.path,
              condition: rule.condition,
              expected_value: rule.value,
              description: rule.description || ""
            }))
          });

          await tx.agent_outputs.create({
            data: {
              agent_id: config.id,
              response_data: parsedResponse,
              response_time: config.responseTime,
              status: "success",
              error_message: ""
            }
          });

          return updatedConfig;
        } else {
          // Create new config with all related data in transaction
          return await tx.agent_configs.create({
            data: {
              name: config.name,
              endpoint: config.endpoint,
              input_format: input_format,
              agent_headers: {
                create: Object.entries(config.headers).map(([key, value]) => ({
                  key,
                  value: String(value),
                }))
              },
              agent_descriptions: {
                create: { description: config.agentDescription }
              },
              agent_user_descriptions: {
                create: { description: config.userDescription }
              },
              validation_rules: {
                create: config.rules.map((rule: any) => ({
                  path: rule.path,
                  condition: rule.condition,
                  expected_value: rule.value,
                  description: rule.description || ""
                }))
              },
              agent_outputs: {
                create: {
                  response_data: parsedResponse,
                  response_time: config.responseTime,
                  status: "success",
                  error_message: ""
                }
              }
            }
          });
        }
      } catch (error) {
        console.error("Error saving agent config:", error);
        throw new Error("Failed to save agent config");
      }
    });
  }
  
  safeJsonParse(str: string) {
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return { rawOutput: str };
    }
  }
  
  async deleteAgentConfig(configId: string): Promise<{ deleted: boolean }> {
    try {

      // // Step 7: Delete the test runs itself
      // await prisma.test_runs.deleteMany({
      //   where: { agent_id: configId },
      // });


      const scenarios = await prisma.test_scenarios.findMany({
      where: { agent_id: configId },
      select: { id: true }
      });

      const scenarioIds = scenarios.map(s => s.id);

      //! Delete test runs related to conversations
      scenarioIds.forEach(async id =>{
        console.log(`Deleting conversations for scenario ID: ${id}`);
        const select_run_ids = prisma.test_conversations.findMany({
          where: { scenario_id: id },
          select: { run_id: true }
        });
        select_run_ids.then(async conversations => {
          const runIds = conversations.map(c => c.run_id);
          console.log(`Deleting test runs for scenario ID: ${id} with run IDs: ${runIds}`);
          return prisma.test_runs.deleteMany({
            where: { id: { in: runIds } }
          });
        }).catch(err => {
          console.error(`Error deleting conversations for scenario ID ${id}:`, err);
        }); 
      })

      //! delete the conversation messsages related to conversations
      scenarioIds.forEach(async id =>{
        console.log(`Deleting conversation messages for scenario ID: ${id}`);
        const select_conversation_ids = prisma.test_conversations.findMany({
          where: { scenario_id: id },
          select: { id: true }
        });
        select_conversation_ids.then(conversations => {
          const conversationIds = conversations.map(c => c.id);
          console.log(`Deleting conversation messages for scenario ID: ${id} with conversation IDs: ${conversationIds}`);
          return prisma.conversation_messages.deleteMany({
            where: { conversation_id: { in: conversationIds } }
          });
        }).catch(err => {
          console.error(`Error deleting conversation messages for scenario ID ${id}:`, err);
        }); 
      })  

      

      


      await prisma.test_conversations.deleteMany({
        where :{scenario_id : { in: scenarioIds }}
      })

      // Step 1: Delete related test scenarios
      await prisma.test_scenarios.deleteMany({
        where: { agent_id: configId },
      });
  
      // Step 2: Delete related persona mappings
      await prisma.agent_persona_mappings.deleteMany({
        where: { agent_id: configId },
      });

      // Step 4: Delete the agent description itself
      await prisma.agent_descriptions.deleteMany({
        where: { agent_id: configId },
      });

      // Step 5: Delete the agent headers itself
      await prisma.agent_headers.deleteMany({
        where: { agent_id: configId },
      });

      // Step 6: Delete the agent user descriptions itself
      await prisma.agent_user_descriptions.deleteMany({
        where: { agent_id: configId },
      });

      
      // Step 8: Delete the agent outputs itself
      await prisma.agent_outputs.deleteMany({
        where: { agent_id: configId },
      });

       // Step 8: Delete the validation rules itself
      await prisma.validation_rules.deleteMany({
        where: { agent_id: configId },
      });



      // Step 9: Delete the agent config itself
      await prisma.agent_configs.delete({
        where: { id: configId },
      });
  
      return { deleted: true };
    } catch (error) {
      console.error("Error deleting agent config:", error);
      throw new Error("Failed to delete agent config");
    }
  }
  
  async updateValidationRules(agentId: string, rules: Rule[]) {
    try {
      return await prisma.agent_configs.update({
        where: { id: agentId },
        data: {
          validation_rules: {
            deleteMany: {},
            create: rules.map(rule => ({
              path: rule.path,
              condition: rule.condition,
              expected_value: rule.value,
            })),
          },
        },
      });
    } catch (error) {
      console.error("Database error in updateValidationRules:", error);
      throw new Error("Failed to update validation rules");
    }
  }
  
}

export const agentConfigService = new AgentConfigService();