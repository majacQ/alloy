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
import isNonEmptyArray from "../../utils/isNonEmptyArray";
import find from "../../utils/find";
import isEmptyObject from "../../utils/isEmptyObject";
import getDecisions from "./ajo-odd";
import { hasItem, getItem, RULES, setItem } from "./ajo-odd/storage";
import { DECISIONS_DEPRECATED_WARNING } from "./constants/loggerMessage";

const DECISIONS_HANDLE = "personalization:decisions";
const RULES_HANDLE = "personalization:odd-rules";

const getOddDecisions = (personalizationDetails, response) => {
  const event = personalizationDetails.getEvent();

  if (hasItem(RULES)) {
    const data = getItem(RULES);

    return getDecisions(event, data.journeys);
  }

  const rules = response.getPayloadsByType(RULES_HANDLE) || [];

  if (rules.length === 0) {
    return [];
  }

  // Here we fetch ONLY AJO rules
  const data = find(rules, e => e.provider === "ajo");
  const { journeys = {} } = data || {};

  if (isEmptyObject(journeys)) {
    return [];
  }

  setItem(RULES, data);

  return getDecisions(event, journeys);
};

export default ({
  autoRenderingHandler,
  nonRenderingHandler,
  groupDecisions,
  handleRedirectDecisions,
  showContainers,
  logger
}) => {
  return ({ decisionsDeferred, personalizationDetails, response }) => {
    const serverDecisions = response.getPayloadsByType(DECISIONS_HANDLE);
    const oddDecisions = getOddDecisions(personalizationDetails, response);
    const unprocessedDecisions = [...serverDecisions, ...oddDecisions];
    const viewName = personalizationDetails.getViewName();

    // if personalization payload is empty return empty decisions array
    if (unprocessedDecisions.length === 0) {
      showContainers();
      decisionsDeferred.resolve({});
      return {
        get decisions() {
          logger.warn(DECISIONS_DEPRECATED_WARNING);
          return [];
        },
        propositions: []
      };
    }

    const {
      redirectDecisions,
      pageWideScopeDecisions,
      viewDecisions,
      nonAutoRenderableDecisions
    } = groupDecisions(unprocessedDecisions);

    if (
      personalizationDetails.isRenderDecisions() &&
      isNonEmptyArray(redirectDecisions)
    ) {
      decisionsDeferred.resolve({});
      return handleRedirectDecisions(redirectDecisions);
    }
    // save decisions for views in local cache
    decisionsDeferred.resolve(viewDecisions);

    if (personalizationDetails.isRenderDecisions()) {
      return autoRenderingHandler({
        viewName,
        pageWideScopeDecisions,
        nonAutoRenderableDecisions
      });
    }
    return nonRenderingHandler({
      viewName,
      redirectDecisions,
      pageWideScopeDecisions,
      nonAutoRenderableDecisions
    });
  };
};
