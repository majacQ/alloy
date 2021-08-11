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

import injectExecuteSetConsentTask from "../../../../../src/components/Privacy/injectExecuteSetConsentTask";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("Privacy:injectExecuteSetConsentTask", () => {
  let onUserXdmProvidedDeferred;
  let sendSetConsentRequestDeferred;
  let lifecycle;
  let sendSetConsentRequest;
  let executeSetConsentTask;

  beforeEach(() => {
    onUserXdmProvidedDeferred = defer();
    lifecycle = {
      onUserXdmProvided: jasmine
        .createSpy("onUserXdmProvided")
        .and.callFake(xdm => {
          xdm.identityMap = {
            EMAIL: [
              {
                id: "other@example.com"
              }
            ]
          };
          return onUserXdmProvidedDeferred.promise;
        })
    };

    lifecycle = jasmine.createSpyObj("lifecycle", {
      onUserXdmProvided: onUserXdmProvidedDeferred.promise
    });
    sendSetConsentRequestDeferred = defer();
    sendSetConsentRequest = jasmine
      .createSpy("sendSetConsentRequest")
      .and.returnValue(sendSetConsentRequestDeferred.promise);
    executeSetConsentTask = injectExecuteSetConsentTask({
      lifecycle,
      sendSetConsentRequest
    });
  });

  it("calls onUserXdmProvided and waits for resolution before sending set consent request", () => {
    const consentOptions = {
      general: "in"
    };
    const identityMap = {
      EMAIL: [
        {
          id: "example@example.com"
        }
      ]
    };
    const onResolved = jasmine.createSpy();
    executeSetConsentTask({ consentOptions, identityMap }).then(onResolved);

    expect(lifecycle.onUserXdmProvided).toHaveBeenCalledWith({
      identityMap
    });
    expect(sendSetConsentRequest).not.toHaveBeenCalled();
    onUserXdmProvidedDeferred.resolve();
    return flushPromiseChains()
      .then(() => {
        expect(sendSetConsentRequest).toHaveBeenCalledWith({
          consentOptions,
          identityMap
        });
        expect(onResolved).not.toHaveBeenCalled();
        sendSetConsentRequestDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(onResolved).toHaveBeenCalled();
      });
  });

  it("does not call lifecycle.onUserXdmProvided if identityMap was not provided", () => {
    sendSetConsentRequestDeferred.resolve();
    const consentOptions = {
      general: "in"
    };
    return executeSetConsentTask({ consentOptions }).then(() => {
      expect(lifecycle.onUserXdmProvided).not.toHaveBeenCalled();
      expect(sendSetConsentRequest).toHaveBeenCalled();
    });
  });
});
