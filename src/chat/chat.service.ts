import { Injectable } from '@nestjs/common';
import dialogflow from 'dialogflow';
import { struct } from 'pb-util';
import * as _ from 'lodash';
import { ChatDTO } from './chat.dto';
import { config } from 'src/firebase';

@Injectable()
export class ChatService {
  private dialogflowClient: any;
  private privateKey: any;

  constructor() {
    this.privateKey = _.replace(
      config.private_key,
      new RegExp('\\\\n', 'g'),
      '\n',
    );
    this.dialogflowClient = {
      projectId: config.project_id,
      sessionClient: new dialogflow.SessionsClient({
        credentials: {
          client_email: config.client_email,
          private_key: this.privateKey,
        },
      }),
    };
  }

  async chat(msg: ChatDTO) {
    const { projectId, sessionClient } = this.dialogflowClient;
    const sessionPath = sessionClient.sessionPath(projectId, msg.sessionId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: `${msg.text}`,
          languageCode: 'pt-BR',
        },
      },
      queryParams: {
        contexts: [
          {
            name: `projects/${projectId}/agent/sessions/${msg.sessionId}/contexts/_context_data`,
            lifespanCount: 5,
            parameters: struct.encode({ u_email: msg.email }),
          },
        ],
      },
    };

    const responses = await sessionClient.detectIntent(request);
    return this.getResultMessageDTO(responses);
  }

  private getResultMessageDTO(result) {
    const options = [];

    console.log(JSON.stringify(result[0].queryResult.fulfillmentMessages));

    result[0].queryResult.fulfillmentMessages.map((item) => {
      if (item.payload) {
        item.payload.fields.options.listValue.values.map((itemValue) => {
          options.push({
            type: itemValue.structValue.fields.type.stringValue,
            text: itemValue.structValue.fields.text.stringValue,
          });
        });
      }
    });

    return {
      message: result[0].queryResult.fulfillmentMessages.map(
        (item) => item?.text?.text[0],
      ),

      endConversation:
        result[0].queryResult.diagnosticInfo == null ? false : true,
      date: new Date().toISOString(),

      options: options,
    };
  }
}
