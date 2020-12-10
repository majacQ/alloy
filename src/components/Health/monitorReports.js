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

const copyPropertiesIfValueIsNotNull = (destObj, srcObj, keys) => {
  keys.forEach(key => {
    if (srcObj[key] !== null) {
      destObj[key] = srcObj[key];
    }
  });
};

const getSourceLocation = (sourceFile, lineNumber, columnNumber) => {
  if (!sourceFile) {
    return;
  }

  let location = sourceFile;

  if (lineNumber) {
    location = `${location}:${lineNumber}`;
  }

  if (columnNumber) {
    location = `${location}:${columnNumber}`;
  }

  return location;
};

export default eventManager => {
  // eslint-disable-next-line no-new,no-undef
  const observer = new ReportingObserver(
    reports => {
      const healthXdm = {};
      reports.forEach(report => {
        const { type, body } = report;
        if (type === "intervention") {
          // https://developer.mozilla.org/en-US/docs/Web/API/InterventionReportBody
          const interventionXdm = {
            id: body.id,
            message: body.message
          };

          const sourceLocation = getSourceLocation(
            body.sourceFile,
            body.lineNumber,
            body.columnNumber
          );
          if (sourceLocation) {
            interventionXdm.sourceLocation = sourceLocation;
          }

          healthXdm.interventions = healthXdm.interventions || [];
          healthXdm.interventions.push(interventionXdm);
        } else if (type === "deprecation") {
          // https://developer.mozilla.org/en-US/docs/Web/API/DeprecationReportBody
          const deprecationXdm = {
            id: body.id,
            message: body.message
          };

          const sourceLocation = getSourceLocation(
            body.sourceFile,
            body.lineNumber,
            body.columnNumber
          );

          if (sourceLocation) {
            deprecationXdm.sourceLocation = sourceLocation;
          }

          if (body.anticipatedRemoval) {
            deprecationXdm.anticipatedRemovalDate = body.anticipatedRemoval.toDateString();
          }

          healthXdm.deprecations = healthXdm.deprecations || [];
          healthXdm.deprecations.push(deprecationXdm);
        }
      });

      if (Object.keys(healthXdm).length) {
        const xdm = {
          _atag: {
            health: healthXdm
          }
        };
        const event = eventManager.createEvent();
        event.mergeXdm(xdm);
        eventManager.sendEvent(event);
      }
    },
    {
      types: ["deprecation", "intervention"],
      buffered: true
    }
  );
  observer.observe();
};
