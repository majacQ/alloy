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

import createViewCacheManager from "../../../../../src/components/Personalization/createViewCacheManager";
import { defer } from "../../../../../src/utils";

describe("Personalization::createCacheManager", () => {
  const cartView = "cart";
  const homeView = "home";
  const productsView = "products";
  const viewDecisions = {
    home: [
      {
        id: "foo1",
        items: [],
        scope: "home"
      },
      {
        id: "foo2",
        items: [],
        scope: "home"
      }
    ],
    cart: [
      {
        id: "foo3",
        items: [],
        scope: "cart"
      }
    ]
  };

  it("stores and gets the decisions based on a viewName", () => {
    const viewCacheManager = createViewCacheManager();
    const decisionsDeferred = defer();

    viewCacheManager.storeViews(decisionsDeferred.promise);
    decisionsDeferred.resolve(viewDecisions);

    return Promise.all([
      expectAsync(viewCacheManager.getView(cartView)).toBeResolvedTo(
        viewDecisions[cartView]
      ),
      expectAsync(viewCacheManager.getView(homeView)).toBeResolvedTo(
        viewDecisions[homeView]
      )
    ]);
  });

  it("gets an empty array if there is no decisions for a specific view", () => {
    const viewCacheManager = createViewCacheManager();
    const decisionsDeferred = defer();

    viewCacheManager.storeViews(decisionsDeferred.promise);
    decisionsDeferred.resolve(viewDecisions);

    return Promise.all([
      expectAsync(viewCacheManager.getView(productsView)).toBeResolvedTo([])
    ]);
  });

  it("should be no views when decisions deferred is rejected", () => {
    const viewCacheManager = createViewCacheManager();
    const decisionsDeferred = defer();

    viewCacheManager.storeViews(decisionsDeferred.promise);
    decisionsDeferred.reject();

    return expectAsync(viewCacheManager.getView("cart"))
      .toBeResolvedTo([])
      .then(() => {
        expect(viewCacheManager.isInitialized()).toBeTrue();
      });
  });
});
