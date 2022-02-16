import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import cookies from "../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createNetworkLogger from "../../helpers/networkLogger";
import { IFRAME_TEST_PAGE, TEST_PAGE } from "../../helpers/constants/url";
import reloadPage from "../../helpers/reloadPage";

const debugEnabledConfig = compose(orgMainConfigMain, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title: "Iframe Test",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: IFRAME_TEST_PAGE,
  additionalScriptOptions: { page: TEST_PAGE }
});

test.meta({
  ID: "IFRAMETEST",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test iFrame", async () => {
  await t.switchToIframe("#iframe");

  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  // this should get an ECID
  await alloy.sendEvent();
  // this should wait until the first event returns
  // so it can send the ECID in the request

  await t.switchToMainWindow();
  await reloadPage();

  await t.switchToIframe("#iframe");
  await alloy.configure(debugEnabledConfig);
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  // make sure we have an ecid
  const identityCookieValue = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue).ok("No identity cookie found.");

  // make sure the ecid was sent as part of the second request
  await t
    .expect(networkLogger.edgeEndpointLogs.requests[1].request.body)
    .contains(identityCookieValue);
});
