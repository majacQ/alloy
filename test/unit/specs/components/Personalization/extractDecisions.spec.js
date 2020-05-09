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

import {
  PAGE_WIDE_SCOPE_DECISIONS,
  SCOPES_FOO1_FOO2_DECISIONS,
  PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS,
  PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
  REDIRECT_PAGE_WIDE_SCOPE_DECISION
} from "./responsesMock/eventResponses";
import extractDecisions from "../../../../../src/components/Personalization/extractDecisions";

describe("Personalization::extractDecisions", () => {
  let response;

  beforeEach(() => {
    response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
  });

  it("extracts dom action decisions", () => {
    response.getPayloadsByType.and.returnValue(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );

    const [
      redirectDecisions,
      domActionDecisions,
      otherDecisions,
      unprocessedDecisions
    ] = extractDecisions(response);
    expect(redirectDecisions).toEqual([]);
    expect(otherDecisions).toEqual([]);
    expect(domActionDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(unprocessedDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
  });

  it("extracts redirect decisions", () => {
    response.getPayloadsByType.and.returnValue(
      REDIRECT_PAGE_WIDE_SCOPE_DECISION
    );

    const [
      redirectDecisions,
      domActionDecisions,
      otherDecisions,
      unprocessedDecisions
    ] = extractDecisions(response);
    expect(redirectDecisions).toEqual(REDIRECT_PAGE_WIDE_SCOPE_DECISION);
    expect(otherDecisions).toEqual([]);
    expect(domActionDecisions).toEqual([]);
    expect(unprocessedDecisions).toEqual(REDIRECT_PAGE_WIDE_SCOPE_DECISION);
  });

  it("extracts other scope decisions", () => {
    response.getPayloadsByType.and.returnValue(SCOPES_FOO1_FOO2_DECISIONS);

    const [
      redirectDecisions,
      domActionDecisions,
      otherDecisions,
      unprocessedDecisions
    ] = extractDecisions(response);
    expect(redirectDecisions).toEqual([]);
    expect(otherDecisions).toEqual(SCOPES_FOO1_FOO2_DECISIONS);
    expect(domActionDecisions).toEqual([]);
    expect(unprocessedDecisions).toEqual(SCOPES_FOO1_FOO2_DECISIONS);
  });

  it("extracts redirect, dom action and other scope decision items", () => {
    const complexDecisions = SCOPES_FOO1_FOO2_DECISIONS.concat(
      PAGE_WIDE_SCOPE_DECISIONS
    ).concat(REDIRECT_PAGE_WIDE_SCOPE_DECISION);
    response.getPayloadsByType.and.returnValue(complexDecisions);

    const [
      redirectDecisions,
      domActionDecisions,
      otherDecisions,
      unprocessedDecisions
    ] = extractDecisions(response);
    expect(redirectDecisions).toEqual(REDIRECT_PAGE_WIDE_SCOPE_DECISION);
    expect(otherDecisions).toEqual(
      SCOPES_FOO1_FOO2_DECISIONS.concat(
        PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS
      )
    );
    expect(domActionDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(unprocessedDecisions).toEqual(complexDecisions);
  });
});
