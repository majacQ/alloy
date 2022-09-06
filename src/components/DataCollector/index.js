/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import validateUserEventOptions from "./validateUserEventOptions";
import validateApplyResponse from "./validateApplyResponse";

const createDataCollector = ({ eventManager }) => {
  return {
    commands: {
      sendEvent: {
        documentationUri: "https://adobe.ly/3GQ3Q7t",
        optionsValidator: options => {
          return validateUserEventOptions({ options });
        },
        run: options => {
          const {
            xdm,
            data,
            documentUnloading = false,
            type,
            mergeId,
            renderDecisions = false,
            decisionScopes = [],
            datasetId,
            datastreamConfigOverrides
          } = options;
          const event = eventManager.createEvent();

          if (documentUnloading) {
            event.documentMayUnload();
          }

          event.setUserXdm(xdm);
          event.setUserData(data);

          if (type) {
            event.mergeXdm({
              eventType: type
            });
          }

          if (mergeId) {
            event.mergeXdm({
              eventMergeId: mergeId
            });
          }

          const sendEventOptions = {
            renderDecisions,
            decisionScopes
          };

          if (datastreamConfigOverrides) {
            sendEventOptions.datastreamConfigOverrides = datastreamConfigOverrides;
          }

          if (datasetId) {
            // TODO Add deprecation warning for config.datasetId and meta.collect.datasetId?
            if (!sendEventOptions.datastreamConfigOverrides) {
              sendEventOptions.datastreamConfigOverrides = {};
            }
            if (
              !sendEventOptions.datastreamConfigOverrides.experience_platform
            ) {
              sendEventOptions.datastreamConfigOverrides.experience_platform = {};
            }
            if (
              !sendEventOptions.datastreamConfigOverrides.experience_platform
                .datasets
            ) {
              sendEventOptions.datastreamConfigOverrides.experience_platform.datasets = {};
            }
            sendEventOptions.datastreamConfigOverrides.experience_platform.datasets.event = datasetId;
          }
          return eventManager.sendEvent(event, sendEventOptions);
        }
      },
      applyResponse: {
        documentationUri: "",
        optionsValidator: options => {
          return validateApplyResponse({ options });
        },
        run: options => {
          const {
            renderDecisions = false,
            responseHeaders = {},
            responseBody = { handle: [] }
          } = options;

          const event = eventManager.createEvent();

          return eventManager.applyResponse(event, {
            renderDecisions,
            responseHeaders,
            responseBody
          });
        }
      }
    }
  };
};

createDataCollector.namespace = "DataCollector";
createDataCollector.configValidators = {};

export default createDataCollector;
