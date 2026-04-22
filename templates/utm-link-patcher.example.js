const EMAILS = [2, 3, 4];

const BASE_URL =
  "https://example.com/campaign-path?utm_source=mailing&utm_medium=email&utm_campaign=example&utm_content=email1&utm_term=email&sck=email1";

function trackingForEmail(number) {
  return {
    utm_content: `email${number}`,
    sck: `email${number}`,
  };
}

function patchTrackedUrl(baseUrl, trackingOverrides) {
  const url = new URL(baseUrl);

  for (const [key, value] of Object.entries(trackingOverrides)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, value);
  }

  return url.toString();
}

for (const number of EMAILS) {
  const tracking = trackingForEmail(number);
  const derivedUrl = patchTrackedUrl(BASE_URL, tracking);

  console.log(
    JSON.stringify(
      {
        emailNumber: number,
        baseUrl: BASE_URL,
        derivedUrl,
      },
      null,
      2
    )
  );
}

/*
How to adapt this template:

1. Copy the real CTA URL from "e-mail 1".
2. Keep host and path unchanged.
3. Change only the parameters that vary per e-mail.
4. If the company uses another schema (for example `foemailN` instead of `emailN`),
   change `trackingForEmail()` to match that schema.
5. If the company has multiple CTA families, create one builder per family instead
   of editing links by hand in the UI.
*/
