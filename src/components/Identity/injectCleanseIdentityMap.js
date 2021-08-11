/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export default ({ logger }) => {
  return identityMap => {
    return Object.keys(identityMap).reduce((newIdentityMap, namespace) => {
      const filteredIdentifiers = identityMap[namespace].filter(({ id }, i) => {
        const isValidId = typeof id === "string" && id.length;
        if (!isValidId) {
          logger.info(
            `The identifier at ${namespace}[${i}] was removed from the identity map because its ID is not a populated string. Its ID value is:`,
            id
          );
        }
        return isValidId;
      });

      if (filteredIdentifiers.length) {
        newIdentityMap[namespace] = filteredIdentifiers;
      } else {
        logger.info(
          `The ${namespace} namespace was removed from the identity map because it contains no identifiers.`
        );
      }
      return newIdentityMap;
    }, {});
  };
};
