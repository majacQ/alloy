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

import isOwnRequestUrl from "../../core/isOwnRequestUrl";

export default eventManager => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (...args) => {
    const [resource, init = {}] = args;
    let method;
    let url;

    if (resource instanceof window.Request) {
      method = resource.method;
      url = resource.url;
    } else if (init) {
      method = init.method || "GET";
      url = resource;
    }

    if (isOwnRequestUrl(url)) {
      return;
    }

    const event = eventManager.createEvent();
    event.mergeXdm({
      _atag: {
        contributingEvent: `${method}: ${url}`
      }
    });

    eventManager.sendEvent(event);

    return originalFetch(...args);
  };
};
