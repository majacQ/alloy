import { TEST_PAGE as TEST_PAGE_URL } from "../constants/url";
import { getFixtureClientScripts } from "./clientScripts";
import destinationRequestMock from "./destinationRequestMock";

export default ({
  title = "",
  url = TEST_PAGE_URL,
  requestHooks = [],
  includeAlloyLibrary = true,
  includeVisitorLibrary = false,
  includeNpmLibrary = false,
  additionalScriptOptions = {}
}) => {
  const clientScripts = getFixtureClientScripts({
    includeAlloyLibrary,
    includeVisitorLibrary,
    includeNpmLibrary
  });
  const clientScriptsWithOptions = clientScripts.map(clientScript => ({
    ...additionalScriptOptions,
    ...clientScript
  }));
  return fixture(title)
    .page(url)
    .requestHooks(...requestHooks, destinationRequestMock)
    .clientScripts(clientScriptsWithOptions);
};
