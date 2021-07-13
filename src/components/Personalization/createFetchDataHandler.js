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

import { hasItem, RULES } from "./ajo-odd/storage";

const hideContainersIfRequired = (details, func, config) => {
  const { prehidingStyle } = config;

  if (details.isRenderDecisions() && !hasItem(RULES)) {
    func(prehidingStyle);
  }
};

const mergeQueryIfRequired = (details, func, event) => {
  if (hasItem(RULES)) {
    // If we have ODD rules do not fetch personalization from edge
    func(event, { enabled: false });
    return;
  }

  func(event, details.createQueryDetails());
};

export default ({
  config,
  responseHandler,
  showContainers,
  hideContainers,
  mergeQuery
}) => {
  return ({
    decisionsDeferred,
    personalizationDetails,
    event,
    onResponse,
    onRequestFailure
  }) => {
    hideContainersIfRequired(personalizationDetails, hideContainers, config);

    mergeQueryIfRequired(personalizationDetails, mergeQuery, event);

    onResponse(({ response }) =>
      responseHandler({ decisionsDeferred, personalizationDetails, response })
    );

    onRequestFailure(() => {
      decisionsDeferred.reject();
      showContainers();
    });
  };
};
