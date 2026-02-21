import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
}

const SITE_NAME = "Helsingborg United Sports Club";
const DEFAULT_DESCRIPTION =
  "Leisure cricket for everyone in Helsingborg, Sweden — weekends year-round, plus weekday sessions in the summer.";
const BASE_URL = "https://helsingborgunited.se";

const SEO = ({ title, description, path = "" }: SEOProps) => {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonicalUrl} />
    </Helmet>
  );
};

export default SEO;
