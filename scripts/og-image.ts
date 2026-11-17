// Renders public/og-image.png, the link preview for pages without their own
// image: `bun scripts/og-image.ts`.
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
// --primary and --border in src/styles/global.css.
const BRAND = "#de3624";
const BORDER = "#e4e4df";
const BAND = 20;
// Narrower than the 630px square some messengers crop to.
const LOGO_WIDTH = 560;

// The wordmark only exists as public/logo.png. No text is drawn: librsvg
// would fall back to a system font instead of Pretendard.
const logo = await sharp("public/logo.png")
  .resize({ width: LOGO_WIDTH, kernel: "lanczos3" })
  .toBuffer();
const { height: logoHeight = 0 } = await sharp(logo).metadata();

const frame = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <rect y="${HEIGHT - BAND - 1}" width="100%" height="1" fill="${BORDER}"/>
    <rect y="${HEIGHT - BAND}" width="100%" height="${BAND}" fill="${BRAND}"/>
  </svg>`,
);

await sharp(frame)
  .composite([
    {
      input: logo,
      left: Math.round((WIDTH - LOGO_WIDTH) / 2),
      top: Math.round((HEIGHT - BAND - logoHeight) / 2),
    },
  ])
  .png({ compressionLevel: 9, palette: true })
  .toFile("public/og-image.png");
