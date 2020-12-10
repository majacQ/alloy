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

import { getLCP, getFID, getCLS } from "web-vitals";
import isOwnRequestUrl from "../../core/isOwnRequestUrl";

let initialized = false;
const reportCallbacks = [];
const vitalsState = {};

const report = () => {
  // const { timeOrigin, getEntriesByType } = performance;
  // console.log(getEntriesByType('navigation');
  const navEntry = performance.getEntriesByType("navigation")[0];
  // Most of these calculations are derived from https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API/Using_the_Resource_Timing_API
  // Useful:
  // https://github.com/benjaminhoffman/web-performance-optimizations/blob/master/Navigation_Timing_API.md#api-specifics
  // https://www.w3.org/TR/navigation-timing/
  // Some of these return 0 values if CORS isn't set up to allow
  // us to inspect the values: https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API#Resource_loading_timestamps
  const pageXdm = {
    ...vitalsState,
    blockingAssetLoadDuration: navEntry.domInteractive - navEntry.responseEnd,
    domInteractive: navEntry.domInteractive,
    duration: navEntry.duration,
    dnsDuration: navEntry.domainLookupEnd - navEntry.domainLookupStart,
    connectDuration: navEntry.connectEnd - navEntry.connectStart,
    sslDuration: navEntry.connectEnd - navEntry.secureConnectionStart,
    serverDuration: navEntry.responseEnd - navEntry.requestStart,
    transferSize: navEntry.transferSize,
    cssCount: 0,
    cssSize: 0,
    imgCount: 0,
    imgSize: 0,
    jsCount: 0,
    jsSize: 0
  };
  const endpointsXdm = [];

  performance.getEntriesByType("resource").forEach(resEntry => {
    const { initiatorType, transferSize } = resEntry;
    switch (initiatorType) {
      case "link":
        pageXdm.cssCount += 1;
        pageXdm.cssSize += transferSize;
        break;
      case "img":
        pageXdm.imgCount += 1;
        pageXdm.imgSize += transferSize;
        break;
      case "script":
        pageXdm.jsCount += 1;
        pageXdm.jsSize += transferSize;
        break;
      case "fetch":
      case "xmlhttprequest":
        if (isOwnRequestUrl(resEntry.name)) {
          break;
        }
        endpointsXdm.push({
          connectDuration: resEntry.connectEnd - resEntry.connectStart,
          decodedBodySize: resEntry.decodedBodySize,
          dnsDuration: resEntry.domainLookupEnd - resEntry.domainLookupStart,
          duration: resEntry.duration,
          encodedBodySize: resEntry.encodedBodySize,
          serverDuration:
            resEntry.requestStart > 0
              ? resEntry.responseEnd - resEntry.requestStart
              : resEntry.duration,
          // TODO: secureConnectionStart seems to be 0 if the request is not to HTTPS.
          // Validate this.
          sslDuration:
            resEntry.secureConnectionStart > 0
              ? resEntry.connectEnd - resEntry.secureConnectionStart
              : 0,
          start: resEntry.startTime,
          transferSize: resEntry.transferSize,
          url: resEntry.name
          // TODO: requestStart is sometimes 0 and I don't understand why.
        });
        break;
      default:
    }
  });

  const xdm = {
    _atag: {
      health: {
        performance: {
          page: pageXdm,
          endpoints: endpointsXdm
        }
      }
    }
  };

  reportCallbacks.forEach(callback => callback(xdm));
};

const startMonitoring = () => {
  getLCP(metric => {
    console.log(metric);
    vitalsState.largestContentfulPaint = metric.value;
  });
  getFID(metric => {
    console.log(metric);
    vitalsState.firstInputDelay = metric.value;
  });
  getCLS(metric => {
    console.log(metric);
    vitalsState.cumulativeLayoutShift = metric.value;
  });
};

// TODO: Probably switch this to an unload event.
// const addClickListener = () => {
//   document.querySelector("#send-it").addEventListener("click", () => {
//     report();
//   });
// };
//
// if (document.readyState === "interactive") {
//   addClickListener();
// } else {
//   document.addEventListener("DOMContentLoaded", () => {
//     addClickListener();
//   });
// }
window.addEventListener("beforeunload", () => {
  report();
});

const initialize = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  if (document.readyState === "complete") {
    startMonitoring();
  } else {
    window.addEventListener("load", () => {
      startMonitoring();
    });
  }
};

const createPerformance = ({ eventManager }) => {
  // TODO: Only run the code below if the config calls for it, I suppose
  reportCallbacks.push(xdm => {
    const event = eventManager.createEvent();
    event.mergeXdm(xdm);
    event.documentMayUnload();
    eventManager.sendEvent(event);
  });
  initialize();

  return {};
};

createPerformance.namespace = "Performance";

export default createPerformance;
