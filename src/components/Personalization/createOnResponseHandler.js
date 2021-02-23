/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { isEmptyObject } from "../../utils";
import { DOM_ACTION } from "./constants/schema";
import PAGE_WIDE_SCOPE from "./constants/scope";
import evaluate from "./odd";

const DECISIONS_HANDLE = "personalization:decisions";
const ODD_HANDLE = "personalization:odd";

const isOddPresent = oddDetails => {
  if (oddDetails.length === 0) {
    return false;
  }

  if (!oddDetails[0].url) {
    return false;
  }

  return true;
};

const fetchArtifact = oddDetails => {
  return fetch(oddDetails[0].url)
    .then(r => r.json())
    .catch(() => ({}));
};

const createContext = () => {
  // this should be a real context, we use dummy values for now
  return {
    scope: PAGE_WIDE_SCOPE
  };
};

const evaluateArtifact = artifact => {
  const context = createContext();

  return evaluate({ artifact, context });
};

const getUnprocessedDecisions = response => {
  const oddDetails = response.getPayloadsByType(ODD_HANDLE);
  const serverSideDecisions = response.getPayloadsByType(DECISIONS_HANDLE);

  if (!isOddPresent(oddDetails)) {
    return Promise.resolve(serverSideDecisions);
  }

  return fetchArtifact(oddDetails)
    .then(evaluateArtifact)
    .then(decisions => [...decisions, ...serverSideDecisions]);
};

export default ({
  decisionsExtractor,
  executeDecisions,
  executeCachedViewDecisions,
  showContainers
}) => {
  return ({ decisionsDeferred, personalizationDetails, response }) => {
    return getUnprocessedDecisions(response).then(unprocessedDecisions => {
      const viewName = personalizationDetails.getViewName();

      if (unprocessedDecisions.length === 0) {
        showContainers();
        decisionsDeferred.resolve({});
        return { decisions: [] };
      }

      const {
        domActionDecisions,
        nonDomActionDecisions
      } = decisionsExtractor.groupDecisionsBySchema({
        decisions: unprocessedDecisions,
        schema: DOM_ACTION
      });
      const {
        pageWideScopeDecisions,
        nonPageWideScopeDecisions
      } = decisionsExtractor.groupDecisionsByScope({
        decisions: domActionDecisions,
        scope: PAGE_WIDE_SCOPE
      });

      if (isEmptyObject(nonPageWideScopeDecisions)) {
        decisionsDeferred.resolve({});
      } else {
        decisionsDeferred.resolve(nonPageWideScopeDecisions);
      }

      if (personalizationDetails.isRenderDecisions()) {
        executeDecisions(pageWideScopeDecisions);
        if (viewName) {
          executeCachedViewDecisions({ viewName });
        }
        showContainers();
        return { decisions: nonDomActionDecisions };
      }

      const decisionsToBeReturned = [
        ...pageWideScopeDecisions,
        ...nonDomActionDecisions
      ];

      if (viewName && nonPageWideScopeDecisions[viewName]) {
        decisionsToBeReturned.push(...nonPageWideScopeDecisions[viewName]);
      }

      return { decisions: decisionsToBeReturned };
    });
  };
};
