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

let initialized = false;

const qualifyingClickSelectors = [
  "button",
  'input[type="button"]',
  'input[type="submit"]'
];

const disqualifyingInputSelectors = [
  "button",
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="hidden"]',
  'input[type="checkbox"]',
  'input[type="radio"]'
];

export default eventManager => {
  if (initialized) {
    return;
  }

  initialized = true;

  document.addEventListener(
    "click",
    event => {
      const element = event.target;
      if (
        !qualifyingClickSelectors.find(selector => element.matches(selector))
      ) {
        return;
      }

      const experienceEvent = eventManager.createEvent();
      experienceEvent.mergeXdm({
        _atag: {
          contributingEvent: `CLICK: ${element.outerHTML}`
        }
      });

      eventManager.sendEvent(experienceEvent);
    },
    true
  );

  document.addEventListener(
    "focusout",
    event => {
      const element = event.target;

      if (
        disqualifyingInputSelectors.find(selector => element.matches(selector))
      ) {
        return;
      }

      const experienceEvent = eventManager.createEvent();
      experienceEvent.mergeXdm({
        _atag: {
          contributingEvent: `INPUT: ${element.outerHTML}`
        }
      });

      eventManager.sendEvent(experienceEvent);
    },
    true
  );
};
